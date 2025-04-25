"use client"

import React, { useEffect, useState } from 'react';
import { useShopifyAI } from '@/contexts/ahoppyai-context';
import { useWebContainer } from '@/hooks/usewebContainer';

interface ShopifyPreviewProps {
  mode: 'desktop' | 'mobile';
}

export default function ShopifyPreview({ mode }: ShopifyPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  
  const { currentProject, framework } = useShopifyAI();
  const { 
    webcontainer, 
    isLoading: webContainerLoading, 
    error: containerError,
    mountFiles, 
    startServer 
  } = useWebContainer();
  
  useEffect(() => {
    async function setupPreview() {
      if (!webcontainer || !currentProject?.files) {
        setFallbackMessage("Preview environment is initializing. Please wait a moment.");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Mount files to WebContainer
        const mountResult = await mountFiles(currentProject.files);
        
        if (!mountResult) {
          throw new Error("Failed to mount files");
        }
        
        // Start development server
        const url = await startServer();
        
        if (!url) {
          setFallbackMessage("Preview server is starting. This may take a moment.");
          // Try again in 5 seconds
          setTimeout(() => {
            startServer().then(newUrl => {
              if (typeof newUrl === "string") {
                setPreviewUrl(newUrl);
                setLoading(false);
                setFallbackMessage(null);
              } else {
                setFallbackMessage("Preview is taking longer than expected. Please try refreshing.");
              }
            }).catch(err => {
              console.error("Error in retry:", err);
              setError("Failed to start preview server. Please try again.");
            });
          }, 5000);
          return;
        }
        
        if (typeof url === "string") {
          setPreviewUrl(url);
          setFallbackMessage(null);
        } else {
          setError("Failed to get preview URL. Please try refreshing.");
        }
      } catch (err:any) {
        console.error("Error setting up preview:", err);
        setError("Failed to initialize preview: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    }
    
    if (webcontainer && currentProject?.files) {
      setupPreview();
    }
  }, [webcontainer, currentProject?.files, mountFiles, startServer]);

  // Render based on loading/error states
  if (webContainerLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-shopify-green"></div>
        <p className="mt-4 text-gray-400 text-sm animate-pulse">
          Initializing preview environment...
        </p>
      </div>
    );
  }

  if (error || containerError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800 p-6">
        <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-gray-300 font-medium mb-2">Preview Error</h3>
        <p className="text-gray-400 text-center text-sm">
          {error || containerError}
        </p>
        <div className="mt-4 text-gray-500 text-xs max-w-md text-center">
          <p>This could be due to missing COOP/COEP headers. Check your Next.js configuration.</p>
        </div>
        <button 
          className="mt-4 px-4 py-2 bg-shopify-green hover:bg-shopify-dark-green text-white rounded-lg transition-colors duration-300 text-sm"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (fallbackMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800 p-6">
        <div className="animate-pulse w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-gray-300 font-medium mb-2">Starting Preview</h3>
        <p className="text-gray-400 text-center text-sm">
          {fallbackMessage}
        </p>
        <div className="mt-6 flex space-x-3">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800">
        <p className="text-gray-400">No preview available</p>
        <button 
          className="mt-4 px-4 py-2 bg-shopify-green/80 hover:bg-shopify-green text-white rounded-lg transition-colors duration-300 text-sm"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg overflow-hidden flex items-center justify-center">
      <div className={`bg-white relative ${
        mode === 'mobile' 
          ? 'w-[375px] h-[667px] rounded-xl shadow-2xl transition-all duration-500 transform hover:scale-105' 
          : 'w-full h-full'
      }`}>
        {mode === 'mobile' && (
          <>
            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-900 rounded-t-xl flex justify-center items-center">
              <div className="w-20 h-1 bg-gray-700 rounded-full"></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-900 rounded-b-xl"></div>
          </>
        )}
        <iframe 
          src={previewUrl} 
          className={`bg-white ${
            mode === 'mobile' 
              ? 'w-full h-[calc(100%-10px)] rounded-lg mt-6' 
              : 'w-full h-full'
          }`}
          sandbox="allow-scripts allow-same-origin allow-forms"
          onError={(e) => {
            console.error("iframe error:", e);
            setError("Failed to load preview. Please try refreshing.");
          }}
        />
      </div>
    </div>
  );
}