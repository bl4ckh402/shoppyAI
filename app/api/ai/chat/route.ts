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
function parseResponse(response: string) {
  // Default structure for responses
  let result: {
    xmlResponse: string;
    generatedCode: string;
    explanation: string;
    followUpSuggestions: string[];
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

// Interface for chat messages
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Chat API handler
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { authenticated, user } = await verifyToken(request);
    
    if (!authenticated || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { messages, framework = 'hydrogen', context = '' } = body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { message: 'Messages are required' },
        { status: 400 }
      );
    }
    
    // Get the last message (current user query)
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.role !== 'user') {
      return NextResponse.json(
        { message: 'Last message must be from user' },
        { status: 400 }
      );
    }
    
    // Format chat history for Gemini
    const chatHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
    
    // Select appropriate model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
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
    
    // Create system prompt based on framework
    let systemPrompt = "You are an expert developer assistant for Shopify e-commerce applications. ";
    
    switch (framework) {
      case 'hydrogen':
        systemPrompt += "You specialize in Hydrogen, Shopify's React-based framework. Format code responses with <code> tags and explanations with <explanation> tags.";
        break;
      case 'liquid':
        systemPrompt += "You specialize in Liquid, Shopify's template language. Format code responses with <code> tags and explanations with <explanation> tags.";
        break;
      case 'oxygen':
        systemPrompt += "You specialize in Oxygen, Shopify's hosting platform. Format code responses with <code> tags and explanations with <explanation> tags.";
        break;
      case 'node':
        systemPrompt += "You specialize in Node.js for Shopify applications. Format code responses with <code> tags and explanations with <explanation> tags.";
        break;
      default:
        systemPrompt += "Format code responses with <code> tags and explanations with <explanation> tags.";
    }
    
    // Add context if provided
    if (context) {
      systemPrompt += `\n\nContext for this request:\n${context}`;
    }
    
    // Send system prompt
    await chat.sendMessage(systemPrompt);
    
    // Send the actual user prompt
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const responseText = response.text();
    
    // Parse the response
    const parsedResponse = parseResponse(responseText);
    
    // Store chat history in user's database record
    // This would be implemented based on your data model
    
    // Return the response
    return NextResponse.json({
      response: responseText,
      ...parsedResponse
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { message: 'Failed to generate response', error: String(error) },
      { status: 500 }
    );
  }
}