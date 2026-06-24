import React, { useState } from 'react';
import { AlertCircle, Loader2 } from "lucide-react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import { WorkerDashboard, ChiefDashboard } from './components/Dashboards';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (email.toLowerCase().includes('chief')) {
        navigate('/chief');
      } else {
        navigate('/worker');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans relative">
      {/* Background Split */}
      <div className="absolute inset-0 flex z-0">
        <div className="hidden lg:block lg:w-1/2 bg-[#0A1930] bg-gradient-to-br from-[#060d1a] via-[#0A1930] to-[#0d264f]"></div>
        <div className="w-full lg:w-1/2 bg-[#F8F9FB]"></div>
      </div>

      {/* Left Content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-24 z-10">
        <h1 className="text-white text-6xl font-black italic tracking-tight mb-4 drop-shadow-lg">
          Login page
        </h1>
        <p className="text-gray-300 text-3xl font-light tracking-wide opacity-90">
          Start your journey<br/>now with us
        </p>
      </div>

      {/* Centered Login Box */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-md px-4 lg:px-0">
        <div className="w-full bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center tracking-tight">Login to your account</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                placeholder="balamia@gmail.com"
              />
            </div>
            
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Password</label>
                <a href="#" className="text-xs font-semibold text-[#007BFF] hover:text-blue-600 transition-colors">Forgot ?</a>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-300"
                  placeholder="Enter your password"
                />
                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm dark:shadow-slate-900/50 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/chief" element={<ChiefDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
