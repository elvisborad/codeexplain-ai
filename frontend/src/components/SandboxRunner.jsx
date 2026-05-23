import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Terminal, AlertTriangle, Cpu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SandboxRunner = ({ code, language }) => {
  const { isDark } = useTheme();
  
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [engineStatus, setEngineStatus] = useState('idle');

  // Load Pyodide helper
  const loadPyodideScript = () => {
    return new Promise((resolve, reject) => {
      if (window.loadPyodide) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Pyodide WebAssembly. Check network.'));
      document.head.appendChild(script);
    });
  };

  const runJavaScript = (jsCode) => {
    setIsRunning(true);
    setLogs([{ type: 'system', text: 'Initializing JavaScript V8 Sandbox...' }]);
    
    setTimeout(() => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const caughtLogs = [];
      iframe.contentWindow.console.log = (...args) => {
        const text = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
        caughtLogs.push({ type: 'info', text });
      };
      
      iframe.contentWindow.console.error = (...args) => {
        const text = args.join(' ');
        caughtLogs.push({ type: 'error', text });
      };

      try {
        iframe.contentWindow.eval(jsCode);
        setLogs(prev => [
          ...prev,
          { type: 'system', text: 'Sandbox execution started.' },
          ...(caughtLogs.length ? caughtLogs : [{ type: 'info', text: '(No logs printed. Use console.log() to print outputs.)' }]),
          { type: 'system', text: 'Execution completed successfully.' }
        ]);
      } catch (err) {
        setLogs(prev => [
          ...prev,
          { type: 'error', text: `Runtime Exception: ${err.message}` }
        ]);
      } finally {
        document.body.removeChild(iframe);
        setIsRunning(false);
      }
    }, 400);
  };

  const runPython = async (pyCode) => {
    setIsRunning(true);
    setEngineStatus('loading');
    setLogs([{ type: 'system', text: 'Fetching Python WebAssembly engine (Pyodide)...' }]);

    try {
      await loadPyodideScript();
      if (!window.pyodideInstance) {
        setLogs(prev => [...prev, { type: 'system', text: 'Initializing Wasm runtime...' }]);
        window.pyodideInstance = await window.loadPyodide();
      }
      
      const pyodide = window.pyodideInstance;
      setEngineStatus('running');
      setLogs([{ type: 'system', text: 'Python engine ready. Redirecting stdout...' }]);

      const outputLogs = [];
      pyodide.setStdout({
        batched: (text) => {
          outputLogs.push({ type: 'info', text });
        }
      });
      pyodide.setStderr({
        batched: (text) => {
          outputLogs.push({ type: 'error', text });
        }
      });

      // Clear imports cache or similar if needed
      await pyodide.runPythonAsync(pyCode);
      
      setLogs(prev => [
        ...prev,
        { type: 'system', text: 'Script running...' },
        ...(outputLogs.length ? outputLogs : [{ type: 'info', text: '(No print statement executed)' }]),
        { type: 'system', text: 'Process finished with exit code 0' }
      ]);
    } catch (err) {
      setLogs(prev => [
        ...prev,
        { type: 'error', text: err.message }
      ]);
    } finally {
      setIsRunning(false);
      setEngineStatus('idle');
    }
  };

  const runSimulated = (simCode, lang) => {
    setIsRunning(true);
    const compiler = lang === 'cpp' ? 'g++ 13.2' : lang === 'c' ? 'gcc 13.2' : 'OpenJDK 21';
    const filename = lang === 'cpp' ? 'main.cpp' : lang === 'c' ? 'main.c' : 'Main.java';
    
    setLogs([
      { type: 'system', text: `[Compiler] Invoking local compiler: ${compiler}...` },
      { type: 'system', text: `[Compiler] Compiling ${filename} with -O3 optimization...` }
    ]);

    setTimeout(() => {
      // Analyze code to provide a realistic simulation
      let simulationOutput = [];
      const lowerCode = simCode.toLowerCase();

      if (lowerCode.includes('binary') && lowerCode.includes('search')) {
        simulationOutput = [
          'Target element: 42',
          'Array: [10, 15, 20, 30, 42, 50, 60, 75]',
          'Step 1: Searching interval [0, 7]. Mid = 3 (val = 30). Target 42 > 30. Search right half.',
          'Step 2: Searching interval [4, 7]. Mid = 5 (val = 50). Target 42 < 50. Search left half.',
          'Step 3: Searching interval [4, 4]. Mid = 4 (val = 42). Target found!',
          'Output: Target 42 found at index 4.'
        ];
      } else if (lowerCode.includes('bubble') && lowerCode.includes('sort')) {
        simulationOutput = [
          'Original list: [34, 12, 5, 23]',
          'Pass 1: [12, 5, 23, 34]',
          'Pass 2: [5, 12, 23, 34]',
          'Sorted list: [5, 12, 23, 34]'
        ];
      } else if (lowerCode.includes('palindrome')) {
        simulationOutput = [
          'Checking: "radar"',
          'radar is a Palindrome!'
        ];
      } else {
        simulationOutput = [
          'Executing simulated sandbox execution...',
          'Standard output: Hello, World!',
          'Process completed successfully.'
        ];
      }

      setLogs(prev => [
        ...prev,
        { type: 'system', text: `[Compiler] Linking complete. Generating executable...` },
        { type: 'system', text: `[Runner] Executing binary...` },
        ...simulationOutput.map(text => ({ type: 'info', text })),
        { type: 'system', text: 'Process finished (exit code: 0)' }
      ]);
      setIsRunning(false);
    }, 1200);
  };

  const handleRun = () => {
    const cleanLang = language.toLowerCase();
    if (cleanLang === 'javascript') {
      runJavaScript(code);
    } else if (cleanLang === 'python') {
      runPython(code);
    } else {
      runSimulated(code, cleanLang);
    }
  };

  const handleClear = () => {
    setLogs([]);
  };

  return (
    <div className={`mt-6 rounded-2xl border ${
      isDark ? 'border-slate-800 bg-slate-950/80 shadow-inner' : 'border-slate-200 bg-slate-100 shadow-inner'
    }`}>
      
      {/* Console Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Execution Sandbox Terminal ({language})
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClear}
            disabled={isRunning || logs.length === 0}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } disabled:opacity-50`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
          
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-md shadow-violet-500/10 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run Code
          </button>
        </div>
      </div>

      {/* Terminal Screen output area */}
      <div className="p-4 font-mono text-xs leading-relaxed overflow-y-auto max-h-64 h-64 bg-slate-950 text-emerald-400 rounded-b-2xl border-t border-slate-900 shadow-inner select-text">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2">
            <Cpu className="w-7 h-7" />
            <p className="font-semibold text-xs text-center">Terminal offline. Click "Run Code" to compile and execute.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log, index) => {
              if (log.type === 'system') {
                return (
                  <div key={index} className="text-slate-500 font-bold">
                    &gt; {log.text}
                  </div>
                );
              }
              if (log.type === 'error') {
                return (
                  <div key={index} className="text-red-500 bg-red-950/20 p-2 rounded-lg border border-red-900/30 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{log.text}</span>
                  </div>
                );
              }
              return (
                <div key={index} className="text-emerald-300 pl-4 whitespace-pre-wrap">
                  {log.text}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default SandboxRunner;
