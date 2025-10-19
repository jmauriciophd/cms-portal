import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { DndWrapper } from './components/common/DndWrapper';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { PublicSite } from './components/public/PublicSite';
import { PermissionsProvider } from './components/auth/PermissionsContext';
import { Toaster } from './components/ui/sonner';
import { useStorageMaintenance } from './components/hooks/useStorageMaintenance';
import { AdvancedSchemaDemo } from './components/demo/AdvancedSchemaDemo';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('currentUser');
  const token = localStorage.getItem('authToken');
  
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function LoginPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Se já está autenticado, redireciona para o dashboard
    const user = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');
    if (user && token) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    navigate('/admin');
  };

  return <LoginForm onLogin={handleLogin} />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      
      // ✅ VERIFICAR STATUS DA CONTA
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const activeUser = storedUsers.find((u: any) => u.id === userData.id || u.email === userData.email);
      
      if (activeUser && (activeUser.status === 'inactive' || activeUser.status === 'suspended' || activeUser.status === 'blocked')) {
        // Conta foi desativada - fazer logout forçado
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        navigate('/login', { replace: true });
        // Mostrar mensagem seria ideal, mas toast não está disponível aqui
        alert('Sua conta foi desativada. Entre em contato com o administrador.');
        return;
      }
      
      setCurrentUser(userData);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    navigate('/login');
  };

  if (!currentUser) {
    return null;
  }

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
}

export default function App() {
  // Inicializar manutenção automática de armazenamento
  useStorageMaintenance();
  
  return (
    <DndWrapper>
      <PermissionsProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Routes>
            {/* Rota pública - Site público sem botão de login */}
            <Route path="/" element={<PublicSite />} />
            
            {/* Rota de login - Acesso direto */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rota do dashboard - Protegida */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Rota do dashboard alternativa */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Rota de demonstração do sistema de schemas */}
            <Route 
              path="/admin/schemas-demo" 
              element={
                <ProtectedRoute>
                  <AdvancedSchemaDemo />
                </ProtectedRoute>
              } 
            />
            
            {/* Redireciona rotas desconhecidas para home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
      </PermissionsProvider>
    </DndWrapper>
  );
}
