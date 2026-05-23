import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Info, Database, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(savedKey);
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className={`w-full max-w-md p-6 rounded-2xl border transition-all duration-300 ${
        isDark 
          ? 'glassmorphism-card-dark border-slate-800 shadow-glass-dark text-slate-200' 
          : 'glassmorphism-card-light border-slate-200 shadow-glass-light text-slate-800'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-violet-500" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              Developer Settings
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Google Gemini API Key
              </label>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-violet-500 hover:underline font-bold"
              >
                Get Free Key
              </a>
            </div>

            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all ${
                  isDark 
                    ? 'bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-700 focus:border-violet-500' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-violet-500'
                }`}
              />
            </div>
            
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
              If provided, this key runs the AI generations client-side. If left empty, the application uses the server's configured key or the local compiler mockup simulations.
            </p>
          </div>

          {/* Connection status info */}
          <div className={`p-3 rounded-xl border flex gap-3 text-xs ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <Info className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">System Status</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                <Database className="w-3 h-3 text-emerald-500" />
                <span>Backend API: Connected (http://localhost:5000)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                <Shield className="w-3 h-3 text-violet-500" />
                <span>Auth: JWT Session Active (7 Days)</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default SettingsModal;
