// custom typefaces
import "@fontsource-variable/montserrat"
import "@fontsource/merriweather"
// custom CSS styles
import "./src/styles/main.scss"

// Highlighting for code blocks
import "prismjs/themes/prism.css"

import "@fortawesome/fontawesome-svg-core/styles.css"
import { config as faConfig } from "@fortawesome/fontawesome-svg-core"
faConfig.autoAddCss = false

// Service worker update functionality
export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    `This application has been updated. ` +
    `Reload to display the latest version?`
  )

  if (answer === true) {
    window.location.reload()
  }
}
