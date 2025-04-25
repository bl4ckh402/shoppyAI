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

// Base prompts for different frameworks
const BASE_PROMPT = "You are an AI assistant helping with a Shopify e-commerce application.";
const reactBasePrompt = "This is a React/Hydrogen-based Shopify application.";
const nodeBasePrompt = "This is a Node.js-based Shopify application.";
const liquidBasePrompt = "This is a Liquid-based Shopify theme.";
const oxygenBasePrompt = "This is an Oxygen-deployed Shopify application.";

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

// Determine framework using Gemini
async function determineFramework(prompt: string): Promise<string> {
  try {
    // Select appropriate model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create generation config
    const generationConfig = {
      temperature: 0.1,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    };
    
    // Send prompt to Gemini
    const result = await model.generateContent(
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Return only one word indicating what framework this prompt is referring to: hydrogen, liquid, oxygen, react, or node. Just return the single word, no explanation.\n\n" + prompt
              }
            ]
          }
        ],
        generationConfig
      }
    );
    
    // Get framework from response
    const response = result.response;
    const text = response.text().trim().toLowerCase();
    
    // Validate and normalize the response
    if (['hydrogen', 'liquid', 'oxygen', 'react', 'node'].includes(text)) {
      // Map react to hydrogen as they're essentially the same in this context
      return text === 'react' ? 'hydrogen' : text;
    }
    
    // Default to hydrogen if response is invalid
    return 'hydrogen';
  } catch (error) {
    console.error("Error determining framework with Gemini:", error);
    return 'hydrogen'; // Default to hydrogen on error
  }
}

// Template API handler
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
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { message: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Determine framework using Gemini
    const framework = await determineFramework(prompt);
    
    // Return prompts based on framework
    let response;
    
    switch (framework) {
      case 'hydrogen':
        response = {
          prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [reactBasePrompt],
          framework: 'hydrogen'
        };
        break;
        
      case 'liquid':
        response = {
          prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${liquidBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [liquidBasePrompt],
          framework: 'liquid'
        };
        break;
        
      case 'oxygen':
        response = {
          prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${oxygenBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [oxygenBasePrompt],
          framework: 'oxygen'
        };
        break;
        
      case 'node':
        response = {
          prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [nodeBasePrompt],
          framework: 'node'
        };
        break;
        
      default:
        response = {
          prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [reactBasePrompt],
          framework: 'hydrogen'
        };
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Template API error:", error);
    return NextResponse.json(
      { message: 'Failed to process template', error: String(error) },
      { status: 500 }
    );
  }
}