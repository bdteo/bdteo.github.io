import React, { useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"

/**
 * ScrollReveal wraps a child element and fades it in when it enters the viewport.
 *
 * - Cards already in the viewport on mount (including scroll-restored pages)
 *   appear instantly with no animation.
 * - Cards below the fold animate in with a staggered delay when scrolled to.
 * - Once revealed, the card stays visible permanently.
 *
 * @param {number} index - Position in the grid, used to calculate stagger delay
 * @param {React.ReactNode} children
 */
const ScrollReveal = ({ children, index = 0 }) => {
  const hasAnimated = useRef(false)
  const elementRef = useRef(null)

  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    rootMargin: "50px",
  })

  // Merge refs (react-intersection-observer ref + our element ref)
  const setRefs = React.useCallback(
    (node) => {
      elementRef.current = node
      inViewRef(node)
    },
    [inViewRef]
  )

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true

    const el = elementRef.current
    if (!el) return

    // Check if element was already in viewport on mount (scroll restore / above fold)
    // In that case, skip the animation entirely
    const rect = el.getBoundingClientRect()
    const wasInViewportOnMount =
      rect.top < window.innerHeight + 100 && rect.bottom > -100

    if (wasInViewportOnMount && !el.dataset.scrolledInto) {
      // Instant reveal — no transition
      el.classList.add("is-visible", "no-transition")
      el.removeAttribute("aria-busy")
    } else {
      // Animated reveal with stagger based on position within the current "batch"
      const staggerDelay = Math.min((index % 6) * 80, 400)
      el.style.transitionDelay = `${staggerDelay}ms`
      el.classList.add("is-visible")
      el.removeAttribute("aria-busy")

      const cleanup = () => {
        el.style.transitionDelay = ""
        el.removeEventListener("transitionend", cleanup)
      }
      el.addEventListener("transitionend", cleanup)
    }
  }, [inView, index])

  // Mark elements that were scrolled into (not present on initial load)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (elementRef.current && !hasAnimated.current) {
        elementRef.current.dataset.scrolledInto = "true"
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div ref={setRefs} className="scroll-reveal" aria-busy="true">
      {children}
    </div>
  )
}

export default ScrollReveal
