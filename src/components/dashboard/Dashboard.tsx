import { useState } from 'react';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Image, 
  Menu as MenuIcon, 
  Settings, 
  LogOut,
  FileCode,
  Layout,
  Palette,
  List,
  Code,
  Trash2,
  Database,
  Tag as TagIcon,
  Layers,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { PageManager } from '../pages/PageManager';
import { FileManager } from '../files/FileManager';
import { MenuManager } from '../menu/MenuManager';
import { SystemSettings } from '../settings/SystemSettings';
import { UserManager } from '../users/UserManager';
import { CustomListManager } from '../content/CustomListManager';
import { SnippetManager } from '../content/SnippetManager';
import { DashboardHome } from './DashboardHome';
import { TemplateManager } from '../templates/TemplateManager';
import { TrashViewer } from '../files/TrashViewer';
import { EditorDemo } from '../editor/EditorDemo';
import { CustomFieldsManager } from '../content/CustomFieldsManager';
import { TaxonomyManager } from '../taxonomy/TaxonomyManager';
import { HierarchicalBuilderDemo } from '../pages/HierarchicalBuilderDemo';
import { GlobalSearch } from './GlobalSearch';

interface DashboardProps {
  currentUser: any;
  onLogout: () => void;
}

type View = 'home' | 'pages' | 'files' | 'menu' | 'lists' | 'snippets' | 'templates' | 'settings' | 'trash' | 'editorDemo' | 'customFields' | 'taxonomy' | 'search' | 'hierarchicalBuilder';

export function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['hierarchicalBuilder']));
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

  interface MenuItem {
    id: string;
    icon: any;
    label: string;
    roles: string[];
    children?: MenuItem[];
  }

  const menuItems: MenuItem[] = [
    { id: 'home', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'editor'] },
    { id: 'pages', icon: Layout, label: 'Páginas', roles: ['admin', 'editor'] },
    { id: 'editorDemo', icon: FileText, label: 'Editor Inteligente', roles: ['admin', 'editor'] },
    { 
      id: 'hierarchicalBuilder', 
      icon: Layers, 
      label: 'Page Builder', 
      roles: ['admin', 'editor'],
      children: [
        { id: 'templates', icon: Palette, label: 'Templates', roles: ['admin', 'editor'] }
      ]
    },
    { id: 'files', icon: Image, label: 'Arquivos', roles: ['admin', 'editor'] },
    { id: 'trash', icon: Trash2, label: 'Lixeira', roles: ['admin', 'editor'] },
    { id: 'menu', icon: MenuIcon, label: 'Menu', roles: ['admin'] },
    { id: 'taxonomy', icon: TagIcon, label: 'Tags e Categorias', roles: ['admin', 'editor'] },
    { id: 'lists', icon: List, label: 'Listas', roles: ['admin', 'editor'] },
    { id: 'customFields', icon: Database, label: 'Campos Personalizados', roles: ['admin', 'editor'] },
    { id: 'snippets', icon: Code, label: 'Snippets', roles: ['admin', 'editor'] },
    { id: 'settings', icon: Settings, label: 'Configurações', roles: ['admin'] },
  ];

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Função auxiliar para navegar e selecionar item
  const handleNavigateToItem = (viewId: string, itemId?: string) => {
    setCurrentView(viewId as View);
    setSelectedItemId(itemId);
    
    // Enviar evento customizado para os componentes filhos
    if (itemId) {
      // Timeout para garantir que o componente foi montado
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('selectItem', { 
          detail: { itemId, viewId } 
        }));
      }, 100);
    }
  };

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
      case 'taxonomy':
        return <TaxonomyManager currentUser={currentUser} />;
      case 'hierarchicalBuilder':
        return <HierarchicalBuilderDemo />;
      case 'lists':
        return <CustomListManager />;
      case 'customFields':
        return <CustomFieldsManager />;
      case 'snippets':
        return <SnippetManager currentUser={currentUser} />;
      case 'templates':
        return <TemplateManager />;
      case 'settings':
        return <SystemSettings currentUser={currentUser} />;
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
                <button
                  onClick={() => {
                    try {
                      // Abrir página inicial do site em nova aba
                      const filesData = localStorage.getItem('files');
                      const files = filesData ? JSON.parse(filesData) : [];
                      
                      if (Array.isArray(files)) {
                        const homepage = files.find((f: any) => f.path === '/Arquivos/Inicio.html');
                        if (homepage && homepage.url) {
                          window.open(homepage.url, '_blank');
                          return;
                        }
                      }
                    } catch (error) {
                      console.error('Error opening homepage:', error);
                    }
                    
                    // Fallback: abrir site público
                    window.open('/public', '_blank');
                  }}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  title="Abrir página inicial do site"
                >
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <FileCode className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Portal CMS</span>
                </button>
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
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.has(item.id);
                
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (hasChildren && !sidebarCollapsed) {
                          toggleExpanded(item.id);
                        }
                        setCurrentView(item.id as View);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        currentView === item.id
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {hasChildren && (
                            isExpanded ? (
                              <ChevronDown className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 flex-shrink-0" />
                            )
                          )}
                        </>
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {hasChildren && isExpanded && !sidebarCollapsed && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                        {item.children
                          ?.filter(child => child.roles.includes(currentUser.role))
                          .map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <button
                                key={child.id}
                                onClick={() => setCurrentView(child.id as View)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                                  currentView === child.id
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <ChildIcon className="w-4 h-4 flex-shrink-0" />
                                <span>{child.label}</span>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
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
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Barra de Pesquisa Global */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <GlobalSearch onNavigate={handleNavigateToItem} />
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
