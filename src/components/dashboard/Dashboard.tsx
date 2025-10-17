import { useState } from 'react';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Image, 
  Menu as MenuIcon, 
  Settings, 
  Users, 
  LogOut,
  FileCode,
  Layout,
  Palette,
  List,
  Code,
  Link as LinkIcon,
  History,
  Trash2,
  Database,
  RefreshCw
} from 'lucide-react';
import { PageManager } from '../pages/PageManager';
import { FileManager } from '../files/FileManager';
import { MenuManager } from '../menu/MenuManager';
import { SystemSettings } from '../settings/SystemSettings';
import { UserManager } from '../users/UserManager';
import { CustomListManager } from '../content/CustomListManager';
import { SnippetManager } from '../content/SnippetManager';
import { DashboardHome } from './DashboardHome';
import { LinkManager } from '../links/LinkManager';
import { TemplateManager } from '../templates/TemplateManager';
import { SecurityMonitor } from '../security/SecurityMonitor';
import { TrashViewer } from '../files/TrashViewer';
import { EditorDemo } from '../editor/EditorDemo';
import { CustomFieldsManager } from '../content/CustomFieldsManager';
import { ContentSyncManager } from '../content/ContentSyncManager';

interface DashboardProps {
  currentUser: any;
  onLogout: () => void;
}

type View = 'home' | 'pages' | 'files' | 'menu' | 'lists' | 'snippets' | 'links' | 'templates' | 'users' | 'security' | 'settings' | 'trash' | 'editorDemo' | 'customFields' | 'contentSync';

export function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'editor'] },
    { id: 'pages', icon: Layout, label: 'Páginas', roles: ['admin', 'editor'] },
    { id: 'editorDemo', icon: FileText, label: 'Editor Inteligente', roles: ['admin', 'editor'] },
    { id: 'files', icon: Image, label: 'Arquivos', roles: ['admin', 'editor'] },
    { id: 'trash', icon: Trash2, label: 'Lixeira', roles: ['admin', 'editor'] },
    { id: 'menu', icon: MenuIcon, label: 'Menu', roles: ['admin'] },
    { id: 'lists', icon: List, label: 'Listas', roles: ['admin', 'editor'] },
    { id: 'customFields', icon: Database, label: 'Campos Personalizados', roles: ['admin', 'editor'] },
    { id: 'contentSync', icon: RefreshCw, label: 'Sincronização', roles: ['admin', 'editor'] },
    { id: 'snippets', icon: Code, label: 'Snippets', roles: ['admin', 'editor'] },
    { id: 'links', icon: LinkIcon, label: 'Links', roles: ['admin', 'editor'] },
    { id: 'templates', icon: Palette, label: 'Templates', roles: ['admin', 'editor'] },
    { id: 'users', icon: Users, label: 'Usuários', roles: ['admin'] },
    { id: 'security', icon: History, label: 'Segurança', roles: ['admin'] },
    { id: 'settings', icon: Settings, label: 'Configurações', roles: ['admin'] },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <DashboardHome currentUser={currentUser} onNavigate={setCurrentView} />;
      case 'pages':
        return <PageManager currentUser={currentUser} />;
      case 'editorDemo':
        return <EditorDemo />;
      case 'files':
        return <FileManager />;
      case 'trash':
        return <TrashViewer onClose={() => setCurrentView('home')} />;
      case 'menu':
        return <MenuManager />;
      case 'lists':
        return <CustomListManager />;
      case 'customFields':
        return <CustomFieldsManager />;
      case 'contentSync':
        return <ContentSyncManager />;
      case 'snippets':
        return <SnippetManager currentUser={currentUser} />;
      case 'links':
        return <LinkManager currentUser={currentUser} />;
      case 'templates':
        return <TemplateManager />;
      case 'users':
        return <UserManager />;
      case 'security':
        return <SecurityMonitor />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardHome currentUser={currentUser} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <FileCode className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Portal CMS</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={sidebarCollapsed ? 'mx-auto' : ''}
              >
                <MenuIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems
              .filter(item => item.roles.includes(currentUser.role))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as View)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-3 border-t border-gray-200">
            <div className={`flex items-center gap-3 mb-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full"
              size={sidebarCollapsed ? 'icon' : 'default'}
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && <span className="ml-2">Sair</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
}
