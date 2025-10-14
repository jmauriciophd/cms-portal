import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  FileText,
  Layout,
  Newspaper,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { VisualEditor } from '../editor/VisualEditor';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'article' | 'page' | 'custom';
  thumbnail?: string;
  components: any[];
  createdAt: string;
  updatedAt: string;
}

interface TemplateManagerProps {
  onSelectTemplate?: (template: Template) => void;
  type?: 'article' | 'page' | 'custom';
}

export function TemplateManager({ onSelectTemplate, type }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [selectedType, setSelectedType] = useState<'article' | 'page' | 'custom'>(type || 'article');

  useEffect(() => {
    loadTemplates();
    createDefaultTemplates();
  }, []);

  const loadTemplates = () => {
    const stored = localStorage.getItem('templates');
    if (stored) {
      setTemplates(JSON.parse(stored));
    }
  };

  const saveTemplates = (updatedTemplates: Template[]) => {
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const createDefaultTemplates = () => {
    const stored = localStorage.getItem('templates');
    if (stored) return; // Já existem templates

    const defaultTemplates: Template[] = [
      {
        id: 'template-article-basic',
        name: 'Artigo Básico',
        description: 'Template simples com título, imagem e texto',
        type: 'article',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          {
            id: 'comp-1',
            type: 'heading',
            props: { tag: 'h1', text: 'Título do Artigo' },
            styles: { fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }
          },
          {
            id: 'comp-2',
            type: 'paragraph',
            props: { text: 'Por [Autor] • [Data]' },
            styles: { color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }
          },
          {
            id: 'comp-3',
            type: 'image',
            props: { src: 'https://via.placeholder.com/800x400', alt: 'Imagem destaque' },
            styles: { width: '100%', borderRadius: '0.5rem', marginBottom: '2rem' }
          },
          {
            id: 'comp-4',
            type: 'paragraph',
            props: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
            styles: { marginBottom: '1rem', lineHeight: '1.8', fontSize: '1.125rem' }
          }
        ]
      },
      {
        id: 'template-article-featured',
        name: 'Artigo Destaque',
        description: 'Com hero section e destaques',
        type: 'article',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          {
            id: 'comp-1',
            type: 'hero',
            props: { 
              title: 'Título do Artigo em Destaque',
              subtitle: 'Subtítulo ou resumo do artigo',
              backgroundImage: 'https://via.placeholder.com/1200x600'
            },
            styles: { marginBottom: '3rem' }
          },
          {
            id: 'comp-2',
            type: 'container',
            props: {},
            styles: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
            children: [
              {
                id: 'comp-3',
                type: 'paragraph',
                props: { text: 'Conteúdo do artigo aqui...' },
                styles: { lineHeight: '1.8', fontSize: '1.125rem' }
              }
            ]
          }
        ]
      },
      {
        id: 'template-article-multimedia',
        name: 'Artigo Multimídia',
        description: 'Com vídeo, imagens e galeria',
        type: 'article',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          {
            id: 'comp-1',
            type: 'heading',
            props: { tag: 'h1', text: 'Título do Artigo' },
            styles: { fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }
          },
          {
            id: 'comp-2',
            type: 'video',
            props: { src: '' },
            styles: { width: '100%', maxWidth: '800px', margin: '0 auto 2rem', display: 'block' }
          },
          {
            id: 'comp-3',
            type: 'paragraph',
            props: { text: 'Texto introdutório do artigo.' },
            styles: { marginBottom: '2rem', lineHeight: '1.8', fontSize: '1.125rem' }
          },
          {
            id: 'comp-4',
            type: 'grid',
            props: { columns: 3, gap: '1rem' },
            styles: { marginBottom: '2rem' },
            children: []
          }
        ]
      },
      {
        id: 'template-page-landing',
        name: 'Landing Page',
        description: 'Página de destino completa',
        type: 'page',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          {
            id: 'comp-1',
            type: 'hero',
            props: { 
              title: 'Bem-vindo',
              subtitle: 'Transforme sua ideia em realidade',
              buttonText: 'Começar Agora'
            },
            styles: { marginBottom: '4rem' }
          },
          {
            id: 'comp-2',
            type: 'grid',
            props: { columns: 3, gap: '2rem' },
            styles: { padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' },
            children: [
              {
                id: 'comp-3',
                type: 'card',
                props: { title: 'Recurso 1', description: 'Descrição do recurso' },
                styles: {}
              },
              {
                id: 'comp-4',
                type: 'card',
                props: { title: 'Recurso 2', description: 'Descrição do recurso' },
                styles: {}
              },
              {
                id: 'comp-5',
                type: 'card',
                props: { title: 'Recurso 3', description: 'Descrição do recurso' },
                styles: {}
              }
            ]
          }
        ]
      },
      {
        id: 'template-page-about',
        name: 'Página Sobre',
        description: 'Página institucional',
        type: 'page',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          {
            id: 'comp-1',
            type: 'heading',
            props: { tag: 'h1', text: 'Sobre Nós' },
            styles: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }
          },
          {
            id: 'comp-2',
            type: 'grid',
            props: { columns: 2, gap: '3rem' },
            styles: { maxWidth: '1200px', margin: '0 auto', padding: '2rem', alignItems: 'center' },
            children: [
              {
                id: 'comp-3',
                type: 'image',
                props: { src: 'https://via.placeholder.com/600x400', alt: 'Sobre' },
                styles: { width: '100%', borderRadius: '0.5rem' }
              },
              {
                id: 'comp-4',
                type: 'container',
                props: {},
                styles: {},
                children: [
                  {
                    id: 'comp-5',
                    type: 'heading',
                    props: { tag: 'h2', text: 'Nossa História' },
                    styles: { marginBottom: '1rem' }
                  },
                  {
                    id: 'comp-6',
                    type: 'paragraph',
                    props: { text: 'Nossa história começa...' },
                    styles: { lineHeight: '1.8' }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'template-page-contact',
        name: 'Página de Contato',
        description: 'Com formulário e informações',
        type: 'page',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          {
            id: 'comp-1',
            type: 'heading',
            props: { tag: 'h1', text: 'Entre em Contato' },
            styles: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }
          },
          {
            id: 'comp-2',
            type: 'grid',
            props: { columns: 2, gap: '3rem' },
            styles: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
            children: [
              {
                id: 'comp-3',
                type: 'form',
                props: {},
                styles: {}
              },
              {
                id: 'comp-4',
                type: 'contact-info',
                props: {
                  email: 'contato@exemplo.com',
                  phone: '(11) 1234-5678',
                  address: 'Rua Exemplo, 123 - São Paulo, SP'
                },
                styles: {}
              }
            ]
          }
        ]
      }
    ];

    saveTemplates(defaultTemplates);
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Digite um nome para o template');
      return;
    }

    const newTemplate: Template = {
      id: `template-${Date.now()}`,
      name: newTemplateName,
      description: newTemplateDesc,
      type: selectedType,
      components: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditingTemplate(newTemplate);
    setShowNewDialog(false);
    setShowEditor(true);
    setNewTemplateName('');
    setNewTemplateDesc('');
  };

  const handleSaveTemplate = (components: any[]) => {
    if (!editingTemplate) return;

    const updatedTemplate = {
      ...editingTemplate,
      components,
      updatedAt: new Date().toISOString()
    };

    const existing = templates.find(t => t.id === updatedTemplate.id);
    const updatedTemplates = existing
      ? templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t)
      : [...templates, updatedTemplate];

    saveTemplates(updatedTemplates);
    setShowEditor(false);
    setEditingTemplate(null);
    toast.success('Template salvo com sucesso!');
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicate: Template = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveTemplates([...templates, duplicate]);
    toast.success('Template duplicado!');
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    const updatedTemplates = templates.filter(t => t.id !== id);
    saveTemplates(updatedTemplates);
    toast.success('Template excluído!');
  };

  const handleExportTemplate = (template: Template) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Template exportado!');
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        imported.id = `template-${Date.now()}`;
        imported.createdAt = new Date().toISOString();
        imported.updatedAt = new Date().toISOString();
        
        saveTemplates([...templates, imported]);
        toast.success('Template importado!');
      } catch (error) {
        toast.error('Erro ao importar template');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredTemplates = type 
    ? templates.filter(t => t.type === type)
    : templates;

  if (showEditor && editingTemplate) {
    return (
      <VisualEditor
        initialComponents={editingTemplate.components}
        onSave={handleSaveTemplate}
        mode={editingTemplate.type === 'article' ? 'article' : editingTemplate.type === 'page' ? 'page' : 'template'}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Templates</h2>
          <p className="text-gray-600">Gerencie templates para páginas e artigos</p>
        </div>
        <div className="flex gap-2">
          <label>
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplate}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </span>
            </Button>
          </label>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Filter */}
      {!type && (
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedType === 'article' ? 'default' : 'outline'}
            onClick={() => setSelectedType('article')}
          >
            Artigos
          </Button>
          <Button
            variant={selectedType === 'page' ? 'default' : 'outline'}
            onClick={() => setSelectedType('page')}
          >
            Páginas
          </Button>
          <Button
            variant={selectedType === 'custom' ? 'default' : 'outline'}
            onClick={() => setSelectedType('custom')}
          >
            Personalizados
          </Button>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
                <Badge variant={template.type === 'article' ? 'default' : 'secondary'}>
                  {template.type === 'article' ? <Newspaper className="w-3 h-3 mr-1" /> : <Layout className="w-3 h-3 mr-1" />}
                  {template.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Preview */}
              <div className="bg-gray-100 rounded p-4 mb-4 h-32 flex items-center justify-center text-gray-400">
                <FileText className="w-12 h-12" />
              </div>

              <div className="text-xs text-gray-500 mb-4">
                <p>Criado: {new Date(template.createdAt).toLocaleDateString('pt-BR')}</p>
                <p>{template.components.length} componente(s)</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {onSelectTemplate ? (
                  <Button 
                    onClick={() => onSelectTemplate(template)}
                    size="sm"
                    className="flex-1"
                  >
                    Usar Template
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportTemplate(template)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Nenhum template encontrado</p>
          <Button onClick={() => setShowNewDialog(true)} className="mt-4">
            Criar Primeiro Template
          </Button>
        </div>
      )}

      {/* New Template Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Template</DialogTitle>
            <DialogDescription>
              Crie um novo template para reutilizar em suas páginas e artigos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nome do Template</label>
              <Input
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Ex: Artigo com Vídeo"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Descrição</label>
              <Input
                value={newTemplateDesc}
                onChange={(e) => setNewTemplateDesc(e.target.value)}
                placeholder="Breve descrição do template"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <div className="flex gap-2">
                <Button
                  variant={selectedType === 'article' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('article')}
                  className="flex-1"
                >
                  Artigo
                </Button>
                <Button
                  variant={selectedType === 'page' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('page')}
                  className="flex-1"
                >
                  Página
                </Button>
                <Button
                  variant={selectedType === 'custom' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('custom')}
                  className="flex-1"
                >
                  Personalizado
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateTemplate} className="flex-1">
                Criar e Editar
              </Button>
              <Button variant="outline" onClick={() => setShowNewDialog(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
