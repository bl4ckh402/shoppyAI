// services/WebContainerService.ts
import { WebContainer } from '@webcontainer/api';
import { FileSystemTree } from '@webcontainer/api';
import { ShopifyAIFile } from '../contexts/ahoppyai-context';
import { getCookieOptions } from '@/lib/cookie-config';

let webcontainerInstance: WebContainer | null = null;

export async function getWebContainer(isHeadless: boolean = false): Promise<WebContainer | null> {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  try {
    // Boot the WebContainer with default options
    webcontainerInstance = await WebContainer.boot({
      workdirName: 'shopify-dev',
    });

    // Apply cookie settings through headers if needed
    const options = getCookieOptions(isHeadless);
    if (webcontainerInstance) {
      // Set cookie-related headers on the instance
      webcontainerInstance.on('server-ready', (port, url) => {
        const headers = new Headers();
        headers.set(
          'Cookie',
          `same-site=${options.sameSite}; secure=${options.secure}; path=${options.path}${
            options.httpOnly ? '; httpOnly' : ''
          }`
        );
        // Add headers to any requests made through the WebContainer
        return { headers };
      });
    }

    return webcontainerInstance;
  } catch (error) {
    console.error('Failed to boot WebContainer:', error);
    return null;
  }
}

export function getWebContainerInstance(): WebContainer | null {
  return webcontainerInstance;
}

export function disposeWebContainer(): void {
  if (webcontainerInstance) {
    webcontainerInstance.teardown();
    webcontainerInstance = null;
  }
}

interface PreviewOptions {
  port?: number;
  command?: string;
  waitForPort?: boolean;
}

interface WebContainerStatus {
  booted: boolean;
  ready: boolean;
  serverRunning: boolean;
  serverUrl: string | null;
  error: string | null;
}

type StatusCallback = (status: WebContainerStatus) => void;

/**
 * Service for managing WebContainer instances for live previews
 */
