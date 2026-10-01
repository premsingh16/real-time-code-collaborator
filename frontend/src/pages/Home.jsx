import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Terminal, ArrowRight, Zap } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

 
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomId.trim() || !username.trim()) {
      toast.error('Room ID & Username are required!');
      return;
    }

   
    navigate(`/workspace/${roomId}`, {
      state: { username },
    });
  };

  
  const createNewRoom = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await api.post('/rooms/create', {
        language: 'cpp',
      });
      
      setRoomId(response.data.roomId);
      toast.success('New Room Generated! Enter your name to join.');
    } catch (error) {
      toast.error('Failed to create a new room');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
        
        
        <div className="p-8 pb-6 border-b border-gray-800 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <Terminal className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Real-Time Code Sync</h1>
          <p className="text-gray-400 text-sm">
            Paste a room ID to join an existing session, or create a new one to invite collaborators.
          </p>
        </div>

        
        <div className="p-8 pt-6">
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Room ID
              </label>
              <input
                type="text"
                placeholder="e.g. 6344e3ea-be7a-4884-..."
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Prem Singh"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom(e)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all mt-6"
            >
              Join Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800"></div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Or</span>
            <div className="flex-1 h-px bg-gray-800"></div>
          </div>

         
          <button
            onClick={createNewRoom}
            disabled={isCreating}
            className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all border border-gray-700"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            {isCreating ? 'Generating...' : 'Generate New Room'}
          </button>
          
          <div className="mt-6 pt-6 border-t border-gray-800">
            {localStorage.getItem('token') ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-blue-400 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all border border-blue-500/30"
              >
                Go to My Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-blue-400 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all border border-blue-500/30"
              >
                Login / Register to Save Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;