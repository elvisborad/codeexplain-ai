import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import MainArea from '../components/MainArea';
import CodeOutputSection from '../components/CodeOutputSection';
import InteractiveChat from '../components/InteractiveChat';
import SettingsModal from '../components/SettingsModal';
import SavedCodesModal from '../components/SavedCodesModal';
import { apiFetch } from '../utils/api';
import { Menu, Sun, Moon, Terminal, ShieldAlert } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Core navigation & data states
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  
  // Loading status indicator states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Responsive sidebar toggle for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal toggles
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavedCodesOpen, setIsSavedCodesOpen] = useState(false);
  
  const [error, setError] = useState('');

  // Fetch chats on mount
  const fetchChats = async () => {
    try {
      const data = await apiFetch('/chats');
      setChats(data);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Fetch individual chat details when active ID changes
  useEffect(() => {
    const fetchChatDetail = async () => {
      if (!activeChatId) {
        setActiveChat(null);
        return;
      }
      
      setLoadingDetail(true);
      setError('');
      try {
        const detail = await apiFetch(`/chats/${activeChatId}`);
        setActiveChat(detail);
      } catch (err) {
        console.error('Failed to load chat detail:', err);
        setError('Error loading chat session detail.');
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchChatDetail();
  }, [activeChatId]);

  const handleGenerateCode = async (prompt, language, difficulty) => {
    setIsGenerating(true);
    setError('');
    setActiveChat(null);
    
    // Retrieve custom user Gemini Key if saved in Settings
    const userApiKey = localStorage.getItem('gemini_api_key');
    const headers = {};
    if (userApiKey) {
      headers['x-gemini-key'] = userApiKey;
    }

    try {
      const data = await apiFetch('/ai/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, language, difficulty })
      });
      
      // Update sidebar chats list
      await fetchChats();
      // Set active
      setActiveChatId(data.chatId);
      setActiveChat(data);
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err.message || 'Generation failed. Make sure your network or API keys are correct.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendFollowUp = async (message) => {
    if (!activeChatId || isSendingFollowUp) return;
    setIsSendingFollowUp(true);
    setError('');

    const userApiKey = localStorage.getItem('gemini_api_key');
    const headers = {};
    if (userApiKey) {
      headers['x-gemini-key'] = userApiKey;
    }

    try {
      const data = await apiFetch('/ai/followup', {
        method: 'POST',
        headers,
        body: JSON.stringify({ chatId: activeChatId, message })
      });

      // Update active chat locally
      setActiveChat(prev => ({
        ...prev,
        response: data.updatedResponse,
        messages: data.messages
      }));
    } catch (err) {
      console.error('Follow up failed:', err);
      setError('Failed to get response. Please check connection or key settings.');
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      await apiFetch(`/chats/${id}`, { method: 'DELETE' });
      if (activeChatId === id) {
        setActiveChatId(null);
        setActiveChat(null);
      }
      fetchChats();
    } catch (err) {
      console.error('Delete chat failed:', err);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setActiveChat(null);
    setError('');
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Background glow effects */}
      <div className="absolute top-[15%] left-[20%] w-[350px] h-[350px] bg-violet-600/10 dark:bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[20%] w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar Component */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        onNewChat={handleNewChat}
        onOpenSavedCodes={() => setIsSavedCodesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 z-10">
        
        {/* Navigation bar Header */}
        <header className={`p-4 border-b flex items-center justify-between sticky top-0 backdrop-blur-md z-30 transition-all ${
          isDark ? 'bg-slate-950/70 border-slate-900' : 'bg-white/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-900"
              title="Open Menu"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold text-xs uppercase shadow-sm">
                C
              </div>
              <span className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                CodeExplain
              </span>
            </div>
            {activeChat && (
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-450">
                <Terminal className="w-4 h-4 text-violet-500" />
                <span className="truncate max-w-sm">Prompt: "{activeChat.prompt}"</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-transparent dark:border-transparent hover:border-slate-200 dark:hover:border-slate-800"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </header>

        {/* Inner Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto">
          {error && (
            <div className="max-w-4xl mx-auto mt-6 px-4">
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-650 dark:text-red-400 text-xs font-bold flex items-center gap-2.5 animate-pulse-slow">
                <ShieldAlert className="w-4.5 h-4.5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {activeChat ? (
            /* Solution Output Panel Layout */
            <div className="space-y-6 pb-20">
              
              {/* Output block (Code, flowcharts, explanation) */}
              <CodeOutputSection
                chatResponse={activeChat.response}
                language={activeChat.language}
                prompt={activeChat.prompt}
                chatId={activeChatId}
              />

              {/* Follow-up Interactive Panel */}
              <div className="w-full max-w-4xl mx-auto px-4">
                <InteractiveChat
                  messages={activeChat.messages || []}
                  onSendFollowUp={handleSendFollowUp}
                  isSending={isSendingFollowUp}
                />
              </div>

            </div>
          ) : (
            /* Input Panel screen */
            <div className="py-12">
              <MainArea
                onGenerateCode={handleGenerateCode}
                isGenerating={isGenerating}
              />
            </div>
          )}
        </main>

      </div>

      {/* Settings Modal popups */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Bookmarks Modal popups */}
      <SavedCodesModal
        isOpen={isSavedCodesOpen}
        onClose={() => setIsSavedCodesOpen(false)}
      />

    </div>
  );
};

export default Dashboard;
