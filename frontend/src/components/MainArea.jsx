import React, { useState } from 'react';
import { Send, Sparkles, Terminal, Code, Cpu, ShieldAlert } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const MainArea = ({ onGenerateCode, isGenerating }) => {
  const { isDark } = useTheme();
  
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [difficulty, setDifficulty] = useState('Intermediate');

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const suggestionChips = [
    { text: 'Write binary search', tag: 'Algorithms' },
    { text: 'Implement bubble sort', tag: 'Sorting' },
    { text: 'Check if string is palindrome', tag: 'Strings' },
    { text: 'Implement a basic stack structure', tag: 'Data Structures' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerateCode(prompt, language, difficulty);
  };

  const handleChipClick = (chipText) => {
    setPrompt(chipText + ` in ${language} and explain.`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      {/* Welcome Hero Panel */}
      <div className="text-center mb-10 mt-4 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
          Write & Understand Code Faster
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 font-semibold max-w-xl mx-auto">
          Input any coding assignment or topic. Our Gemini AI engine will write executable code, visualize flowcharts, and explain it line-by-line.
        </p>
      </div>

      {/* Main Form Glass Card */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 ${
        isDark 
          ? 'glassmorphism-card-dark border-slate-800/80 shadow-glass-dark' 
          : 'glassmorphism-card-light border-slate-200/80 shadow-glass-light'
      }`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Text Area Prompt Input */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Programming Problem or Question
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Write a program to reverse a linked list and output the time complexity."
              rows={4}
              required
              disabled={isGenerating}
              className={`w-full p-4 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-4 transition-all duration-200 resize-none ${
                isDark 
                  ? 'bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-600 focus:ring-violet-500/10 focus:border-violet-500' 
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-violet-500/5 focus:border-violet-500'
              }`}
            />
          </div>

          {/* Selectors grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Language Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Programming Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isGenerating}
                  className={`w-full p-3.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-violet-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-violet-500'
                  }`}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <Code className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Explanation Difficulty
              </label>
              <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      difficulty === diff
                        ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm border border-slate-200/40 dark:border-slate-700/40'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action trigger button */}
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-3 py-4 mt-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 text-white font-extrabold tracking-wider shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer ai-pulse-glow"
          >
            {isGenerating ? (
              <>
                <Cpu className="w-5 h-5 animate-spin" />
                Analyzing & Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                Generate Code & Explanation
              </>
            )}
          </button>

        </form>

        {/* Suggestion Chips */}
        <div className="mt-8 border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
          <span className="block text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-3">
            Quick Templates
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isGenerating}
                onClick={() => handleChipClick(chip.text)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 hover:scale-[1.02] flex items-center gap-2 ${
                  isDark
                    ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:text-slate-100 hover:border-violet-500/50'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950 hover:border-violet-500/50'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-violet-500" />
                <span>{chip.text}</span>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-slate-200/50 dark:bg-slate-800 text-slate-400 font-bold">
                  {chip.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MainArea;
