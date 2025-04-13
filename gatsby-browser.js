// File: gatsby-browser.js

// Import custom typefaces and styles
import "@fontsource-variable/montserrat"
import "@fontsource/merriweather"
import "./src/styles/main.scss"

// Highlighting for code blocks
import "prismjs/themes/prism.css"

// FontAwesome configuration
import "@fortawesome/fontawesome-svg-core/styles.css"
import { config as faConfig } from "@fortawesome/fontawesome-svg-core"

// Import copy button functionality
import { addCopyButtons } from "./src/components/code-copy-button"

// Configure Font Awesome
faConfig.autoAddCss = false

// Automatically reload the page when a new service worker is available
export const onServiceWorkerUpdateReady = () => {
  window.location.reload()
}

// Add copy buttons to code blocks after the page is loaded
export const onRouteUpdate = () => {
  addCopyButtons()
}
