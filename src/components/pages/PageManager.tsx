import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Eye, 
  Layout, 
  ExternalLink, 
  Copy,
  Grid3x3,
  List,
  FolderPlus,
  ChevronRight,
  Folder,
  File,
  Home,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { PageEditor } from './PageEditor';
import { saveHTMLFile, deleteHTMLFile } from '../files/FileSystemHelper';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbList, BreadcrumbPage } from '../ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';
import { LinkManagementService } from '../../services/LinkManagementService';
import { initializePageTemplate } from '../../utils/pageTemplates';
import { ItemContextMenu } from '../common/ContextMenu';
import { MoveDialog, RenameDialog, HistoryDialog, PropertiesDialog } from '../common/ItemDialogs';
import { pageOperations } from '../common/ItemOperations';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  folder?: string; // Caminho da pasta (ex: "projetos/website")
  template?: string;
  meta?: {
    robots?: string;
    description?: string;
  };
  name?: string; // Para compatibilidade com ItemOperations
  path?: string; // Para compatibilidade com ItemOperations
  type?: string; // Para compatibilidade com ItemOperations
}

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'page';
  path: string;
  createdAt: string;
  updatedAt: string;
  page?: Page;
}

interface PageManagerProps {
  currentUser: any;
}

export function PageManager({ currentUser }: PageManagerProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Estados para os diálogos
  const [moveDialog, setMoveDialog] = useState<{ open: boolean; item: Page | null }>({ open: false, item: null });
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; item: Page | null }>({ open: false, item: null });
  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; item: Page | null }>({ open: false, item: null });
  const [propertiesDialog, setPropertiesDialog] = useState<{ open: boolean; item: Page | null }>({ open: false, item: null });
  
  // Snippets disponíveis
  const [availableSnippets] = useState([
    { id: '1', name: 'Botão CTA', content: '<button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Clique Aqui</button>' },
    { id: '2', name: 'Card Simples', content: '<div class="bg-white p-6 rounded-lg shadow-md"><h3 class="font-semibold mb-2">Título</h3><p>Conteúdo do card</p></div>' },
    { id: '3', name: 'Lista com Ícones', content: '<ul class="space-y-2"><li>✓ Item 1</li><li>✓ Item 2</li><li>✓ Item 3</li></ul>' }
  ]);
  
  // Imagens disponíveis (exemplo)
  const [availableImages] = useState([
    { id: '1', name: 'Banner', url: 'https://via.placeholder.com/1200x400' },
    { id: '2', name: 'Logo', url: 'https://via.placeholder.com/300x100' },
    { id: '3', name: 'Thumbnail', url: 'https://via.placeholder.com/600x400' }
  ]);

  useEffect(() => {
    loadPages();
    loadFolders();
  }, []);

  const loadPages = () => {
    const stored = localStorage.getItem('pages');
    if (stored) {
      setPages(JSON.parse(stored));
    } else {
      const samplePages: Page[] = [
        {
          id: '1',
          title: 'Página Inicial',
          slug: 'home',
          folder: '',
          components: [
            { id: '1', type: 'hero', content: { title: 'Bem-vindo', subtitle: 'Ao nosso portal' } },
            { id: '2', type: 'text', content: { text: 'Conteúdo da página inicial' } }
          ],
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('pages', JSON.stringify(samplePages));
      setPages(samplePages);
    }
  };

  const loadFolders = () => {
    const stored = localStorage.getItem('page-folders');
    if (stored) {
      setFolders(JSON.parse(stored));
    } else {
      setFolders([]);
    }
  };

  const savePages = (updatedPages: Page[]) => {
    localStorage.setItem('pages', JSON.stringify(updatedPages));
    setPages(updatedPages);
  };

  const saveFolders = (updatedFolders: FolderItem[]) => {
    localStorage.setItem('page-folders', JSON.stringify(updatedFolders));
    setFolders(updatedFolders);
  };

  const getCurrentItems = (): FolderItem[] => {
    const items: FolderItem[] = [];
    
    // Adicionar pastas no caminho atual
    const currentFolders = folders.filter(f => {
      const folderPath = f.path.substring(0, f.path.lastIndexOf('/')) || '';
      return folderPath === currentPath && f.type === 'folder';
    });
    items.push(...currentFolders);

    // Adicionar páginas no caminho atual
    const currentPages = pages.filter(p => (p.folder || '') === currentPath);
    currentPages.forEach(page => {
      items.push({
        id: page.id,
        name: page.title,
        type: 'page',
        path: currentPath,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        page: page
      });
    });

    return items;
  };

  const filteredItems = getCurrentItems().filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFolder = () => {
    const folderName = prompt('Nome da pasta:');
    if (!folderName) return;

    const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    
    // Verificar se já existe
    if (folders.some(f => f.path === folderPath)) {
      toast.error('Já existe uma pasta com este nome');
      return;
    }

    const newFolder: FolderItem = {
      id: Date.now().toString(),
      name: folderName,
      type: 'folder',
      path: folderPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveFolders([...folders, newFolder]);
    toast.success(`Pasta "${folderName}" criada!`);
  };

  const handleCreatePage = () => {
    setEditingPage({
      id: '',
      title: '',
      slug: '',
      content: '<h2>Bem-vindo à Nova Página</h2><p>Comece a editar o conteúdo...</p>',
      excerpt: '',
      featuredImage: '',
      folder: currentPath,
      template: 'default',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setShowEditor(true);
  };

  const handleNavigate = (item: FolderItem) => {
    if (item.type === 'folder') {
      setCurrentPath(item.path);
    } else if (item.page) {
      handleEdit(item.page);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setShowEditor(true);
  };

  const handleSave = (page: Page) => {
    let updatedPages;
    const isNew = !page.id || !pages.some(p => p.id === page.id);
    
    if (isNew) {
      const newPage = {
        ...page,
        id: page.id || Date.now().toString(),
        folder: currentPath,
        createdAt: page.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedPages = [newPage, ...pages];
      toast.success('Página criada com sucesso!');
      
      // Salva arquivo HTML
      saveHTMLFile({
        type: 'page',
        id: newPage.id,
        title: newPage.title,
        slug: newPage.slug,
        content: newPage.content,
        folder: currentPath
      });

      // Gera link automaticamente
      LinkManagementService.createLinkForResource({
        title: newPage.title,
        slug: newPage.slug,
        resourceType: 'page',
        resourceId: newPage.id,
        folder: currentPath,
        description: page.excerpt || `Página: ${newPage.title}`,
        metadata: {
          status: newPage.status,
          template: newPage.template
        }
      });
    } else {
      updatedPages = pages.map(p => 
        p.id === page.id 
          ? { ...page, updatedAt: new Date().toISOString() }
          : p
      );
      toast.success('Página atualizada!');
      
      // Atualiza arquivo HTML
      saveHTMLFile({
        type: 'page',
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        folder: page.folder || ''
      });

      // Atualiza link se título/slug/pasta mudaram
      LinkManagementService.updateLinkForResource({
        resourceId: page.id,
        newSlug: page.slug,
        newTitle: page.title,
        newFolder: page.folder
      });
    }
    
    savePages(updatedPages);
    setShowEditor(false);
    setEditingPage(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Deseja excluir esta página?')) return;
    
    const page = pages.find(p => p.id === id);
    if (page) {
      const updatedPages = pages.filter(p => p.id !== id);
      savePages(updatedPages);
      deleteHTMLFile(page.slug, 'page');
      
      // Deleta links associados
      LinkManagementService.deleteLinksForResource(id);
      
      toast.success('Página excluída!');
    }
  };

  const handleDeleteFolder = (path: string) => {
    // Verificar se tem conteúdo
    const hasPages = pages.some(p => p.folder === path || p.folder?.startsWith(path + '/'));
    const hasSubfolders = folders.some(f => f.path.startsWith(path + '/'));
    
    if (hasPages || hasSubfolders) {
      toast.error('A pasta não está vazia. Remova o conteúdo primeiro.');
      return;
    }

    if (!confirm('Deseja excluir esta pasta?')) return;

    const updatedFolders = folders.filter(f => f.path !== path);
    saveFolders(updatedFolders);
    toast.success('Pasta excluída!');
  };

  const getBreadcrumbItems = () => {
    const items: { label: string; path: string }[] = [
      { label: 'Início', path: '' },
      { label: 'Arquivos', path: '' },
      { label: 'páginas', path: '' }
    ];

    if (currentPath) {
      const parts = currentPath.split('/');
      let accumulatedPath = '';
      parts.forEach(part => {
        accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
        items.push({ label: part, path: accumulatedPath });
      });
    }

    return items;
  };

  // Funções do menu de contexto
  const handleContextCopy = (page: Page) => {
    const pageItem = { ...page, name: page.title, path: page.folder, type: 'page' };
    pageOperations.copyItem(pageItem);
  };

  const handleContextMove = (page: Page) => {
    setMoveDialog({ open: true, item: page });
  };

  const handleContextRename = (page: Page) => {
    setRenameDialog({ open: true, item: page });
  };

  const handleContextHistory = (page: Page) => {
    setHistoryDialog({ open: true, item: page });
  };

  const handleContextCopyPath = (page: Page) => {
    const pageItem = { ...page, name: page.title, path: page.folder, type: 'page' };
    pageOperations.copyPath(pageItem);
  };

  const handleContextProperties = (page: Page) => {
    setPropertiesDialog({ open: true, item: page });
  };

  const handleContextDelete = (page: Page) => {
    handleDelete(page.id);
  };

  const handleMoveConfirm = (newPath: string) => {
    if (moveDialog.item) {
      const pageItem = { ...moveDialog.item, name: moveDialog.item.title, path: moveDialog.item.folder, type: 'page' };
      const updated = pageOperations.moveItem(pageItem, newPath);
      
      const updatedPage: Page = {
        ...moveDialog.item,
        folder: newPath,
        updatedAt: updated.updatedAt
      };
      
      const updatedPages = pages.map(p => p.id === updatedPage.id ? updatedPage : p);
      savePages(updatedPages);
    }
  };

  const handleRenameConfirm = (newName: string) => {
    if (renameDialog.item) {
      const pageItem = { ...renameDialog.item, name: renameDialog.item.title, path: renameDialog.item.folder, type: 'page' };
      const updated = pageOperations.renameItem(pageItem, newName);
      
      const updatedPage: Page = {
        ...renameDialog.item,
        title: newName,
        updatedAt: updated.updatedAt
      };
      
      const updatedPages = pages.map(p => p.id === updatedPage.id ? updatedPage : p);
      savePages(updatedPages);
    }
  };

  const handleHistoryRestore = (entry: any) => {
    const restored = pageOperations.restoreFromHistory(entry);
    if (restored) {
      toast.success('Versão restaurada do histórico');
    }
  };

  // Obter pastas disponíveis para mover
  const getAvailablePaths = (): string[] => {
    return folders
      .filter(f => f.type === 'folder')
      .map(f => f.path)
      .filter(path => path !== moveDialog.item?.folder);
  };

  if (showEditor) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <PageEditor
          page={editingPage}
          onSave={handleSave}
          onBack={() => {
            setShowEditor(false);
            setEditingPage(null);
          }}
          availableSnippets={availableSnippets}
          availableImages={availableImages}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Gerenciamento de Páginas</h1>
            <p className="text-gray-600">Organize suas páginas com segurança</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              {getBreadcrumbItems().map((item, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="w-4 h-4" />
                    </BreadcrumbSeparator>
                  )}
                  {index === 0 ? (
                    <BreadcrumbItem>
                      <BreadcrumbLink 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => setCurrentPath('')}
                      >
                        <Home className="w-4 h-4" />
                        {item.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  ) : index === getBreadcrumbItems().length - 1 ? (
                    <BreadcrumbItem>
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    </BreadcrumbItem>
                  ) : (
                    <BreadcrumbItem>
                      <BreadcrumbLink 
                        className="cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => {
                          // Se for "Início", "Arquivos" ou "páginas" → voltar para raiz
                          if (index <= 2) {
                            setCurrentPath('');
                          } else {
                            // Pasta específica → navegar para aquele path
                            setCurrentPath(item.path);
                          }
                        }}
                      >
                        {item.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar páginas e pastas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2 border rounded-lg p-1 bg-white">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateFolder}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Nova Pasta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreatePage}>
                <Layout className="w-4 h-4 mr-2" />
                Nova Página
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ItemContextMenu
              key={item.id}
              actions={item.type === 'page' && item.page ? {
                onCopy: () => handleContextCopy(item.page!),
                onMove: () => handleContextMove(item.page!),
                onRename: () => handleContextRename(item.page!),
                onHistory: () => handleContextHistory(item.page!),
                onCopyPath: () => handleContextCopyPath(item.page!),
                onProperties: () => handleContextProperties(item.page!),
                onDelete: () => handleContextDelete(item.page!)
              } : {}}
              disabled={item.type === 'folder'}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => handleNavigate(item)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {item.type === 'folder' ? (
                      <Folder className="w-12 h-12 text-blue-500" />
                    ) : (
                      <Layout className="w-12 h-12 text-purple-500" />
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {item.type === 'folder' ? (
                          <>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(item);
                            }}>
                              <Folder className="w-4 h-4 mr-2" />
                              Abrir
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(item.path);
                              }}
                              className="text-red-600"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              if (item.page) handleEdit(item.page);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1 truncate">
                    {item.name}
                  </h3>

                  {item.type === 'page' && item.page && (
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        item.page.status === 'published' ? 'default' :
                        item.page.status === 'scheduled' ? 'secondary' : 'outline'
                      }>
                        {item.page.status === 'published' ? 'Publicada' :
                         item.page.status === 'scheduled' ? 'Agendada' : 'Rascunho'}
                      </Badge>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            </ItemContextMenu>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma página encontrada</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleCreatePage}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira página
              </Button>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modificado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleNavigate(item)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {item.type === 'folder' ? (
                          <Folder className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Layout className="w-5 h-5 text-purple-500" />
                        )}
                        <span className="font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.type === 'page' && item.page && (
                        <Badge variant={
                          item.page.status === 'published' ? 'default' :
                          item.page.status === 'scheduled' ? 'secondary' : 'outline'
                        }>
                          {item.page.status === 'published' ? 'Publicada' :
                           item.page.status === 'scheduled' ? 'Agendada' : 'Rascunho'}
                        </Badge>
                      )}
                      {item.type === 'folder' && (
                        <span className="text-gray-500 text-sm">Pasta</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.updatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {item.type === 'page' && item.page && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item.page!)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {item.type === 'folder' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFolder(item.path)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhuma página encontrada</p>
                <Button 
                  variant="outline"
                  onClick={handleCreatePage}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira página
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diálogos */}
      <MoveDialog
        open={moveDialog.open}
        onOpenChange={(open) => setMoveDialog({ open, item: null })}
        item={moveDialog.item ? { ...moveDialog.item, name: moveDialog.item.title, path: moveDialog.item.folder, type: 'page' } : null}
        availablePaths={getAvailablePaths()}
        onConfirm={handleMoveConfirm}
      />

      <RenameDialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog({ open, item: null })}
        item={renameDialog.item ? { ...renameDialog.item, name: renameDialog.item.title, path: renameDialog.item.folder, type: 'page' } : null}
        onConfirm={handleRenameConfirm}
      />

      <HistoryDialog
        open={historyDialog.open}
        onOpenChange={(open) => setHistoryDialog({ open, item: null })}
        item={historyDialog.item ? { ...historyDialog.item, name: historyDialog.item.title, path: historyDialog.item.folder, type: 'page' } : null}
        history={historyDialog.item ? pageOperations.getHistory(historyDialog.item.id) : []}
        onRestore={handleHistoryRestore}
      />

      <PropertiesDialog
        open={propertiesDialog.open}
        onOpenChange={(open) => setPropertiesDialog({ open, item: null })}
        item={propertiesDialog.item ? { ...propertiesDialog.item, name: propertiesDialog.item.title, path: propertiesDialog.item.folder, type: 'page' } : null}
        additionalInfo={propertiesDialog.item ? {
          'Slug': propertiesDialog.item.slug,
          'Status': propertiesDialog.item.status,
          'Template': propertiesDialog.item.template || 'default',
          'Resumo': propertiesDialog.item.excerpt || 'Não definido'
        } : undefined}
      />
    </div>
  );
}
