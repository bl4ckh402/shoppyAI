"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ShopifyAIProject } from "@/contexts/ahoppyai-context";
import ProjectService from "@/services/project";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlusCircle,
  Code,
  Store,
  Box,
  Settings,
  GitBranch,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/theme-toggle";
import FloatingParticles from "@/components/floating-particles";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ShopifyAIProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // Check authentication status after loading is complete
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/sign-in");
      } else {
        setIsLoaded(true);
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const userProjects = await ProjectService.getProjects();
        setProjects(userProjects);
        console.log("Projects loaded:", userProjects);
        setError(null);
      } catch (err) {
        console.error("Error loading projects:", err);
        setError("Failed to load your projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadProjects();
    }
  }, [user]);

  if (isLoading || loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-shopify-green"></div>
      </div>
    );
  }

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
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center space-x-2">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-shopify-green/30 blur-md group-hover:blur-xl group-hover:bg-shopify-green/40 transition-all duration-500"></div>
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 5,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <Zap className="h-7 w-7 text-shopify-green group-hover:text-shopify-green/90 transition-colors duration-300" />
              </motion.div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-shopify-green to-shopify-dark-green bg-clip-text text-transparent relative">
              ShopifyAI
              <span className="absolute -top-3 -right-8 text-xs font-normal bg-shopify-green/90 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                BETA
              </span>
            </span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="border-border/50 bg-background/50 backdrop-blur-md hover:bg-shopify-green/10 hover:border-shopify-green/50 transition-all duration-300 group"
            >
              <Settings className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border/50 bg-background/50 backdrop-blur-md hover:bg-shopify-green/10 hover:border-shopify-green/50 transition-all duration-300 group"
            >
              <GitBranch className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              Projects
            </Button>
            <Button
              size="sm"
              className="bg-shopify-green hover:bg-shopify-dark-green text-white relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-shopify-green via-shopify-dark-green to-shopify-green bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative">Deploy to Shopify</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate={isLoaded ? "show" : "hidden"}
        className="container py-8"
      >
        <motion.div
          variants={item}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your Shopify projects and snippets
            </p>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            <Button
              onClick={() => router.push("/new-project")}
              className="bg-shopify-green hover:bg-shopify-green/90 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-shopify-green via-shopify-dark-green to-shopify-green bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <PlusCircle className="mr-2 h-4 w-4 relative" />
              <span className="relative">New Project</span>
            </Button>
            <Button
              onClick={() => router.push("/new-snippet")}
              variant="outline"
              className="border-border/50 bg-background/50 backdrop-blur-md hover:bg-shopify-green/10 hover:border-shopify-green/50 transition-all duration-300 group"
            >
              <Code className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              New Snippet
            </Button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            variants={item}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.length > 0 ? (
            projects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Card className="border-border/50 bg-card/30 backdrop-blur-lg text-card-foreground shadow-lg transition-all duration-500 hover:shadow-shopify-green/10 overflow-hidden group">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Box className="mr-2 h-5 w-5 text-shopify-green group-hover:rotate-12 transition-transform duration-300" />
                      {project.name}
                    </CardTitle>
                    <CardDescription>
                      Shopify Project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || "No description provided"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last updated:{" "}
                      {new Date(
                        project.updatedAt || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className="w-full bg-shopify-green hover:bg-shopify-dark-green relative overflow-hidden group"
                    >
                      <Link href={`/project/${project.id}`}>
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-shopify-green via-shopify-dark-green to-shopify-green bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                        <span className="relative">Open Project</span>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <motion.div
                className="bg-muted rounded-full p-4 mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Store className="h-10 w-10 text-muted-foreground" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Create your first Shopify project and use AI to help you build
                faster
              </p>
              <Button
                onClick={() => router.push("/new-project")}
                className="bg-shopify-green hover:bg-shopify-green/90 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-shopify-green via-shopify-dark-green to-shopify-green bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <PlusCircle className="mr-2 h-4 w-4 relative" />
                <span className="relative">New Project</span>
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}
