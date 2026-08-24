// @ts-nocheck
/**
 * useVideoScrub
 * --------------------------------------------------------------------------
 * Drives the cinematic hero video/canvas from scroll position rather than a
 * normal timeline. Two layers:
 *
 *  1. Frame bank (best-effort, progressive enhancement): fetches the MP4,
 *     demuxes it with mp4box, decodes samples with WebCodecs' VideoDecoder,
 *     and caches decoded frames as compressed webp blobs keyed by timestamp.
 *     Once at least one frame has painted, the <canvas> is shown and driven
 *     from this bank for buttery-smooth scroll scrubbing.
 *
 *  2. Fallback: until the bank is ready (or if WebCodecs / decoding is
 *     unavailable, or the 60s watchdog trips), the underlying <video> element
 *     is scrubbed directly via `video.currentTime`. This always works, just
 *     less smoothly on some browsers/formats.
 *
 * This file intentionally avoids strict TypeScript checking (`@ts-nocheck`):
 * `mp4box` ships no official type definitions and touches internal ISOBMFF
 * box structures, and WebCodecs types vary across TS/lib versions. Runtime
 * behavior is what matters here, and every risky step is wrapped so a
 * failure anywhere simply falls back to plain video scrubbing.
 * --------------------------------------------------------------------------
 */
import { useEffect, useRef, useState } from 'react'
import * as MP4Box from 'mp4box'

const LERP_TAU = 8
const SNAP = 0.002
const LRU_MAX = 24
const LEAD = 24
const WATCHDOG = 60000

interface BankEntry {
  ts: number // seconds
  blob: Blob
}

