import { useEffect, useState } from 'react'

/**
 * Returns `true` once `active` has been true for at least `delayMs`.
 * Used to stagger the entrance of children inside a section whose own
 * opacity is scroll-driven (section becomes eligible to animate once its
 * opacity crosses ~0.3, per the marketing-page stagger spec).
 */
export function useStagger(active: boolean, delayMs = 0): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    const t = setTimeout(() => setVisible(true), delayMs)
    return () => clearTimeout(t)
  }, [active, delayMs])

  return visible
}
