import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Save, Eye, Plus, Trash, GripVertical, Type, Image as ImageIcon, Layout, Box, Edit } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';

interface PageComponent {
  id: string;
  type: 'hero' | 'text' | 'image' | 'cards' | 'custom';
  content: any;
}

interface Page {
  id?: string;
  title: string;
  slug: string;
  components: PageComponent[];
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

interface PageBuilderProps {
  page: Page | null;
  onSave: (page: Page) => void;
  onCancel: () => void;
}

export function PageBuilder({ page, onSave, onCancel }: PageBuilderProps) {
  const [formData, setFormData] = useState<Page>({
    title: '',
    slug: '',
    components: [],
    status: 'draft'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  useEffect(() => {
    if (page) {
      setFormData(page);
    }
  }, [page]);

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

  const addComponent = (type: PageComponent['type']) => {
    const newComponent: PageComponent = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type)
    };
    setFormData({
      ...formData,
      components: [...formData.components, newComponent]
    });
    setSelectedComponent(newComponent.id);
    toast.success('Componente adicionado!');
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'hero':
        return { title: 'Título Hero', subtitle: 'Subtítulo', buttonText: 'Saiba Mais' };
      case 'text':
        return { text: '<p>Digite seu conteúdo aqui...</p>' };
      case 'image':
        return { url: '', alt: 'Imagem', caption: '' };
      case 'cards':
        return { 
          cards: [
            { title: 'Card 1', description: 'Descrição 1' },
            { title: 'Card 2', description: 'Descrição 2' }
          ] 
        };
      case 'custom':
        return { html: '<div>HTML personalizado</div>' };
      default:
        return {};
    }
  };

  const updateComponent = (id: string, content: any) => {
    setFormData({
      ...formData,
      components: formData.components.map(c => 
        c.id === id ? { ...c, content } : c
      )
    });
  };

  const deleteComponent = (id: string) => {
    setFormData({
      ...formData,
      components: formData.components.filter(c => c.id !== id)
    });
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
    toast.success('Componente removido!');
  };

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    const newComponents = [...formData.components];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newComponents.length) {
      [newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]];
      setFormData({ ...formData, components: newComponents });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    });
  };

  const renderComponentEditor = (component: PageComponent) => {
    switch (component.type) {
      case 'hero':
        return (
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input
                value={component.content.title}
                onChange={(e) => updateComponent(component.id, { ...component.content, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Input
                value={component.content.subtitle}
                onChange={(e) => updateComponent(component.id, { ...component.content, subtitle: e.target.value })}
              />
            </div>
            <div>
              <Label>Texto do Botão</Label>
              <Input
                value={component.content.buttonText}
                onChange={(e) => updateComponent(component.id, { ...component.content, buttonText: e.target.value })}
              />
            </div>
          </div>
        );
      case 'text':
        return (
          <div>
            <Label>Conteúdo HTML</Label>
            <Textarea
              value={component.content.text}
              onChange={(e) => updateComponent(component.id, { text: e.target.value })}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-3">
            <div>
              <Label>URL da Imagem</Label>
              <Input
                value={component.content.url}
                onChange={(e) => updateComponent(component.id, { ...component.content, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Texto Alternativo</Label>
              <Input
                value={component.content.alt}
                onChange={(e) => updateComponent(component.id, { ...component.content, alt: e.target.value })}
              />
            </div>
            <div>
              <Label>Legenda</Label>
              <Input
                value={component.content.caption}
                onChange={(e) => updateComponent(component.id, { ...component.content, caption: e.target.value })}
              />
            </div>
          </div>
        );
      case 'custom':
        return (
          <div>
            <Label>HTML Personalizado</Label>
            <Textarea
              value={component.content.html}
              onChange={(e) => updateComponent(component.id, { html: e.target.value })}
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        );
      default:
        return <p className="text-gray-500">Editor em desenvolvimento</p>;
    }
  };

  const renderComponentPreview = (component: PageComponent) => {
    switch (component.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-12 rounded-lg text-center">
            <h1 className="mb-4">{component.content.title}</h1>
            <p className="text-xl mb-6">{component.content.subtitle}</p>
            <Button variant="secondary">{component.content.buttonText}</Button>
          </div>
        );
      case 'text':
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: component.content.text }} />
        );
      case 'image':
        return (
          <div>
            {component.content.url ? (
              <img src={component.content.url} alt={component.content.alt} className="w-full rounded-lg" />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
            {component.content.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center">{component.content.caption}</p>
            )}
          </div>
        );
      case 'custom':
        return (
          <div dangerouslySetInnerHTML={{ __html: component.content.html }} />
        );
      default:
        return null;
    }
  };

  if (showPreview) {
    return (
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Editor
          </Button>
          <h1 className="text-gray-900">{formData.title} - Preview</h1>
          <div className="w-24"></div>
        </div>
        <div className="max-w-5xl mx-auto space-y-8 bg-white p-8 rounded-lg shadow">
          {formData.components.map(component => (
            <div key={component.id}>
              {renderComponentPreview(component)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={onCancel} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-gray-900 mb-2">
          {page ? 'Editar Página' : 'Nova Página'}
        </h1>
        <p className="text-gray-600">
          URL: <span className="font-mono text-indigo-600">/{formData.slug || 'slug'}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Add Components */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-4">Adicionar Componente</h3>
                <div className="space-y-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => addComponent('hero')}
                  >
                    <Box className="w-4 h-4 mr-2" />
                    Hero Section
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => addComponent('text')}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Texto
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => addComponent('image')}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagem
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => addComponent('custom')}
                  >
                    <Layout className="w-4 h-4 mr-2" />
                    HTML Customizado
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="mb-4">Publicação</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Publicar</Label>
                    <Switch
                      checked={formData.status === 'published'}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, status: checked ? 'published' : 'draft' })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Página
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>Título da Página</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Digite o título"
                    required
                  />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-amigavel"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Components List */}
            <div className="space-y-4">
              <h3>Componentes da Página</h3>
              {formData.components.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Layout className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum componente adicionado</p>
                    <p className="text-sm">Use o menu lateral para adicionar componentes</p>
                  </CardContent>
                </Card>
              ) : (
                formData.components.map((component, index) => (
                  <Card 
                    key={component.id}
                    className={selectedComponent === component.id ? 'ring-2 ring-indigo-500' : ''}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="capitalize">{component.type}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveComponent(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveComponent(index, 'down')}
                            disabled={index === formData.components.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedComponent(
                              selectedComponent === component.id ? null : component.id
                            )}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteComponent(component.id)}
                            className="text-red-600"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {selectedComponent === component.id && (
                        <div className="mt-4 pt-4 border-t">
                          {renderComponentEditor(component)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-4">Preview Rápido</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {formData.components.map(component => (
                    <div key={component.id} className="text-xs">
                      {renderComponentPreview(component)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
