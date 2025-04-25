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

// Types for file operations
interface ShopifyAIFile {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: ShopifyAIFile[];
}

// Helper function to find a file within a project's files array
function findFile(files: ShopifyAIFile[], path: string): ShopifyAIFile | null {
  for (const file of files) {
    if (file.path === path) {
      return file;
    }
    
    if (file.type === 'folder' && file.children) {
      const found = findFile(file.children, path);
      if (found) return found;
    }
  }
  
  return null;
}

// Helper function to recursively create folder structure
function createFoldersRecursively(
  files: ShopifyAIFile[],
  pathSegments: string[]
): ShopifyAIFile[] {
  let updatedFiles = [...files];
  let currentLevel = updatedFiles;
  let currentPath = '';
  
  for (let i = 0; i < pathSegments.length; i++) {
    if (!pathSegments[i]) continue;
    
    currentPath += '/' + pathSegments[i];
    
    // Check if folder already exists
    let folderIndex = currentLevel.findIndex(f => f.path === currentPath);
    
    if (folderIndex === -1) {
      // Create folder if it doesn't exist
      const newFolder: ShopifyAIFile = {
        name: pathSegments[i],
        type: 'folder',
        path: currentPath,
        children: []
      };
      
      currentLevel.push(newFolder);
      folderIndex = currentLevel.length - 1;
    }
    
    // Move to next level
    if (!currentLevel[folderIndex].children) {
      currentLevel[folderIndex].children = [];
    }
    
    currentLevel = currentLevel[folderIndex].children!;
  }
  
  return updatedFiles;
}

// Helper function to update a file within a files array
function updateFileRecursively(
  files: ShopifyAIFile[],
  filePath: string,
  updates: Partial<ShopifyAIFile>
): boolean {
  for (let i = 0; i < files.length; i++) {
    if (files[i].path === filePath) {
      // Apply updates
      files[i] = { ...files[i], ...updates };
      return true;
    }
    
    if (files[i].type === 'folder' && files[i].children) {
      if (updateFileRecursively(files[i].children!, filePath, updates)) {
        return true;
      }
    }
  }
  
  return false;
}

// Helper function to delete a file from a files array
function deleteFileRecursively(
  files: ShopifyAIFile[],
  filePath: string
): { success: boolean, deletedFile: ShopifyAIFile | null } {
  for (let i = 0; i < files.length; i++) {
    if (files[i].path === filePath) {
      // Remove the file or folder
      const deletedFile = files.splice(i, 1)[0];
      return { success: true, deletedFile };
    }
    
    if (files[i].type === 'folder' && files[i].children) {
      const result = deleteFileRecursively(files[i].children!, filePath);
      if (result.success) {
        return result;
      }
    }
  }
  
  return { success: false, deletedFile: null };
}

// Get a file from a project
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
    
    // Get project ID and file path from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const filePath = searchParams.get('path');
    
    if (!projectId || !filePath) {
      return NextResponse.json(
        { message: 'Project ID and file path are required' },
        { status: 400 }
      );
    }
    
    // Get project from Supabase
    const { data: project, error } = await supabase
      .from('projects')
      .select('files')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Find the file in the project's files array
    const file = findFile(project.files || [], filePath);
    
    if (!file) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(file);
  } catch (error) {
    console.error('Files GET error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// Create a new file or folder
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
    
    // Get project ID from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { path, content, type = 'file' } = body;
    
    if (!path) {
      return NextResponse.json(
        { message: 'File path is required' },
        { status: 400 }
      );
    }
    
    // Get project from Supabase
    const { data: project, error: getError } = await supabase
      .from('projects')
      .select('files')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
    
    if (getError) {
      console.error('Supabase error:', getError);
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if file already exists
    const files = project.files || [];
    const existingFile = findFile(files, path);
    
    if (existingFile) {
      return NextResponse.json(
        { message: 'File or folder already exists' },
        { status: 400 }
      );
    }
    
    // Get file name from path
    const pathSegments = path.split('/').filter(Boolean);
    const fileName = pathSegments[pathSegments.length - 1];
    
    // Create parent folders if they don't exist
    let updatedFiles = [...files];
    
    if (pathSegments.length > 1) {
      updatedFiles = createFoldersRecursively(
        updatedFiles,
        pathSegments.slice(0, -1)
      );
    }
    
    // Find the parent folder
    const parentPath = '/' + pathSegments.slice(0, -1).join('/');
    let parentFolder: ShopifyAIFile | null = null;
    
    if (parentPath !== '/') {
      parentFolder = findFile(updatedFiles, parentPath);
    }
    
    // Create the new file
    const newFile: ShopifyAIFile = {
      name: fileName,
      type,
      path,
      content: type === 'file' ? content : undefined,
      children: type === 'folder' ? [] : undefined
    };
    
    // Add the file to the parent folder or root
    if (parentFolder && parentFolder.type === 'folder') {
      if (!parentFolder.children) parentFolder.children = [];
      parentFolder.children.push(newFile);
    } else {
      updatedFiles.push(newFile);
    }
    
    // Update project in Supabase
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        files: updatedFiles,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Supabase error:', updateError);
      return NextResponse.json(
        { message: 'Failed to create file' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error('Files POST error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// Update a file
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
    
    // Get project ID and file path from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const filePath = searchParams.get('path');
    
    if (!projectId || !filePath) {
      return NextResponse.json(
        { message: 'Project ID and file path are required' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { content, newPath } = body;
    
    // Get project from Supabase
    const { data: project, error: getError } = await supabase
      .from('projects')
      .select('files')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
    
    if (getError) {
      console.error('Supabase error:', getError);
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Copy the files array
    const files = [...(project.files || [])];
    
    // Prepare updates
    const updates: Partial<ShopifyAIFile> = {};
    
    if (content !== undefined) {
      updates.content = content;
    }
    
    if (newPath) {
      const pathSegments = newPath.split('/').filter(Boolean);
      const fileName = pathSegments[pathSegments.length - 1];
      
      updates.name = fileName;
      updates.path = newPath;
    }
    
    // Update the file
    if (!updateFileRecursively(files, filePath, updates)) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }
    
    // Update project in Supabase
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        files,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Supabase error:', updateError);
      return NextResponse.json(
        { message: 'Failed to update file' },
        { status: 500 }
      );
    }
    
    // Find the updated file to return it
    const updatedFile = findFile(files, newPath || filePath);
    
    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Files PUT error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// Delete a file
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
    
    // Get project ID and file path from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const filePath = searchParams.get('path');
    
    if (!projectId || !filePath) {
      return NextResponse.json(
        { message: 'Project ID and file path are required' },
        { status: 400 }
      );
    }

    // Get project from Supabase
    const { data: project, error: getError } = await supabase
      .from('projects')
      .select('files')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (getError) {
      console.error('Supabase error:', getError);
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    // Copy the files array
    const files = [...(project.files || [])];

    // Delete the file
    const { success, deletedFile } = deleteFileRecursively(files, filePath);

    if (!success) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    // Update project in Supabase
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        files,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Supabase error:', updateError);
      return NextResponse.json(
        { message: 'Failed to delete file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'File deleted successfully',
      file: deletedFile
    });
  } catch (error) {
    console.error('Files DELETE error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}