import { ArrowRight } from 'lucide-react'
import { useStagger } from '@/hooks/useStagger'

export function SectionOne({ opacity }: { opacity: number }) {
  const active = opacity > 0.3
  const inTitle = useStagger(active, 0)
  const inSubtitle = useStagger(active, 150)
  const inButton = useStagger(active, 300)

  return (
    <div
      className="absolute inset-0 flex items-center"
      style={{ opacity, transition: 'opacity 0.1s ease-out' }}
    >
      <div className="w-full px-6 sm:px-8 md:px-20 lg:px-32">
        <h1
          className={`stagger-item ${inTitle ? 'in' : ''} font-light uppercase leading-[1.2] text-dark`}
          style={{ fontSize: 'clamp(2rem,5vw,5rem)' }}
        >
          Reset your mind.
          <br />
          Rediscover your potential.
        </h1>
        <p
          className={`stagger-item ${inSubtitle ? 'in' : ''} mt-6 text-sm tracking-[0.3em] uppercase text-dark`}
        >
          Pause. Breathe. Become.
        </p>
      </div>

      <button
        aria-label="Continue"
        className={`stagger-item ${inButton ? 'in' : ''} absolute bottom-10 right-6 sm:right-8 md:right-12 flex items-center justify-center rounded-full border hover:opacity-70 transition-opacity`}
        style={{ width: 48, height: 48, borderColor: 'rgba(29,48,69,0.5)' }}
      >
        <ArrowRight size={18} className="text-dark" />
      </button>
    </div>
  )
}
