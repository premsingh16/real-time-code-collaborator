import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, Code2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '', 
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && !formData.username.trim()) {
      return toast.error('Username is required for registration');
    }
    if (!formData.email.trim() || !formData.password.trim()) {
      return toast.error('Email and Password are required');
    }

    setIsLoading(true);
    const loadingToast = toast.loading(isLogin ? 'Logging in...' : 'Creating account...');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const response = await api.post(endpoint, payload);

      localStorage.setItem('token', response.data.token);
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!', { id: loadingToast });
      
      navigate('/');
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Authentication failed. Please try again.';
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-gray-100">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        
        <div className="p-8 pb-6 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <Code2 className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin 
              ? 'Enter your credentials to access your workspaces' 
              : 'Sign up to start saving your collaborative code'}
          </p>
        </div>

        <div className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Prem Singh"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="prem@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all mt-6"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors focus:outline-none"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Auth;