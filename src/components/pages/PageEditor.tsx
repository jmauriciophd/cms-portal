import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Clock, 
  FileText,
  Image as ImageIcon,
  Code,
  Calendar,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RichTextEditor } from '../editor/RichTextEditor';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: string;
  template?: string;
  meta?: {
    description?: string;
    robots?: string;
  };
  createdAt: string;
  updatedAt: string;
  folder?: string;
}

interface PageEditorProps {
  page: Page | null;
  onSave: (page: Page) => void;
  onBack: () => void;
  availableSnippets?: Array<{ id: string; name: string; content: string }>;
  availableImages?: Array<{ id: string; name: string; url: string }>;
}

export function PageEditor({ page, onSave, onBack, availableSnippets = [], availableImages = [] }: PageEditorProps) {
  const [formData, setFormData] = useState<Page>(
    page || {
      id: Date.now().toString(),
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featuredImage: '',
      status: 'draft',
      template: 'default',
      meta: {
        description: '',
        robots: 'index, follow'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folder: ''
    }
  );

  const [showPreview, setShowPreview] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showSnippetSelector, setShowSnippetSelector] = useState(false);

  useEffect(() => {
    if (page) {
      setFormData(page);
    }
  }, [page]);

  // Gerar slug automaticamente do título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSave = (status: 'draft' | 'published' | 'scheduled') => {
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('O slug é obrigatório');
      return;
    }

    if (status === 'scheduled' && !formData.scheduledDate) {
      toast.error('Selecione a data de agendamento');
      return;
    }

    const updatedPage: Page = {
      ...formData,
      status,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedPage);

    const statusMessages = {
      draft: 'Rascunho salvo com sucesso!',
      published: 'Página publicada com sucesso!',
      scheduled: `Página agendada para ${new Date(formData.scheduledDate!).toLocaleString('pt-BR')}`
    };

    toast.success(statusMessages[status]);
  };

  const insertSnippet = (snippet: { id: string; name: string; content: string }) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + snippet.content
    }));
    setShowSnippetSelector(false);
    toast.success(`Snippet "${snippet.name}" inserido!`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simular upload (em produção, fazer upload real)
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          featuredImage: reader.result as string
        }));
        toast.success('Imagem carregada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSystemImage = (image: { id: string; name: string; url: string }) => {
    setFormData(prev => ({
      ...prev,
      featuredImage: image.url
    }));
    setShowImageSelector(false);
    toast.success(`Imagem "${image.name}" selecionada!`);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900">
                {page ? 'Editar Página' : 'Nova Página'}
              </h1>
              <p className="text-sm text-gray-500">
                {formData.title || 'Sem título'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Editar' : 'Preview'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave('draft')}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave('scheduled')}
              disabled={!formData.scheduledDate}
            >
              <Clock className="w-4 h-4 mr-2" />
              Agendar
            </Button>

            <Button
              size="sm"
              onClick={() => handleSave('published')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Publicar Agora
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <Card>
                <CardHeader>
                  {formData.featuredImage && (
                    <div className="mb-6 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={formData.featuredImage}
                        alt={formData.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                  <CardTitle className="text-3xl">{formData.title || 'Sem título'}</CardTitle>
                  {formData.excerpt && (
                    <p className="text-lg text-gray-600 mt-2">{formData.excerpt}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full">
            {/* Editor Principal */}
            <div className="flex-1 overflow-auto">
              <div className="max-w-4xl mx-auto p-8">
                <div className="space-y-6">
                  {/* Título */}
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold">
                      Título da Página *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Digite o título da página"
                      className="text-2xl h-14 mt-2"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <Label htmlFor="slug" className="text-sm">
                      Slug (URL) *
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">
                        {window.location.origin}/
                      </span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="url-amigavel"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Imagem Destacada */}
                  <div>
                    <Label className="text-sm">Imagem Destacada</Label>
                    <div className="mt-2 space-y-3">
                      {formData.featuredImage && (
                        <div className="relative rounded-lg border border-gray-200 overflow-hidden">
                          <ImageWithFallback
                            src={formData.featuredImage}
                            alt="Imagem destacada"
                            className="w-full h-48 object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                          >
                            Remover
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload do Computador
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowImageSelector(!showImageSelector)}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Biblioteca de Mídia
                        </Button>
                      </div>

                      {showImageSelector && availableImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {availableImages.map(img => (
                            <button
                              key={img.id}
                              onClick={() => selectSystemImage(img)}
                              className="relative aspect-square rounded overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
                            >
                              <ImageWithFallback
                                src={img.url}
                                alt={img.name}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumo */}
                  <div>
                    <Label htmlFor="excerpt" className="text-sm">
                      Resumo / Descrição Curta
                    </Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Breve descrição da página (opcional)"
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <Separator />

                  {/* Editor de Conteúdo */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base font-semibold">
                        Conteúdo da Página
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSnippetSelector(!showSnippetSelector)}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Inserir Snippet
                      </Button>
                    </div>

                    {showSnippetSelector && availableSnippets.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-2">
                          Snippets Disponíveis:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {availableSnippets.map(snippet => (
                            <Button
                              key={snippet.id}
                              variant="outline"
                              size="sm"
                              onClick={() => insertSnippet(snippet)}
                              className="justify-start"
                            >
                              {snippet.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar de Configurações */}
            <div className="w-80 bg-white border-l border-gray-200 overflow-auto">
              <div className="p-6">
                <Tabs defaultValue="publish" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="publish">Publicação</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                  </TabsList>

                  <TabsContent value="publish" className="space-y-4 mt-4">
                    {/* Status */}
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-gray-500">
                        Status
                      </Label>
                      <div className="mt-2">
                        <Select
                          value={formData.status}
                          onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Rascunho</SelectItem>
                            <SelectItem value="published">Publicado</SelectItem>
                            <SelectItem value="scheduled">Agendado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Agendamento */}
                    <div>
                      <Label htmlFor="scheduledDate" className="text-xs uppercase tracking-wide text-gray-500">
                        Data de Agendamento
                      </Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <Input
                          id="scheduledDate"
                          type="datetime-local"
                          value={formData.scheduledDate || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                          className="text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Deixe em branco para publicar imediatamente
                      </p>
                    </div>

                    {/* Template */}
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-gray-500">
                        Template
                      </Label>
                      <div className="mt-2">
                        <Select
                          value={formData.template || 'default'}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Padrão</SelectItem>
                            <SelectItem value="full-width">Largura Total</SelectItem>
                            <SelectItem value="sidebar-left">Sidebar Esquerda</SelectItem>
                            <SelectItem value="sidebar-right">Sidebar Direita</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* Info */}
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Criado em:</span>
                        <span>{new Date(formData.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Atualizado:</span>
                        <span>{new Date(formData.updatedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4 mt-4">
                    {/* Meta Description */}
                    <div>
                      <Label htmlFor="metaDescription" className="text-xs uppercase tracking-wide text-gray-500">
                        Meta Description
                      </Label>
                      <Textarea
                        id="metaDescription"
                        value={formData.meta?.description || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          meta: { ...prev.meta, description: e.target.value }
                        }))}
                        placeholder="Descrição para motores de busca"
                        rows={3}
                        className="mt-2 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.meta?.description?.length || 0} / 160 caracteres
                      </p>
                    </div>

                    {/* Robots */}
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-gray-500">
                        Meta Robots
                      </Label>
                      <div className="mt-2">
                        <Select
                          value={formData.meta?.robots || 'index, follow'}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            meta: { ...prev.meta, robots: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="index, follow">Index, Follow</SelectItem>
                            <SelectItem value="noindex, follow">NoIndex, Follow</SelectItem>
                            <SelectItem value="index, nofollow">Index, NoFollow</SelectItem>
                            <SelectItem value="noindex, nofollow">NoIndex, NoFollow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Preview do Resultado na Busca */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Preview no Google:</p>
                      <div className="space-y-1">
                        <div className="text-blue-600 text-sm hover:underline cursor-pointer">
                          {formData.title || 'Título da Página'}
                        </div>
                        <div className="text-xs text-green-700">
                          {window.location.origin}/{formData.slug || 'slug'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formData.meta?.description || formData.excerpt || 'Adicione uma meta description...'}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
