"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { getProject } from "@/services/projects"
import { ShopifyAIProject } from "@/contexts/ahoppyai-context"
import { Store, Box, ArrowLeft, Smartphone, Monitor, LucideCode } from "lucide-react"
import AIPromptInput from "@/components/ai-prompt-input"
import ShopifyPreview from "@/components/shopify-preview"
import EnhancedCodeEditor from "@/components/code-editor"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [project, setProject] = useState<ShopifyAIProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/landing")
      return
    }

    async function loadProject() {
      if (loadingRef.current) return
      loadingRef.current = true

      try {
        setLoading(true)
        const projectData = await getProject(params.id as string)
        setProject(projectData)
        setError(null)
      } catch (err) {
        console.error("Error loading project:", err)
        setError("Failed to load project. Please try again.")
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    }

    if (params.id && user && !loadingRef.current) {
      loadProject()
    }
  }, [params.id, user, authLoading, router])

  // Initialize welcome messages
  useEffect(() => {
    if (project) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: `Welcome to ${project.name}! I'm your AI assistant, ready to help you build and customize your Shopify store. You can describe what you want to build, and I'll generate the code for you.`,
          timestamp: new Date()
        },
        {
          id: 'welcome-2',
          role: 'assistant',
          content: 'For example, you can ask me to:\n• Create a custom product card component\n• Build a responsive navigation menu\n• Add a newsletter signup form\n• Create an animated banner\n• Customize your checkout page',
          timestamp: new Date()
        }
      ]);
    }
  }, [project]);

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code)
    // Add AI response to chat
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Here\'s the generated code based on your request:',
      code: code,
      timestamp: new Date()
    }])
  }

  const handleNewMessage = (content: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }])
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-shopify-green"></div>
      </div>
    )
  }

  const renderMessage = (message: ChatMessage) => {
    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${
          message.role === 'user' ? 'flex-row' : 'flex-row'
        }`}
      >
        <div className="flex-shrink-0">
          {message.role === 'user' ? (
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar>
              <AvatarFallback className="bg-shopify-green/10 text-shopify-green">
                AI
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="flex-1">
          <div className={`rounded-lg p-4 ${
            message.role === 'user' 
              ? 'bg-muted/50' 
              : 'bg-shopify-green/10'
          }`}>
            <p className="text-sm text-foreground/90">{message.content}</p>
            {message.code && (
              <div className="mt-2 bg-background/50 rounded border border-border/50 p-2">
                <pre className="text-xs overflow-x-auto">
                  <code>{message.code}</code>
                </pre>
              </div>
            )}
          </div>
          <div className="mt-1">
            <span className="text-xs text-muted-foreground">
              {new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              }).format(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-background/90 dark:from-background dark:via-background/95 dark:to-background/80 overflow-hidden">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30"
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild size="sm">
              <a href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </a>
            </Button>
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-shopify-green/30 blur-md group-hover:blur-xl group-hover:bg-shopify-green/40 transition-all duration-500"></div>
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut" }}
                className="relative"
              >
                <Store className="h-7 w-7 text-shopify-green group-hover:text-shopify-green/90 transition-colors duration-300" />
              </motion.div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-shopify-green to-shopify-dark-green bg-clip-text text-transparent relative">
              {project?.name || "Project"}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeTab === 'preview' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                  className={previewMode === 'desktop' ? 'bg-shopify-green/10' : ''}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                  className={previewMode === 'mobile' ? 'bg-shopify-green/10' : ''}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(activeTab === 'preview' ? 'code' : 'preview')}
            >
              {activeTab === 'preview' ? <LucideCode className="h-4 w-4" /> : 'Preview'}
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="container flex-1 py-6">
        {error && (
          <Card className="p-4 mb-4 border border-red-500 bg-red-100 text-red-700">
            <p>{error}</p>
          </Card>
        )}
        
        {project ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
            {/* Left side - Chat Interface */}
            <div className="flex flex-col h-full">
              <Card className="flex-1 border-border/50 bg-card/30 backdrop-blur-lg overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="flex-1 p-4 overflow-y-auto">
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 border-t border-border/50">
                    <AIPromptInput 
                      onCodeGenerated={handleCodeGenerated}
                      onMessageSent={handleNewMessage}
                      placeholder="Describe the changes you want to make..."
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right side - Preview/Code */}
            <div className="flex flex-col h-full">
              <Card className="flex-1 border-border/50 bg-card/30 backdrop-blur-lg overflow-hidden">
                {activeTab === 'preview' ? (
                  <div className="h-full p-4">
                    <ShopifyPreview mode={previewMode} />
                  </div>
                ) : (
                  <div className="h-full">
                    <EnhancedCodeEditor
                      value={generatedCode}
                      onChange={(value) => setGeneratedCode(value)}
                      language="javascript"
                      path="generated-code.js"
                    />
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <p>No project data available.</p>
        )}
      </div>
    </main>
  )
}