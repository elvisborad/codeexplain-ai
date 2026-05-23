import React, { useState, useEffect } from 'react';
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

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setLocalError('');
    try {
      const decoded = decodeJwt(response.credential);
      if (!decoded) {
        throw new Error('Failed to parse Google login token.');
      }
      const { email, name, sub } = decoded;
      await loginWithGoogle(email, name, sub);
    } catch (err) {
      setLocalError(err.message || 'Google Single Sign-On failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /* global google */
    const initGoogleSignIn = () => {
      if (window.google) {
        try {
          google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "593340769447-b8626fg6fce6lgeeo0sf3k4sbq2ujoio.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse
          });
          google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { 
              theme: isDark ? "dark" : "outline", 
              size: "large", 
              width: "382",
              text: "signin_with",
              shape: "pill"
            }
          );
        } catch (e) {
          console.error("Google Sign-In initialization failed:", e);
        }
      } else {
        setTimeout(initGoogleSignIn, 300);
      }
    };
    initGoogleSignIn();
  }, [isDark]);

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

        {/* Google Login container */}
        <div className="flex justify-center mt-2 min-h-[44px]">
          <div id="google-signin-button" className="w-full flex justify-center"></div>
        </div>

      </div>
    </div>
  );
};

export default Login;
