"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getProjects } from "@/services/projects"
import { getSnippets } from "@/services/snippets"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucideCode, LucideFolder, LucidePlus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [snippets, setSnippets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const projectsData = await getProjects()
        const snippetsData = await getSnippets()
        setProjects(projectsData)
        setSnippets(snippetsData)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-shopify-green"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-4">
          <Button asChild>
            <Link href="/projects/new">
              <LucidePlus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/snippets/new">
              <LucidePlus className="mr-2 h-4 w-4" />
              New Snippet
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">
            <LucideFolder className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="snippets">
            <LucideCode className="mr-2 h-4 w-4" />
            Code Snippets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground mb-4">You don't have any projects yet</p>
                <Button asChild>
                  <Link href="/projects/new">
                    <LucidePlus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link href={`/projects/${project.id}`} key={project.id}>
                  <Card className="h-full transition-all hover:shadow-md hover:border-shopify-green/50 cursor-pointer">
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardFooter className="text-sm text-muted-foreground">
                      Last updated: {new Date(project.updated_at).toLocaleDateString()}
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="snippets">
          {snippets.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground mb-4">You don't have any code snippets yet</p>
                <Button asChild>
                  <Link href="/snippets/new">
                    <LucidePlus className="mr-2 h-4 w-4" />
                    Create Your First Snippet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets.map((snippet) => (
                <Link href={`/snippets/${snippet.id}`} key={snippet.id}>
                  <Card className="h-full transition-all hover:shadow-md hover:border-shopify-green/50 cursor-pointer">
                    <CardHeader>
                      <CardTitle>{snippet.title}</CardTitle>
                      <CardDescription>{snippet.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-950/90 dark:bg-slate-950/70 text-slate-50 rounded-md p-2 text-sm font-mono overflow-hidden max-h-24">
                        {snippet.code.substring(0, 100)}
                        {snippet.code.length > 100 && "..."}
                      </div>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">Language: {snippet.language}</CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
