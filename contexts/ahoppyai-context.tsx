"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebContainer } from '@/hooks/usewebContainer';
import { createProject as createProjectService } from '@/services/projects';

// Define types
export interface ShopifyAIFile {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ShopifyAIFile[];
}

export interface ShopifyAIProject {
  id: string;
  name: string;
  description: string;
  framework: string;
  files: ShopifyAIFile[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectCreateInput {
  name: string;
  description: string;
  is_template?: boolean;
  is_public?: boolean;
  owner_id: string;
}

interface CodeGenerationResult {
  code: string;
  followUpSuggestions?: string[];
}

interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
}

interface ShopifyAIContextType {
  currentProject: ShopifyAIProject | null;
  loadProject: (id: string) => Promise<void>;
  selectedFile: ShopifyAIFile | null;
  selectFile: (file: ShopifyAIFile) => void;
  updateFile: (path: string, content: string) => Promise<void>;
  createFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  generating: boolean;
  generateCode: (prompt: string) => Promise<CodeGenerationResult>;
  lastGeneratedCode: CodeGenerationResult | null;
  promptHistory: ConversationEntry[];
  previewReady: boolean;
  startPreview: () => Promise<string | null>;
  resetPreview: () => void;
  framework: string;
  previewMode: 'desktop' | 'mobile';
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  createProject: (project: ProjectCreateInput) => Promise<void>;
}

// Create context
const ShopifyAIContext = createContext<ShopifyAIContextType | null>(null);

// Context provider
export function ShopifyAIProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<ShopifyAIProject | null>(null);
  const [selectedFile, setSelectedFile] = useState<ShopifyAIFile | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<CodeGenerationResult | null>(null);
  const [promptHistory, setPromptHistory] = useState<ConversationEntry[]>([]);
  const [previewReady, setPreviewReady] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // WebContainer integration
  const { 
    webcontainer, 
    isLoading: webContainerLoading,
    mountFiles,
    startServer
  } = useWebContainer();

  // Load project by ID
  const loadProject = async (id: string): Promise<void> => {
    // Simulate API call in this example
    try {
      // In a real app, fetch from API
      const project: ShopifyAIProject = {
        id,
        name: 'My Shopify Store',
        description: 'A modern Shopify store built with Next.js',
        framework: 'nextjs',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: [
          {
            name: 'app',
            path: '/app',
            type: 'folder',
            children: [
              {
                name: 'page.tsx',
                path: '/app/page.tsx',
                type: 'file',
                content: 'export default function Home() {\n  return <div>Hello World</div>;\n}'
              }
            ]
          },
          {
            name: 'components',
            path: '/components',
            type: 'folder',
            children: []
          },
          {
            name: 'package.json',
            path: '/package.json',
            type: 'file',
            content: '{\n  "name": "shopify-store",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start"\n  },\n  "dependencies": {\n    "next": "^13.4.0",\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}'
          }
        ]
      };
      
      setCurrentProject(project);
      
      // Initialize WebContainer with project files
      if (webcontainer && !webContainerLoading) {
        await mountFiles(project.files);
        setPreviewReady(true);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      throw error;
    }
  };
  
  // Select file
  const selectFile = (file: ShopifyAIFile): void => {
    if (file.type === 'file') {
      setSelectedFile(file);
    }
  };
  
  // Update file content
  const updateFile = async (path: string, content: string): Promise<void> => {
    try {
      if (!currentProject) return;
      
      // Update file in state
      const updateFileRecursive = (files: ShopifyAIFile[]): ShopifyAIFile[] => {
        return files.map(file => {
          if (file.path === path) {
            return { ...file, content };
          } else if (file.children) {
            return {
              ...file,
              children: updateFileRecursive(file.children)
            };
          }
          return file;
        });
      };
      
      const updatedFiles = updateFileRecursive(currentProject.files);
      setCurrentProject({
        ...currentProject,
        files: updatedFiles,
        updatedAt: new Date().toISOString()
      });
      
      // Update selected file if it's the one being edited
      if (selectedFile && selectedFile.path === path) {
        setSelectedFile({ ...selectedFile, content });
      }
      
      // Update file in WebContainer if available
      if (webcontainer) {
        await webcontainer.fs.writeFile(path, content);
      }
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  };
  
  // Create new file
  const createFile = async (path: string, content: string): Promise<void> => {
    try {
      if (!currentProject) return;
      
      const pathParts = path.split('/').filter(Boolean);
      const fileName = pathParts.pop() || '';
      const folderPath = '/' + pathParts.join('/');
      
      // Create new file object
      const newFile: ShopifyAIFile = {
        name: fileName,
        path,
        type: 'file',
        content
      };
      
      // Add file to the correct location in the tree
      const addFileToFolder = (files: ShopifyAIFile[]): ShopifyAIFile[] => {
        if (folderPath === '/') {
          return [...files, newFile];
        }
        
        return files.map(file => {
          if (file.path === folderPath && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), newFile]
            };
          } else if (file.children) {
            return {
              ...file,
              children: addFileToFolder(file.children)
            };
          }
          return file;
        });
      };
      
      const updatedFiles = addFileToFolder(currentProject.files);
      setCurrentProject({
        ...currentProject,
        files: updatedFiles,
        updatedAt: new Date().toISOString()
      });
      
      // Select the newly created file
      setSelectedFile(newFile);
      
      // Create file in WebContainer if available
      if (webcontainer) {
        // Ensure directory exists
        if (folderPath !== '/') {
          try {
            await webcontainer.fs.mkdir(folderPath, { recursive: true });
          } catch (err) {
            // Directory might already exist
          }
        }
        
        await webcontainer.fs.writeFile(path, content);
      }
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  };
  
