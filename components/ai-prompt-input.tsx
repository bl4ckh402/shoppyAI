// components/ShopifyAIPrompt.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useShopifyAI } from '../contexts/ahoppyai-context';

interface ShopifyAIPromptProps {
  onCodeGenerated?: (code: string) => void;
  onMessageSent?: (message: string) => void;
  placeholder?: string;
  className?: string;
}

const AIPromptInput: React.FC<ShopifyAIPromptProps> = ({
  onCodeGenerated,
  onMessageSent,
  placeholder = "Describe what you want to build for your Shopify store...",
  className = ""
}) => {
  const [prompt, setPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    generating,
    framework,
    generateCode,
    lastGeneratedCode,
    promptHistory
  } = useShopifyAI();
  
  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);
  
  // Update follow-up suggestions when lastGeneratedCode changes
  useEffect(() => {
    if (lastGeneratedCode?.followUpSuggestions) {
      setFollowUpSuggestions(lastGeneratedCode.followUpSuggestions);
    } else {
      setFollowUpSuggestions([]);
    }
  }, [lastGeneratedCode]);
  
  // Handle prompt submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    try {
      // Notify about the new message first
      onMessageSent?.(prompt);
      
      const result = await generateCode(prompt);
      
      // Clear the prompt input
      setPrompt('');
      
      // Call the callback if provided
      if (onCodeGenerated && result.code) {
        onCodeGenerated(result.code);
      }
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };
  
  // Handle follow-up suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setFollowUpSuggestions([]);
    
    // Focus the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  return (
    <div className={`bg-background/50 rounded-lg shadow-lg transition-all ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-shopify-green focus:ring-2 focus:ring-shopify-green/20 transition-all resize-none min-h-[60px]"
            rows={isExpanded ? 4 : 2}
          />
          
          {generating && (
            <div className="absolute right-3 bottom-3 flex items-center text-muted-foreground text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-shopify-green mr-2"></div>
              Generating...
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-3">
          <div className="flex space-x-2">
            {promptHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1 bg-background/50 hover:bg-muted text-foreground/70 rounded-md text-sm transition-colors"
              >
                {isExpanded ? 'Collapse' : 'History'}
              </button>
            )}
          </div>
          
          <button
            type="submit"
            disabled={generating || !prompt.trim()}
            className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
              generating || !prompt.trim()
                ? 'bg-muted cursor-not-allowed'
                : 'bg-shopify-green hover:bg-shopify-green/90'
            }`}
          >
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </form>
      
      {followUpSuggestions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Follow-up suggestions:</h4>
          <div className="flex flex-wrap gap-2">
            {followUpSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 bg-background/50 hover:bg-muted text-foreground/70 rounded-md text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isExpanded && promptHistory.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Conversation History:</h4>
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
            {promptHistory.map((entry, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-sm ${
                  entry.role === 'user'
                    ? 'bg-muted/50 text-foreground'
                    : 'bg-shopify-green/10 text-foreground'
                }`}
              >
                <div className="font-medium text-xs text-muted-foreground mb-1">
                  {entry.role === 'user' ? 'You' : 'AI'}:
                </div>
                <div>
                  {entry.content.length > 150
                    ? `${entry.content.substring(0, 150)}...`
                    : entry.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPromptInput;