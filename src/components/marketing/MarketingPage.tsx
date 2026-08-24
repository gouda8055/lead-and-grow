import { useState } from 'react'
import { useVideoScrub } from '@/hooks/useVideoScrub'
import { Navbar } from './Navbar'
import { MobileMenu } from './MobileMenu'
import { SectionOne } from './SectionOne'
import { SectionTwo } from './SectionTwo'
import { SectionThree } from './SectionThree'
import { s1Opacity, s2Opacity, s3Opacity } from './sectionOpacity'

const HERO_VIDEO_URL =
  import.meta.env.VITE_HERO_VIDEO_URL ||
  'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4'

export function MarketingPage() {
  const { containerRef, videoRef, canvasRef, progress, canvasLive } = useVideoScrub(HERO_VIDEO_URL)
  const [menuOpen, setMenuOpen] = useState(false)

  const o1 = s1Opacity(progress)
  const o2 = s2Opacity(progress)
  const o3 = s3Opacity(progress)

  // Nav flips to white once the darker, cinematic third act starts taking over.
  const navDark = o3 > 0.4

  return (
    <div ref={containerRef} className="relative h-[500vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-dark">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO_URL}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: canvasLive ? 1 : 0 }}
          aria-hidden="true"
        />

        <div className="absolute inset-0 pointer-events-none">
          <Navbar dark={navDark} onOpenMenu={() => setMenuOpen(true)} />
          <SectionOne opacity={o1} />
          <SectionTwo opacity={o2} />
          <SectionThree opacity={o3} />
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
