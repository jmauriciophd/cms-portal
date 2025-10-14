import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Search, Edit, Trash, Eye, FileText, Layout } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ArticleEditor } from './ArticleEditor';
import { UnifiedEditor } from '../editor/UnifiedEditor';
import { TemplateManager } from '../templates/TemplateManager';
import { toast } from 'sonner@2.0.3';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  slug: string;
  categories?: string[];
  featuredImage?: string;
  scheduledDate?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  components?: any[];
  meta?: {
    robots?: string;
    description?: string;
  };
}

interface ArticleManagerProps {
  currentUser: any;
}

export function ArticleManager({ currentUser }: ArticleManagerProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = () => {
    const stored = localStorage.getItem('articles');
    if (stored) {
      setArticles(JSON.parse(stored));
    } else {
      // Initialize with sample data
      const sampleArticles: Article[] = [
        {
          id: '1',
          title: 'Bem-vindo ao Portal CMS',
          summary: 'Conheça as principais funcionalidades do nosso sistema de gerenciamento de conteúdo.',
          content: '<h2>Introdução</h2><p>Este é o sistema mais completo de gerenciamento de portal.</p>',
          author: 'Admin',
          status: 'published',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          slug: 'bem-vindo-ao-portal-cms'
        },
        {
          id: '2',
          title: 'Tutorial de Configuração',
          summary: 'Aprenda a configurar seu portal em poucos passos.',
          content: '<h2>Passo a Passo</h2><p>Siga estas instruções para configurar tudo.</p>',
          author: 'Editor',
          status: 'draft',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          slug: 'tutorial-de-configuracao'
        }
      ];
      localStorage.setItem('articles', JSON.stringify(sampleArticles));
      setArticles(sampleArticles);
    }
  };

  const saveArticles = (updatedArticles: Article[]) => {
    localStorage.setItem('articles', JSON.stringify(updatedArticles));
    setArticles(updatedArticles);
  };

  const handleCreateNew = () => {
    setEditingArticle(null);
    setShowEditor(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const handleSave = (article: Article) => {
    let updatedArticles;
    if (article.id) {
      updatedArticles = articles.map(a => a.id === article.id ? article : a);
      toast.success('Matéria atualizada com sucesso!');
    } else {
      const newArticle = {
        ...article,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedArticles = [newArticle, ...articles];
      toast.success('Matéria criada com sucesso!');
    }
    saveArticles(updatedArticles);
    setShowEditor(false);
    setEditingArticle(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta matéria?')) {
      const updatedArticles = articles.filter(a => a.id !== id);
      saveArticles(updatedArticles);
      toast.success('Matéria excluída com sucesso!');
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(articles, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `articles-${Date.now()}.json`;
    link.click();
    toast.success('Artigos exportados com sucesso!');
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showEditor) {
    return (
      <UnifiedEditor
        type="article"
        initialTitle={editingArticle?.title || ''}
        initialSlug={editingArticle?.slug || ''}
        initialComponents={editingArticle?.components || []}
        initialStatus={editingArticle?.status as any || 'draft'}
        initialScheduledDate={editingArticle?.scheduledDate}
        initialMeta={editingArticle?.meta}
        onSave={(data) => {
          const updatedArticle: Article = {
            ...editingArticle,
            id: editingArticle?.id || Date.now().toString(),
            title: data.title,
            slug: data.slug,
            components: data.components,
            status: data.status as any,
            scheduledDate: data.scheduledDate,
            meta: data.meta,
            content: JSON.stringify(data.components),
            summary: data.meta?.description || editingArticle?.summary || '',
            author: currentUser.name,
            createdAt: editingArticle?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          handleSave(updatedArticle);
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingArticle(null);
        }}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Gerenciamento de Matérias</h1>
          <p className="text-gray-600">Crie e gerencie notícias e artigos do portal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportJSON}>
            Exportar JSON
          </Button>
          <Button variant="outline" onClick={() => setShowTemplateSelector(true)}>
            <Layout className="w-4 h-4 mr-2" />
            Usar Template
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Matéria
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar matérias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Articles List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="flex-1">{article.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={
                    article.status === 'published' ? 'default' : 
                    article.status === 'scheduled' ? 'secondary' :
                    article.status === 'pending' ? 'outline' : 
                    'secondary'
                  }>
                    {article.status === 'published' ? 'Publicado' : 
                     article.status === 'scheduled' ? 'Agendado' :
                     article.status === 'pending' ? 'Pendente' : 
                     'Rascunho'}
                  </Badge>
                  {article.approvalStatus && article.approvalStatus !== 'pending' && (
                    <Badge variant={article.approvalStatus === 'approved' ? 'default' : 'destructive'}>
                      {article.approvalStatus === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription>{article.summary}</CardDescription>
              {article.categories && article.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {article.categories.map(cat => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Por {article.author}</span>
                <span>{new Date(article.updatedAt).toLocaleDateString('pt-BR')}</span>
              </div>
              {article.scheduledDate && (
                <div className="text-xs text-gray-600 mb-2">
                  📅 Agendado para: {new Date(article.scheduledDate).toLocaleString('pt-BR')}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info(`URL: /artigos/${article.slug}`)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(article.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma matéria encontrada</p>
        </div>
      )}

      {/* Template Selector Modal */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Selecionar Template</DialogTitle>
            <DialogDescription>
              Escolha um template para iniciar sua matéria
            </DialogDescription>
          </DialogHeader>
          <TemplateManager
            type="article"
            onSelectTemplate={(template) => {
              const newArticle: Article = {
                id: Date.now().toString(),
                title: 'Nova Matéria',
                summary: '',
                content: JSON.stringify(template.components),
                author: currentUser.name,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                slug: `nova-materia-${Date.now()}`
              };
              setEditingArticle(newArticle);
              setShowTemplateSelector(false);
              setShowEditor(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
