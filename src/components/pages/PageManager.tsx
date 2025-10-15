import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Search, Edit, Trash, Eye, Layout, ExternalLink, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { PageBuilder } from './PageBuilder';
import { UnifiedEditor } from '../editor/UnifiedEditor';
import { saveHTMLFile, deleteHTMLFile } from '../files/FileSystemHelper';
import { toast } from 'sonner@2.0.3';

interface Page {
  id: string;
  title: string;
  slug: string;
  components: any[];
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  meta?: {
    robots?: string;
    description?: string;
  };
}

interface PageManagerProps {
  currentUser: any;
}

export function PageManager({ currentUser }: PageManagerProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    loadPages();
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

  const savePages = (updatedPages: Page[]) => {
    localStorage.setItem('pages', JSON.stringify(updatedPages));
    setPages(updatedPages);
  };

  const handleCreateNew = () => {
    setEditingPage(null);
    setShowBuilder(true);
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setShowBuilder(true);
  };

  const handleSave = (page: Page) => {
    let updatedPages;
    const isNew = !page.id || !pages.some(p => p.id === page.id);
    
    if (isNew) {
      const newPage = {
        ...page,
        id: page.id || Date.now().toString(),
        createdAt: page.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedPages = [newPage, ...pages];
      toast.success('Página criada com sucesso!');
      
      // Salva arquivo HTML automaticamente
      saveHTMLFile({
        type: 'page',
        id: newPage.id,
        title: newPage.title,
        slug: newPage.slug,
        components: newPage.components || [],
        meta: newPage.meta
      });
    } else {
      updatedPages = pages.map(p => p.id === page.id ? page : p);
      toast.success('Página atualizada com sucesso!');
      
      // Atualiza arquivo HTML
      saveHTMLFile({
        type: 'page',
        id: page.id,
        title: page.title,
        slug: page.slug,
        components: page.components || [],
        meta: page.meta
      });
    }
    
    savePages(updatedPages);
    setShowBuilder(false);
    setEditingPage(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta página?')) {
      const page = pages.find(p => p.id === id);
      const updatedPages = pages.filter(p => p.id !== id);
      savePages(updatedPages);
      
      // Remove arquivo HTML também
      if (page) {
        deleteHTMLFile({
          type: 'page',
          slug: page.slug
        });
      }
      
      toast.success('Página excluída com sucesso!');
    }
  };

  const handlePreview = (slug: string) => {
    // Abrir em nova aba
    const url = `/${slug}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(pages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pages-${Date.now()}.json`;
    link.click();
    toast.success('Páginas exportadas com sucesso!');
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showBuilder) {
    return (
      <UnifiedEditor
        type="page"
        initialTitle={editingPage?.title || ''}
        initialSlug={editingPage?.slug || ''}
        initialComponents={editingPage?.components || []}
        initialStatus={editingPage?.status as any || 'draft'}
        initialScheduledDate={editingPage?.scheduledDate}
        initialMeta={editingPage?.meta}
        onSave={(data) => {
          const updatedPage: Page = {
            id: editingPage?.id || Date.now().toString(),
            title: data.title,
            slug: data.slug,
            components: data.components,
            status: data.status as any,
            scheduledDate: data.scheduledDate,
            meta: data.meta,
            createdAt: editingPage?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          handleSave(updatedPage);
        }}
        onCancel={() => {
          setShowBuilder(false);
          setEditingPage(null);
        }}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Gerenciamento de Páginas</h1>
          <p className="text-gray-600">Crie páginas personalizadas com editor visual</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportJSON}>
            Exportar JSON
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Página
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar páginas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="flex-1">{page.title}</CardTitle>
                <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                  {page.status === 'published' ? 'Publicado' : 'Rascunho'}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <span className="text-indigo-600 hover:underline cursor-pointer" onClick={() => handlePreview(page.slug)}>
                  /{page.slug}
                </span>
                <button 
                  onClick={() => handleCopyLink(page.slug)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copiar link"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Layout className="w-4 h-4" />
                <span>{page.components?.length || 0} componentes</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(page)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePreview(page.slug)}
                  title="Visualizar página"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(page.id)}
                  className="text-red-600"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma página encontrada</p>
        </div>
      )}
    </div>
  );
}
