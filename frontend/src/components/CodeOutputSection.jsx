import React, { useState, useEffect } from 'react';
import { Copy, Download, Play, ChevronDown, ChevronUp, Bookmark, Sparkles, Zap, Timer, HardDrive, FileText, Check } from 'lucide-react';
import FlowchartVisualizer from './FlowchartVisualizer';
import SandboxRunner from './SandboxRunner';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../utils/api';
import confetti from 'canvas-confetti';

const CodeOutputSection = ({ chatResponse, language, prompt, chatId, onSaveCodeStatus }) => {
  const { isDark } = useTheme();
  
  const [showSandbox, setShowSandbox] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [showAlternative, setShowAlternative] = useState(false);

  const { code, comments, explanation, algorithm, complexity, flowchart, alternative } = chatResponse;

  useEffect(() => {
    // Reset states on new code load
    setIsCopied(false);
    setIsSaved(false);
    setShowSandbox(false);
    
    // Play confetti when code output loads to wow the user!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const fileContent = `/*
  CodeExplain AI: Generated Explanation
  Prompt: ${prompt}
  Language: ${language}
  Time Complexity: ${complexity?.time || 'N/A'}
  Space Complexity: ${complexity?.space || 'N/A'}
*/\n\n${code}\n\n/*\n=== EXPLANATION ===\n${explanation}\n\n=== ALGORITHM ===\n${algorithm}\n*/`;
    
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${prompt.toLowerCase().replace(/[^a-z0-9]/g, '_')}_solution.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    // Generate clean printable window for PDF creation
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>CodeExplain AI - ${prompt}</title>
          <style>
            body { font-family: system-ui, sans-serif; color: #1e293b; padding: 40px; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            pre { background: #0f172a; color: #f8fafc; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: monospace; }
            .complexity { display: flex; gap: 20px; margin-bottom: 20px; }
            .complexity-card { border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; flex: 1; }
            .section { margin-top: 30px; }
            .title { font-weight: bold; font-size: 1.1em; color: #334155; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>CodeExplain AI - Solution</h1>
          <p><strong>Query:</strong> ${prompt}</p>
          <p><strong>Language:</strong> ${language}</p>
          
          <div class="complexity">
            <div class="complexity-card">
              <strong>Time Complexity:</strong> ${complexity?.time || 'N/A'}
            </div>
            <div class="complexity-card">
              <strong>Space Complexity:</strong> ${complexity?.space || 'N/A'}
            </div>
          </div>

          <div class="section">
            <div class="title">Generated Code:</div>
            <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          </div>

          <div class="section">
            <div class="title">Explanation:</div>
            <p style="white-space: pre-wrap;">${explanation}</p>
          </div>

          <div class="section">
            <div class="title">Algorithm:</div>
            <p style="white-space: pre-wrap;">${algorithm}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleBookmark = async () => {
    try {
      await apiFetch('/chats/save', {
        method: 'POST',
        body: JSON.stringify({
          title: prompt,
          language,
          code,
          explanation,
          complexity
        })
      });
      setIsSaved(true);
      if (onSaveCodeStatus) onSaveCodeStatus();
    } catch (err) {
      console.error('Bookmark code failed:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Code Header Glass Card */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 ${
        isDark 
          ? 'glassmorphism-card-dark border-slate-800 shadow-glass-dark' 
          : 'glassmorphism-card-light border-slate-200 shadow-glass-light'
      }`}>
        
        {/* Title/Actions Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Generated Code Output
            </h3>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleBookmark}
              disabled={isSaved}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isSaved 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                  : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Save to bookmarks"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={handleCopy}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isCopied 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                  : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {isCopied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handleDownloadTxt}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Download text file"
            >
              <Download className="w-4 h-4" />
              Source
            </button>

            <button
              onClick={handlePrintPDF}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Print to PDF"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>

            <button
              onClick={() => setShowSandbox(prev => !prev)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                showSandbox
                  ? 'bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-500/10'
                  : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-850'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Compile & Run
            </button>
          </div>
        </div>

        {/* Code Block display */}
        <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-900 font-mono text-[13px] leading-relaxed text-slate-300 overflow-x-auto select-text shadow-inner">
          <span className="absolute top-3 right-4 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">
            {language}
          </span>
          <pre className="pr-12 text-slate-300"><code className="block whitespace-pre">{code}</code></pre>
        </div>

        {/* Sandbox Console Panel injection */}
        {showSandbox && <SandboxRunner code={code} language={language} />}
      </div>

      {/* Grid: Complexity Cards & Line comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Time Complexity */}
        <div className={`p-5 rounded-2xl border flex gap-4 transition-all duration-300 ${
          isDark ? 'glassmorphism-card-dark border-slate-800/80 shadow-md' : 'glassmorphism-card-light border-slate-200 shadow-sm'
        }`}>
          <div className="p-3 h-11 w-11 flex items-center justify-center rounded-xl bg-violet-600/10 text-violet-500 flex-shrink-0 shadow-inner">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Time Complexity</h4>
            <div className="text-lg font-black text-violet-600 dark:text-violet-400 mt-1">{complexity?.time || 'O(N)'}</div>
          </div>
        </div>

        {/* Space Complexity */}
        <div className={`p-5 rounded-2xl border flex gap-4 transition-all duration-300 ${
          isDark ? 'glassmorphism-card-dark border-slate-800/80 shadow-md' : 'glassmorphism-card-light border-slate-200 shadow-sm'
        }`}>
          <div className="p-3 h-11 w-11 flex items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-500 flex-shrink-0 shadow-inner">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Space Complexity</h4>
            <div className="text-lg font-black text-emerald-500 mt-1">{complexity?.space || 'O(1)'}</div>
          </div>
        </div>

      </div>

      {/* Code flow analysis (Mermaid Chart) */}
      {flowchart && (
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${
          isDark 
            ? 'glassmorphism-card-dark border-slate-800 shadow-glass-dark' 
            : 'glassmorphism-card-light border-slate-200 shadow-glass-light'
        }`}>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-500" />
            Execution Flowchart Visualization
          </h4>
          <FlowchartVisualizer chartCode={flowchart} isDark={isDark} />
        </div>
      )}

      {/* Block/Line Breakdown panel */}
      {comments && (
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${
          isDark 
            ? 'glassmorphism-card-dark border-slate-800 shadow-glass-dark' 
            : 'glassmorphism-card-light border-slate-200 shadow-glass-light'
        }`}>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Block-by-Block Analysis
          </h4>
          <div className="text-xs font-semibold leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-350">
            {comments}
          </div>
        </div>
      )}

      {/* Step-by-step logic and dry run */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 ${
        isDark 
          ? 'glassmorphism-card-dark border-slate-800 shadow-glass-dark' 
          : 'glassmorphism-card-light border-slate-200 shadow-glass-light'
      }`}>
        <button
          onClick={() => setShowExplanation(prev => !prev)}
          className="w-full flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          <span>Line-by-Line & Educational Explanation</span>
          {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showExplanation && (
          <div className="mt-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-350 whitespace-pre-wrap">
            {explanation}
          </div>
        )}
      </div>

      {/* Algorithm details */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 ${
        isDark 
          ? 'glassmorphism-card-dark border-slate-800 shadow-glass-dark' 
          : 'glassmorphism-card-light border-slate-200 shadow-glass-light'
      }`}>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Logical Algorithm Steps
        </h4>
        <div className="text-xs font-semibold leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-350">
          {algorithm}
        </div>
      </div>

      {/* Collapsible Alternative Solutions */}
      {alternative && (
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${
          isDark 
            ? 'glassmorphism-card-dark border-slate-800 shadow-glass-dark' 
            : 'glassmorphism-card-light border-slate-200 shadow-glass-light'
        }`}>
          <button
            onClick={() => setShowAlternative(prev => !prev)}
            className="w-full flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            <span>Alternative Approach / Optimization</span>
            {showAlternative ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showAlternative && (
            <div className="mt-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-350 whitespace-pre-wrap">
              {alternative}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CodeOutputSection;
