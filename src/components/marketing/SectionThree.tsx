import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStagger } from '@/hooks/useStagger'

export function SectionThree({ opacity }: { opacity: number }) {
  const active = opacity > 0.3
  const inEyebrow = useStagger(active, 0)
  const inHeadline = useStagger(active, 150)
  const inCta = useStagger(active, 300)

  return (
    <div
      className="absolute inset-0 flex items-center justify-end"
      style={{ opacity, transition: 'opacity 0.1s ease-out' }}
    >
      <div className="max-w-2xl text-left px-6 sm:px-8 md:px-20 lg:px-32">
        <p className={`stagger-item ${inEyebrow ? 'in' : ''} text-white/60 text-lg tracking-wide mb-4`}>
          Your personalized path
        </p>
        <h2
          className={`stagger-item ${inHeadline ? 'in' : ''} font-light text-white leading-[1.2] uppercase tracking-wide mb-8`}
          style={{ fontSize: 'clamp(2rem,4vw,4rem)' }}
        >
          Train the mind.
          <br />
          Strengthen the body.
          <br />
          Lead with clarity.
        </h2>

        <Link
          to="/app/practice"
          className={`stagger-item ${inCta ? 'in' : ''} inline-flex items-center gap-4 group`}
        >
          <span className="text-sm tracking-[0.3em] text-white/80 uppercase">
            Begin your 15-minute practice
          </span>
          <span className="flex items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover:scale-110" style={{ width: 40, height: 40 }}>
            <ArrowRight size={16} className="text-gray-800" />
          </span>
        </Link>
      </div>
    </div>
  )
}
