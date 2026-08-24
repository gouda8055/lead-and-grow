import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'

const LINKS = ['LEADERSHIP', 'ASSESSMENT', 'PRACTICE', 'PROGRESS', 'MY JOURNEY'] as const

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-[100] bg-dark transition-[opacity,visibility] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        open ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      <div className="flex justify-end px-6 sm:px-8 pt-8 sm:pt-12">
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="flex items-center justify-center rounded-full border border-white/30 hover:border-white transition-colors"
          style={{ width: 40, height: 40 }}
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      <div className="flex h-[calc(100%-6rem)] items-center justify-center">
        <ul className="flex flex-col items-center gap-6">
          {LINKS.map((link, i) => {
            const isActive = link === 'LEADERSHIP'
            return (
              <li
                key={link}
                className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transitionDelay: `${i * 60}ms`,
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                <Link
                  to={link === 'LEADERSHIP' ? '/' : '/app'}
                  onClick={onClose}
                  className={`text-2xl sm:text-3xl font-light tracking-wide uppercase transition-colors ${
                    isActive ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {link}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8">
        <span className="text-xs tracking-[0.2em] uppercase text-white/60">NEWS</span>
        <span className="text-xs tracking-[0.2em] uppercase text-white/60">CONTACT</span>
      </div>
    </div>
  )
}
