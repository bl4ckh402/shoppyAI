import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Initialize Supabase for auth verification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to parse response from Gemini
export function parseResponse(response: string) {
  // Extract code blocks, explanations, etc. as needed
  // This is a simplified version - expand based on your actual needs
  
  // Default structure for responses
  let result: {
    xmlResponse: string,
    generatedCode: string,
    explanation: string,
    followUpSuggestions: string[]
  } = {
    xmlResponse: response,
    generatedCode: response,
    explanation: "",
    followUpSuggestions: []
  };
  
  // Parse XML-like responses if they exist
  const codeBlockRegex = /<code>([\s\S]*?)<\/code>/;
  const codeMatch = response.match(codeBlockRegex);
  
  if (codeMatch && codeMatch[1]) {
    result.generatedCode = codeMatch[1].trim();
  }
  
  // Extract explanation if it exists
  const explanationRegex = /<explanation>([\s\S]*?)<\/explanation>/;
  const explanationMatch = response.match(explanationRegex);
  
  if (explanationMatch && explanationMatch[1]) {
    result.explanation = explanationMatch[1].trim();
  }
  
  // Extract follow-up suggestions if they exist
  const suggestionsRegex = /<suggestions>([\s\S]*?)<\/suggestions>/;
  const suggestionsMatch = response.match(suggestionsRegex);
  
  if (suggestionsMatch && suggestionsMatch[1]) {
    const suggestionsText = suggestionsMatch[1].trim();
    result.followUpSuggestions = suggestionsText
      .split('\n')
      .map(suggestion => suggestion.trim())
      .filter(suggestion => suggestion.length > 0);
  }
  
  return result;
}

// Helper function to verify auth token
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, user: null };
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return { authenticated: false, user: null };
    }
    
    return { authenticated: true, user: data.user };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false, user: null };
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Generate code using Gemini
async function generateCodeWithGemini(
  prompt: string,
  framework: 'hydrogen' | 'liquid' | 'oxygen' = 'hydrogen',
  history: ChatMessage[] = []
) {
  try {
    // Select appropriate model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Format history for Gemini
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
    
    // Create chat session with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
    
    // Add system prompt based on framework
    let systemPrompt = "You are an expert developer assistant for Shopify e-commerce applications. ";
    
    switch (framework) {
      case 'hydrogen':
        systemPrompt += "You specialize in Hydrogen, Shopify's React-based framework. Format your code responses with <code> tags.";
        break;
      case 'liquid':
        systemPrompt += "You specialize in Liquid, Shopify's template language. Format your code responses with <code> tags.";
        break;
      case 'oxygen':
        systemPrompt += "You specialize in Oxygen, Shopify's hosting platform. Format your code responses with <code> tags.";
        break;
      default:
        systemPrompt += "Format your code responses with <code> tags.";
    }
    
    // First send system prompt
    await chat.sendMessage(systemPrompt);
    
    // Now send the actual user prompt
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const responseText = response.text();
    
    // Parse the response
    return {
      code: responseText,
      ...parseResponse(responseText)
    };
  } catch (error) {
    console.error("Error generating code with Gemini:", error);
    throw error;
  }
}

// Main API handler for Gemini code generation
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { authenticated, user } = await verifyToken(request);
    
    if (!authenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { prompt, framework = 'hydrogen', history = [] } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { message: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Generate code
    const result = await generateCodeWithGemini(prompt, framework, history);
    
    // Return result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { message: 'Failed to generate code', error: String(error) },
      { status: 500 }
    );
  }
}