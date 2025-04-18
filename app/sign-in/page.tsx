import SignInForm from "@/components/auth/sign-in-form"
import Link from "next/link"
import { LucideZap } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-background/90">
      <div className="mb-8 flex items-center">
        <div className="relative mr-2">
          <div className="absolute -inset-1 rounded-full bg-shopify-green/30 blur-sm"></div>
          <LucideZap className="relative h-6 w-6 text-shopify-green" />
        </div>
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-shopify-green to-shopify-dark-green bg-clip-text text-transparent"
        >
          ShopifyAI
        </Link>
      </div>
      <SignInForm />
    </div>
  )
}
