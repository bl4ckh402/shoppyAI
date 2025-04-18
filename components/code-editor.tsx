"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

interface CodeEditorProps {
  code: string
  language: string
}

export default function CodeEditor({ code, language }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [lineCount, setLineCount] = useState(0)

  // In a real implementation, you would integrate a code editor like Monaco or CodeMirror
  // This is a simplified placeholder
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textContent = code
      // Count lines for line numbers
      setLineCount(code.split("\n").length)
    }
  }, [code])

  // Generate line numbers
  const lineNumbers = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1)

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="flex">
        {/* Line numbers */}
        <div className="p-4 pt-[calc(1rem+1px)] text-xs font-mono text-gray-500 dark:text-gray-400 bg-slate-900/80 dark:bg-slate-950/60 border-r border-slate-700/30 rounded-bl-xl select-none">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-5">
              {num}
            </div>
          ))}
        </div>

        {/* Code content */}
        <pre
          ref={editorRef}
          className="p-4 overflow-auto text-sm font-mono bg-slate-950/90 dark:bg-slate-950/70 text-slate-50 rounded-br-xl max-h-[400px] backdrop-blur-md transition-all duration-300 w-full leading-5"
          style={{ tabSize: 2 }}
        >
          {code}
        </pre>
      </div>

      {/* Language badge */}
      <motion.div
        className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-shopify-green/90 text-white font-medium"
        initial={{ opacity: 0.8, y: 0 }}
        animate={{ opacity: isHovered ? 1 : 0.8, y: isHovered ? -2 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {language}
      </motion.div>

      {/* Copy button that appears on hover */}
      {code && (
        <motion.button
          className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            navigator.clipboard.writeText(code)
            // You could add a toast notification here
          }}
        >
          Copy
        </motion.button>
      )}

      {/* Syntax highlighting effect */}
      {isHovered && code && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-shopify-green/5 to-transparent rounded-b-xl"></div>
        </motion.div>
      )}
    </div>
  )
}
