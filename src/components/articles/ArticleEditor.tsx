import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Save, Eye, Code, Image as ImageIcon } from 'lucide-react';
import { Switch } from '../ui/switch';
import { MediaLibrarySelector } from '../files/MediaLibrarySelector';

interface Article {
  id?: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
  slug: string;
}

interface ArticleEditorProps {
  article: Article | null;
  onSave: (article: Article) => void;
  onCancel: () => void;
  currentUser: any;
}

export function ArticleEditor({ article, onSave, onCancel, currentUser }: ArticleEditorProps) {
  const [formData, setFormData] = useState<Article>({
    title: '',
    summary: '',
    content: '',
    author: currentUser?.name || 'Admin',
    status: 'draft',
    slug: ''
  });
  const [activeTab, setActiveTab] = useState('editor');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (article) {
      setFormData(article);
    }
  }, [article]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    });
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

    // Inserir no cursor atual ou no final
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = formData.content;
      
      const newContent = 
        currentContent.substring(0, start) + 
        '\n' + mediaHtml + '\n' +
        currentContent.substring(end);
      
      setFormData({ ...formData, content: newContent });
      
      // Refocar no textarea após inserção
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + mediaHtml.length + 2;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      // Se não conseguir acessar o textarea, adiciona no final
      setFormData({ 
        ...formData, 
        content: formData.content + '\n' + mediaHtml + '\n'
      });
    }
  };

  const renderPreview = () => {
    return (
      <div className="prose max-w-none">
        <h1>{formData.title || 'Título da matéria'}</h1>
        <p className="text-gray-600 italic">{formData.summary || 'Resumo da matéria'}</p>
        <div dangerouslySetInnerHTML={{ __html: formData.content || '<p>Conteúdo da matéria...</p>' }} />
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={onCancel} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-gray-900 mb-2">
          {article ? 'Editar Matéria' : 'Nova Matéria'}
        </h1>
        <p className="text-gray-600">
          URL amigável: <span className="font-mono text-indigo-600">/artigos/{formData.slug || 'titulo-da-materia'}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="editor">
                      <Eye className="w-4 h-4 mr-2" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="code">
                      <Code className="w-4 h-4 mr-2" />
                      Código HTML
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Digite o título da matéria"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="summary">Resumo</Label>
                      <Textarea
                        id="summary"
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        placeholder="Breve resumo da matéria (para SEO e listagens)"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="content">Conteúdo</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMediaLibrary(true)}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Biblioteca de Mídia
                        </Button>
                      </div>
                      <Textarea
                        ref={contentTextareaRef}
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Digite o conteúdo da matéria (HTML simples permitido)"
                        rows={15}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Você pode usar tags HTML como &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img&gt;, &lt;video&gt;, &lt;audio&gt;
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="htmlContent">Código HTML Personalizado</Label>
                      <Textarea
                        id="htmlContent"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="<h2>Título</h2><p>Conteúdo...</p>"
                        rows={20}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Editor de código HTML para total controle da marcação
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview">
                    <Card className="p-6 bg-white">
                      {renderPreview()}
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="mb-4">Publicação</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="status">Publicar imediatamente</Label>
                      <Switch
                        id="status"
                        checked={formData.status === 'published'}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, status: checked ? 'published' : 'draft' })
                        }
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.status === 'published'
                        ? 'A matéria será publicada e visível no portal'
                        : 'A matéria será salva como rascunho'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Autor:</span>
                      <span>{formData.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="capitalize">
                        {formData.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button type="submit" className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {article ? 'Atualizar' : 'Salvar'} Matéria
                  </Button>
                  <Button type="button" variant="outline" onClick={onCancel} className="w-full">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">URL da Matéria</h3>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL amigável)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="titulo-da-materia"
                  />
                  <p className="text-xs text-gray-500">
                    URL: /artigos/{formData.slug || 'slug'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

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
