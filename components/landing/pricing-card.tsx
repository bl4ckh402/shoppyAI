"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LucideCheck } from "lucide-react"

interface PricingCardProps {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  popular: boolean
  index: number
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  popular,
  index,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative"
    >
      {popular && (
        <div className="absolute -top-4 inset-x-0 flex justify-center">
          <div className="bg-shopify-green text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>
        </div>
      )}

      <div
        className={`bg-card/30 backdrop-blur-lg border ${popular ? "border-shopify-green/50" : "border-border/50"} rounded-xl p-6 h-full flex flex-col transition-all duration-500 hover:shadow-lg ${popular ? "hover:shadow-shopify-green/10" : "hover:shadow-shopify-green/5"} hover:-translate-y-1 relative`}
      >
        {popular && (
          <div className="absolute inset-0 rounded-xl border border-shopify-green/20 -m-0.5 pointer-events-none"></div>
        )}

        <div>
          <h3 className="text-xl font-bold mb-2">{name}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="mb-6">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-muted-foreground ml-2">{period}</span>
          </div>
        </div>

        <div className="space-y-3 mb-8 flex-grow">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start">
              <div className="flex-shrink-0 mr-2 mt-1">
                <div
                  className={`rounded-full p-1 ${popular ? "bg-shopify-green/20 text-shopify-green" : "bg-shopify-green/10 text-shopify-green/80"}`}
                >
                  <LucideCheck className="h-3 w-3" />
                </div>
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          className={`w-full ${popular ? "bg-shopify-green hover:bg-shopify-dark-green text-white" : "bg-card hover:bg-card/80 border border-border/50"} relative overflow-hidden group`}
        >
          {popular && (
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-shopify-green via-shopify-dark-green to-shopify-green bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          )}
          <span className="relative">{cta}</span>
        </Button>
      </div>
    </motion.div>
  )
}
