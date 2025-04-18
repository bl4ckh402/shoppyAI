"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { LucideZap, LucideBrain } from "lucide-react"
import { motion } from "framer-motion"

interface AIPromptInputProps {
  onGenerate: (code: string) => void
}

export default function AIPromptInput({ onGenerate }: AIPromptInputProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Simulate AI generation - in a real app, this would call your AI service
    setTimeout(() => {
      // Example generated Shopify Liquid code
      const generatedCode = `{% section 'hero' %}
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

      onGenerate(generatedCode)
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <Card className="border-border/50 bg-card/30 backdrop-blur-lg shadow-lg rounded-xl transition-all duration-500 hover:shadow-shopify-green/10 group">
      <CardContent className="pt-6 relative">
        <motion.div
          className="absolute -top-3 left-4 bg-shopify-green/90 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LucideBrain className="w-3 h-3 mr-1" />
          AI Prompt
        </motion.div>
        <Textarea
          placeholder="Describe what you want to build for your Shopify store... (e.g., 'Create a product grid with hover effects and add to cart functionality')"
          className="min-h-[120px] resize-none bg-background/50 backdrop-blur-md border-border/50 focus-visible:ring-shopify-green/50 transition-all duration-300"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value)
            setIsTyping(true)
            setTimeout(() => setIsTyping(false), 1000)
          }}
        />
        {isTyping && (
          <motion.div
            className="absolute bottom-2 right-2 text-xs text-shopify-green"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            AI is listening...
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">Powered by AI trained on Shopify best practices</div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`${
              isGenerating ? "bg-shopify-dark-green" : "bg-shopify-green hover:bg-shopify-dark-green"
            } text-white relative overflow-hidden group`}
          >
            <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></span>
            {isGenerating ? (
              <div className="flex items-center">
                <div className="relative mr-2 h-4 w-4">
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                </div>
                Generating...
              </div>
            ) : (
              <div className="flex items-center">
                <motion.div
                  className="mr-2 h-4 w-4"
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <LucideZap className="h-4 w-4" />
                </motion.div>
                Generate
              </div>
            )}
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
  )
}
