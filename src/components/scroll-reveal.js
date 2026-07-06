import React from "react"

/**
 * Wrapper for card layout compatibility. Server-rendered cards stay plain
 * static markup so nothing is gated behind client-side JavaScript work
 * (that's what keeps Lighthouse happy).
 *
 * With `animate` (used only for client-appended cards that never exist at
 * audit time), the card starts hidden and fades in when scrolled into view.
 *
 * @param {React.ReactNode} children
 * @param {boolean} animate - Scroll-triggered fade-in for client-only cards
 * @param {number} index - Position within the appended batch, for stagger
 */
const ScrollReveal = ({ children, animate = false, index = 0 }) => {
  const ref = React.useRef(null)
  const [visible, setVisible] = React.useState(!animate)

  React.useEffect(() => {
    if (!animate || visible) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "80px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [animate, visible])

  const className = animate
    ? `scroll-reveal ${visible ? "scroll-reveal--enter" : "scroll-reveal--pending"}`
    : "scroll-reveal"

  return (
    <div
      ref={ref}
      className={className}
      style={
        animate && visible
          ? { animationDelay: `${(index % 3) * 90}ms` }
          : undefined
      }
    >
      {children}
    </div>
  )
}

export default ScrollReveal
