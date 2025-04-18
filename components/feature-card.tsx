"use client"

import type React from "react"

import { motion } from "framer-motion"

interface FeatureCardProps {
  feature: {
    title: string
    description: string
    icon: React.ReactNode
    demo: string
  }
  index: number
  inView: boolean
}

export default function FeatureCard({ feature, index, inView }: FeatureCardProps) {
  return (
    <motion.div
      className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-lg overflow-hidden shadow-lg transition-all duration-500 hover:shadow-shopify-green/10 group"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      whileHover={{ y: -5 }}
    >
      <div className="p-6">
        <div className="mb-4">{feature.icon}</div>
        <h3 className="text-xl font-semibold mb-2 group-hover:text-shopify-green transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-foreground/70">{feature.description}</p>
      </div>
      <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img
          src={feature.demo || "/placeholder.svg"}
          alt={feature.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 right-4 bg-shopify-green/90 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Learn More
        </div>
      </div>
    </motion.div>
  )
}
