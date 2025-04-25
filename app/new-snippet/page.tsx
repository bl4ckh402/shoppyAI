"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useShopifyAI } from "@/contexts/ahoppyai-context"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Code } from "lucide-react"
import Link from "next/link"
import GeminiService from "@/services/gemini"
import ProjectService from "@/services/project"

// Form schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Snippet name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Please describe what the snippet should do in at least 10 characters.",
  }),
  framework: z.enum(["hydrogen", "liquid", "oxygen"], {
    required_error: "Please select a framework.",
  }),
  snippetType: z.enum(["component", "function", "api", "style", "other"], {
    required_error: "Please select a snippet type.",
  }),
})

export default function NewSnippet() {
  const router = useRouter()
  const { createProject } = useShopifyAI()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      framework: "hydrogen",
      snippetType: "component",
    },
  })

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Create a prompt for the AI based on form values
      const prompt = `Create a ${values.framework} ${values.snippetType} snippet for a Shopify store with the following details:
Name: ${values.name}
Description: ${values.description}
Framework: ${values.framework}
Type: ${values.snippetType}

Please provide the code with detailed comments explaining how it works.`;
      
      // Use the AI to generate the snippet code
      const aiResponse = await GeminiService.generateCode({
        prompt,
        framework: values.framework,
      });
      
      // Create a new project (snippet)
      const project = await createProject(
        `${values.name} (Snippet)`,
        values.framework,
        values.description
      );
      
      // Create the main snippet file based on framework and type
      let filePath = "/";
      let fileName = "";
      
      switch (values.framework) {
        case "hydrogen":
          fileName = values.snippetType === "component" 
            ? `${values.name.replace(/\s+/g, "")}.jsx` 
            : `${values.name.replace(/\s+/g, "")}.js`;
          filePath = values.snippetType === "component"
            ? `/components/${fileName}`
            : `/lib/${fileName}`;
          break;
        case "liquid":
          fileName = `${values.name.replace(/\s+/g, "-")}.liquid`;
          filePath = values.snippetType === "component"
            ? `/snippets/${fileName}`
            : `/sections/${fileName}`;
          break;
        case "oxygen":
          fileName = values.snippetType === "component" 
            ? `${values.name.replace(/\s+/g, "")}.jsx` 
            : `${values.name.replace(/\s+/g, "")}.js`;
          filePath = values.snippetType === "component"
            ? `/components/${fileName}`
            : `/lib/${fileName}`;
          break;
      }
      
      // Wait a moment for the project to be fully created and get its ID
      // This is just for demonstration, in a real app you'd properly handle this with the returned project
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Error creating snippet:", err);
      setError("Failed to create snippet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create New Snippet</h1>
        <p className="text-muted-foreground mt-1">Generate a reusable code snippet with AI</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Snippet Details</CardTitle>
          <CardDescription>
            Describe the code snippet you want to create, and our AI will generate it for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Snippet Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product Gallery" {...field} />
                    </FormControl>
                    <FormDescription>
                      What would you like to call this snippet?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="framework"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Framework</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select framework" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hydrogen">Hydrogen (React)</SelectItem>
                          <SelectItem value="liquid">Liquid (Theme)</SelectItem>
                          <SelectItem value="oxygen">Oxygen (Deploy)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Which Shopify framework is this for?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="snippetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Snippet Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="component">UI Component</SelectItem>
                          <SelectItem value="function">Utility Function</SelectItem>
                          <SelectItem value="api">API Integration</SelectItem>
                          <SelectItem value="style">Style/CSS</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        What type of code snippet do you need?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Create a responsive product gallery with thumbnails, zoom functionality, and variant selection."
                        className="resize-none min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe in detail what you want the snippet to do. Be specific to get better results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="px-0 flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-shopify-green hover:bg-shopify-green/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Generating..." : "Generate Snippet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => router.push("/dashboard")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}