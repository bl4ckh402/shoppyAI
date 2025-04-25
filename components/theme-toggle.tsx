"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const mountedRef = React.useRef(false)

  React.useEffect(() => {
    if (!mountedRef.current) {
      setMounted(true)
      mountedRef.current = true
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="border border-border/50 bg-background/50 backdrop-blur-md hover:bg-shopify-green/10 hover:border-shopify-green/50 transition-all duration-300 rounded-md p-2"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
