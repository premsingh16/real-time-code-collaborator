import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Users, LogOut, Play, Copy, Download, Save, LayoutDashboard } from 'lucide-react';
import { initSocket } from '../services/socket';
import api from '../services/api';
import EditorWindow from '../components/EditorWindow';
import TerminalWindow from '../components/TerminalWindow';

const Workspace = () => {
  const socketRef = useRef(null);
  const codeRef = useRef('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  
  const [clients, setClients] = useState([]);
  const [initialCode, setInitialCode] = useState('// Loading workspace...');
  const [language, setLanguage] = useState('cpp');
  
  const [output, setOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [customInput, setCustomInput] = useState('');
  
  const [currentCodeId, setCurrentCodeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!location.state?.username) {
    return <Navigate to="/" />;
  }

 
  useEffect(() => {
    const fetchSavedCode = async () => {
      if (location.state?.codeId) {
        try {
          const response = await api.get(`/code/${location.state.codeId}`);
          const savedData = response.data.data;
          setInitialCode(savedData.code);
          codeRef.current = savedData.code;
          setLanguage(savedData.language);
          setCurrentCodeId(savedData._id); 
          toast.success('Loaded saved workspace from DB!');
        } catch (error) {
          toast.error('Failed to load saved workspace content');
        }
      }
    };

    fetchSavedCode();
  }, [location.state?.codeId]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('Socket error', e);
        toast.error('Socket connection failed, try again later.');
        navigate('/');
      }

      socketRef.current.emit('join-room', {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on('sync-room-state', ({ code, language, clients }) => {
        
        if (!location.state?.codeId) {
          setInitialCode(code);
          codeRef.current = code;
          setLanguage(language);
        }
        setClients(clients);
      });

      socketRef.current.on('user-joined', ({ username, clients }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room`);
        }
        setClients(clients);
      });

      socketRef.current.on('user-left', ({ username, clients }) => {
        toast(`${username} left the room`, { icon: '👋' });
        setClients(clients);
      });

      socketRef.current.on('language-update', ({ language }) => {
        setLanguage(language);
        toast(`Switched to ${language.toUpperCase()}`, { icon: '🔄' });
      });

      socketRef.current.on('output-update', ({ outputData }) => {
        setOutput(outputData);
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off('sync-room-state');
        socketRef.current.off('user-joined');
        socketRef.current.off('user-left');
        socketRef.current.off('language-update');
        socketRef.current.off('output-update');
      }
    };
  }, [roomId, location.state?.username, location.state?.codeId, navigate]);

  const leaveRoom = () => {
    navigate('/');
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socketRef.current.emit('language-change', { roomId, language: newLang });
  };

  const runCode = async () => {
    if (!codeRef.current.trim()) {
      toast.error('Code cannot be empty!');
      return;
    }

    setIsCompiling(true);
    setOutput('');

    try {
      const response = await api.post('/code/compile', {
        language,
        code: codeRef.current,
        stdin: customInput, 
      });

      const resultText = response.data.result.output || 'Execution successful but no output.';
      setOutput(resultText);

      socketRef.current.emit('output-change', { roomId, outputData: resultText });
      toast.success('Execution Complete');
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to compile code on server';
      const formattedError = `Error: ${errorMsg}`;
      setOutput(formattedError);
      socketRef.current.emit('output-change', { roomId, outputData: formattedError });
      toast.error('Execution Failed');
    } finally {
      setIsCompiling(false);
    }
  };

  const saveWorkspace = async () => {
    if (!codeRef.current.trim()) {
      toast.error('Cannot save an empty workspace!');
      return;
    }

    let title = 'Untitled Workspace';
    if (!currentCodeId) {
      const userTitle = window.prompt('Enter a title for this workspace:', 'My Awesome Code');
      if (userTitle === null) return;
      title = userTitle || title;
    }

    setIsSaving(true);
    const loadingToast = toast.loading('Saving to database...');

    try {
      const payload = {
        title,
        language,
        code: codeRef.current,
        roomId,
      };

      if (currentCodeId) {
        payload.codeId = currentCodeId;
      }

      const response = await api.post('/code/save', payload);
      setCurrentCodeId(response.data.data._id);
      
      toast.success(currentCodeId ? 'Workspace updated!' : 'Workspace saved!', { id: loadingToast });
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.', { id: loadingToast });
        navigate('/auth');
      } else {
        toast.error('Failed to save workspace', { id: loadingToast });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy Room ID');
    }
  };

  const downloadCode = () => {
    if (!codeRef.current.trim()) {
      toast.error('No code to download!');
      return;
    }

    const extensions = { cpp: 'cpp', python: 'py', javascript: 'js', java: 'java' };
    const ext = extensions[language] || 'txt';
    const filename = `script-${roomId.slice(0, 6)}.${ext}`;

    const blob = new Blob([codeRef.current], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white overflow-hidden">
      
     
      <div className="w-60 lg:w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400 shrink-0" />
          <h2 className="font-semibold truncate">Collaborators</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {clients.map((client) => (
            <div key={client.socketId} className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                {client.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium truncate">{client.username}</span>
            </div>
          ))}
        </div>
          
        
        <div className="p-4 border-t border-gray-800 space-y-3 shrink-0">
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400 shrink-0" /> My Dashboard
          </button>

          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wider">Invite Friends</p>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={roomId}
                readOnly
                className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1.5 text-xs text-gray-400 focus:outline-none cursor-text truncate"
              />
              <button
                onClick={copyRoomId}
                className="bg-gray-800 hover:bg-gray-700 p-1.5 rounded transition-colors text-gray-300 shrink-0"
                title="Copy Room ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
            
          <button 
            onClick={leaveRoom}
            className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" /> Leave Room
          </button>
        </div>
      </div>

      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
       
        <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 shrink-0 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-400 hidden sm:inline">Language:</span>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-gray-800 border border-gray-700 text-blue-400 px-3 py-1.5 rounded-md text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={saveWorkspace}
              disabled={isSaving}
              className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all disabled:opacity-50 shrink-0"
            >
              <Save className="w-4 h-4 shrink-0" /> 
              <span className="hidden xs:inline">{isSaving ? 'Saving...' : (currentCodeId ? 'Update' : 'Save')}</span>
            </button>

            <button 
              onClick={downloadCode}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0"
            >
              <Download className="w-4 h-4 shrink-0" /> 
              <span className="hidden xs:inline">Download</span>
            </button>

            <button 
              onClick={runCode}
              disabled={isCompiling}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 sm:px-5 py-1.5 rounded-md text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-current shrink-0" /> 
              <span>{isCompiling ? 'Running...' : 'Run Code'}</span>
            </button>
          </div>
        </div>

        
        <div className="flex-1 p-2 bg-gray-950 min-h-0 relative">
          <EditorWindow 
            socketRef={socketRef}
            roomId={roomId}
            currentLanguage={language}
            initialCode={initialCode}
            onCodeChange={(newCode) => { codeRef.current = newCode }}
          />
        </div>

       
        <div className="h-48 lg:h-64 flex flex-col sm:flex-row border-t border-gray-800 bg-gray-950 shrink-0">
          <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-800 flex flex-col h-1/2 sm:h-full">
            <div className="px-4 py-2 border-b border-gray-800 bg-gray-900 text-xs sm:text-sm font-semibold text-gray-400">
              Custom Input (stdin)
            </div>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type your inputs here (e.g., 10 20)..."
              className="flex-1 bg-transparent p-3 text-xs sm:text-sm text-gray-300 focus:outline-none resize-none font-mono"
            />
          </div>

          <div className="w-full sm:w-2/3 flex flex-col h-1/2 sm:h-full min-w-0">
            <TerminalWindow output={output} isCompiling={isCompiling} />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Workspace;