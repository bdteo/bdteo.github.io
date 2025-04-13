// Modern copy button functionality for code blocks
// Following latest design standards with animation effects

// Copy text to clipboard
const copyToClipboard = str => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(str).catch(err => {
      console.error("Could not copy text: ", err)
    })
  } else {
    // Fallback for older browsers
    const el = document.createElement("textarea")
    el.value = str
    el.setAttribute("readonly", "")
    el.style.position = "absolute"
    el.style.left = "-9999px"
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
  }
}

// Function that adds copy buttons to all code blocks
export const addCopyButtons = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return // Exit if not in browser environment
  }
  
  // Wait for DOM to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCopyButtons)
  } else {
    window.setTimeout(initCopyButtons, 100) // Small delay to ensure everything is loaded
  }
}

const initCopyButtons = () => {
  // Select all code blocks
  const codeBlocks = document.querySelectorAll(".gatsby-highlight")
  
  codeBlocks.forEach(block => {
    // Check if button is already added
    if (block.querySelector(".copy-button")) return
    
    // Get the code content
    const codeElement = block.querySelector("pre code")
    if (!codeElement) return
    
    // Get code content as text
    const textContent = codeElement.textContent || ""

    // Create the button element
    const button = document.createElement("button")
    button.className = "copy-button"
    button.setAttribute("aria-label", "Copy code to clipboard")
    
    // Only add the icon SVG
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `
    
    // Add click event
    button.addEventListener("click", () => {
      copyToClipboard(textContent)
      
      // Replace with checkmark SVG for success state
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `
      button.classList.add("copied")
      
      // Reset after 2 seconds
      setTimeout(() => {
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `
        button.classList.remove("copied")
      }, 2000)
    })
    
    // Add button to the code block
    block.appendChild(button)
  })
}