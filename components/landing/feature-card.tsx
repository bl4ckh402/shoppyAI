"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  image: string
  index: number
}

export default function FeatureCard({ title, description, icon, image, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="bg-card/30 backdrop-blur-lg border border-border/50 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-shopify-green/5 hover:-translate-y-1 h-full flex flex-col">
        <div className="p-6">
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-shopify-green/10 text-shopify-green">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="mt-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </div>
    </motion.div>
  )
}
