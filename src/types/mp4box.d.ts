// Minimal ambient typings for the `mp4box` package (no official types ship on npm).
// Only the surface used by src/hooks/useVideoScrub.ts is declared.

declare module 'mp4box' {
  export interface MP4Sample {
    number: number
    track_id: number
    is_sync: boolean
    data: Uint8Array
    size: number
    cts: number
    dts: number
    timescale: number
    duration: number
  }

  export interface MP4VideoTrack {
    id: number
    codec: string
    video?: { width: number; height: number }
    nb_samples: number
    timescale: number
    duration: number
  }

  export interface MP4Info {
    duration: number
    timescale: number
    videoTracks: MP4VideoTrack[]
  }

  export interface MP4ArrayBuffer extends ArrayBuffer {
    fileStart: number
  }

  export interface MP4File {
    onReady?: (info: MP4Info) => void
    onSamples?: (trackId: number, user: unknown, samples: MP4Sample[]) => void
    onError?: (error: string) => void
    appendBuffer(data: MP4ArrayBuffer): number
    start(): void
    stop(): void
    flush(): void
    setExtractionOptions(trackId: number, user?: unknown, options?: { nbSamples?: number }): void
    getTrackById(id: number): unknown
  }

  export function createFile(): MP4File
}
