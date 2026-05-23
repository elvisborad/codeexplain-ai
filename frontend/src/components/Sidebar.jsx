import React from 'react';
import { MessageSquare, Plus, Bookmark, Settings, LogOut, Code, Menu, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({
  chats,
  activeChatId,
  setActiveChatId,
  onNewChat,
  onOpenSavedCodes,
  onOpenSettings,
  onDeleteChat,
  isOpen,
  setIsOpen
}) => {
  const { user, logoutUser } = useAuth();
  const { isDark } = useTheme();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 border-r transition-all duration-300 transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isDark 
          ? 'glassmorphism-card-dark border-slate-900 shadow-glass-dark text-slate-200' 
          : 'glassmorphism-card-light border-slate-200 shadow-glass-light text-slate-800'
      }`}>
        
        {/* Header / Brand */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-md">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                CodeExplain AI
              </h2>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Developer Suite
              </span>
            </div>
          </div>
          
          {/* Close button (Mobile only) */}
          <button 
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              setIsOpen(false);
            }}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white text-sm font-bold tracking-wide shadow-md shadow-violet-500/10 transition-all duration-200 hover:shadow-violet-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Explanation
          </button>
        </div>

        {/* Chat Sessions History List */}
        <div className="flex-1 px-3 overflow-y-auto space-y-1 select-none">
          <span className="px-3 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            Chat History
          </span>
          
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs text-slate-400 dark:text-slate-500">No previous sessions found</p>
            </div>
          ) : (
            <div className="mt-2 space-y-1">
              {chats.map((chat) => {
                const isActive = chat._id === activeChatId;
                return (
                  <div
                    key={chat._id}
                    className={`group relative flex items-center justify-between rounded-xl p-3 text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400 border-l-4 border-violet-500 pl-2'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                    }`}
                    onClick={() => {
                      setActiveChatId(chat._id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3 w-full pr-8 overflow-hidden">
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-violet-500' : 'text-slate-400'}`} />
                      <span className="truncate text-xs font-semibold">{chat.prompt}</span>
                    </div>

                    {/* Trash Delete button */}
                    <button
                      className="absolute right-3 opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat._id);
                      }}
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2 bg-slate-50/50 dark:bg-slate-950/20">
          
          <button
            onClick={() => {
              onOpenSavedCodes();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/60 text-sm font-semibold transition-colors"
          >
            <Bookmark className="w-4 h-4 text-slate-400" />
            Saved Codes
          </button>
          
          <button
            onClick={() => {
              onOpenSettings();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/60 text-sm font-semibold transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            Settings
          </button>

          <div className="border-t border-slate-200/40 dark:border-slate-800/40 my-2 pt-2">
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs uppercase shadow-sm">
                  {user?.username ? user.username[0] : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{user?.username}</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate font-semibold">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={logoutUser}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
