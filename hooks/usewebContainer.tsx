"use client"

import { useState, useEffect } from 'react';
import { WebContainer } from '@webcontainer/api';

// Define the FileOrFolder type
type FileOrFolder = {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileOrFolder[];
};

// Global state for WebContainer instance
let webcontainerInstance: WebContainer | null = null;
let isBooting = false;
let bootPromise: Promise<WebContainer> | null = null;
let instanceCount = 0;
let isCleaningUp = false;

// Initialize WebContainer instance once
async function initializeWebContainer() {
  // If an instance exists and is valid, return it
  if (webcontainerInstance) {
    instanceCount++;
    return webcontainerInstance;
  }
  
  // If already booting, wait for the existing boot promise
  if (isBooting && bootPromise) {
    instanceCount++;
    return bootPromise;
  }

  // Prevent concurrent boot attempts
  if (isCleaningUp) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return initializeWebContainer();
  }
  
  try {
    isBooting = true;
    
    // Add a check for browser compatibility
    if (typeof window === 'undefined' || !window.navigator?.serviceWorker) {
      throw new Error('WebContainer requires a modern browser with Service Worker support');
    }

    // Wait for document to be fully loaded to avoid resource loading issues
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve, { once: true });
      });
    }

    // Add a small delay to ensure all resources are properly loaded
    await new Promise(resolve => setTimeout(resolve, 1000));

    bootPromise = WebContainer.boot({
      workdirName: 'shopify-project'
    });
    
    webcontainerInstance = await bootPromise;
    instanceCount++;
    return webcontainerInstance;
  } catch (error:any) {
    console.error("Error booting WebContainer:", error);
    // Add more specific error messaging
    if (error.message?.includes('lockdown')) {
      throw new Error('WebContainer initialization failed due to security restrictions. Please ensure you\'re using a supported browser and environment.');
    }
    if (error.message?.includes('worker')) {
      throw new Error('Failed to load required WebContainer workers. Please check your network connection and try again.');
    }
    throw error;
  } finally {
    isBooting = false;
    bootPromise = null;
  }
}

// Cleanup function to properly dispose of WebContainer instance
async function cleanupWebContainer() {
  instanceCount--;
  
  if (instanceCount <= 0 && webcontainerInstance) {
    try {
      isCleaningUp = true;
      // Wait for any pending operations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      // Reset everything
      webcontainerInstance = null;
      instanceCount = 0;
      isBooting = false;
      bootPromise = null;
    } catch (e) {
      console.error('Error cleaning up WebContainer:', e);
    } finally {
      isCleaningUp = false;
    }
  }
}

export function useWebContainer() {
  const [container, setContainer] = useState<WebContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const init = async () => {
      try {
        if (!isMounted) return;
        
        setIsLoading(true);
        const instance = await initializeWebContainer();
        
        if (isMounted) {
          setContainer(instance);
          setIsLoading(false);
          setError(null);
        }
      } catch (err:any) {
        console.error("WebContainer initialization error:", err);
        
        if (isMounted) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying WebContainer initialization (${retryCount}/${maxRetries})...`);
            // Add exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            init();
            return;
          }
          
          setError(err.message || "Failed to initialize WebContainer");
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      // Cleanup when the component unmounts
      cleanupWebContainer();
    };
  }, []);

  // Function to mount files to the WebContainer
  const mountFiles = async (files: FileOrFolder[]) => {
    if (!container) return null;
    
    try {
      const mountStructure = createMountStructure(files);
      await container.mount(mountStructure);
      return true;
    } catch (err) {
      console.error("Error mounting files:", err);
      setError("Failed to mount files to WebContainer.");
      return false;
    }
  };

  // Helper function to create mount structure
  const createMountStructure = (files: FileOrFolder[]) => {
    const mountStructure: Record<string, any> = {};
  
    const processFile = (file: FileOrFolder, isRootFolder = true) => {  
      if (file.type === 'folder') {
        if (isRootFolder) {
          mountStructure[file.name] = {
            directory: {}
          };
          
          if (file.children && file.children.length > 0) {
            file.children.forEach((child: FileOrFolder) => {
              const childResult = processFile(child, false);
              if (childResult) {
                mountStructure[file.name].directory[child.name] = childResult;
              }
            });
          }
        } else {
          const result: { directory: Record<string, any> } = { directory: {} };
          
          if (file.children && file.children.length > 0) {
            file.children.forEach((child: FileOrFolder) => {
              const childResult = processFile(child, false);
              if (childResult) {
                result.directory[child.name] = childResult;
              }
            });
          }
          
          return result;
        }
      } else if (file.type === 'file') {
        if (isRootFolder) {
          mountStructure[file.name] = {
            file: {
              contents: file.content || ''
            }
          };
        } else {
          return {
            file: {
              contents: file.content || ''
            }
          };
        }
      }
      
      return isRootFolder ? null : mountStructure[file.name];
    };
  
    files.forEach(file => processFile(file, true));
    return mountStructure;
  };

  // Function to start the WebContainer server
  const startServer = async () => {
    if (!container) return null;
    
    try {
      // Create basic package.json if it doesn't exist
      try {
        const packageJsonExists = await container.fs.readFile('/package.json').then(() => true).catch(() => false);
        if (!packageJsonExists) {
          // Create a basic package.json
          await container.fs.writeFile('/package.json', JSON.stringify({
            name: "shopify-project",
            private: true,
            version: "0.0.0",
            scripts: {
              dev: "next dev"
            },
            dependencies: {
              "next": "^13.4.1",
              "react": "^18.2.0",
              "react-dom": "^18.2.0"
            }
          }, null, 2));
        }
      } catch (err) {
        console.log("Error checking/creating package.json:", err);
      }
      
      // Install dependencies
      try {
        const installProcess = await container.spawn('npm', ['install']);
        
        // Capture output for debugging
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log("Install output:", data);
          }
        }));
        
        const exitCode = await installProcess.exit;
        if (exitCode !== 0) {
          console.warn(`npm install exited with code ${exitCode} - attempting to continue`);
        }
      } catch (err) {
        console.warn("Error during npm install, attempting to continue:", err);
      }
      
      // Start the development server
      try {
        const devProcess = await container.spawn('npm', ['run', 'dev']);
        
        // Log server output
        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log("Server output:", data);
          }
        }));
      } catch (err) {
        console.error("Error starting dev server:", err);
        throw err;
      }
      
      // Wait for the server-ready event
      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          // If timeout occurs, return a fallback URL
          resolve(null);
        }, 15000);
        
        container.on('server-ready', (port, url) => {
          clearTimeout(timeoutId);
          resolve(url);
        });
      });
    } catch (err:any) {
      console.error("Error starting server:", err);
      setError("Failed to start development server: " + err.message);
      return null;
    }
  };

  return {
    webcontainer: container,
    isLoading,
    error,
    mountFiles,
    startServer
  };
}