// services/ProjectService.ts
import axios from 'axios';
import { ShopifyAIFile, ShopifyAIProject } from '../contexts/ahoppyai-context';
import AuthUtil from '../utils/auth-utils';

/**
 * Service for managing projects via the API
 */
class ProjectService {
  /**
   * Get all projects for the current user
   */
  async getProjects(): Promise<ShopifyAIProject[]> {
    try {
      const headers = await AuthUtil.getAuthHeaders();
      const response = await axios.get('/api/projects', {
        headers
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }
  
  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<ShopifyAIProject> {
    try {
      const headers = await AuthUtil.getAuthHeaders();
      const response = await axios.get(`/api/projects?id=${id}`, {
        headers
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw new Error('Failed to fetch project');
    }
  }
  
  /**
   * Create a new project
   */
  async createProject(
    name: string, 
    framework: 'hydrogen' | 'liquid' | 'oxygen', 
    description?: string
  ): Promise<ShopifyAIProject> {
    try {
      const headers = await AuthUtil.getAuthHeaders();
      const response = await axios.post('/api/projects', 
        { name, framework, description },
        {
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }
  
  /**
   * Update a project
   */
  async updateProject(
    id: string, 
    updates: Partial<ShopifyAIProject>
  ): Promise<ShopifyAIProject> {
    try {
      const headers = await AuthUtil.getAuthHeaders();
      const response = await axios.put(`/api/projects?id=${id}`, 
        updates,
        {
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw new Error('Failed to update project');
    }
  }
  
  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<{ message: string; project: ShopifyAIProject }> {
    try {
      const headers = await AuthUtil.getAuthHeaders();
      const response = await axios.delete(`/api/projects?id=${id}`, {
        headers
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw new Error('Failed to delete project');
    }
  }
  
  /**
   * Get a file from a project
   */
  async getFile(projectId: string, path: string): Promise<ShopifyAIFile> {
    try {
      const headers = await AuthUtil.getAuthHeaders();
      const response = await axios.get(`/api/projects/files?projectId=${projectId}&path=${encodeURIComponent(path)}`, {
        headers
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching file ${path}:`, error);
      throw new Error('Failed to fetch file');
    }
  }
  
  /**
   * Create a file in a project
   */
  async createFile(
    projectId: string, 
    path: string, 
    content: string, 
    type: 'file' | 'folder' = 'file'
  ): Promise<ShopifyAIFile> {
    try {
      const headers = await AuthUtil.getAuthHeaders();
      const response = await axios.post(`/api/projects/files?projectId=${projectId}`, 
        { path, content, type },
        {
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error creating file ${path}:`, error);
      throw new Error('Failed to create file');
    }
  }
  
  /**
   * Update a file in a project
   */
  async updateFile(
    projectId: string,
    path: string, 
    updates: { content?: string; newPath?: string }
  ): Promise<ShopifyAIFile> {
    try {
      const headers = await AuthUtil.getAuthHeaders();
      const response = await axios.put(
        `/api/projects/files?projectId=${projectId}&path=${encodeURIComponent(path)}`, 
        updates,
        {
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error updating file ${path}:`, error);
      throw new Error('Failed to update file');
    }
  }
  
  /**
   * Delete a file from a project
   */
  async deleteFile(projectId: string, path: string): Promise<{ message: string; file: ShopifyAIFile }> {
    try {
      const headers = await AuthUtil.getAuthHeaders();
      const response = await axios.delete(
        `/api/projects/files?projectId=${projectId}&path=${encodeURIComponent(path)}`,
        {
          headers
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting file ${path}:`, error);
      throw new Error('Failed to delete file');
    }
  }
  
  // We now use AuthUtil for authentication
}

export default new ProjectService();