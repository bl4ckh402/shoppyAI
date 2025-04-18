"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getProjects } from "@/services/projects"
import HydrogenGenerator from "@/components/hydrogen/hydrogen-generator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { LucideCode, LucideInfo } from "lucide-react"
import Link from "next/link"

export default function HydrogenPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      try {
        const projectsData = await getProjects()
        setProjects(projectsData)
        if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id)
        }
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadProjects()
    } else {
      setIsLoading(false)
    }
  }, [user])

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopify Hydrogen</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            {user && projects.length > 0 ? (
              <div className="flex items-center space-x-4">
                <Label htmlFor="project-select" className="whitespace-nowrap">
                  Select Project:
                </Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isLoading}>
                  <SelectTrigger id="project-select" className="w-[250px]">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {user ? (
                  <Link href="/projects/new" className="text-shopify-green hover:underline">
                    Create a project
                  </Link>
                ) : (
                  <Link href="/sign-in" className="text-shopify-green hover:underline">
                    Sign in
                  </Link>
                )}{" "}
                to save generated components
              </div>
            )}
          </div>

          <HydrogenGenerator projectId={selectedProjectId} />
        </div>

        <div>
          <Card className="border-border/50 bg-card/30 backdrop-blur-lg shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LucideInfo className="mr-2 h-5 w-5 text-shopify-green" />
                About Hydrogen
              </CardTitle>
              <CardDescription>Shopify's React-based framework for building custom storefronts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Hydrogen is Shopify's opinionated stack for headless commerce built on Remix, providing tools,
                utilities, and best-in-class examples for building dynamic commerce applications.
              </p>

              <div className="space-y-2">
                <h3 className="font-medium">Key Features:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>React-based components for commerce</li>
                  <li>Server-side rendering for SEO optimization</li>
                  <li>Seamless integration with Shopify's backend</li>
                  <li>Optimized for performance and user experience</li>
                  <li>Deploy to Shopify Oxygen for global edge hosting</li>
                </ul>
              </div>

              <div className="pt-2">
                <a
                  href="https://shopify.dev/docs/api/hydrogen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shopify-green hover:underline flex items-center"
                >
                  <LucideCode className="mr-1 h-4 w-4" />
                  Official Hydrogen Documentation
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30 backdrop-blur-lg shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Popular Components</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li>
                  <button
                    className="w-full text-left p-3 rounded-md bg-background/50 hover:bg-shopify-green/10 transition-colors"
                    onClick={() => {
                      setSelectedProjectId(projects[0]?.id)
                      // This would set the component type in the generator
                    }}
                  >
                    <div className="font-medium">Product Card</div>
                    <div className="text-sm text-muted-foreground">Display product information in a grid layout</div>
                  </button>
                </li>
                <li>
                  <button
                    className="w-full text-left p-3 rounded-md bg-background/50 hover:bg-shopify-green/10 transition-colors"
                    onClick={() => {
                      setSelectedProjectId(projects[0]?.id)
                      // This would set the component type in the generator
                    }}
                  >
                    <div className="font-medium">Shopping Cart</div>
                    <div className="text-sm text-muted-foreground">
                      Fully functional cart with line items and checkout
                    </div>
                  </button>
                </li>
                <li>
                  <button
                    className="w-full text-left p-3 rounded-md bg-background/50 hover:bg-shopify-green/10 transition-colors"
                    onClick={() => {
                      setSelectedProjectId(projects[0]?.id)
                      // This would set the component type in the generator
                    }}
                  >
                    <div className="font-medium">Product Details</div>
                    <div className="text-sm text-muted-foreground">
                      Complete product page with gallery, variants, and add to cart functionality
                    </div>
                  </button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
