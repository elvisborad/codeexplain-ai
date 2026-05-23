import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Cpu } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <Cpu className="w-10 h-10 text-violet-500 animate-spin" />
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-450 tracking-wider">
            Initializing CodeExplain...
          </h2>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
