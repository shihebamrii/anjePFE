// Import React framework
import * as React from "react"

// Define width threshold (in pixels) for classifying device as mobile
const MOBILE_BREAKPOINT = 768

// Custom hook to detect if the user's viewport is mobile width
export function useIsMobile() {
  // State to hold mobile status (undefined initially to prevent mismatch on SSR)
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    // Media query listener checking maximum width threshold
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Handler that updates state when window width crosses breakpoint
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add change event listener for window resizing
    mql.addEventListener("change", onChange)
    
    // Check initial window width immediately on component mount
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup function to remove event listener when component unmounts
    return () => mql.removeEventListener("change", onChange);
  }, [])

  // Coerce isMobile to boolean
  return !!isMobile
}
