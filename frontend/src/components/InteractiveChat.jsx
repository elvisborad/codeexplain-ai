import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Terminal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const InteractiveChat = ({ messages, onSendFollowUp, isSending }) => {
  const { isDark } = useTheme();
  
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSendFollowUp(input);
    setInput('');
  };

  return (
    <div className={`flex flex-col h-[480px] rounded-2xl border transition-all duration-300 ${
      isDark 
        ? 'border-slate-800/80 bg-slate-950/20' 
        : 'border-slate-200 bg-slate-50/50'
    }`}>
      
      {/* Panel Header */}
      <div className="flex items-center gap-2 p-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <MessageSquare className="w-4 h-4 text-violet-500" />
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Interactive Follow-up Assistant
        </span>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-center space-y-2 p-6">
            <Sparkles className="w-7 h-7 text-violet-500/50 animate-pulse" />
            <p className="font-semibold text-xs">Ask follow-up questions about this code here.</p>
            <p className="text-[10px] opacity-75 max-w-[200px]">For example: "Explain line 5", "Optimize to O(1) space", or "Convert to recursive".</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={index}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-xs uppercase shadow-sm flex-shrink-0 ${
                    isUser 
                      ? 'bg-gradient-to-tr from-violet-600 to-indigo-500' 
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-500'
                  }`}>
                    {isUser ? 'U' : 'AI'}
                  </div>

                  {/* Bubble */}
                  <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs font-semibold leading-relaxed border ${
                    isUser 
                      ? 'bg-violet-600 text-white border-violet-500' 
                      : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {/* Render simple newlines and bold indicators */}
                    <div className="whitespace-pre-line font-medium">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Typing indicator */}
        {isSending && (
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-sm">
              AI
            </div>
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box Footer */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-2 bg-slate-100/30 dark:bg-slate-950/20 rounded-b-2xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask follow-up query..."
          disabled={isSending}
          className={`flex-1 px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all ${
            isDark 
              ? 'bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-violet-500' 
              : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-violet-500'
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="p-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};

export default InteractiveChat;
