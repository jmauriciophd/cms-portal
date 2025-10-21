import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash, 
  Copy,
  FileText,
  Code,
  Eye
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';

export interface Snippet {
  id: string;
  name: string;
  description?: string;
  content: string;
  category: 'html' | 'text' | 'component' | 'custom';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const SNIPPET_CATEGORIES = [
  { value: 'html', label: 'HTML' },
  { value: 'text', label: 'Texto' },
  { value: 'component', label: 'Componente' },
  { value: 'custom', label: 'Personalizado' }
];

interface SnippetManagerProps {
  currentUser?: any;
}

export function SnippetManager({ currentUser }: SnippetManagerProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [previewSnippet, setPreviewSnippet] = useState<Snippet | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Snippet['category']>('html');

  useEffect(() => {
    loadSnippets();
  }, []);

  useEffect(() => {
    // Listener para abrir snippet da pesquisa global
    const handleSelectItem = (e: CustomEvent) => {
      const { itemId, viewId } = e.detail;
      if (viewId === 'snippets') {
        const snippetToEdit = snippets.find(s => s.id === itemId);
        if (snippetToEdit) {
          setEditingSnippet(snippetToEdit);
          setName(snippetToEdit.name);
          setDescription(snippetToEdit.description || '');
          setContent(snippetToEdit.content);
          setCategory(snippetToEdit.category);
          setShowEditDialog(true);
          toast.success(`Editando snippet: ${snippetToEdit.name}`);
        }
      }
    };

    window.addEventListener('selectItem', handleSelectItem as EventListener);

    return () => {
      window.removeEventListener('selectItem', handleSelectItem as EventListener);
    };
  }, [snippets]);

  const loadSnippets = () => {
    const stored = localStorage.getItem('snippets');
    if (stored) {
      setSnippets(JSON.parse(stored));
    } else {
      // Default snippets
      const defaultSnippets: Snippet[] = [
        {
          id: '1',
          name: 'Assinatura do Editor',
          description: 'Assinatura padrão para artigos',
          content: '<div class="signature"><p><em>Equipe Editorial - Portal de Notícias</em></p></div>',
          category: 'html',
          createdBy: 'Admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Aviso Legal',
          description: 'Disclaimer padrão',
          content: '<div class="legal-notice"><p><strong>Aviso:</strong> Este conteúdo é apenas para fins informativos.</p></div>',
          category: 'html',
          createdBy: 'Admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('snippets', JSON.stringify(defaultSnippets));
      setSnippets(defaultSnippets);
    }
  };

  const saveSnippets = (updatedSnippets: Snippet[]) => {
    localStorage.setItem('snippets', JSON.stringify(updatedSnippets));
    setSnippets(updatedSnippets);
  };

  const handleCreate = () => {
    if (!name.trim() || !content.trim()) {
      toast.error('Nome e conteúdo são obrigatórios');
      return;
    }

    const newSnippet: Snippet = {
      id: Date.now().toString(),
      name,
      description,
      content,
      category,
      createdBy: currentUser?.name || 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveSnippets([...snippets, newSnippet]);
    resetForm();
    setShowCreateDialog(false);
    toast.success('Snippet criado com sucesso!');
  };

  const handleUpdate = () => {
    if (!editingSnippet || !name.trim() || !content.trim()) {
      toast.error('Nome e conteúdo são obrigatórios');
      return;
    }

    const updated: Snippet = {
      ...editingSnippet,
      name,
      description,
      content,
      category,
      updatedAt: new Date().toISOString()
    };

    const updatedSnippets = snippets.map(s => s.id === updated.id ? updated : s);
    saveSnippets(updatedSnippets);
    resetForm();
    setShowEditDialog(false);
    setEditingSnippet(null);
    toast.success('Snippet atualizado com sucesso!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este snippet?')) return;

    const updatedSnippets = snippets.filter(s => s.id !== id);
    saveSnippets(updatedSnippets);
    toast.success('Snippet excluído com sucesso!');
  };

  const handleDuplicate = (snippet: Snippet) => {
    const duplicated: Snippet = {
      ...snippet,
      id: Date.now().toString(),
      name: `${snippet.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveSnippets([...snippets, duplicated]);
    toast.success('Snippet duplicado com sucesso!');
  };

  const openEditDialog = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setName(snippet.name);
    setDescription(snippet.description || '');
    setContent(snippet.content);
    setCategory(snippet.category);
    setShowEditDialog(true);
  };

  const openPreviewDialog = (snippet: Snippet) => {
    setPreviewSnippet(snippet);
    setShowPreviewDialog(true);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setContent('');
    setCategory('html');
  };

  const filteredSnippets = filterCategory === 'all'
    ? snippets
    : snippets.filter(s => s.category === filterCategory);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Snippets Reutilizáveis</h1>
          <p className="text-gray-600">Crie blocos de conteúdo para reutilizar em artigos</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Snippet
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filterCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterCategory('all')}
        >
          Todos ({snippets.length})
        </Button>
        {SNIPPET_CATEGORIES.map(cat => {
          const count = snippets.filter(s => s.category === cat.value).length;
          return (
            <Button
              key={cat.value}
              variant={filterCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(cat.value)}
            >
              {cat.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Snippets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSnippets.map(snippet => (
          <Card key={snippet.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{snippet.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {snippet.description || 'Sem descrição'}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {SNIPPET_CATEGORIES.find(c => c.value === snippet.category)?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gray-50 p-3 rounded text-xs font-mono h-20 overflow-hidden">
                {snippet.content.substring(0, 100)}
                {snippet.content.length > 100 && '...'}
              </div>

              <div className="text-xs text-gray-500">
                <p>Por: {snippet.createdBy}</p>
                <p>Criado: {new Date(snippet.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openPreviewDialog(snippet)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(snippet)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(snippet)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(snippet.id)}
                >
                  <Trash className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSnippets.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {filterCategory === 'all' 
              ? 'Nenhum snippet criado ainda'
              : `Nenhum snippet na categoria ${SNIPPET_CATEGORIES.find(c => c.value === filterCategory)?.label}`
            }
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Snippet
          </Button>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={showCreateDialog || showEditDialog} 
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setShowEditDialog(false);
            resetForm();
            setEditingSnippet(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSnippet ? 'Editar Snippet' : 'Criar Novo Snippet'}
            </DialogTitle>
            <DialogDescription>
              {editingSnippet 
                ? 'Atualize as informações do snippet'
                : 'Configure um novo bloco de conteúdo reutilizável'
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">
                <Code className="w-4 h-4 mr-2" />
                Editar
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Nome do Snippet *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Assinatura do Editor"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrição do snippet..."
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Snippet['category'])}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {SNIPPET_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Cole ou digite o HTML/texto do snippet..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Você pode usar HTML e CSS inline
                </p>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Preview</CardTitle>
                  <CardDescription>Como o snippet aparecerá no artigo</CardDescription>
                </CardHeader>
                <CardContent>
                  {content ? (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Adicione conteúdo para ver o preview
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={editingSnippet ? handleUpdate : handleCreate} 
              className="flex-1"
            >
              {editingSnippet ? 'Atualizar' : 'Criar'} Snippet
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                resetForm();
                setEditingSnippet(null);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewSnippet?.name}</DialogTitle>
            <DialogDescription>{previewSnippet?.description}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Código</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {previewSnippet && (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewSnippet.content }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto whitespace-pre-wrap break-words max-w-full">
                    {previewSnippet?.content}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={async () => {
                      const { copyToClipboard } = await import('../../utils/clipboard');
                      const success = await copyToClipboard(previewSnippet?.content || '');
                      
                      if (success) {
                        toast.success('Código copiado!');
                      } else {
                        toast.error('Erro ao copiar código');
                      }
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
