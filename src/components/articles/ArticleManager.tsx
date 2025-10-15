import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash,
  FileText,
  Grid3x3,
  List,
  FolderPlus,
  ChevronRight,
  Folder,
  Home
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArticleEditor } from './ArticleEditor';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbList, BreadcrumbPage } from '../ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';
import { LinkManagementService } from '../../services/LinkManagementService';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  categories: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  folder?: string; // Caminho da pasta
}

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'article';
  path: string;
  createdAt: string;
  updatedAt: string;
  article?: Article;
}

interface ArticleManagerProps {
  currentUser: any;
}

export function ArticleManager({ currentUser }: ArticleManagerProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadArticles();
    loadFolders();
  }, []);

  const loadArticles = () => {
    const stored = localStorage.getItem('articles');
    if (stored) {
      setArticles(JSON.parse(stored));
    } else {
      const sampleArticles: Article[] = [
        {
          id: '1',
          title: 'Bem-vindo ao CMS',
          slug: 'bem-vindo-ao-cms',
          folder: '',
          content: '<p>Este é seu primeiro artigo.</p>',
          excerpt: 'Primeiro artigo do sistema',
          author: currentUser?.name || 'Admin',
          status: 'published',
          categories: ['Geral'],
          tags: ['início'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('articles', JSON.stringify(sampleArticles));
      setArticles(sampleArticles);
    }
  };

  const loadFolders = () => {
    const stored = localStorage.getItem('article-folders');
    if (stored) {
      setFolders(JSON.parse(stored));
    } else {
      setFolders([]);
    }
  };

  const saveArticles = (updatedArticles: Article[]) => {
    localStorage.setItem('articles', JSON.stringify(updatedArticles));
    setArticles(updatedArticles);
  };

  const saveFolders = (updatedFolders: FolderItem[]) => {
    localStorage.setItem('article-folders', JSON.stringify(updatedFolders));
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

    // Adicionar artigos no caminho atual
    const currentArticles = articles.filter(a => (a.folder || '') === currentPath);
    currentArticles.forEach(article => {
      items.push({
        id: article.id,
        name: article.title,
        type: 'article',
        path: currentPath,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        article: article
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

  const handleCreateArticle = () => {
    setEditingArticle({
      id: '',
      title: '',
      slug: '',
      folder: currentPath,
      content: '',
      excerpt: '',
      author: currentUser?.name || 'Admin',
      status: 'draft',
      categories: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setShowEditor(true);
  };

  const handleNavigate = (item: FolderItem) => {
    if (item.type === 'folder') {
      setCurrentPath(item.path);
    } else if (item.article) {
      handleEdit(item.article);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const handleSave = (article: Article) => {
    let updatedArticles;
    const isNew = !article.id || !articles.some(a => a.id === article.id);
    
    if (isNew) {
      const newArticle = {
        ...article,
        id: article.id || Date.now().toString(),
        folder: currentPath,
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedArticles = [newArticle, ...articles];
      toast.success('Matéria criada com sucesso!');

      // Gera link automaticamente
      LinkManagementService.createLinkForResource({
        title: newArticle.title,
        slug: newArticle.slug,
        resourceType: 'article',
        resourceId: newArticle.id,
        folder: currentPath,
        description: `Matéria: ${newArticle.title}`,
        metadata: {
          status: newArticle.status,
          author: newArticle.author,
          categories: newArticle.categories,
          tags: newArticle.tags
        }
      });
    } else {
      updatedArticles = articles.map(a => 
        a.id === article.id 
          ? { ...article, updatedAt: new Date().toISOString() }
          : a
      );
      toast.success('Matéria atualizada!');

      // Atualiza link
      LinkManagementService.updateLinkForResource({
        resourceId: article.id,
        newSlug: article.slug,
        newTitle: article.title,
        newFolder: article.folder
      });
    }
    
    saveArticles(updatedArticles);
    setShowEditor(false);
    setEditingArticle(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Deseja excluir esta matéria?')) return;
    
    const updatedArticles = articles.filter(a => a.id !== id);
    saveArticles(updatedArticles);
    
    // Deleta links associados
    LinkManagementService.deleteLinksForResource(id);
    
    toast.success('Matéria excluída!');
  };

  const handleDeleteFolder = (path: string) => {
    const hasArticles = articles.some(a => a.folder === path || a.folder?.startsWith(path + '/'));
    const hasSubfolders = folders.some(f => f.path.startsWith(path + '/'));
    
    if (hasArticles || hasSubfolders) {
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
      { label: 'matérias', path: '' }
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

  if (showEditor) {
    return (
      <div className="h-full">
        <ArticleEditor
          article={editingArticle || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingArticle(null);
          }}
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
            <h1 className="text-gray-900 mb-2">Gerenciamento de Matérias</h1>
            <p className="text-gray-600">Organize suas matérias e notícias com segurança</p>
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
                          // Correção: navegação correta
                          if (index === 0 || index === 1 || index === 2) {
                            // Início, Arquivos ou matérias → raiz
                            setCurrentPath('');
                          } else {
                            // Pasta específica → navegar
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
              placeholder="Buscar matérias e pastas..."
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
              <DropdownMenuItem onClick={handleCreateArticle}>
                <FileText className="w-4 h-4 mr-2" />
                Nova Matéria
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => handleNavigate(item)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {item.type === 'folder' ? (
                    <Folder className="w-12 h-12 text-blue-500" />
                  ) : (
                    <FileText className="w-12 h-12 text-green-500" />
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        •••
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
                            if (item.article) handleEdit(item.article);
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

                {item.type === 'article' && item.article && (
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      item.article.status === 'published' ? 'default' :
                      item.article.status === 'scheduled' ? 'secondary' : 'outline'
                    }>
                      {item.article.status === 'published' ? 'Publicada' :
                       item.article.status === 'scheduled' ? 'Agendada' : 'Rascunho'}
                    </Badge>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma matéria encontrada</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleCreateArticle}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira matéria
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
                          <FileText className="w-5 h-5 text-green-500" />
                        )}
                        <span className="font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.type === 'article' && item.article && (
                        <Badge variant={
                          item.article.status === 'published' ? 'default' :
                          item.article.status === 'scheduled' ? 'secondary' : 'outline'
                        }>
                          {item.article.status === 'published' ? 'Publicada' :
                           item.article.status === 'scheduled' ? 'Agendada' : 'Rascunho'}
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
                        {item.type === 'article' && item.article && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item.article!)}
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
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhuma matéria encontrada</p>
                <Button 
                  variant="outline"
                  onClick={handleCreateArticle}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira matéria
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Article Editor Dialog */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <ArticleEditor
              article={editingArticle}
              onSave={handleSaveArticle}
              onCancel={() => {
                setShowEditor(false);
                setEditingArticle(null);
              }}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}
    </div>
  );
}