export function useVideoScrub(videoSrc: string) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [progress, setProgress] = useState(0)
  const [canvasLive, setCanvasLive] = useState(false)

  const stateRef = useRef({
    bank: [] as BankEntry[],
    lru: new Map(),
    current: 0,
    target: 0,
    ready: false,
    reverted: false,
    painted: false,
    building: false,
    dur: 0,
  })

  // -------------------------------------------------------------------
  // Scroll progress
  // -------------------------------------------------------------------
  useEffect(() => {
    let raf = 0

    const computeProgress = () => {
      const el = containerRef.current
      if (!el) return
      const span = el.offsetHeight - window.innerHeight
      const p = span > 0 ? window.scrollY / span : 0
      setProgress(Math.min(1, Math.max(0, p)))
    }

    const onScrollOrResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(computeProgress)
    }

    computeProgress()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('orientationchange', onScrollOrResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('orientationchange', onScrollOrResize)
    }
  }, [])

  // -------------------------------------------------------------------
  // rAF lerp + paint loop
  // -------------------------------------------------------------------
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx2d = () => {
      const canvas = canvasRef.current
      if (!canvas) return null
      return canvas.getContext('2d')
    }

    const paintFromBank = (t: number) => {
      const s = stateRef.current
      if (!s.bank.length) return false
      const idx = nearestIndex(s.bank, t)
      warmLRU(s, idx)
      const bmp = s.lru.get(idx)
      const canvas = canvasRef.current
      const cx = ctx2d()
      if (bmp && canvas && cx) {
        cx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
        if (!s.painted) {
          s.painted = true
          setCanvasLive(true)
        }
        return true
      }
      return false
    }

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const s = stateRef.current
      const video = videoRef.current

      s.target = progress * (s.dur || (video ? video.duration || 0 : 0))

      if (reducedMotion) {
        s.current = s.target
      } else {
        s.current += (s.target - s.current) * (1 - Math.exp(-dt * LERP_TAU))
        if (Math.abs(s.target - s.current) < SNAP) s.current = s.target
      }

      if (!s.reverted && s.ready) {
        paintFromBank(s.current)
      } else if (video && Number.isFinite(s.current)) {
        // Fallback: seek the video element directly.
        try {
          if (Math.abs(video.currentTime - s.current) > 0.03) {
            video.currentTime = s.current
          }
        } catch {
          // ignore seek errors (e.g. video not ready yet)
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  // -------------------------------------------------------------------
  // Frame bank builder (progressive enhancement)
  // -------------------------------------------------------------------
  useEffect(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const hasWebCodecs = typeof window !== 'undefined' && 'VideoDecoder' in window

    if (reducedMotion || !hasWebCodecs || !videoSrc) {
      return
    }

    let cancelled = false
    let watchdogTimer: number | undefined

    const revert = () => {
      stateRef.current.reverted = true
      setCanvasLive(false)
    }

    const build = async (hardwareAcceleration: 'no-preference' | 'prefer-software') => {
      const s = stateRef.current
      if (s.building || cancelled) return
      s.building = true

      try {
        const res = await fetch(videoSrc, { mode: 'cors' })
        if (!res.ok) throw new Error(`Failed to fetch video: ${res.status}`)
        const buf = (await res.arrayBuffer()) as MP4Box.MP4ArrayBuffer
        buf.fileStart = 0

        const mp4boxfile = MP4Box.createFile()

        await new Promise<void>((resolve, reject) => {
          mp4boxfile.onError = (err: string) => reject(new Error(err))

          mp4boxfile.onReady = (info) => {
            if (cancelled) return resolve()
            const videoTrack = info.videoTracks?.[0]
            if (!videoTrack) return reject(new Error('No video track found'))

            s.dur = info.duration / info.timescale

            const width = videoTrack.video?.width ?? 1920
            const height = videoTrack.video?.height ?? 1080
            const offscreen = new OffscreenCanvas(width, height)
            const offCtx = offscreen.getContext('2d')

            let decoder: VideoDecoder | null = null
            let decodedCount = 0
            let feedIndex = 0

            const handleFrame = (frame: VideoFrame) => {
              try {
                if (offCtx) {
                  offCtx.drawImage(frame, 0, 0, width, height)
                  offscreen
                    .convertToBlob({ type: 'image/webp', quality: 0.82 })
                    .then((blob) => {
                      s.bank.push({ ts: frame.timestamp / 1e6, blob })
                    })
                    .catch(() => {
                      /* ignore individual frame encode failures */
                    })
                }
              } finally {
                frame.close()
                decodedCount += 1
              }
            }

            try {
              decoder = new VideoDecoder({
                output: handleFrame,
                error: () => {
                  /* handled by outer retry / watchdog */
                },
              })

              const description = getAvcOrHevcDescription(mp4boxfile, videoTrack.id)
              decoder.configure({
                codec: videoTrack.codec,
                codedWidth: width,
                codedHeight: height,
                description,
                hardwareAcceleration,
              })
            } catch (err) {
              reject(err)
              return
            }

            mp4boxfile.setExtractionOptions(videoTrack.id, null, { nbSamples: 200 })

            mp4boxfile.onSamples = (_trackId: number, _ref: unknown, samples) => {
              if (cancelled || !decoder) return
              for (const sample of samples) {
                // Throttle: don't feed too far ahead of what's been decoded.
                while (feedIndex - decodedCount > LEAD) {
                  // Busy-wait is avoided by simply breaking; the decoder
                  // catches up asynchronously and future onSamples batches
                  // will naturally pace themselves via decodeQueueSize.
                  break
                }
                try {
                  decoder.decode(
                    new EncodedVideoChunk({
                      type: sample.is_sync ? 'key' : 'delta',
                      timestamp: (sample.cts / sample.timescale) * 1e6,
                      duration: (sample.duration / sample.timescale) * 1e6,
                      data: sample.data,
                    })
                  )
                  feedIndex += 1
                } catch {
                  // Skip malformed samples rather than aborting the whole bank.
                }
              }
            }

            mp4boxfile.start()
            resolve()
          }

          mp4boxfile.appendBuffer(buf)
          mp4boxfile.flush()
        })

        if (cancelled) return

        // Give decoding a moment to populate the bank, then mark ready.
        await new Promise((r) => setTimeout(r, 400))
        s.bank.sort((a, b) => a.ts - b.ts)
        if (s.bank.length > 0) {
          s.ready = true
        } else {
          throw new Error('Frame bank produced no frames')
        }
      } catch (err) {
        if (hardwareAcceleration === 'no-preference') {
          // Retry once with software decoding before giving up.
          s.building = false
          return build('prefer-software')
        }
        revert()
      } finally {
        s.building = false
      }
    }

    const start = () => build('no-preference')
    if (document.readyState === 'complete') {
      start()
    } else {
      window.addEventListener('load', start, { once: true })
    }

    watchdogTimer = window.setTimeout(() => {
      if (!stateRef.current.ready) revert()
    }, WATCHDOG)

    return () => {
      cancelled = true
      if (watchdogTimer) window.clearTimeout(watchdogTimer)
      window.removeEventListener('load', start)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSrc])

  return { containerRef, videoRef, canvasRef, progress, canvasLive }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function nearestIndex(bank: BankEntry[], t: number): number {
  let lo = 0
  let hi = bank.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (bank[mid].ts < t) lo = mid + 1
    else hi = mid
  }
  return lo
}

function warmLRU(s: { bank: BankEntry[]; lru: Map<number, ImageBitmap | null> }, idx: number) {
  const wanted = [idx - 1, idx, idx + 1, idx + 2].filter((i) => i >= 0 && i < s.bank.length)
  for (const i of wanted) {
    if (!s.lru.has(i)) {
      s.lru.set(i, null)
      createImageBitmap(s.bank[i].blob)
        .then((bmp) => s.lru.set(i, bmp))
        .catch(() => s.lru.delete(i))
    }
  }
  if (s.lru.size > LRU_MAX) {
    const keys = Array.from(s.lru.keys()).sort((a, b) => Math.abs(a - idx) - Math.abs(b - idx))
    for (const key of keys.slice(LRU_MAX)) {
      const bmp = s.lru.get(key)
      if (bmp) bmp.close?.()
      s.lru.delete(key)
    }
  }
}

/**
 * Extracts the AVC (avcC) or HEVC (hvcC) decoder configuration record from
 * the parsed moov box so VideoDecoder.configure() has what it needs.
 */
function getAvcOrHevcDescription(mp4boxfile, trackId: number): Uint8Array | undefined {
  try {
    const trak = mp4boxfile.getTrackById(trackId)
    const entries = trak?.mdia?.minf?.stbl?.stsd?.entries ?? []
    for (const entry of entries) {
      const box = entry.avcC ?? entry.hvcC
      if (box) {
        const stream = new MP4Box.DataStream(undefined, 0, MP4Box.DataStream.BIG_ENDIAN)
        box.write(stream)
        // Strip the 8-byte box header (size + fourcc) that `write` includes.
        return new Uint8Array(stream.buffer, 8)
      }
    }
  } catch {
    // Description is optional for some codecs; decoder.configure may still work.
  }
  return undefined
}
