import React from "react"
import { ThemeProvider } from "./src/context/ThemeContext"

import "./src/styles/main.scss"

const GA_TRACKING_ID = "G-7MSGWE21G5"
const ANALYTICS_DELAY_MS = 12000

const canTrackAnalytics = () => {
  if (process.env.NODE_ENV !== "production") return false
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false
  }

  return !["1", "yes"].includes(
    String(navigator.doNotTrack || window.doNotTrack || "").toLowerCase(),
  )
}

const ensureGtagQueue = () => {
  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments)
    }

  if (!window.__bdteoGaInitialized) {
    window.gtag("js", new Date())
    window.__bdteoGaInitialized = true
  }
}

const loadGoogleAnalytics = () => {
  if (!canTrackAnalytics() || window.__bdteoGaLoaded) return

  ensureGtagQueue()
  window.__bdteoGaLoaded = true

  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
  document.head.appendChild(script)
}

const scheduleGoogleAnalytics = () => {
  if (!canTrackAnalytics() || window.__bdteoGaScheduled) return

  window.__bdteoGaScheduled = true
  window.setTimeout(() => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(loadGoogleAnalytics)
    } else {
      loadGoogleAnalytics()
    }
  }, ANALYTICS_DELAY_MS)
}

const trackPageView = location => {
  if (!canTrackAnalytics()) return

  ensureGtagQueue()
  window.gtag("config", GA_TRACKING_ID, {
    anonymize_ip: true,
    cookie_expires: 0,
    page_title: document.title,
    page_location: location.href,
    page_path: `${location.pathname}${location.search}${location.hash}`,
  })
}

const addCopyButtonsWhenNeeded = () => {
  if (!document.querySelector(".gatsby-highlight")) return

  import("./src/components/code-copy-button").then(({ addCopyButtons }) => {
    addCopyButtons()
  })
}

// Automatically reload the page when a new service worker is available
export const onServiceWorkerUpdateReady = () => {
  window.location.reload()
}

export const onClientEntry = () => {
  scheduleGoogleAnalytics()
}

export const onRouteUpdate = ({ location }) => {
  addCopyButtonsWhenNeeded()
  trackPageView(location)
  scheduleGoogleAnalytics()
}

export const wrapRootElement = ({ element }) => {
  return <ThemeProvider>{element}</ThemeProvider>
}
