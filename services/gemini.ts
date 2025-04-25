// services/GeminiService.ts

import AuthUtil from "@/utils/auth-utils";
import axios from "axios";

export interface GeminiResponse {
    generatedCode: string;
    explanation?: string;
    followUpSuggestions?: string[];
  }
  
  export interface GeminiPrompt {
    prompt: string;
    context?: string;
    framework?: 'hydrogen' | 'liquid' | 'oxygen';
    additionalInstructions?: string;
  }
  
  export interface PromptHistory {
    role: 'user' | 'assistant';
    content: string;
  }
  
  /**
   * Service for generating code using API endpoints
   */
  export class GeminiService {
    private history: PromptHistory[] = [];
    private framework: 'hydrogen' | 'liquid' | 'oxygen' = 'hydrogen';
  
    constructor(framework?: 'hydrogen' | 'liquid' | 'oxygen') {
      if (framework) {
        this.framework = framework;
      }
    }
  
    /**
     * Generate code based on a prompt
     */
    async generateCode(promptData: GeminiPrompt): Promise<GeminiResponse> {
      try {
        const { prompt, context, framework, additionalInstructions } = promptData;
        
        // Use the provided framework or default to the one set in constructor
        const selectedFramework = framework || this.framework;
        
        // Create the request body
        const requestBody = {
          prompt,
          framework: selectedFramework,
          context,
          additionalInstructions,
          history: this.history
        };
        
        // Call the backend API endpoint
        const headers = await AuthUtil.getAuthHeaders();
        const response = await axios.post('/api/ai/gemini', requestBody, {
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        });
        
        // Extract data from response
        const { generatedCode, explanation, followUpSuggestions } = response.data;
        
        // Update conversation history
        this.history.push({ role: 'user', content: prompt });
        this.history.push({ 
          role: 'assistant', 
          content: generatedCode + (explanation ? `\n\n${explanation}` : '')
        });
        
        return {
          generatedCode,
          explanation,
          followUpSuggestions
        };
      } catch (error) {
        console.error('Error generating code:', error);
        throw new Error('Failed to generate code. Please try again.');
      }
    }
  
    /**
     * Get template suggestions based on prompt
     */
    async getTemplate(prompt: string): Promise<{
      prompts: string[];
      uiPrompts: string[];
      framework: 'hydrogen' | 'liquid' | 'oxygen' | 'node';
    }> {
      try {
        // Call the template API endpoint
        const headers = await AuthUtil.getAuthHeaders();
        const response = await axios.post('/api/ai/template', 
          { prompt },
          {
            headers: {
              'Content-Type': 'application/json',
              ...headers
            }
          }
        );
        
        return response.data;
      } catch (error) {
        console.error('Error getting template suggestion:', error);
        
        // Return default values on error
        return {
          prompts: [],
          uiPrompts: [],
          framework: 'hydrogen'
        };
      }
    }
  
    /**
     * Generate code using chat interface
     */
    async chat(messages: PromptHistory[], context?: string): Promise<GeminiResponse> {
      try {
        // Call the chat API endpoint
        const headers = await AuthUtil.getAuthHeaders();
        const response = await axios.post('/api/ai/chat', 
          { 
            messages, 
            framework: this.framework,
            context
          },
          {
            headers: {
              'Content-Type': 'application/json',
              ...headers
            }
          }
        );
        
        // Update local history if successful
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (lastUserMessage) {
          this.history.push(lastUserMessage);
          this.history.push({ 
            role: 'assistant', 
            content: response.data.response
          });
        }
        
        return {
          generatedCode: response.data.generatedCode,
          explanation: response.data.explanation,
          followUpSuggestions: response.data.followUpSuggestions
        };
      } catch (error) {
        console.error('Error in chat generation:', error);
        throw new Error('Failed to generate response. Please try again.');
      }
    }
  
    /**
     * Clear conversation history
     */
    clearHistory(): void {
      this.history = [];
    }
  
    /**
     * Get conversation history
     */
    getHistory(): PromptHistory[] {
      return [...this.history];
    }
  
    /**
     * Set framework for code generation
     */
    setFramework(framework: 'hydrogen' | 'liquid' | 'oxygen'): void {
      this.framework = framework;
    }
    
    // We now use AuthUtil for authentication
  }
  
  export default new GeminiService();