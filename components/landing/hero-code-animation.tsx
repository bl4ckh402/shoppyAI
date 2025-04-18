"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export default function HeroCodeAnimation() {
  const { theme } = useTheme()
  const [currentStep, setCurrentStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [code, setCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const examplePrompt = "Create a product grid with hover effects and add to cart functionality"
  const exampleCode = `{% section 'hero' %}
<div class="product-grid">
  {% for product in collection.products limit: 4 %}
    <div class="product-card">
      <img src="{{ product.featured_image | img_url: 'medium' }}" alt="{{ product.title }}">
      <h3>{{ product.title }}</h3>
      <p class="price">{{ product.price | money }}</p>
      <button class="add-to-cart" data-product-id="{{ product.id }}">
        Add to Cart
      </button>
    </div>
  {% endfor %}
</div>`

  useEffect(() => {
    const animationSequence = async () => {
      // Type the prompt
      setIsTyping(true)
      for (let i = 0; i <= examplePrompt.length; i++) {
        setPrompt(examplePrompt.substring(0, i))
        await new Promise((resolve) => setTimeout(resolve, 30))
      }
      setIsTyping(false)

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Start generating
      setIsGenerating(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Type the code
      for (let i = 0; i <= exampleCode.length; i++) {
        setCode(exampleCode.substring(0, i))
        await new Promise((resolve) => setTimeout(resolve, 5))
      }
      setIsGenerating(false)

      // Wait before restarting
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Reset and start over
      setPrompt("")
      setCode("")
      animationSequence()
    }

    animationSequence()

    return () => {
      setPrompt("")
      setCode("")
    }
  }, [])

  return (
    <div className="p-4 min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs text-muted-foreground">ShopifyAI Editor</div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Prompt input */}
        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-1">Describe what you want to build:</div>
          <div className="bg-background/50 border border-border/50 rounded-md p-2 min-h-[60px] relative">
            {prompt}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                className="inline-block w-1 h-4 bg-shopify-green ml-0.5"
              ></motion.span>
            )}
          </div>
        </div>

        {/* Code output */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-muted-foreground">Generated code:</div>
            {isGenerating && (
              <div className="text-xs text-shopify-green flex items-center">
                <motion.div
                  className="w-3 h-3 mr-1 rounded-full border border-shopify-green"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                ></motion.div>
                Generating...
              </div>
            )}
          </div>
          <div
            className={`bg-slate-950/90 dark:bg-slate-950/70 text-slate-50 rounded-md p-2 font-mono text-xs overflow-auto flex-1 min-h-[200px] ${theme === "dark" ? "border border-slate-800" : ""}`}
          >
            <pre className="whitespace-pre-wrap">{code}</pre>
            {isGenerating && !code && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                className="inline-block w-1 h-4 bg-shopify-green ml-0.5"
              ></motion.span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
