import { ArrowDown, ChevronUp } from 'lucide-react'
import { useStagger } from '@/hooks/useStagger'

const PARAMETERS = [
  'Self-awareness',
  'Communication',
  'Emotional intelligence',
  'Decision-making',
  'Influence',
  'Adaptability',
  'Teamwork',
  'Discipline',
  'Confidence',
  'Vision & purpose',
  'Stress management',
  'Consistency',
]

export function SectionTwo({ opacity }: { opacity: number }) {
  const active = opacity > 0.3
  const inHeadline = useStagger(active, 0)
  const inDown = useStagger(active, 200)
  const inDots = useStagger(active, 350)
  const inUp = useStagger(active, 500)

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity, transition: 'opacity 0.1s ease-out' }}
    >
      <div
        className={`stagger-item ${inHeadline ? 'in' : ''} max-w-4xl px-6 sm:px-8 text-center`}
      >
        <h2
          className="font-extralight tracking-wide leading-[1.3] uppercase text-dark"
          style={{ fontSize: 'clamp(1.5rem,4.5vw,4.5rem)' }}
        >
          Understand yourself.
          <br />
          Strengthen your leadership.
        </h2>
        <p className="mt-6 text-base sm:text-lg text-dark">
          We assess your leadership across 12 dimensions{' '}
          <span className="font-medium">to reveal where you are today</span>{' '}
          <span className="text-dark/60">and what will help you grow next.</span>
        </p>

        <div className="mt-10 hidden sm:flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs tracking-[0.1em] uppercase text-dark/70">
          {PARAMETERS.map((p, i) => (
            <span key={p}>
              {i + 1}. {p}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-16 right-6 sm:right-8 md:right-12 flex flex-col items-center gap-4">
        <button
          aria-label="Scroll down"
          className={`stagger-item ${inDown ? 'in' : ''} flex items-center justify-center rounded-full border border-dark/50 hover:opacity-70 transition-opacity`}
          style={{ width: 48, height: 48 }}
        >
          <ArrowDown size={18} className="text-dark" />
        </button>

        <div className={`stagger-item ${inDots ? 'in' : ''} flex flex-col items-center gap-2`}>
          <span className="rounded-full bg-dark" style={{ width: 8, height: 8 }} />
          <span className="rounded-full bg-dark/40" style={{ width: 6, height: 6 }} />
          <span className="rounded-full bg-dark/40" style={{ width: 6, height: 6 }} />
        </div>

        <button
          aria-label="Scroll up"
          className={`stagger-item ${inUp ? 'in' : ''} flex items-center justify-center rounded-full border border-dark/50 hover:opacity-70 transition-opacity`}
          style={{ width: 40, height: 40 }}
        >
          <ChevronUp size={16} className="text-dark" />
        </button>
      </div>
    </div>
  )
}
