"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LucideCheck, LucideX } from "lucide-react"

interface PricingCardProps {
  plan: {
    name: string
    price: string
    period: string
    description: string
    features: string[]
    limitations: string[]
    cta: string
    popular: boolean
  }
  index: number
}

export default function PricingCard({ plan, index }: PricingCardProps) {
  return (
    <motion.div
      className={`rounded-xl border ${plan.popular ? "border-shopify-green" : "border-border/50"} bg-card/30 backdrop-blur-lg p-6 shadow-lg transition-all duration-500 hover:shadow-shopify-green/10 relative`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      whileHover={{ y: -5 }}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-shopify-green text-white text-xs font-medium px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
        <p className="text-foreground/70 text-sm mb-4">{plan.description}</p>
        <div className="mb-2">
          <span className="text-3xl font-bold">{plan.price}</span>
          <span className="text-foreground/70 text-sm"> / {plan.period}</span>
        </div>
      </div>
      <div className="space-y-4 mb-6">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start">
            <LucideCheck className="h-5 w-5 text-shopify-green mr-2 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
        {plan.limitations.map((limitation) => (
          <div key={limitation} className="flex items-start text-foreground/50">
            <LucideX className="h-5 w-5 text-foreground/30 mr-2 flex-shrink-0" />
            <span className="text-sm">{limitation}</span>
          </div>
        ))}
      </div>
      <Button
        className={`w-full ${plan.popular ? "bg-shopify-green hover:bg-shopify-dark-green text-white" : "bg-foreground/10 hover:bg-foreground/20 text-foreground"}`}
      >
        {plan.cta}
      </Button>
    </motion.div>
  )
}
