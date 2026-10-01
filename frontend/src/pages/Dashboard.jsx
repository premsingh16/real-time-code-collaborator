import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Code2, Trash2, ExternalLink, Clock, Home, LogOut } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [savedCodes, setSavedCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const response = await api.get('/code/my-codes');
        setSavedCodes(response.data.data);
      } catch (error) {
        toast.error('Failed to load saved workspaces');
        if (error.response?.status === 401) {
          navigate('/auth'); 
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCodes();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;
    
    try {
      await api.delete(`/code/${id}`);
      setSavedCodes(savedCodes.filter((code) => code._id !== id));
      toast.success('Workspace deleted');
    } catch (error) {
      toast.error('Failed to delete workspace');
    }
  };

  
  const openWorkspace = (code) => {
    const username = user?.username || 'Developer';
    navigate(`/workspace/${code.roomId}`, { 
      state: { username, codeId: code._id } 
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
       
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Code2 className="w-8 h-8 text-blue-500" />
              My Workspaces
            </h1>
            <p className="text-gray-400 mt-2">
              Welcome back, <span className="text-blue-400 font-semibold">{user?.username || 'Developer'}</span>!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Home className="w-4 h-4" /> Home
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

       
        {isLoading ? (
          <div className="text-center text-blue-400 mt-20 animate-pulse font-medium">Fetching your code...</div>
        ) : savedCodes.length === 0 ? (
          <div className="text-center bg-gray-900 border border-gray-800 rounded-xl p-12">
            <Code2 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No workspaces found</h2>
            <p className="text-gray-500 mb-6">You haven't saved any code yet.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Create New Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCodes.map((code) => (
              <div key={code._id} className="bg-gray0 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all group flex flex-col bg-gray-900">
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-100 truncate pr-4" title={code.title}>
                    {code.title}
                  </h3>
                  <span className="bg-gray-800 text-blue-400 text-xs font-bold px-2.5 py-1 rounded uppercase">
                    {code.language}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                  <Clock className="w-3.5 h-3.5" />
                  Updated: {new Date(code.updatedAt).toLocaleDateString()}
                </div>

                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-800/50">
                  <button
                    onClick={() => openWorkspace(code)} 
                    className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Open
                  </button>
                  <button
                    onClick={() => handleDelete(code._id)}
                    className="p-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors"
                    title="Delete Workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;