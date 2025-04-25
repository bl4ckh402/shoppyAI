// components/EnhancedCodeEditor.tsx
import React from 'react';
import Editor from '@monaco-editor/react';

interface EnhancedCodeEditorProps {
  className?: string;
  value: string;
  language: string;
  path: string;
  onChange: (value: string) => void;
  autoSave?: boolean;
}

// Define language mappings for syntax highlighting
const getLanguageFromPath = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'scss':
      return 'scss';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'liquid':
      return 'liquid'; // Custom language for Shopify Liquid
    default:
      return 'plaintext';
  }
};

// Define file type icons
const FileIcon: React.FC<{ path: string }> = ({ path }) => {
  const extension = path.split('.').pop()?.toLowerCase();
  
  const getIconForExtension = (ext?: string) => {
    switch (ext) {
      case 'js':
      case 'jsx':
        return '📜';
      case 'ts':
      case 'tsx':
        return '📝';
      case 'html':
        return '🌐';
      case 'css':
      case 'scss':
        return '🎨';
      case 'json':
        return '🔧';
      case 'md':
        return '📖';
      case 'liquid':
        return '💧';
      default:
        return '📄';
    }
  };
  
  return <span className="mr-2">{getIconForExtension(extension)}</span>;
};

const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({ 
  className = '',
  value,
  language,
  path,
  onChange,
  autoSave = true
}) => {
  // Handle content change
  const handleChange = (newValue: string | undefined) => {
    if (newValue === undefined) return;
    onChange(newValue);
  };

  return (
    <div className={`flex flex-col bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <FileIcon path={path} />
          <span className="text-gray-200 font-medium">{path}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
            {language}
          </div>
        </div>
      </div>
      
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={handleChange}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          lineNumbers: 'on',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
          },
          folding: true,
          tabSize: 2,
          suggest: {
            showClasses: true,
            showFunctions: true,
            showVariables: true,
            showWords: true,
            showSnippets: true,
          },
          contextmenu: true,
          quickSuggestions: true,
          formatOnType: true,
          formatOnPaste: true,
        }}
        beforeMount={(monaco:any) => {
          // Register a custom language for Liquid if it doesn't exist yet
          if (!monaco.languages.getLanguages().some((lang:any) => lang.id === 'liquid')) {
            monaco.languages.register({ id: 'liquid' });
            
            // Basic syntax highlighting for Liquid
            monaco.languages.setMonarchTokensProvider('liquid', {
              tokenizer: {
                root: [
                  // Liquid tags
                  [/{%[\s\S]*?%}/, 'liquid-tag'],
                  [/{{[\s\S]*?}}/, 'liquid-output'],
                  // HTML
                  [/<[^>]+>/, 'html-tag'],
                  // Comments
                  [/{#[\s\S]*?#}/, 'comment'],
                ]
              }
            });
            
            // Define theme for Liquid
            monaco.editor.defineTheme('liquid-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'liquid-tag', foreground: '569cd6', fontStyle: 'bold' },
                { token: 'liquid-output', foreground: 'ce9178' },
                { token: 'comment', foreground: '6a9955' },
                { token: 'html-tag', foreground: '569cd6' },
              ],
              colors: {}
            });
            
            // Apply theme
            monaco.editor.setTheme('liquid-dark');
          }
        }}
      />
    </div>
  );
};

export default EnhancedCodeEditor;