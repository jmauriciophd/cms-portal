import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definição de papéis e permissões
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'content' | 'files' | 'settings' | 'users';
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[]; // IDs das permissões
  dashboardWidgets: string[]; // Widgets visíveis no dashboard
  canModify: boolean;
}

// Permissões disponíveis no sistema
export const ALL_PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'dashboard.view', name: 'Visualizar Dashboard', description: 'Acesso ao painel principal', category: 'dashboard' },
  { id: 'dashboard.analytics', name: 'Ver Analytics', description: 'Visualizar estatísticas e gráficos', category: 'dashboard' },
  { id: 'dashboard.realtime', name: 'Dados em Tempo Real', description: 'Atualização automática de dados', category: 'dashboard' },
  { id: 'dashboard.quicktips', name: 'Dicas Rápidas', description: 'Visualizar dicas e sugestões', category: 'dashboard' },
  
  // Conteúdo
  { id: 'content.view', name: 'Visualizar Conteúdo', description: 'Ver páginas e artigos', category: 'content' },
  { id: 'content.create', name: 'Criar Conteúdo', description: 'Criar novas páginas e artigos', category: 'content' },
  { id: 'content.edit', name: 'Editar Conteúdo', description: 'Modificar páginas e artigos', category: 'content' },
  { id: 'content.delete', name: 'Excluir Conteúdo', description: 'Remover páginas e artigos', category: 'content' },
  { id: 'content.publish', name: 'Publicar Conteúdo', description: 'Publicar/despublicar conteúdo', category: 'content' },
  
  // Arquivos
  { id: 'files.view', name: 'Visualizar Arquivos', description: 'Acessar gerenciador de arquivos', category: 'files' },
  { id: 'files.upload', name: 'Upload de Arquivos', description: 'Enviar novos arquivos', category: 'files' },
  { id: 'files.edit', name: 'Editar Arquivos', description: 'Modificar arquivos existentes', category: 'files' },
  { id: 'files.delete', name: 'Excluir Arquivos', description: 'Remover arquivos', category: 'files' },
  
  // Configurações
  { id: 'settings.view', name: 'Ver Configurações', description: 'Acessar painel de configurações', category: 'settings' },
  { id: 'settings.general', name: 'Configurações Gerais', description: 'Modificar configurações básicas', category: 'settings' },
  { id: 'settings.advanced', name: 'Configurações Avançadas', description: 'Acesso a configurações avançadas', category: 'settings' },
  { id: 'settings.security', name: 'Segurança', description: 'Configurações de segurança', category: 'settings' },
  { id: 'settings.permissions', name: 'Gerenciar Permissões', description: 'Configurar permissões de papéis', category: 'settings' },
  
  // Usuários
  { id: 'users.view', name: 'Visualizar Usuários', description: 'Ver lista de usuários', category: 'users' },
  { id: 'users.create', name: 'Criar Usuários', description: 'Adicionar novos usuários', category: 'users' },
  { id: 'users.edit', name: 'Editar Usuários', description: 'Modificar usuários existentes', category: 'users' },
  { id: 'users.delete', name: 'Excluir Usuários', description: 'Remover usuários', category: 'users' },
  { id: 'users.roles', name: 'Gerenciar Papéis', description: 'Atribuir papéis a usuários', category: 'users' },
];

// Widgets do Dashboard
export const DASHBOARD_WIDGETS = [
  { id: 'stats', name: 'Estatísticas Gerais', description: 'Cards com números principais' },
  { id: 'views', name: 'Visualizações', description: 'Gráfico de visualizações em tempo real' },
  { id: 'activity', name: 'Atividades Recentes', description: 'Lista de atividades do sistema' },
  { id: 'quicktips', name: 'Dicas Rápidas', description: 'Sugestões e dicas contextuais' },
  { id: 'shortcuts', name: 'Atalhos Rápidos', description: 'Botões de ação rápida' },
  { id: 'content', name: 'Conteúdo Recente', description: 'Últimas páginas e artigos' },
];

// Configuração padrão de permissões por papel
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    role: 'admin',
    permissions: ALL_PERMISSIONS.map(p => p.id), // Todas as permissões
    dashboardWidgets: DASHBOARD_WIDGETS.map(w => w.id), // Todos os widgets
    canModify: true,
  },
  editor: {
    role: 'editor',
    permissions: [
      'dashboard.view',
      'dashboard.analytics',
      'dashboard.quicktips',
      'content.view',
      'content.create',
      'content.edit',
      'content.publish',
      'files.view',
      'files.upload',
      'files.edit',
    ],
    dashboardWidgets: ['stats', 'views', 'activity', 'quicktips', 'shortcuts', 'content'],
    canModify: true,
  },
  viewer: {
    role: 'viewer',
    permissions: [
      'content.view', // Apenas visualizar páginas externas
    ],
    dashboardWidgets: [], // Sem acesso ao dashboard
    canModify: false,
  },
};

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface PermissionsContextType {
  currentUser: User | null;
  rolePermissions: Record<UserRole, RolePermissions>;
  hasPermission: (permissionId: string) => boolean;
  hasAnyPermission: (permissionIds: string[]) => boolean;
  hasAllPermissions: (permissionIds: string[]) => boolean;
  canViewWidget: (widgetId: string) => boolean;
  updateRolePermissions: (role: UserRole, permissions: string[], widgets: string[]) => void;
  setCurrentUser: (user: User | null) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, RolePermissions>>(
    DEFAULT_ROLE_PERMISSIONS
  );

  // Carregar configurações de permissões do localStorage
  useEffect(() => {
    const storedPermissions = localStorage.getItem('rolePermissions');
    if (storedPermissions) {
      try {
        setRolePermissions(JSON.parse(storedPermissions));
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
      }
    }

    // Carregar usuário atual do localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    }
  }, []);

  // Salvar usuário atual no localStorage quando mudar
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const hasPermission = (permissionId: string): boolean => {
    if (!currentUser) return false;
    const userPermissions = rolePermissions[currentUser.role]?.permissions || [];
    return userPermissions.includes(permissionId);
  };

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    if (!currentUser) return false;
    return permissionIds.some(id => hasPermission(id));
  };

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    if (!currentUser) return false;
    return permissionIds.every(id => hasPermission(id));
  };

  const canViewWidget = (widgetId: string): boolean => {
    if (!currentUser) return false;
    const userWidgets = rolePermissions[currentUser.role]?.dashboardWidgets || [];
    return userWidgets.includes(widgetId);
  };

  const updateRolePermissions = (role: UserRole, permissions: string[], widgets: string[]) => {
    const updated = {
      ...rolePermissions,
      [role]: {
        ...rolePermissions[role],
        permissions,
        dashboardWidgets: widgets,
      },
    };
    setRolePermissions(updated);
    localStorage.setItem('rolePermissions', JSON.stringify(updated));
  };

  return (
    <PermissionsContext.Provider
      value={{
        currentUser,
        rolePermissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canViewWidget,
        updateRolePermissions,
        setCurrentUser,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
}

// HOC para proteger componentes com permissões
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: string | string[],
  fallback?: ReactNode
) {
  return function ProtectedComponent(props: P) {
    const { hasPermission, hasAnyPermission } = usePermissions();
    
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    const hasAccess = permissions.length === 1 
      ? hasPermission(permissions[0])
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return fallback || (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-600">Você não tem permissão para acessar este recurso.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
