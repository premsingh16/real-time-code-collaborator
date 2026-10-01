import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const EditorWindow = ({ socketRef, roomId, currentLanguage, initialCode, onCodeChange }) => {
  const [value, setValue] = useState(initialCode);
  const debounceTimerRef = useRef(null);
  const isIncomingChangeRef = useRef(false);

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

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-800">
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