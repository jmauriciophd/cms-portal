import { useState, useEffect, useRef } from 'react';
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
import { MediaLibrarySelector } from '../files/MediaLibrarySelector';
import type { Template } from '../templates/TemplateManager';

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
    keywords?: string;
    // Open Graph
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    // Twitter
    twitterCard?: 'summary' | 'summary_large_image';
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
  };
  author?: string;
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
        robots: 'index, follow',
        keywords: '',
        ogType: 'website',
        twitterCard: 'summary_large_image'
      },
      author: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folder: ''
    }
  );

  const [showPreview, setShowPreview] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showSnippetSelector, setShowSnippetSelector] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const richTextEditorRef = useRef<any>(null);

  useEffect(() => {
    if (page) {
      setFormData(page);
    }
  }, [page]);

  // Função para converter components do template em HTML
  const convertTemplateToHTML = (components: any[]): string => {
    if (!components || !Array.isArray(components)) {
      return '';
    }

    const renderNode = (node: any): string => {
      if (!node || typeof node !== 'object') return '';

      const { type, props = {}, children = [], content = '' } = node;
      
      // Estilos inline
      let styleStr = '';
      if (node.styles) {
        styleStr = Object.entries(node.styles)
          .map(([key, value]) => {
            // Converter camelCase para kebab-case
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}: ${value}`;
          })
          .join('; ');
      }

      // Classes
      const classStr = node.className || props.className || '';

      // Renderizar com base no tipo
      switch (type) {
        case 'heading':
          const level = props.level || 2;
          return `<h${level}${classStr ? ` class="${classStr}"` : ''}${styleStr ? ` style="${styleStr}"` : ''}>${props.text || content || 'Título'}${children.map(renderNode).join('')}</h${level}>`;
        
        case 'text':
        case 'paragraph':
          return `<p${classStr ? ` class="${classStr}"` : ''}${styleStr ? ` style="${styleStr}"` : ''}>${props.text || content || 'Texto'}${children.map(renderNode).join('')}</p>`;
        
        case 'container':
        case 'section':
          return `<div${classStr ? ` class="${classStr}"` : ''}${styleStr ? ` style="${styleStr}"` : ''}>${children.map(renderNode).join('')}</div>`;
        
        case 'button':
          return `<button${classStr ? ` class="${classStr}"` : ''}${styleStr ? ` style="${styleStr}"` : ''}>${props.text || content || 'Botão'}</button>`;
        
        case 'image':
          return `<img src="${props.src || 'https://via.placeholder.com/800x400'}" alt="${props.alt || ''}"${classStr ? ` class="${classStr}"` : ''}${styleStr ? ` style="${styleStr}"` : ''} />`;
        
        case 'list':
          const listTag = props.ordered ? 'ol' : 'ul';
          return `<${listTag}${classStr ? ` class="${classStr}"` : ''}${styleStr ? ` style="${styleStr}"` : ''}>${children.map(renderNode).join('')}</${listTag}>`;
        
        case 'listItem':
          return `<li${classStr ? ` class="${classStr}"` : ''}${styleStr ? ` style="${styleStr}"` : ''}>${props.text || content || 'Item'}${children.map(renderNode).join('')}</li>`;
        
        case 'link':
          return `<a href="${props.href || '#'}"${classStr ? ` class="${classStr}"` : ''}${styleStr ? ` style="${styleStr}"` : ''}>${props.text || content || 'Link'}${children.map(renderNode).join('')}</a>`;
        
        default:
          // Para tipos desconhecidos, renderizar como div com children
          return `<div${classStr ? ` class="${classStr}"` : ''}${styleStr ? ` style="${styleStr}"` : ''}>${children.map(renderNode).join('')}</div>`;
      }
    };

    return components.map(renderNode).join('\n');
  };

  // Carregar templates disponíveis do localStorage
  useEffect(() => {
    const loadTemplates = () => {
      const stored = localStorage.getItem('templates');
      if (stored) {
        try {
          const allTemplates: Template[] = JSON.parse(stored);
          // Filtrar apenas templates do tipo 'page'
          const pageTemplates = allTemplates.filter(t => t.type === 'page');
          setAvailableTemplates(pageTemplates);
        } catch (error) {
          console.error('Erro ao carregar templates:', error);
        }
      }
    };

    loadTemplates();

    // Listener para atualizar quando templates mudarem
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'templates') {
        loadTemplates();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Aplicar conteúdo do template quando selecionado
  const handleTemplateChange = (templateId: string) => {
    setFormData(prev => ({ ...prev, template: templateId }));
    
    // Se não for o template default, aplicar o conteúdo
    if (templateId !== 'default') {
      const selectedTemplate = availableTemplates.find(t => t.id === templateId);
      if (selectedTemplate && selectedTemplate.components) {
        const htmlContent = convertTemplateToHTML(selectedTemplate.components);
        if (htmlContent) {
          setFormData(prev => ({ ...prev, content: htmlContent }));
          toast.success(`Template "${selectedTemplate.name}" aplicado ao conteúdo!`);
        }
      }
    }
  };

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
      // Só gera o slug automaticamente se não foi editado manualmente
      slug: isSlugManuallyEdited ? prev.slug : generateSlug(title)
    }));
  };

  const handleSlugChange = (slug: string) => {
    setIsSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleMediaSelect = (file: any) => {
    let mediaHtml = '';
    
    if (file.mimeType?.startsWith('image/')) {
      mediaHtml = `<img src="${file.url}" alt="${file.name}" style="max-width: 100%; height: auto;" />`;
    } else if (file.mimeType?.startsWith('video/')) {
      mediaHtml = `<video controls style="max-width: 100%; height: auto;">
  <source src="${file.url}" type="${file.mimeType}">
  Seu navegador não suporta vídeos.
</video>`;
    } else if (file.mimeType?.startsWith('audio/')) {
      mediaHtml = `<audio controls style="width: 100%;">
  <source src="${file.url}" type="${file.mimeType}">
  Seu navegador não suporta áudio.
</audio>`;
    } else {
      mediaHtml = `<a href="${file.url}" download="${file.name}">${file.name}</a>`;
    }

    // Inserir no editor de rich text
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n' + mediaHtml + '\n'
    }));

    toast.success('Mídia inserida com sucesso!');
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
                        onChange={(e) => handleSlugChange(e.target.value)}
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
                          onClick={() => setShowMediaLibrary(true)}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Inserir Imagem
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMediaLibrary(true)}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Inserir Mídia
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSnippetSelector(!showSnippetSelector)}
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Inserir Snippet
                        </Button>
                      </div>
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
                          onValueChange={handleTemplateChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Padrão</SelectItem>
                            {availableTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.template && formData.template !== 'default' && (
                        <p className="text-xs text-gray-500 mt-2">
                          {availableTemplates.find(t => t.id === formData.template)?.description || 'Template selecionado'}
                        </p>
                      )}
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
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-4 pr-4">
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
                            {formData.meta?.description?.length || 0} / 160 caracteres (ideal: 150-160)
                          </p>
                        </div>

                        {/* Keywords */}
                        <div>
                          <Label htmlFor="metaKeywords" className="text-xs uppercase tracking-wide text-gray-500">
                            Palavras-chave (Keywords)
                          </Label>
                          <Input
                            id="metaKeywords"
                            value={formData.meta?.keywords || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              meta: { ...prev.meta, keywords: e.target.value }
                            }))}
                            placeholder="palavra1, palavra2, palavra3"
                            className="mt-2 text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Separe por vírgulas. Ex: tecnologia, inovação, notícias
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

                        <Separator />

                        {/* Open Graph Section */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm text-gray-900">Open Graph (Facebook, LinkedIn)</h3>
                          <p className="text-xs text-gray-500">
                            Controle como sua página aparece ao ser compartilhada em redes sociais
                          </p>

                          {/* OG Title */}
                          <div>
                            <Label htmlFor="ogTitle" className="text-xs">
                              OG Title
                            </Label>
                            <Input
                              id="ogTitle"
                              value={formData.meta?.ogTitle || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                meta: { ...prev.meta, ogTitle: e.target.value }
                              }))}
                              placeholder={formData.title || 'Deixe vazio para usar o título da página'}
                              className="mt-1 text-sm"
                            />
                          </div>

                          {/* OG Description */}
                          <div>
                            <Label htmlFor="ogDescription" className="text-xs">
                              OG Description
                            </Label>
                            <Textarea
                              id="ogDescription"
                              value={formData.meta?.ogDescription || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                meta: { ...prev.meta, ogDescription: e.target.value }
                              }))}
                              placeholder={formData.meta?.description || 'Deixe vazio para usar a meta description'}
                              rows={2}
                              className="mt-1 text-sm"
                            />
                          </div>

                          {/* OG Image */}
                          <div>
                            <Label htmlFor="ogImage" className="text-xs">
                              OG Image URL
                            </Label>
                            <Input
                              id="ogImage"
                              value={formData.meta?.ogImage || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                meta: { ...prev.meta, ogImage: e.target.value }
                              }))}
                              placeholder={formData.featuredImage || 'Deixe vazio para usar a imagem destacada'}
                              className="mt-1 text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Tamanho recomendado: 1200x630px
                            </p>
                          </div>

                          {/* OG Type */}
                          <div>
                            <Label className="text-xs">
                              OG Type
                            </Label>
                            <div className="mt-1">
                              <Select
                                value={formData.meta?.ogType || 'website'}
                                onValueChange={(value: any) => setFormData(prev => ({
                                  ...prev,
                                  meta: { ...prev.meta, ogType: value }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="website">Website</SelectItem>
                                  <SelectItem value="article">Article</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Twitter Card Section */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm text-gray-900">Twitter Card</h3>
                          <p className="text-xs text-gray-500">
                            Personalize a aparência no Twitter/X
                          </p>

                          {/* Twitter Card Type */}
                          <div>
                            <Label className="text-xs">
                              Card Type
                            </Label>
                            <div className="mt-1">
                              <Select
                                value={formData.meta?.twitterCard || 'summary_large_image'}
                                onValueChange={(value: any) => setFormData(prev => ({
                                  ...prev,
                                  meta: { ...prev.meta, twitterCard: value }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="summary">Summary (pequeno)</SelectItem>
                                  <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Twitter Title */}
                          <div>
                            <Label htmlFor="twitterTitle" className="text-xs">
                              Twitter Title
                            </Label>
                            <Input
                              id="twitterTitle"
                              value={formData.meta?.twitterTitle || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                meta: { ...prev.meta, twitterTitle: e.target.value }
                              }))}
                              placeholder="Deixe vazio para usar OG Title / Título"
                              className="mt-1 text-sm"
                            />
                          </div>

                          {/* Twitter Description */}
                          <div>
                            <Label htmlFor="twitterDescription" className="text-xs">
                              Twitter Description
                            </Label>
                            <Textarea
                              id="twitterDescription"
                              value={formData.meta?.twitterDescription || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                meta: { ...prev.meta, twitterDescription: e.target.value }
                              }))}
                              placeholder="Deixe vazio para usar OG Description"
                              rows={2}
                              className="mt-1 text-sm"
                            />
                          </div>

                          {/* Twitter Image */}
                          <div>
                            <Label htmlFor="twitterImage" className="text-xs">
                              Twitter Image URL
                            </Label>
                            <Input
                              id="twitterImage"
                              value={formData.meta?.twitterImage || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                meta: { ...prev.meta, twitterImage: e.target.value }
                              }))}
                              placeholder="Deixe vazio para usar OG Image"
                              className="mt-1 text-sm"
                            />
                          </div>
                        </div>

                        <Separator />

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

                        {/* Preview Social Media */}
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Preview Redes Sociais:</p>
                          <div className="bg-white border border-gray-300 rounded overflow-hidden">
                            {(formData.meta?.ogImage || formData.featuredImage) && (
                              <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                Imagem OG: {formData.meta?.ogImage || formData.featuredImage || 'Sem imagem'}
                              </div>
                            )}
                            <div className="p-2">
                              <div className="text-xs font-semibold text-gray-900 line-clamp-1">
                                {formData.meta?.ogTitle || formData.title || 'Título'}
                              </div>
                              <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                                {formData.meta?.ogDescription || formData.meta?.description || formData.excerpt || 'Descrição'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Media Library Selector */}
      <MediaLibrarySelector
        open={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaSelect}
        allowedTypes={['image/*', 'video/*', 'audio/*']}
        multiple={false}
      />
    </div>
  );
}
