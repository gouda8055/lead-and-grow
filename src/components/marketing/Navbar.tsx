import { Info, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'

const LINKS = ['LEADERSHIP', 'ASSESSMENT', 'PRACTICE', 'PROGRESS', 'MY JOURNEY'] as const

export function Navbar({ dark, onOpenMenu }: { dark: boolean; onOpenMenu: () => void }) {
  const colorClass = dark ? 'text-white' : 'text-dark'

  return (
    <nav
      className={`pointer-events-auto flex items-center justify-between px-6 sm:px-8 md:px-12 pt-8 sm:pt-12 pb-6 transition-colors duration-500 ${colorClass}`}
    >
      {/* Left: desktop links / mobile hamburger */}
      <div className="flex items-center">
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex lg:hidden flex-col justify-center gap-[5px]"
        >
          <span className={`block h-[2px] w-6 ${dark ? 'bg-white' : 'bg-dark'}`} />
          <span className={`block h-[2px] w-6 ${dark ? 'bg-white' : 'bg-dark'}`} />
          <span className={`block h-[2px] w-4 ${dark ? 'bg-white' : 'bg-dark'}`} />
        </button>

        <div className="hidden lg:flex items-center gap-8 xl:gap-10">
          {LINKS.map((link) => {
            const isActive = link === 'LEADERSHIP'
            return (
              <Link
                key={link}
                to={link === 'LEADERSHIP' ? '/' : '/app'}
                className={`relative text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70 transition-opacity pb-1 ${
                  isActive ? 'after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2px] after:bg-current' : ''
                }`}
              >
                {link}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline text-xs tracking-[0.15em] uppercase font-medium">NEWS</span>
        <span
          className={`flex items-center justify-center rounded-full ${dark ? 'bg-white' : 'bg-dark'}`}
          style={{ width: 20, height: 20 }}
        >
          <Info size={10} className={dark ? 'text-dark' : 'text-white'} />
        </span>
        <span className="hidden sm:inline text-xs tracking-[0.15em] uppercase font-medium">MENU</span>
      </div>
    </nav>
  )
}
