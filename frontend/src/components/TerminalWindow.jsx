import { Terminal } from 'lucide-react';

const TerminalWindow = ({ output, isCompiling }) => {
  return (
    <div className="h-64 bg-gray-950 border-t border-gray-800 flex flex-col">
      
      <div className="flex items-center px-4 py-2 border-b border-gray-800 bg-gray-900 text-sm font-semibold text-gray-400 gap-2">
        <Terminal className="w-4 h-4" /> Output Console
      </div>
    
      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
        {isCompiling ? (
          <span className="text-blue-400 animate-pulse">⚙️ Compiling and running code...</span>
        ) : (
          <pre className="whitespace-pre-wrap wrap-break-word text-gray-300">
            {output || 'No output yet. Click "Run Code" to execute.'}
          </pre>
        )}
      </div>
    </div>
  );
};

export default TerminalWindow;