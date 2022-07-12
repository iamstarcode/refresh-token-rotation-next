
const getInitialTheme = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedPrefs = window.localStorage.getItem("color-theme")
      if (typeof storedPrefs === "string") {
        return storedPrefs
      }
  
      const userMedia = window.matchMedia("(prefers-color-scheme: dark)")
      if (userMedia.matches) {
        return "dark"
      }
    }
    return "dark"
  }