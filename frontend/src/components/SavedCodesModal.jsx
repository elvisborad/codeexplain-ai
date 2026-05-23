import React, { useState, useEffect } from 'react';
import { X, Bookmark, Trash2, Copy, Check, Code, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../utils/api';

const SavedCodesModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  
  const [savedCodes, setSavedCodes] = useState([]);
  const [activeCode, setActiveCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fetchSavedCodes = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/chats/saved/all');
      setSavedCodes(data);
      if (data.length > 0) {
        setActiveCode(data[0]);
      } else {
        setActiveCode(null);
      }
    } catch (err) {
      console.error('Fetch saved codes failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSavedCodes();
    }
  }, [isOpen]);

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await apiFetch(`/chats/saved/${id}`, { method: 'DELETE' });
      // Update local state
      const updated = savedCodes.filter(c => c._id !== id);
      setSavedCodes(updated);
      
      if (activeCode?._id === id) {
        setActiveCode(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error('Delete saved code failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className={`w-full max-w-5xl h-[85vh] flex flex-col rounded-3xl border transition-all duration-300 ${
        isDark 
          ? 'glassmorphism-card-dark border-slate-800 shadow-glass-dark text-slate-200' 
          : 'glassmorphism-card-light border-slate-200 shadow-glass-light text-slate-800'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-violet-500 fill-current" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              Saved Code Bookmarks
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Workspace body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left panel: Bookmarks List */}
          <div className="w-full md:w-80 border-r border-slate-200/50 dark:border-slate-800/50 overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="flex justify-center items-center h-40 text-xs text-slate-450 font-bold">
                Loading bookmarks...
              </div>
            ) : savedCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400">
                <Bookmark className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs font-bold">No saved snippets</p>
                <p className="text-[10px] opacity-75">Click "Save" on generated code outputs to bookmark them.</p>
              </div>
            ) : (
              savedCodes.map((codeItem) => {
                const isActive = activeCode?._id === codeItem._id;
                return (
                  <div
                    key={codeItem._id}
                    onClick={() => {
                      setActiveCode(codeItem);
                      setIsCopied(false);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between group ${
                      isActive
                        ? 'bg-violet-600/10 border-violet-500 text-violet-600 dark:text-violet-400 shadow-sm'
                        : isDark
                          ? 'bg-slate-900/40 border-slate-850 hover:bg-slate-900 text-slate-450 hover:text-slate-200'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-950'
                    }`}
                  >
                    <div className="overflow-hidden pr-4">
                      <div className="text-xs font-bold truncate mb-1">{codeItem.title}</div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold">
                        <Code className="w-3 h-3 text-violet-500" />
                        <span className="uppercase">{codeItem.language}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(codeItem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleDelete(codeItem._id, e)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex-shrink-0"
                      title="Delete bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Right panel: Active Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30 dark:bg-slate-950/20">
            {activeCode ? (
              <div className="flex-1 flex flex-col p-6 overflow-hidden">
                {/* Meta details header */}
                <div className="flex justify-between items-start gap-4 mb-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-4 flex-shrink-0">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{activeCode.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-violet-600/10 text-violet-600 dark:text-violet-400 uppercase tracking-widest text-[10px]">
                        {activeCode.language}
                      </span>
                      <span>Time: {activeCode.complexity?.time || 'O(N)'}</span>
                      <span>Space: {activeCode.complexity?.space || 'O(1)'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(activeCode.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      isCopied 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                        : isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Scrolled Code box */}
                <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-950 p-4 border border-slate-900 font-mono text-xs leading-relaxed text-slate-350 select-text shadow-inner">
                  <pre><code className="block whitespace-pre-wrap">{activeCode.code}</code></pre>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center text-slate-400">
                <p className="text-xs font-bold">Select a code snippet from the left to view details</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default SavedCodesModal;
