import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { 
  Plus, 
  Trash, 
  GripVertical, 
  Save, 
  Pencil, 
  FolderPlus, 
  Upload, 
  Download,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  FileText,
  MapPin,
  Layout,
  Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner@2.0.3';

interface MenuItem {
  title: string;
  targetUrl: string;
  ignorarFilhosNoMenu: boolean;
  filhos: MenuItem[] | null;
  href: string;
  id?: string;
  expanded?: boolean;
}

interface MenuConfig {
  id: string;
  name: string;
  description: string;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
  associatedPages?: string[];
  position?: MenuPosition;
  displaySettings?: MenuDisplaySettings;
}

type MenuPositionType = 'header' | 'top' | 'right' | 'left' | 'footer' | 'sidebar' | 'custom';

interface MenuPosition {
  type: MenuPositionType;
  customPosition?: string;
  alignment?: 'start' | 'center' | 'end';
  sticky?: boolean;
}

interface MenuDisplaySettings {
  showOnHomepage?: boolean;
  specificPages?: string[];
  excludedPages?: string[];
  showOnAllPages?: boolean;
  responsive?: {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
  };
}

export function MenuManager() {
  const [menus, setMenus] = useState<MenuConfig[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showNewMenuDialog, setShowNewMenuDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingPath, setEditingPath] = useState<number[]>([]);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuDescription, setNewMenuDescription] = useState('');
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    loadMenus();
    loadPages();
  }, []);

  useEffect(() => {
    // Listener para abrir menu da pesquisa global
    const handleSelectItem = (e: CustomEvent) => {
      const { itemId, viewId } = e.detail;
      if (viewId === 'menus') {
        // Buscar menu diretamente do localStorage
        const storedMenus = localStorage.getItem('menus');
        const allMenus: MenuConfig[] = storedMenus ? JSON.parse(storedMenus) : [];
        const menuToEdit = allMenus.find(m => m.id === itemId);
        
        if (menuToEdit) {
          setSelectedMenuId(menuToEdit.id);
          toast.success(`Selecionado menu: ${menuToEdit.name}`);
        }
      }
    };

    window.addEventListener('selectItem', handleSelectItem as EventListener);

    return () => {
      window.removeEventListener('selectItem', handleSelectItem as EventListener);
    };
  }, []);

  const ensureIds = (items: MenuItem[]): MenuItem[] => {
    return items.map((item, index) => ({
      ...item,
      id: item.id || `item-${Date.now()}-${index}`,
      filhos: item.filhos ? ensureIds(item.filhos) : null
    }));
  };

  const loadMenus = () => {
    const stored = localStorage.getItem('menus');
    if (stored) {
      const loadedMenus = JSON.parse(stored).map((menu: MenuConfig) => ({
        ...menu,
        items: ensureIds(menu.items)
      }));
      setMenus(loadedMenus);
      if (loadedMenus.length > 0 && !selectedMenuId) {
        setSelectedMenuId(loadedMenus[0].id);
      }
    } else {
      // Create default menu
      const defaultMenu: MenuConfig = {
        id: 'menu-principal',
        name: 'Menu Principal',
        description: 'Menu de navegação principal do site',
        items: [
          {
            title: 'Início',
            targetUrl: '/Arquivos/Inicio.html',
            ignorarFilhosNoMenu: false,
            filhos: null,
            href: '/'
          },
          {
            title: 'Institucional',
            targetUrl: '/sites/portal/Paginas/inc/MenuList.aspx',
            ignorarFilhosNoMenu: false,
            filhos: [
              {
                title: 'Atribuições',
                targetUrl: '/sites/portal/Paginas/Institucional/Atribuicoes.aspx',
                ignorarFilhosNoMenu: false,
                filhos: null,
                href: '/Institucional/Atribuicoes'
              },
              {
                title: 'Composição',
                targetUrl: '/sites/portal/Paginas/Institucional/Composicao.aspx',
                ignorarFilhosNoMenu: false,
                filhos: null,
                href: '/Institucional/Composicao'
              }
            ],
            href: '/Institucional'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMenus([defaultMenu]);
      setSelectedMenuId(defaultMenu.id);
      localStorage.setItem('menus', JSON.stringify([defaultMenu]));
    }
  };

  const loadPages = () => {
    const stored = localStorage.getItem('pages');
    if (stored) {
      setPages(JSON.parse(stored));
    }
  };

  const saveMenus = (updatedMenus: MenuConfig[]) => {
    const menusWithTimestamp = updatedMenus.map(menu => ({
      ...menu,
      updatedAt: new Date().toISOString()
    }));
    localStorage.setItem('menus', JSON.stringify(menusWithTimestamp));
    setMenus(menusWithTimestamp);
    toast.success('Menus salvos com sucesso!');
  };

  const getCurrentMenu = (): MenuConfig | undefined => {
    return menus.find(m => m.id === selectedMenuId);
  };

  const updateCurrentMenu = (items: MenuItem[]) => {
    const updatedMenus = menus.map(menu => 
      menu.id === selectedMenuId 
        ? { ...menu, items, updatedAt: new Date().toISOString() }
        : menu
    );
    saveMenus(updatedMenus);
  };

  const generateHref = (targetUrl: string): string => {
    // Convert ASPX URLs to friendly HTML URLs
    let href = targetUrl;
    
    // Remove domain and base path
    href = href.replace(/^(https?:\/\/[^\/]+)?/, '');
    href = href.replace(/^\/sites\/[^\/]+\/Paginas/, '');
    
    // Remove .aspx extension
    href = href.replace(/\.aspx$/i, '');
    
    // Clean up special paths
    href = href.replace(/\/inc\/MenuList$/, '');
    
    // Ensure starts with /
    if (!href.startsWith('/')) {
      href = '/' + href;
    }
    
    // Remove trailing slash
    href = href.replace(/\/$/, '');
    
    // Handle root
    if (href === '' || href === '/') {
      href = '/';
    }
    
    return href;
  };

  const createNewMenu = () => {
    if (!newMenuName.trim()) {
      toast.error('Digite um nome para o menu');
      return;
    }

    const newMenu: MenuConfig = {
      id: `menu-${Date.now()}`,
      name: newMenuName,
      description: newMenuDescription,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      associatedPages: [],
      position: {
        type: 'header'
      },
      displaySettings: {
        showOnAllPages: true,
        responsive: {
          desktop: true,
          tablet: true,
          mobile: true
        }
      }
    };

    const updatedMenus = [...menus, newMenu];
    saveMenus(updatedMenus);
    setSelectedMenuId(newMenu.id);
    setShowNewMenuDialog(false);
    setNewMenuName('');
    setNewMenuDescription('');
    toast.success('Menu criado com sucesso!');
  };

  const deleteMenu = (menuId: string) => {
    if (menus.length === 1) {
      toast.error('Não é possível excluir o último menu');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este menu?')) {
      const updatedMenus = menus.filter(m => m.id !== menuId);
      saveMenus(updatedMenus);
      if (selectedMenuId === menuId) {
        setSelectedMenuId(updatedMenus[0]?.id || '');
      }
      toast.success('Menu excluído com sucesso!');
    }
  };

  const duplicateMenu = (menuId: string) => {
    const menuToDuplicate = menus.find(m => m.id === menuId);
    if (!menuToDuplicate) return;

    const duplicated: MenuConfig = {
      ...menuToDuplicate,
      id: `menu-${Date.now()}`,
      name: `${menuToDuplicate.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedMenus = [...menus, duplicated];
    saveMenus(updatedMenus);
    setSelectedMenuId(duplicated.id);
    toast.success('Menu duplicado com sucesso!');
  };

  const associatePage = (menuId: string, pageId: string) => {
    const updatedMenus = menus.map(menu => {
      if (menu.id === menuId) {
        const associated = menu.associatedPages || [];
        const newAssociated = associated.includes(pageId)
          ? associated.filter(id => id !== pageId)
          : [...associated, pageId];
        return { ...menu, associatedPages: newAssociated };
      }
      return menu;
    });
    saveMenus(updatedMenus);
  };

  const addMenuItem = (path: number[] = []) => {
    const currentMenu = getCurrentMenu();
    if (!currentMenu) return;

    const newItem: MenuItem = {
      title: 'Novo Item',
      targetUrl: '/novo',
      ignorarFilhosNoMenu: false,
      filhos: null,
      href: '/novo',
      id: `item-${Date.now()}`,
      expanded: false
    };

    if (path.length === 0) {
      updateCurrentMenu([...currentMenu.items, newItem]);
    } else {
      const updatedItems = addItemAtPath(currentMenu.items, path, newItem);
      updateCurrentMenu(updatedItems);
    }
  };

  const addItemAtPath = (items: MenuItem[], path: number[], newItem: MenuItem): MenuItem[] => {
    if (path.length === 1) {
      return items.map((item, index) => {
        if (index === path[0]) {
          return {
            ...item,
            filhos: [...(item.filhos || []), newItem],
            expanded: true
          };
        }
        return item;
      });
    }

    return items.map((item, index) => {
      if (index === path[0] && item.filhos) {
        return {
          ...item,
          filhos: addItemAtPath(item.filhos, path.slice(1), newItem)
        };
      }
      return item;
    });
  };

  const openEditDialog = (item: MenuItem, path: number[]) => {
    setEditingItem({ ...item });
    setEditingPath(path);
    setShowEditDialog(true);
  };

  const saveEditedItem = () => {
    if (!editingItem) return;

    const currentMenu = getCurrentMenu();
    if (!currentMenu) return;

    // Generate href from targetUrl
    const updatedItem = {
      ...editingItem,
      href: generateHref(editingItem.targetUrl)
    };

    const updatedItems = updateItemAtPath(currentMenu.items, editingPath, updatedItem);
    updateCurrentMenu(updatedItems);
    setShowEditDialog(false);
    setEditingItem(null);
    toast.success('Item atualizado com sucesso!');
  };

  const updateItemAtPath = (items: MenuItem[], path: number[], updatedItem: MenuItem): MenuItem[] => {
    if (path.length === 1) {
      return items.map((item, index) => 
        index === path[0] ? updatedItem : item
      );
    }

    return items.map((item, index) => {
      if (index === path[0] && item.filhos) {
        return {
          ...item,
          filhos: updateItemAtPath(item.filhos, path.slice(1), updatedItem)
        };
      }
      return item;
    });
  };

  const deleteMenuItem = (path: number[]) => {
    if (confirm('Tem certeza que deseja excluir este item e seus filhos?')) {
      const currentMenu = getCurrentMenu();
      if (!currentMenu) return;

      const updatedItems = deleteItemAtPath(currentMenu.items, path);
      updateCurrentMenu(updatedItems);
      toast.success('Item excluído com sucesso!');
    }
  };

  const deleteItemAtPath = (items: MenuItem[], path: number[]): MenuItem[] => {
    if (path.length === 1) {
      return items.filter((_, index) => index !== path[0]);
    }

    return items.map((item, index) => {
      if (index === path[0] && item.filhos) {
        return {
          ...item,
          filhos: deleteItemAtPath(item.filhos, path.slice(1))
        };
      }
      return item;
    });
  };

  const toggleExpanded = (path: number[]) => {
    const currentMenu = getCurrentMenu();
    if (!currentMenu) return;

    const updatedItems = toggleExpandedAtPath(currentMenu.items, path);
    updateCurrentMenu(updatedItems);
  };

  const toggleExpandedAtPath = (items: MenuItem[], path: number[]): MenuItem[] => {
    if (path.length === 1) {
      return items.map((item, index) => 
        index === path[0] ? { ...item, expanded: !item.expanded } : item
      );
    }

    return items.map((item, index) => {
      if (index === path[0] && item.filhos) {
        return {
          ...item,
          filhos: toggleExpandedAtPath(item.filhos, path.slice(1))
        };
      }
      return item;
    });
  };

  const moveItem = (path: number[], direction: 'up' | 'down') => {
    const currentMenu = getCurrentMenu();
    if (!currentMenu) return;

    const updatedItems = moveItemAtPath(currentMenu.items, path, direction);
    updateCurrentMenu(updatedItems);
  };

  const moveItemAtPath = (items: MenuItem[], path: number[], direction: 'up' | 'down'): MenuItem[] => {
    if (path.length === 1) {
      const newItems = [...items];
      const index = path[0];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (newIndex >= 0 && newIndex < newItems.length) {
        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      }
      
      return newItems;
    }

    return items.map((item, index) => {
      if (index === path[0] && item.filhos) {
        return {
          ...item,
          filhos: moveItemAtPath(item.filhos, path.slice(1), direction)
        };
      }
      return item;
    });
  };

  const exportMenu = (menuId: string) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;

    const dataStr = JSON.stringify(menu.items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${menu.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    toast.success('Menu exportado com sucesso!');
  };

  const importMenuFromJson = () => {
    try {
      setImportError('');
      
      // Limpar whitespace
      const cleanedJson = importJson.trim();
      
      if (!cleanedJson) {
        setImportError('Por favor, cole um JSON válido');
        return;
      }

      // Tentar parsear o JSON
      let parsed;
      try {
        parsed = JSON.parse(cleanedJson);
      } catch (parseError: any) {
        // Mensagens de erro mais amigáveis
        if (parseError.message.includes('Unexpected token')) {
          setImportError('JSON malformado. Verifique se há vírgulas, chaves ou colchetes faltando.');
        } else if (parseError.message.includes('Unexpected end')) {
          setImportError('JSON incompleto. Verifique se todas as chaves e colchetes foram fechados.');
        } else if (parseError.message.includes('Unexpected non-whitespace')) {
          setImportError('Há caracteres extras após o JSON. Verifique se copiou apenas o conteúdo JSON válido.');
        } else {
          setImportError(`Erro ao interpretar JSON: ${parseError.message}`);
        }
        return;
      }
      
      if (!Array.isArray(parsed)) {
        setImportError('O JSON deve conter um array (lista) de itens de menu');
        return;
      }

      if (parsed.length === 0) {
        setImportError('O array está vazio. Adicione pelo menos um item de menu');
        return;
      }

      // Validar cada item
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        const validationError = validateMenuItemWithMessage(item, i + 1);
        if (validationError) {
          setImportError(validationError);
          return;
        }
      }

      updateCurrentMenu(ensureIds(parsed));
      setShowImportDialog(false);
      setImportJson('');
      toast.success('Menu importado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao importar menu:', error);
      setImportError(`Erro inesperado ao importar menu: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const validateMenuItemWithMessage = (item: any, itemNumber: number, path: string = ''): string | null => {
    const prefix = path ? `${path}` : `Item ${itemNumber}`;

    if (!item || typeof item !== 'object') {
      return `${prefix}: deve ser um objeto`;
    }

    if (typeof item.title !== 'string') {
      return `${prefix}: campo "title" (título) é obrigatório e deve ser texto`;
    }

    if (typeof item.targetUrl !== 'string') {
      return `${prefix}: campo "targetUrl" (URL de destino) é obrigatório e deve ser texto`;
    }

    if (typeof item.ignorarFilhosNoMenu !== 'boolean') {
      return `${prefix}: campo "ignorarFilhosNoMenu" deve ser true ou false`;
    }

    if (typeof item.href !== 'string') {
      return `${prefix}: campo "href" (URL amigável) é obrigatório e deve ser texto`;
    }

    if (item.filhos !== null) {
      if (!Array.isArray(item.filhos)) {
        return `${prefix}: campo "filhos" deve ser null ou um array`;
      }

      // Validar filhos recursivamente
      for (let i = 0; i < item.filhos.length; i++) {
        const childError = validateMenuItemWithMessage(
          item.filhos[i], 
          i + 1, 
          `${prefix} → Filho ${i + 1}`
        );
        if (childError) {
          return childError;
        }
      }
    }

    return null;
  };

  const validateMenuItem = (item: any): boolean => {
    if (typeof item.title !== 'string') return false;
    if (typeof item.targetUrl !== 'string') return false;
    if (typeof item.ignorarFilhosNoMenu !== 'boolean') return false;
    if (typeof item.href !== 'string') return false;
    
    if (item.filhos !== null) {
      if (!Array.isArray(item.filhos)) return false;
      return item.filhos.every((child: any) => validateMenuItem(child));
    }
    
    return true;
  };

  const renderMenuItem = (item: MenuItem, path: number[], level: number = 0) => {
    const hasFilhos = item.filhos && item.filhos.length > 0;
    const shouldShowFilhos = hasFilhos && !item.ignorarFilhosNoMenu;
    const index = path[path.length - 1];
    const parentItems = getItemsAtPath(getCurrentMenu()?.items || [], path.slice(0, -1));
    
    return (
      <div key={item.id || path.join('-')} className="space-y-2">
        <Card className={level > 0 ? 'ml-8 border-l-4 border-indigo-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Move Controls */}
              <div className="flex flex-col gap-1 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveItem(path, 'up')}
                  disabled={index === 0}
                  className="h-6 w-6 p-0"
                >
                  ↑
                </Button>
                <GripVertical className="w-4 h-4 text-gray-400" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveItem(path, 'down')}
                  disabled={index === parentItems.length - 1}
                  className="h-6 w-6 p-0"
                >
                  ↓
                </Button>
              </div>

              {/* Expand/Collapse */}
              {hasFilhos && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(path)}
                  className="h-8 w-8 p-0 mt-2"
                >
                  {item.expanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              )}

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.title}</span>
                      {hasFilhos && (
                        <Badge variant="secondary" className="text-xs">
                          {item.filhos!.length} {item.filhos!.length === 1 ? 'filho' : 'filhos'}
                        </Badge>
                      )}
                      {item.ignorarFilhosNoMenu && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          Filhos ocultos
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <div>Target: {item.targetUrl}</div>
                      <div className="text-indigo-600">Href: {item.href}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(item, path)}
                  title="Editar item"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addMenuItem(path)}
                  title="Adicionar filho"
                >
                  <FolderPlus className="w-4 h-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMenuItem(path)}
                  title="Excluir item"
                  className="text-red-600"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children */}
        {hasFilhos && item.expanded && (
          <div className="space-y-2">
            {item.filhos!.map((filho, filhoIndex) => 
              <div key={filho.id || `${path.join('-')}-${filhoIndex}`}>
                {renderMenuItem(filho, [...path, filhoIndex], level + 1)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getItemsAtPath = (items: MenuItem[], path: number[]): MenuItem[] => {
    if (path.length === 0) return items;
    
    const item = items[path[0]];
    if (!item || !item.filhos) return items;
    
    return getItemsAtPath(item.filhos, path.slice(1));
  };

  const exampleJson = `[
  {
    "title": "Institucional",
    "targetUrl": "/sites/portalp/Paginas/inc/MenuList.aspx",
    "ignorarFilhosNoMenu": false,
    "filhos": [
      {
        "title": "Atribuições",
        "targetUrl": "/sites/portalp/Paginas/Institucional/Atribuicoes.aspx",
        "ignorarFilhosNoMenu": false,
        "filhos": null,
        "href": "/Institucional/Atribuicoes"
      },
      {
        "title": "Composição",
        "targetUrl": "/sites/portalp/Paginas/Institucional/Composicao.aspx",
        "ignorarFilhosNoMenu": false,
        "filhos": null,
        "href": "/Institucional/Composicao"
      }
    ],
    "href": "/Institucional"
  }
]`;

  const currentMenu = getCurrentMenu();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Gerenciamento de Menus</h1>
          <p className="text-gray-600">Configure múltiplos menus com estrutura hierárquica e URLs amigáveis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewMenuDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Menu
          </Button>
        </div>
      </div>

      <Tabs value={selectedMenuId} onValueChange={setSelectedMenuId} className="space-y-6">
        <div className="flex items-center gap-4">
          <TabsList className="flex-1">
            {menus.map(menu => (
              <TabsTrigger key={menu.id} value={menu.id} className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {menu.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {currentMenu && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettingsDialog(true)}
                title="Configurações de exibição e posicionamento"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => duplicateMenu(currentMenu.id)}
                title="Duplicar menu"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportDialog(true)}
                title="Importar JSON"
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportMenu(currentMenu.id)}
                title="Exportar JSON"
              >
                <Download className="w-4 h-4" />
              </Button>
              {menus.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMenu(currentMenu.id)}
                  className="text-red-600"
                  title="Excluir menu"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {menus.map(menu => (
          <TabsContent key={menu.id} value={menu.id} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Menu Editor */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{menu.name}</CardTitle>
                        <CardDescription>{menu.description}</CardDescription>
                      </div>
                      <Button onClick={() => addMenuItem()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {menu.items.map((item, index) => renderMenuItem(item, [index]))}
                    
                    {menu.items.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        Nenhum item no menu. Clique em "Adicionar Item" para começar.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Associated Pages */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Páginas Associadas</CardTitle>
                    <CardDescription>
                      Vincule este menu a páginas específicas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pages.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhuma página criada ainda</p>
                    ) : (
                      pages.map(page => (
                        <div key={page.id} className="flex items-center gap-2">
                          <Switch
                            checked={menu.associatedPages?.includes(page.id) || false}
                            onCheckedChange={() => associatePage(menu.id, page.id)}
                          />
                          <span className="text-sm">{page.title}</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Menu Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preview do Menu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <nav className="bg-gray-900 text-white p-4 rounded-lg">
                      <ul className="space-y-2">
                        {menu.items.map(item => (
                          <li key={item.id}>
                            <a 
                              href={item.href} 
                              className="hover:text-indigo-300 transition-colors"
                              onClick={(e) => e.preventDefault()}
                            >
                              {item.title}
                            </a>
                            {item.filhos && item.filhos.length > 0 && !item.ignorarFilhosNoMenu && (
                              <ul className="ml-4 mt-2 space-y-1 text-sm text-gray-300">
                                {item.filhos.map(filho => (
                                  <li key={filho.id}>
                                    <a href={filho.href} onClick={(e) => e.preventDefault()}>
                                      • {filho.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </CardContent>
                </Card>

                {/* Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Criado em:</span>
                      <div>{new Date(menu.createdAt).toLocaleString('pt-BR')}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Atualizado em:</span>
                      <div>{new Date(menu.updatedAt).toLocaleString('pt-BR')}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total de itens:</span>
                      <div>{menu.items.length}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* New Menu Dialog */}
      <Dialog open={showNewMenuDialog} onOpenChange={setShowNewMenuDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Novo Menu</DialogTitle>
            <DialogDescription>
              Crie um novo menu independente para diferentes áreas do site
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="menu-name">Nome do Menu *</Label>
              <Input
                id="menu-name"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="Ex: Menu Principal, Menu Footer, Menu Sidebar"
              />
            </div>

            <div>
              <Label htmlFor="menu-description">Descrição</Label>
              <Textarea
                id="menu-description"
                value={newMenuDescription}
                onChange={(e) => setNewMenuDescription(e.target.value)}
                placeholder="Descrição opcional do menu"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createNewMenu} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Criar Menu
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewMenuDialog(false);
                  setNewMenuName('');
                  setNewMenuDescription('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Item do Menu</DialogTitle>
            <DialogDescription>
              Configure o título, URL e visibilidade dos filhos
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Nome do item no menu"
                />
              </div>

              <div>
                <Label htmlFor="edit-targetUrl">Target URL *</Label>
                <Input
                  id="edit-targetUrl"
                  value={editingItem.targetUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, targetUrl: e.target.value })}
                  placeholder="/sites/portal/Paginas/Exemplo.aspx"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL original do sistema (pode incluir .aspx)
                </p>
              </div>

              <div>
                <Label htmlFor="edit-href">Href (URL Amigável)</Label>
                <Input
                  id="edit-href"
                  value={generateHref(editingItem.targetUrl)}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gerado automaticamente a partir do Target URL
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Switch
                  checked={editingItem.ignorarFilhosNoMenu}
                  onCheckedChange={(checked) => 
                    setEditingItem({ ...editingItem, ignorarFilhosNoMenu: checked })
                  }
                />
                <div className="flex-1">
                  <Label className="flex items-center gap-2">
                    {editingItem.ignorarFilhosNoMenu ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    Ignorar Filhos no Menu
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Quando ativado, os itens filhos não serão exibidos no menu
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveEditedItem} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingItem(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Importar Menu (JSON)</DialogTitle>
            <DialogDescription>
              Cole o JSON do menu ou veja o exemplo abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label>JSON do Menu</Label>
              <Textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Cole o JSON aqui..."
                rows={12}
                className="font-mono text-sm"
              />
              {importError && (
                <p className="text-red-600 text-sm mt-2 bg-red-50 p-2 rounded border border-red-200">
                  {importError}
                </p>
              )}
            </div>

            <div>
              <Label>Exemplo de Estrutura</Label>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-[200px]">
                <pre className="text-xs font-mono">{exampleJson}</pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Dica: Cole apenas o conteúdo do array JSON, sem texto adicional antes ou depois
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t mt-4">
            <Button onClick={importMenuFromJson} className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Importar Menu
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowImportDialog(false);
                setImportJson('');
                setImportError('');
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu Settings Dialog - Position and Display */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações de Posicionamento e Exibição
            </DialogTitle>
            <DialogDescription>
              Defina onde e como o menu "{currentMenu?.name}" será exibido no site
            </DialogDescription>
          </DialogHeader>

          {currentMenu && (
            <Tabs defaultValue="position" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="position" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Posicionamento
                </TabsTrigger>
                <TabsTrigger value="display" className="flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  Exibição
                </TabsTrigger>
              </TabsList>

              {/* Position Tab */}
              <TabsContent value="position" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Posição do Menu</CardTitle>
                    <CardDescription>
                      Escolha onde o menu será posicionado na página
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Tipo de Posicionamento</Label>
                      <Select
                        value={currentMenu.position?.type || 'header'}
                        onValueChange={(value: MenuPositionType) => {
                          const updated = menus.map(m => 
                            m.id === currentMenu.id
                              ? { 
                                  ...m, 
                                  position: { 
                                    ...m.position, 
                                    type: value 
                                  } 
                                }
                              : m
                          );
                          saveMenus(updated);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="header">
                            <div className="flex items-center gap-2">
                              <Layout className="w-4 h-4" />
                              Cabeçalho (Header)
                            </div>
                          </SelectItem>
                          <SelectItem value="top">
                            <div className="flex items-center gap-2">
                              <Layout className="w-4 h-4" />
                              Topo da Página
                            </div>
                          </SelectItem>
                          <SelectItem value="right">
                            <div className="flex items-center gap-2">
                              <Layout className="w-4 h-4" />
                              Lateral Direita
                            </div>
                          </SelectItem>
                          <SelectItem value="left">
                            <div className="flex items-center gap-2">
                              <Layout className="w-4 h-4" />
                              Lateral Esquerda
                            </div>
                          </SelectItem>
                          <SelectItem value="footer">
                            <div className="flex items-center gap-2">
                              <Layout className="w-4 h-4" />
                              Rodapé (Footer)
                            </div>
                          </SelectItem>
                          <SelectItem value="sidebar">
                            <div className="flex items-center gap-2">
                              <Layout className="w-4 h-4" />
                              Barra Lateral (Sidebar)
                            </div>
                          </SelectItem>
                          <SelectItem value="custom">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Posição Personalizada
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-2">
                        {currentMenu.position?.type === 'header' && 'Menu será exibido no cabeçalho principal do site'}
                        {currentMenu.position?.type === 'top' && 'Menu será fixado no topo da página'}
                        {currentMenu.position?.type === 'right' && 'Menu será exibido na lateral direita'}
                        {currentMenu.position?.type === 'left' && 'Menu será exibido na lateral esquerda'}
                        {currentMenu.position?.type === 'footer' && 'Menu será exibido no rodapé do site'}
                        {currentMenu.position?.type === 'sidebar' && 'Menu será exibido em uma barra lateral'}
                        {currentMenu.position?.type === 'custom' && 'Defina uma posição personalizada abaixo'}
                      </p>
                    </div>

                    {currentMenu.position?.type === 'custom' && (
                      <div>
                        <Label>Posição Personalizada</Label>
                        <Input
                          value={currentMenu.position?.customPosition || ''}
                          onChange={(e) => {
                            const updated = menus.map(m => 
                              m.id === currentMenu.id
                                ? { 
                                    ...m, 
                                    position: { 
                                      ...m.position!, 
                                      customPosition: e.target.value 
                                    } 
                                  }
                                : m
                            );
                            saveMenus(updated);
                          }}
                          placeholder="Ex: #menu-container, .custom-menu, etc."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Seletor CSS ou ID onde o menu será renderizado
                        </p>
                      </div>
                    )}

                    <div>
                      <Label>Alinhamento</Label>
                      <Select
                        value={currentMenu.position?.alignment || 'start'}
                        onValueChange={(value: 'start' | 'center' | 'end') => {
                          const updated = menus.map(m => 
                            m.id === currentMenu.id
                              ? { 
                                  ...m, 
                                  position: { 
                                    ...m.position!, 
                                    alignment: value 
                                  } 
                                }
                              : m
                          );
                          saveMenus(updated);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="start">Início (Esquerda)</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="end">Fim (Direita)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Switch
                        checked={currentMenu.position?.sticky || false}
                        onCheckedChange={(checked) => {
                          const updated = menus.map(m => 
                            m.id === currentMenu.id
                              ? { 
                                  ...m, 
                                  position: { 
                                    ...m.position!, 
                                    sticky: checked 
                                  } 
                                }
                              : m
                          );
                          saveMenus(updated);
                        }}
                      />
                      <div>
                        <Label>Menu Fixo (Sticky)</Label>
                        <p className="text-xs text-gray-500 mt-1">
                          O menu permanecerá visível durante a rolagem da página
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview Visual */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preview de Posicionamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="bg-white rounded shadow-sm overflow-hidden">
                        {/* Header */}
                        {currentMenu.position?.type === 'header' && (
                          <div className="bg-indigo-600 text-white p-3 text-center">
                            <Badge variant="secondary">Menu: {currentMenu.name}</Badge>
                          </div>
                        )}
                        
                        {/* Top */}
                        {currentMenu.position?.type === 'top' && (
                          <div className="bg-indigo-500 text-white p-2 text-center text-sm">
                            <Badge variant="secondary">Menu: {currentMenu.name}</Badge>
                          </div>
                        )}

                        {/* Content Area */}
                        <div className="flex">
                          {/* Left Sidebar */}
                          {(currentMenu.position?.type === 'left' || currentMenu.position?.type === 'sidebar') && (
                            <div className="w-48 bg-gray-200 p-3 text-center">
                              <Badge variant="secondary" className="text-xs">Menu: {currentMenu.name}</Badge>
                            </div>
                          )}

                          {/* Main Content */}
                          <div className="flex-1 p-6 text-center text-gray-400">
                            Conteúdo da Página
                          </div>

                          {/* Right Sidebar */}
                          {currentMenu.position?.type === 'right' && (
                            <div className="w-48 bg-gray-200 p-3 text-center">
                              <Badge variant="secondary" className="text-xs">Menu: {currentMenu.name}</Badge>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        {currentMenu.position?.type === 'footer' && (
                          <div className="bg-gray-800 text-white p-3 text-center">
                            <Badge variant="secondary">Menu: {currentMenu.name}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Display Tab */}
              <TabsContent value="display" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Controle de Exibição</CardTitle>
                    <CardDescription>
                      Configure em quais páginas o menu será exibido
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <Switch
                        checked={currentMenu.displaySettings?.showOnAllPages || false}
                        onCheckedChange={(checked) => {
                          const updated = menus.map(m => 
                            m.id === currentMenu.id
                              ? { 
                                  ...m, 
                                  displaySettings: { 
                                    ...m.displaySettings!, 
                                    showOnAllPages: checked,
                                    specificPages: checked ? [] : m.displaySettings?.specificPages,
                                    excludedPages: []
                                  } 
                                }
                              : m
                          );
                          saveMenus(updated);
                        }}
                      />
                      <div className="flex-1">
                        <Label>Exibir em Todas as Páginas</Label>
                        <p className="text-xs text-gray-600 mt-1">
                          O menu será exibido globalmente em todo o site
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <Switch
                        checked={currentMenu.displaySettings?.showOnHomepage || false}
                        onCheckedChange={(checked) => {
                          const updated = menus.map(m => 
                            m.id === currentMenu.id
                              ? { 
                                  ...m, 
                                  displaySettings: { 
                                    ...m.displaySettings!, 
                                    showOnHomepage: checked 
                                  } 
                                }
                              : m
                          );
                          saveMenus(updated);
                        }}
                      />
                      <div className="flex-1">
                        <Label>Exibir na Página Inicial</Label>
                        <p className="text-xs text-gray-600 mt-1">
                          O menu será visível na home/página inicial do site
                        </p>
                      </div>
                    </div>

                    {!currentMenu.displaySettings?.showOnAllPages && (
                      <div>
                        <Label>Páginas Específicas</Label>
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                          {pages.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              Nenhuma página criada ainda
                            </p>
                          ) : (
                            pages.map(page => {
                              const isIncluded = currentMenu.displaySettings?.specificPages?.includes(page.id) || false;
                              return (
                                <div key={page.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                  <Switch
                                    checked={isIncluded}
                                    onCheckedChange={(checked) => {
                                      const updated = menus.map(m => {
                                        if (m.id === currentMenu.id) {
                                          const specificPages = m.displaySettings?.specificPages || [];
                                          return {
                                            ...m,
                                            displaySettings: {
                                              ...m.displaySettings!,
                                              specificPages: checked
                                                ? [...specificPages, page.id]
                                                : specificPages.filter(id => id !== page.id)
                                            }
                                          };
                                        }
                                        return m;
                                      });
                                      saveMenus(updated);
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm">{page.title}</p>
                                    <p className="text-xs text-gray-500">{page.slug || page.id}</p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Selecione as páginas onde o menu deve aparecer
                        </p>
                      </div>
                    )}

                    {currentMenu.displaySettings?.showOnAllPages && (
                      <div>
                        <Label>Páginas Excluídas</Label>
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                          {pages.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              Nenhuma página criada ainda
                            </p>
                          ) : (
                            pages.map(page => {
                              const isExcluded = currentMenu.displaySettings?.excludedPages?.includes(page.id) || false;
                              return (
                                <div key={page.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                  <Switch
                                    checked={isExcluded}
                                    onCheckedChange={(checked) => {
                                      const updated = menus.map(m => {
                                        if (m.id === currentMenu.id) {
                                          const excludedPages = m.displaySettings?.excludedPages || [];
                                          return {
                                            ...m,
                                            displaySettings: {
                                              ...m.displaySettings!,
                                              excludedPages: checked
                                                ? [...excludedPages, page.id]
                                                : excludedPages.filter(id => id !== page.id)
                                            }
                                          };
                                        }
                                        return m;
                                      });
                                      saveMenus(updated);
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm">{page.title}</p>
                                    <p className="text-xs text-gray-500">{page.slug || page.id}</p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Selecione páginas onde o menu NÃO deve aparecer
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Responsive Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configurações Responsivas</CardTitle>
                    <CardDescription>
                      Controle a exibição do menu em diferentes dispositivos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                        <Layout className="w-8 h-8 text-gray-600" />
                        <Label className="text-center">Desktop</Label>
                        <Switch
                          checked={currentMenu.displaySettings?.responsive?.desktop !== false}
                          onCheckedChange={(checked) => {
                            const updated = menus.map(m => 
                              m.id === currentMenu.id
                                ? { 
                                    ...m, 
                                    displaySettings: { 
                                      ...m.displaySettings!, 
                                      responsive: {
                                        ...m.displaySettings?.responsive,
                                        desktop: checked
                                      }
                                    } 
                                  }
                                : m
                            );
                            saveMenus(updated);
                          }}
                        />
                      </div>

                      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                        <Layout className="w-6 h-6 text-gray-600" />
                        <Label className="text-center">Tablet</Label>
                        <Switch
                          checked={currentMenu.displaySettings?.responsive?.tablet !== false}
                          onCheckedChange={(checked) => {
                            const updated = menus.map(m => 
                              m.id === currentMenu.id
                                ? { 
                                    ...m, 
                                    displaySettings: { 
                                      ...m.displaySettings!, 
                                      responsive: {
                                        ...m.displaySettings?.responsive,
                                        tablet: checked
                                      }
                                    } 
                                  }
                                : m
                            );
                            saveMenus(updated);
                          }}
                        />
                      </div>

                      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                        <Layout className="w-4 h-4 text-gray-600" />
                        <Label className="text-center">Mobile</Label>
                        <Switch
                          checked={currentMenu.displaySettings?.responsive?.mobile !== false}
                          onCheckedChange={(checked) => {
                            const updated = menus.map(m => 
                              m.id === currentMenu.id
                                ? { 
                                    ...m, 
                                    displaySettings: { 
                                      ...m.displaySettings!, 
                                      responsive: {
                                        ...m.displaySettings?.responsive,
                                        mobile: checked
                                      }
                                    } 
                                  }
                                : m
                            );
                            saveMenus(updated);
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Card */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Resumo das Configurações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Posição:</span>
                      <span className="ml-2 font-medium">
                        {currentMenu.position?.type === 'header' && 'Cabeçalho'}
                        {currentMenu.position?.type === 'top' && 'Topo'}
                        {currentMenu.position?.type === 'right' && 'Lateral Direita'}
                        {currentMenu.position?.type === 'left' && 'Lateral Esquerda'}
                        {currentMenu.position?.type === 'footer' && 'Rodapé'}
                        {currentMenu.position?.type === 'sidebar' && 'Sidebar'}
                        {currentMenu.position?.type === 'custom' && `Personalizada (${currentMenu.position.customPosition})`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Alinhamento:</span>
                      <span className="ml-2 font-medium capitalize">
                        {currentMenu.position?.alignment || 'start'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Menu Fixo:</span>
                      <span className="ml-2 font-medium">
                        {currentMenu.position?.sticky ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Exibição:</span>
                      <span className="ml-2 font-medium">
                        {currentMenu.displaySettings?.showOnAllPages 
                          ? `Todas as páginas${currentMenu.displaySettings.excludedPages?.length ? ` (${currentMenu.displaySettings.excludedPages.length} excluídas)` : ''}`
                          : `${currentMenu.displaySettings?.specificPages?.length || 0} páginas específicas`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Página Inicial:</span>
                      <span className="ml-2 font-medium">
                        {currentMenu.displaySettings?.showOnHomepage ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Dispositivos:</span>
                      <span className="ml-2">
                        {currentMenu.displaySettings?.responsive?.desktop !== false && (
                          <Badge variant="secondary" className="mr-1">Desktop</Badge>
                        )}
                        {currentMenu.displaySettings?.responsive?.tablet !== false && (
                          <Badge variant="secondary" className="mr-1">Tablet</Badge>
                        )}
                        {currentMenu.displaySettings?.responsive?.mobile !== false && (
                          <Badge variant="secondary">Mobile</Badge>
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex gap-2 pt-4 border-t mt-4">
            <Button
              onClick={() => {
                setShowSettingsDialog(false);
                toast.success('Configurações salvas!');
              }}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Concluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}