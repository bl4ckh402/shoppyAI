"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ShopifyPreviewProps {
  code: string
  mode: string
}

export default function ShopifyPreview({ code, mode }: ShopifyPreviewProps) {
  const { theme } = useTheme()
  const [isHovered, setIsHovered] = useState(Array(4).fill(false))
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state
  useEffect(() => {
    if (code) {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 800)
      return () => clearTimeout(timer)
    }
  }, [code])

  const handleMouseEnter = (index: number) => {
    const newState = [...isHovered]
    newState[index] = true
    setIsHovered(newState)
  }

  const handleMouseLeave = (index: number) => {
    const newState = [...isHovered]
    newState[index] = false
    setIsHovered(newState)
  }

  const width = mode === "mobile" ? "max-w-[375px]" : "w-full"
  const isDark = theme === "dark"

  return (
    <div className="p-4 flex justify-center">
      <motion.div
        className={`${width} border border-border/50 rounded-xl ${
          isDark ? "bg-slate-900/50" : "bg-white/90"
        } backdrop-blur-md transition-all duration-500 relative overflow-hidden`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Browser-like top bar for desktop mode */}
        {mode === "desktop" && (
          <div className="h-6 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-xl flex items-center px-2 space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            <div className="ml-2 h-3.5 bg-gray-200 dark:bg-gray-700 rounded-sm flex-grow max-w-[200px]"></div>
          </div>
        )}

        {/* Mobile frame for mobile mode */}
        {mode === "mobile" && (
          <div className="relative">
            <div className="h-6 bg-black rounded-t-xl flex justify-center items-end pb-0.5">
              <div className="w-20 h-3 rounded-b-xl bg-black border-b border-x border-gray-700"></div>
            </div>
          </div>
        )}

        {code ? (
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center min-h-[400px]"
              >
                <div className="flex flex-col items-center">
                  <div className="relative h-10 w-10 mb-4">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-shopify-green border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rendering preview...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 min-h-[400px]"
              >
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {/* This would be replaced with actual rendering of the Shopify theme */}
                  <motion.div
                    className="mb-6 bg-gray-100 dark:bg-gray-800 h-40 rounded-lg flex items-center justify-center border border-shopify-green/20 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-shopify-green/5 to-transparent"></div>
                    <span className="text-sm relative z-10">Hero Section Preview</span>
                    <div className="absolute bottom-2 right-2 bg-shopify-green/90 text-white text-xs px-2 py-0.5 rounded-full">
                      Featured
                    </div>
                  </motion.div>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border transition-all duration-300 ${
                          isHovered[i - 1]
                            ? "border-shopify-green shadow-lg shadow-shopify-green/10"
                            : "border-shopify-green/10"
                        }`}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onMouseEnter={() => handleMouseEnter(i - 1)}
                        onMouseLeave={() => handleMouseLeave(i - 1)}
                      >
                        <div className="bg-gray-200 dark:bg-gray-700 h-24 mb-2 rounded-lg relative overflow-hidden">
                          {isHovered[i - 1] && (
                            <motion.div
                              className="absolute inset-0 bg-shopify-green/10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            />
                          )}
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mb-2"></div>
                        <motion.div
                          className="h-8 bg-shopify-green/20 rounded-lg flex items-center justify-center text-xs text-shopify-green font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isHovered[i - 1] ? "Add to Cart" : ""}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="flex items-center justify-center min-h-[400px] text-gray-400 dark:text-gray-500">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="mb-4 opacity-50">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto"
                >
                  <rect width="18" height="14" x="3" y="3" rx="2" />
                  <path d="M7 7h10" />
                  <path d="M7 11h10" />
                  <path d="M7 15h10" />
                </svg>
              </div>
              Generate code to see preview
              <div className="mt-2 text-xs text-shopify-green">Type a prompt and click Generate</div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
