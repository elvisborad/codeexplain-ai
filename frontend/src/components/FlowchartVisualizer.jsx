import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid configurations
try {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'dark',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis'
    }
  });
} catch (e) {
  console.error('Mermaid initialization failed:', e);
}

const FlowchartVisualizer = ({ chartCode, isDark }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!chartCode || !containerRef.current) return;

    const renderChart = async () => {
      try {
        containerRef.current.innerHTML = `
          <div class="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <svg class="animate-spin w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating flowchart diagram...
          </div>
        `;

        // Normalize graph syntax
        let formattedCode = chartCode.trim();
        if (!formattedCode.startsWith('graph') && !formattedCode.startsWith('flowchart')) {
          formattedCode = 'graph TD\n' + formattedCode;
        }

        // Clean double escape quotes if Gemini generated them
        formattedCode = formattedCode.replace(/\\"/g, '"');

        const uniqueId = `mermaid-chart-${Math.floor(Math.random() * 100000)}`;
        
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: isDark ? 'dark' : 'default',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true
          }
        });

        const { svg } = await mermaid.render(uniqueId, formattedCode);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.warn('Flowchart visualizer failed to render SVG:', err);
        // Clean error elements potentially left by Mermaid in document body
        const badElements = document.querySelectorAll('[id^="dmermaid-chart-"]');
        badElements.forEach(el => el.remove());
        
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="w-full text-left p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs">
              <p class="font-bold mb-1">Flowchart Render Warning</p>
              <p class="mb-3 text-[11px] opacity-80">The AI generated a flowchart using special characters that couldn't be parsed. Below is the logical step structure:</p>
              <pre class="bg-slate-950 dark:bg-slate-900/80 p-3 rounded-lg text-[10px] text-slate-300 font-mono overflow-x-auto border border-slate-800">${chartCode}</pre>
            </div>
          `;
        }
      }
    };

    renderChart();
  }, [chartCode, isDark]);

  return (
    <div className="w-full flex justify-center p-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 overflow-x-auto min-h-[100px] items-center">
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
};

export default FlowchartVisualizer;
