import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Mail, Lock, User, Terminal, ToggleLeft, ToggleRight, Sun, Moon } from 'lucide-react';

const Login = () => {
  const { loginUser, registerUser, loginWithGoogle, error: authError } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password || (isRegister && !username)) {
      setLocalError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(username, email, password);
      } else {
        await loginUser(email, password);
      }
    } catch (err) {
      // AuthContext handles setting error, or we catch it
      setLocalError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    setLoading(true);
    setLocalError('');
    try {
      // Simulate OAuth login callback
      const mockEmail = 'coder.gemini@gmail.com';
      const mockName = 'Gemini Coder';
      const mockGoogleId = 'g-1234567890';
      await loginWithGoogle(mockEmail, mockName, mockGoogleId);
    } catch (err) {
      setLocalError(err.message || 'Google login simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Background glow animations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 dark:bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl glassmorphism-card-light dark:glassmorphism-card-dark border border-slate-200 dark:border-slate-800 transition-transform duration-200 hover:scale-105"
        title="Toggle Theme"
      >
        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
      </button>

      {/* Login Card */}
      <div className={`w-full max-w-md p-8 mx-4 rounded-3xl z-10 border transition-all duration-300 ${
        isDark ? 'glassmorphism-card-dark border-slate-800 shadow-glass-dark' : 'glassmorphism-card-light border-slate-200 shadow-glass-light'
      }`}>
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/20 mb-4 animate-bounce-slow">
            <Terminal className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
            CodeExplain AI
          </h1>
          <p className="text-sm mt-2 text-slate-500 dark:text-slate-400 text-center font-medium">
            Explain, write, run, and understand code instantly
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 mb-6 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
          <button
            onClick={() => { setIsRegister(false); setLocalError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isRegister
                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setLocalError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isRegister
                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Errors */}
        {(localError || authError) && (
          <div className="p-3 mb-4 text-xs font-semibold text-red-600 bg-red-100 dark:bg-red-950/40 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/50 animate-pulse-slow">
            {localError || authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium placeholder-slate-400"
              />
            </div>
          )}

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="w-5 h-5" />
            </span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium placeholder-slate-400"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="w-5 h-5" />
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white font-bold tracking-wide shadow-md transition-all duration-200 hover:shadow-violet-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Or
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Google Login (Mock) */}
        <button
          onClick={handleMockGoogleLogin}
          disabled={loading}
          className="w-full py-3 flex items-center justify-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-sm active:scale-[0.98]"
        >
          {/* Google Color Icon G */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Sign in with Google
          </span>
        </button>

      </div>
    </div>
  );
};

export default Login;
