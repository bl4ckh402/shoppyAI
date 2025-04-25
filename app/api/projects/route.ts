import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

// GET all projects or a specific project
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { authenticated, user } = await verifyToken(request);
    
    if (!authenticated || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Return a specific project
    if (id) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { message: 'Project not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(data);
    }
    
    // Return all projects for the user
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { message: 'Failed to fetch projects' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// Create a new project
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
    const { name, description, framework } = body;
    
    // Validate project data
    if (!name || !framework) {
      return NextResponse.json(
        { message: 'Name and framework are required' },
        { status: 400 }
      );
    }
    
    // Create new project in Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          framework,
          owner_id: user.id,
          files: [],
          prompt_history: []
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { message: 'Failed to create project' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// Update a project
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const { authenticated, user } = await verifyToken(request);
    
    if (!authenticated || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get project ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { name, description, framework, files, prompt_history } = body;
    
    // Build update object
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (framework !== undefined) updates.framework = framework;
    if (files !== undefined) updates.files = files;
    if (prompt_history !== undefined) updates.prompt_history = prompt_history;
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    // Update project in Supabase
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: 'Project not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: 'Failed to update project' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Projects PUT error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// Delete a project
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const { authenticated, user } = await verifyToken(request);
    
    if (!authenticated || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get project ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // First get the project to return it after deletion
    const { data: project, error: getError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single();
    
    if (getError) {
      console.error('Supabase error:', getError);
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Delete project from Supabase
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { message: 'Failed to delete project' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Project deleted successfully',
      project
    });
  } catch (error) {
    console.error('Projects DELETE error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}