class WebContainerService {
  private status: WebContainerStatus = {
    booted: false,
    ready: false,
    serverRunning: false,
    serverUrl: null,
    error: null,
  };
  private statusCallbacks: StatusCallback[] = [];
  private installProcess: any = null;
  private serverProcess: any = null;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  /**
   * Initialize the WebContainer with retry logic
   */
  async initialize(): Promise<WebContainer> {
    if (webcontainerInstance && this.status.booted) {
      return webcontainerInstance;
    }

    // Clean up any existing instance
    await this.cleanup();

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.updateStatus({ booted: false, ready: false, error: null });
        webcontainerInstance = await getWebContainer();
        this.updateStatus({ booted: true });

        // Listen for server-ready event
        webcontainerInstance?.on('server-ready', (port, url) => {
          this.updateStatus({ serverRunning: true, serverUrl: url });
        });

        return webcontainerInstance!;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message;

        // If this is not the last attempt, wait before retrying
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
          // Force garbage collection if available
          if (typeof global.gc === 'function') {
            try {
              global.gc();
            } catch (e) {
              console.warn('Failed to force garbage collection:', e);
            }
          }
        }
      }
    }

    // If we get here, all retries failed
    const errorMessage = lastError?.message || 'Unknown error';
    this.updateStatus({
      error: `Failed to boot WebContainer after ${this.maxRetries} attempts: ${errorMessage}`,
    });
    throw new Error(
      `Failed to boot WebContainer after ${this.maxRetries} attempts: ${errorMessage}`
    );
  }

  /**
   * Clean up WebContainer instance and resources
   */
  private async cleanup(): Promise<void> {
    if (this.serverProcess) {
      try {
        await this.serverProcess.kill();
      } catch (e) {
        console.warn('Error killing server process:', e);
      }
      this.serverProcess = null;
    }

    if (this.installProcess) {
      try {
        await this.installProcess.kill();
      } catch (e) {
        console.warn('Error killing install process:', e);
      }
      this.installProcess = null;
    }

    disposeWebContainer();

    // Reset status
    this.status = {
      booted: false,
      ready: false,
      serverRunning: false,
      serverUrl: null,
      error: null,
    };

    // Force garbage collection if available
    if (typeof global.gc === 'function') {
      try {
        global.gc();
      } catch (e) {
        console.warn('Failed to force garbage collection:', e);
      }
    }
  }

  /**
   * Convert ShopifyAI file structure to WebContainer file system tree
   */
  convertToFileSystemTree(files: ShopifyAIFile[]): FileSystemTree {
    const tree: FileSystemTree = {};

    const processFile = (file: ShopifyAIFile): any => {
      if (file.type === 'folder' && file.children) {
        const directory: { [key: string]: any } = {};

        file.children.forEach((child) => {
          const name = child.name;
          directory[name] = processFile(child);
        });

        return { directory };
      } else if (file.type === 'file') {
        return {
          file: {
            contents: file.content || '',
          },
        };
      }

      return { file: { contents: '' } };
    };

    // Process top-level files
    files.forEach((file) => {
      const name = file.name;
      tree[name] = processFile(file);
    });

    return tree;
  }

  /**
   * Mount files to the WebContainer
   */
  async mountFiles(files: ShopifyAIFile[]): Promise<void> {
    if (!webcontainerInstance) {
      await this.initialize();
    }

    if (!webcontainerInstance) {
      throw new Error('WebContainer is not initialized');
    }

    try {
      this.updateStatus({ ready: false });

      // Convert files to WebContainer format
      const fileSystemTree = this.convertToFileSystemTree(files);

      // Mount the files
      await webcontainerInstance.mount(fileSystemTree);

      this.updateStatus({ ready: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.updateStatus({ error: `Failed to mount files: ${errorMessage}` });
      throw error;
    }
  }

  /**
   * Start the preview server
   */
  async startPreview(options: PreviewOptions = {}): Promise<string> {
    if (!webcontainerInstance) {
      throw new Error('WebContainer is not initialized');
    }

    if (!this.status.ready) {
      throw new Error('Files are not mounted yet');
    }

    try {
      // Default options
      const { port = 3000, command = 'npm run dev', waitForPort = true } = options;

      // Check if package.json exists and install dependencies if needed
      if (!this.installProcess) {
        try {
          await webcontainerInstance.fs.readFile('package.json');

          // Install dependencies
          this.updateStatus({ serverRunning: false, serverUrl: null });
          this.installProcess = await webcontainerInstance.spawn('npm', ['install']);

          const installExitCode = await this.installProcess.exit;

          if (installExitCode !== 0) {
            this.updateStatus({ error: `npm install failed with exit code ${installExitCode}` });
            throw new Error(`npm install failed with exit code ${installExitCode}`);
          }
        } catch (error) {
          // If package.json doesn't exist, create a minimal one
          const packageJson = {
            name: 'shopify-preview',
            private: true,
            version: '1.0.0',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview',
            },
            dependencies: {
              '@shopify/hydrogen': '^2023.10.0',
              react: '^18.2.0',
              'react-dom': '^18.2.0',
            },
            devDependencies: {
              '@vitejs/plugin-react': '^4.0.0',
              vite: '^4.3.9',
            },
          };

          await webcontainerInstance.fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));

          // Install dependencies
          this.installProcess = await webcontainerInstance.spawn('npm', ['install']);

          const installExitCode = await this.installProcess.exit;

          if (installExitCode !== 0) {
            this.updateStatus({ error: `npm install failed with exit code ${installExitCode}` });
            throw new Error(`npm install failed with exit code ${installExitCode}`);
          }
        }
      }

      // Start the dev server
      this.updateStatus({ serverRunning: false, serverUrl: null });

      // If a server is already running, stop it
      if (this.serverProcess) {
        try {
          this.serverProcess.kill();
        } catch (error) {
          console.warn('Failed to kill previous server process:', error);
        }
      }

      // Split the command into the executable and args
      const [cmd, ...args] = command.split(' ');
      this.serverProcess = await webcontainerInstance.spawn(cmd, args);

      // Forward output to console for debugging
      this.serverProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log('[WebContainer]', data);
          },
        })
      );

      if (waitForPort) {
        // Wait for server-ready event
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error(`Timed out waiting for server to start on port ${port}`));
          }, 30000); // 30 seconds timeout

          let handled = false;
          const serverReadyHandler = (_port: number, url: string) => {
            if (!handled && _port === port) {
              handled = true;
              clearTimeout(timeoutId);
              resolve(url);
            }
          };

          webcontainerInstance?.on('server-ready', serverReadyHandler);

          // Check if server is already running on the port
          if (this.status.serverRunning && this.status.serverUrl) {
            clearTimeout(timeoutId);
            resolve(this.status.serverUrl);
          }
        });
      }

      // If not waiting for port, just return a placeholder URL
      return `http://localhost:${port}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.updateStatus({ error: `Failed to start preview: ${errorMessage}` });
      throw error;
    }
  }

  /**
   * Write a single file to the WebContainer
   */
  async writeFile(path: string, content: string): Promise<void> {
    if (!webcontainerInstance) {
      throw new Error('WebContainer is not initialized');
    }

    try {
      // Ensure the directory exists
      const dirPath = path.substring(0, path.lastIndexOf('/'));
      if (dirPath) {
        await this.ensureDir(dirPath);
      }

      // Write the file
      await webcontainerInstance.fs.writeFile(path, content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.updateStatus({ error: `Failed to write file: ${errorMessage}` });
      throw error;
    }
  }

  /**
   * Ensure a directory exists
   */
  private async ensureDir(path: string): Promise<void> {
    if (!webcontainerInstance) {
      throw new Error('WebContainer is not initialized');
    }

    try {
      // Try to create the directory and ignore error if it already exists
      const segments = path.split('/').filter(Boolean);
      let currentPath = '';
      for (const segment of segments) {
        currentPath += `/${segment}`;
        try {
          await webcontainerInstance.fs.mkdir(currentPath);
        } catch (error: any) {
          // If error is not "already exists", rethrow
          if (!error?.message?.includes('EEXIST')) {
            throw error;
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create directory: ${errorMessage}`);
    }
  }

  /**
   * Update WebContainer status and notify subscribers
   */
  private updateStatus(update: Partial<WebContainerStatus>): void {
    this.status = { ...this.status, ...update };

    // Notify all subscribers
    this.statusCallbacks.forEach((callback) => callback(this.status));
  }

  /**
   * Subscribe to status updates
   */
  onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.push(callback);

    // Immediately call with current status
    callback(this.status);

    // Return unsubscribe function
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Reset the WebContainer with proper cleanup
   */
  async reset(): Promise<void> {
    await this.cleanup();

    // Notify subscribers of reset
    this.statusCallbacks.forEach((callback) => callback(this.status));

    // Re-initialize
    await this.initialize();
  }
}

// Export as a singleton
export default new WebContainerService();