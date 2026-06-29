import React from "react"

/**
 * Keep the wrapper for card layout compatibility without gating SSR content
 * behind client-side IntersectionObserver work.
 *
 * @param {React.ReactNode} children
 */
const ScrollReveal = ({ children }) => (
  <div className="scroll-reveal">{children}</div>
)

export default ScrollReveal
