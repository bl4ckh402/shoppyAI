"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import FloatingParticles from "@/components/floating-particles"
import PricingCard from "@/components/pricing-card"
import FeatureCard from "@/components/feature-card"
import TestimonialCard from "@/components/testimonial-card"
import {
  LucideZap,
  LucideArrowRight,
  LucideCode,
  LucideRocket,
  LucideBrain,
  LucideStore,
  LucideChevronDown,
} from "lucide-react"

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: false })
  const isFeaturesInView = useInView(featuresRef, { once: false, margin: "-100px" })

  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const features = [
    {
      title: "AI-Powered Code Generation",
      description:
        "Generate Shopify-specific code with a simple prompt. Build themes, apps, and customizations in seconds.",
      icon: <LucideCode className="h-10 w-10 text-shopify-green" />,
      demo: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Real-time Preview",
      description:
        "See your changes instantly with our live preview. Test on desktop and mobile without leaving the app.",
      icon: <LucideStore className="h-10 w-10 text-shopify-green" />,
      demo: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Shopify Integration",
      description:
        "Deploy directly to your Shopify store with one click. Seamless integration with the Shopify ecosystem.",
      icon: <LucideRocket className="h-10 w-10 text-shopify-green" />,
      demo: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Advanced AI Understanding",
      description:
        "Our AI understands Shopify's Liquid templating language and best practices for optimal store performance.",
      icon: <LucideBrain className="h-10 w-10 text-shopify-green" />,
      demo: "/placeholder.svg?height=200&width=300",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Shopify Store Owner",
      content:
        "ShopifyAI has transformed how I manage my store. I've cut development time by 70% and launched new features faster than ever.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Shopify Developer",
      content:
        "As a developer, I was skeptical about AI tools, but ShopifyAI genuinely understands Shopify's ecosystem. It's become an essential part of my workflow.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      role: "E-commerce Agency",
      content:
        "Our agency has scaled our Shopify client work by 3x since adopting ShopifyAI. The code quality is excellent and requires minimal tweaking.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 4,
    },
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "per month",
      description: "Perfect for small stores and solo entrepreneurs",
      features: [
        "AI code generation (100 prompts/mo)",
        "Basic theme customization",
        "Standard support",
        "1 store connection",
      ],
      limitations: ["No API access", "No team collaboration"],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$79",
      period: "per month",
      description: "For growing businesses and professional developers",
      features: [
        "AI code generation (unlimited)",
        "Advanced theme customization",
        "Priority support",
        "5 store connections",
        "API access",
        "Team collaboration (3 seats)",
      ],
      limitations: [],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact for pricing",
      description: "For agencies and large e-commerce businesses",
      features: [
        "AI code generation (unlimited)",
        "Custom AI training",
        "Dedicated support",
        "Unlimited store connections",
        "Full API access",
        "Unlimited team seats",
        "White labeling",
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  const faqs = [
    {
      question: "How does ShopifyAI generate code?",
      answer:
        "ShopifyAI uses advanced machine learning models trained specifically on Shopify's ecosystem, including Liquid templates, theme structure, and app development patterns. It understands your natural language prompts and converts them into high-quality, optimized code that follows Shopify best practices.",
    },
    {
      question: "Do I need coding knowledge to use ShopifyAI?",
      answer:
        "No! ShopifyAI is designed to be accessible to both non-technical store owners and experienced developers. Store owners can generate code without any technical knowledge, while developers can use it to accelerate their workflow and handle repetitive tasks.",
    },
    {
      question: "Can I edit the generated code?",
      answer:
        "All code generated by ShopifyAI is fully editable. Our built-in code editor makes it easy to customize the generated code to your exact specifications, and our real-time preview shows you the changes instantly.",
    },
    {
      question: "Is there a limit to how much code I can generate?",
      answer:
        "It depends on your plan. Our Starter plan includes 100 AI generations per month, while our Professional and Enterprise plans offer unlimited generations. You can upgrade or downgrade your plan at any time.",
    },
    {
      question: "How secure is my store data?",
      answer:
        "We take security seriously. ShopifyAI uses OAuth for secure access to your Shopify store and never stores your credentials. We only access the data necessary for the features you use, and all data is encrypted in transit and at rest.",
    },
  ]

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-background/90 dark:from-background dark:via-background/95 dark:to-background/80 overflow-hidden">
      <FloatingParticles />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30"
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-shopify-green/30 blur-md group-hover:blur-xl group-hover:bg-shopify-green/40 transition-all duration-500"></div>
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut" }}
                className="relative"
              >
                <LucideZap className="h-7 w-7 text-shopify-green group-hover:text-shopify-green/90 transition-colors duration-300" />
              </motion.div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-shopify-green to-shopify-dark-green bg-clip-text text-transparent relative">
              ShopifyAI
              <span className="absolute -top-3 -right-8 text-xs font-normal bg-shopify-green/90 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                BETA
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <a href="#features" className="text-foreground/80 hover:text-shopify-green transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-foreground/80 hover:text-shopify-green transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-foreground/80 hover:text-shopify-green transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-foreground/80 hover:text-shopify-green transition-colors">
                FAQ
              </a>
            </nav>
            <ThemeToggle />
            <Link href="/app">
              <Button
                size="sm"
                className="bg-shopify-green hover:bg-shopify-dark-green text-white relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-shopify-green via-shopify-dark-green to-shopify-green bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative">Launch App</span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-32 overflow-hidden">
        <motion.div style={{ opacity, scale }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-shopify-green/20 rounded-full blur-[100px] dark:bg-shopify-green/10" />
        </motion.div>

        <div className="container relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-1 bg-shopify-green/10 border border-shopify-green/20 rounded-full text-shopify-green text-sm font-medium"
            >
              Revolutionizing Shopify Development
            </motion.div>
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 dark:from-foreground dark:to-foreground/70 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Build Shopify Stores <br className="hidden md:block" />
              <span className="text-shopify-green">10x Faster</span> with AI
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              ShopifyAI transforms how you build and customize Shopify stores. Generate high-quality code, themes, and
              apps with simple prompts — no coding required.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link href="/app">
                <Button
                  size="lg"
                  className="bg-shopify-green hover:bg-shopify-dark-green text-white px-8 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-shopify-green via-shopify-dark-green to-shopify-green bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative flex items-center">
                    Try For Free
                    <LucideArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-border/50 bg-background/50 backdrop-blur-md hover:bg-shopify-green/10 hover:border-shopify-green/50 transition-all duration-300"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* App Preview */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10 pointer-events-none" />

            <div className="relative mx-auto max-w-5xl rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-shopify-green/5">
              <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto h-5 w-80 bg-gray-200 dark:bg-gray-700 rounded-md" />
              </div>
              <div className="bg-white dark:bg-gray-900 aspect-[16/9] relative">
                <img
                  src="/placeholder.svg?height=720&width=1280"
                  alt="ShopifyAI Interface"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-foreground/50 z-20"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            >
              <span className="text-sm mb-2">Scroll to explore</span>
              <LucideChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 relative">
        <div className="container">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Shopify Development</h2>
            <p className="text-lg text-foreground/70">
              ShopifyAI combines cutting-edge AI with deep Shopify expertise to deliver a revolutionary development
              experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} inView={isFeaturesInView} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-shopify-green/5 to-transparent relative">
        <div className="container">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How ShopifyAI Works</h2>
            <p className="text-lg text-foreground/70">
              A simple three-step process to transform your Shopify development workflow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Describe What You Need",
                description:
                  "Use natural language to describe the feature, component, or customization you want to build.",
                icon: <LucideBrain className="h-8 w-8 text-shopify-green" />,
              },
              {
                step: "02",
                title: "AI Generates Code",
                description:
                  "Our AI instantly creates Shopify-specific code based on your description and best practices.",
                icon: <LucideCode className="h-8 w-8 text-shopify-green" />,
              },
              {
                step: "03",
                title: "Preview & Deploy",
                description:
                  "See a live preview of your code, make adjustments if needed, and deploy directly to your store.",
                icon: <LucideRocket className="h-8 w-8 text-shopify-green" />,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-lg shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(149, 191, 71, 0.2)" }}
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-shopify-green flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-foreground/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 relative">
        <div className="container">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-foreground/70">
              Join thousands of Shopify merchants and developers who are transforming their workflow with ShopifyAI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-shopify-green/5 to-transparent relative">
        <div className="container">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-foreground/70">
              Choose the plan that's right for your business. All plans include a 14-day free trial.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={plan.name} plan={plan} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 relative">
        <div className="container max-w-4xl">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-foreground/70">Everything you need to know about ShopifyAI</p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between p-6">
                    <h3 className="text-lg font-medium">{faq.question}</h3>
                    <span className="relative ml-1.5 h-5 w-5 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                  </summary>

                  <div className="px-6 pb-6 pt-0">
                    <p className="text-foreground/70">{faq.answer}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-shopify-green/10 to-transparent dark:from-shopify-green/5" />
        <div className="container relative">
          <motion.div
            className="max-w-4xl mx-auto text-center bg-card/30 backdrop-blur-lg border border-border/50 rounded-2xl p-10 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px -20px rgba(149, 191, 71, 0.3)" }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Ready to Transform Your Shopify Development?
            </motion.h2>
            <motion.p
              className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join thousands of merchants and developers who are building better Shopify stores faster with AI.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/app">
                <Button
                  size="lg"
                  className="bg-shopify-green hover:bg-shopify-dark-green text-white px-8 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-shopify-green via-shopify-dark-green to-shopify-green bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="relative flex items-center">
                    Start Your Free Trial
                    <LucideArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-shopify-green/30 blur-sm"></div>
                  <LucideZap className="relative h-6 w-6 text-shopify-green" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-shopify-green to-shopify-dark-green bg-clip-text text-transparent">
                  ShopifyAI
                </span>
              </div>
              <p className="text-sm text-foreground/70 mb-4">
                Revolutionizing Shopify development with AI-powered code generation and real-time previews.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-shopify-green transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-foreground/60">
            <p>© {new Date().getFullYear()} ShopifyAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
