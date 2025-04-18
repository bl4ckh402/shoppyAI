"use client"

import { motion } from "framer-motion"
import { LucideStar } from "lucide-react"

interface TestimonialCardProps {
  testimonial: {
    name: string
    role: string
    content: string
    avatar: string
    rating: number
  }
  index: number
}

export default function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-lg p-6 shadow-lg transition-all duration-500 hover:shadow-shopify-green/10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center mb-4">
        <div className="mr-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-shopify-green/30">
            <img
              src={testimonial.avatar || "/placeholder.svg"}
              alt={testimonial.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div>
          <h4 className="font-semibold">{testimonial.name}</h4>
          <p className="text-sm text-foreground/70">{testimonial.role}</p>
        </div>
      </div>
      <div className="flex mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <LucideStar
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
      <p className="text-foreground/80 italic">"{testimonial.content}"</p>
    </motion.div>
  )
}