  // Delete file or folder
  const deleteFile = async (path: string): Promise<void> => {
    try {
      if (!currentProject) return;
      
      // Remove file from state
      const removeFileRecursive = (files: ShopifyAIFile[]): ShopifyAIFile[] => {
        return files.filter(file => {
          if (file.path === path) {
            return false;
          }
          
          if (file.children) {
            file.children = removeFileRecursive(file.children);
          }
          
          return true;
        });
      };
      
      const updatedFiles = removeFileRecursive(currentProject.files);
      setCurrentProject({
        ...currentProject,
        files: updatedFiles,
        updatedAt: new Date().toISOString()
      });
      
      // Clear selected file if it's the one being deleted
      if (selectedFile && selectedFile.path === path) {
        setSelectedFile(null);
      }
      
      // Delete file in WebContainer if available
      if (webcontainer) {
        await webcontainer.fs.rm(path, { recursive: true });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };
  
  // Generate code from prompt
  const generateCode = async (prompt: string): Promise<CodeGenerationResult> => {
    try {
      setGenerating(true);
      
      // Add prompt to history
      setPromptHistory(prev => [...prev, { role: 'user', content: prompt }]);
      
      // Simulate API call in this example
      // In a real app, call your AI API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result: CodeGenerationResult = {
        code: `// Generated from prompt: ${prompt}\n\nimport React from 'react';\n\nexport default function ${prompt.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}() {\n  return (\n    <div className="p-4 bg-white rounded-lg shadow">\n      <h2 className="text-xl font-bold">${prompt}</h2>\n      <p className="mt-2 text-gray-600">This component was generated based on your prompt.</p>\n    </div>\n  );\n}`,
        followUpSuggestions: [
          'Add styling to this component',
          'Make it responsive',
          'Add data fetching'
        ]
      };
      
      // Add response to history
      setPromptHistory(prev => [...prev, { role: 'assistant', content: result.code }]);
      
      setLastGeneratedCode(result);
      return result;
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    } finally {
      setGenerating(false);
    }
  };
  
  // Start preview
  const startPreview = async (): Promise<string | null> => {
    try {
      if (!webcontainer || !currentProject) return null;
      
      // Mount project files
      await mountFiles(currentProject.files);
      
      // Start development server
      const url = await startServer();
      return url as string;
    } catch (error) {
      console.error('Error starting preview:', error);
      throw error;
    }
  };
  
  // Reset preview
  const resetPreview = () => {
    // In a real app, this would restart the WebContainer
    // For now, we'll just simulate a reset
    setPreviewReady(false);
    setTimeout(() => setPreviewReady(true), 1000);
  };

  // Create new project
  const createProject = async (project: ProjectCreateInput): Promise<void> => {
    try {
      await createProjectService({
        name: project.name,
        description: project.description,
        is_template: project.is_template ?? false,
        is_public: project.is_public ?? false,
        owner_id: project.owner_id
      });
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  // Context value
  const contextValue: ShopifyAIContextType = {
    currentProject,
    loadProject,
    selectedFile,
    selectFile,
    updateFile,
    createFile,
    deleteFile,
    generating,
    generateCode,
    lastGeneratedCode,
    promptHistory,
    previewReady,
    startPreview,
    resetPreview,
    framework: currentProject?.framework || 'nextjs',
    previewMode,
    setPreviewMode,
    createProject
  };
  
  return (
    <ShopifyAIContext.Provider value={contextValue}>
      {children}
    </ShopifyAIContext.Provider>
  );
}

// Custom hook to use the ShopifyAI context
export function useShopifyAI() {
  const context = useContext(ShopifyAIContext);
  if (!context) {
    throw new Error('useShopifyAI must be used within a ShopifyAIProvider');
  }
  return context;
}