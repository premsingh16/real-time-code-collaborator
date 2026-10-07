import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const EditorWindow = ({ socketRef, roomId, currentLanguage, initialCode, onCodeChange }) => {
  const [value, setValue] = useState(initialCode);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const debounceTimerRef = useRef(null);
  const isIncomingChangeRef = useRef(false);
  const editorWrapperRef = useRef(null); 

  useEffect(() => {
    setValue(initialCode);
  }, [initialCode]);

  
  useEffect(() => {
    if (!socketRef.current) return;

    const handleIncomingCodeUpdate = ({ code }) => {
      isIncomingChangeRef.current = true;
      setValue(code);
      onCodeChange(code);
    };

    socketRef.current.on('code-update', handleIncomingCodeUpdate);

    return () => {
      socketRef.current.off('code-update', handleIncomingCodeUpdate);
    };
  }, [socketRef, onCodeChange]);

  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleChange = (newValue) => {
    if (isIncomingChangeRef.current) {
      isIncomingChangeRef.current = false;
      return;
    }

    setValue(newValue);
    onCodeChange(newValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      socketRef.current.emit('code-change', {
        roomId,
        code: newValue,
      });
    }, 400); 
  };

  // Full Screen Toggle Logic
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      editorWrapperRef.current.requestFullscreen().catch((err) => {
        console.error("Error enabling full-screen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div 
      ref={editorWrapperRef} 
      className="relative w-full h-full rounded-lg overflow-hidden border border-gray-800 bg-[#1e1e1e]"
    >
     
      <button
        onClick={toggleFullScreen}
        className="absolute top-2 right-4 z-10 px-3 py-1 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 hover:text-white transition-all opacity-50 hover:opacity-100"
      >
        {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
      </button>

      <Editor
        height="100%"
        language={currentLanguage === 'cpp' ? 'cpp' : currentLanguage}
        theme="vs-dark"
        value={value}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          fontSize: 15,
          wordWrap: 'on',
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
        }}
      />
    </div>
  );
};

export default EditorWindow;