import { useState, useEffect } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { PublicSite } from './components/public/PublicSite';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { LogIn, Eye } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'login' | 'public'>('public');

  useEffect(() => {
    // Check if user is already authenticated
    const user = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');
    if (user && token) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setViewMode('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setViewMode('public');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated ? (
        viewMode === 'login' ? (
          <div className="relative">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                onClick={() => setViewMode('public')}
                className="bg-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver como Visitante
              </Button>
            </div>
            <LoginForm onLogin={handleLogin} />
          </div>
        ) : (
          <div className="relative">
            <div className="fixed top-4 right-4 z-50">
              <Button
                onClick={() => setViewMode('login')}
                className="bg-indigo-600 hover:bg-indigo-700 shadow-lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Área Administrativa
              </Button>
            </div>
            <PublicSite />
          </div>
        )
      ) : (
        <Dashboard currentUser={currentUser} onLogout={handleLogout} />
      )}
      <Toaster />
    </div>
  );
}
