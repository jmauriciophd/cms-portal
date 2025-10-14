import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Search, Edit, Trash, Eye, Layout } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { PageBuilder } from './PageBuilder';
import { toast } from 'sonner@2.0.3';

interface Page {
  id: string;
  title: string;
  slug: string;
  components: any[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
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
    if (page.id) {
      updatedPages = pages.map(p => p.id === page.id ? page : p);
      toast.success('Página atualizada com sucesso!');
    } else {
      const newPage = {
        ...page,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedPages = [newPage, ...pages];
      toast.success('Página criada com sucesso!');
    }
    savePages(updatedPages);
    setShowBuilder(false);
    setEditingPage(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta página?')) {
      const updatedPages = pages.filter(p => p.id !== id);
      savePages(updatedPages);
      toast.success('Página excluída com sucesso!');
    }
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
      <PageBuilder
        page={editingPage}
        onSave={handleSave}
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
              <CardDescription>/{page.slug}</CardDescription>
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
                  onClick={() => toast.info(`URL: /${page.slug}`)}
                >
                  <Eye className="w-4 h-4" />
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
