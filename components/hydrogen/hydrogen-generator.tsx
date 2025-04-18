"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LucideCode, LucideZap, LucideSave, LucideEye } from "lucide-react"
import { generateHydrogenComponent, saveHydrogenComponent, type HydrogenComponentType } from "@/services/hydrogen"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface HydrogenGeneratorProps {
  projectId?: string
}

export default function HydrogenGenerator({ projectId }: HydrogenGeneratorProps) {
  const [componentType, setComponentType] = useState<HydrogenComponentType>("product-card")
  const [componentName, setComponentName] = useState("ProductCard")
  const [customizations, setCustomizations] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("generator")

  const { user } = useAuth()
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const customizationsObj = customizations ? JSON.parse(customizations) : undefined
      const result = await generateHydrogenComponent({
        type: componentType,
        customizations: customizationsObj,
      })
      setGeneratedCode(result.code)
      setActiveTab("preview")
    } catch (error) {
      console.error("Error generating component:", error)
      toast({
        title: "Generation Error",
        description: "Failed to generate Hydrogen component. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!user || !projectId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in and select a project to save this component.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await saveHydrogenComponent(user.id, projectId, componentName, generatedCode)
      toast({
        title: "Component Saved",
        description: `${componentName} has been saved to your project.`,
      })
    } catch (error) {
      console.error("Error saving component:", error)
      toast({
        title: "Save Error",
        description: "Failed to save component. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full border-border/50 bg-card/30 backdrop-blur-lg shadow-lg transition-all duration-500 hover:shadow-shopify-green/10">
      <CardHeader>
        <CardTitle className="flex items-center">
          <LucideCode className="mr-2 h-5 w-5 text-shopify-green" />
          Hydrogen Component Generator
        </CardTitle>
        <CardDescription>Generate Shopify Hydrogen components for your headless commerce storefront</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedCode}>
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="component-type">Component Type</Label>
                  <Select
                    value={componentType}
                    onValueChange={(value) => setComponentType(value as HydrogenComponentType)}
                  >
                    <SelectTrigger id="component-type">
                      <SelectValue placeholder="Select component type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product-card">Product Card</SelectItem>
                      <SelectItem value="collection-list">Collection List</SelectItem>
                      <SelectItem value="cart">Shopping Cart</SelectItem>
                      <SelectItem value="product-details">Product Details</SelectItem>
                      <SelectItem value="navigation">Navigation</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="hero">Hero Section</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="component-name">Component Name</Label>
                  <Input
                    id="component-name"
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    placeholder="e.g., ProductCard"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customizations">Customizations (Optional JSON)</Label>
                <Textarea
                  id="customizations"
                  value={customizations}
                  onChange={(e) => setCustomizations(e.target.value)}
                  placeholder='{"theme": "modern", "showPrices": true}'
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Enter customization options as JSON to tailor the component to your needs
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-shopify-green hover:bg-shopify-dark-green text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <LucideZap className="mr-2 h-4 w-4" />
                    Generate Component
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            {generatedCode && (
              <div className="space-y-4">
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-slate-950/90 dark:bg-slate-950/70 text-slate-50 overflow-auto max-h-[400px] text-sm font-mono">
                    {generatedCode}
                  </pre>

                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-background/50 hover:bg-shopify-green/10"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode)
                        toast({
                          title: "Copied to clipboard",
                          description: "Component code copied to clipboard",
                        })
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("generator")}>
                    <LucideEye className="mr-2 h-4 w-4" />
                    Back to Generator
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !projectId}
                    className="bg-shopify-green hover:bg-shopify-dark-green text-white"
                  >
                    {isSaving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <LucideSave className="mr-2 h-4 w-4" />
                        Save Component
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground border-t border-border/50 pt-4">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-shopify-green mr-2"></div>
          Powered by Shopify Hydrogen and Oxygen
        </div>
      </CardFooter>
    </Card>
  )
}
