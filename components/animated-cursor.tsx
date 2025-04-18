"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function AnimatedCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })

      // Check if cursor is over a clickable element
      const target = e.target as HTMLElement
      const isClickable =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        window.getComputedStyle(target).cursor === "pointer"

      setIsPointer(isClickable)
    }

    const handleMouseDown = () => setIsActive(true)
    const handleMouseUp = () => setIsActive(false)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // Don't show custom cursor on mobile devices
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
    return null
  }

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full border-2 border-shopify-green pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: position.x - 12,
          y: position.y - 12,
          scale: isActive ? 0.8 : 1,
        }}
        transition={{ type: "spring", damping: 30, mass: 0.5, stiffness: 400 }}
      />

      {/* Cursor dot */}
      <motion.div
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-shopify-green pointer-events-none z-50 ${
          isPointer ? "opacity-0" : "opacity-100"
        }`}
        animate={{
          x: position.x - 4,
          y: position.y - 4,
          scale: isActive ? 0.5 : 1,
        }}
        transition={{ type: "spring", damping: 50, mass: 0.2, stiffness: 800 }}
      />

      {/* Hover indicator for clickable elements */}
      {isPointer && (
        <motion.div
          className="fixed top-0 left-0 w-10 h-10 rounded-full border border-shopify-green pointer-events-none z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 0.5,
            scale: 1.2,
            x: position.x - 20,
            y: position.y - 20,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        />
      )}
    </>
  )
}
