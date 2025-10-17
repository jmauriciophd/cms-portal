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
  Upload,
  Lock,
  FolderInput,
  Edit3,
  History as HistoryIcon,
  Link2,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { VisualEditor } from '../editor/VisualEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { DeleteConfirmDialog } from '../common/DeleteConfirmDialog';
import { MoveDialog, RenameDialog, HistoryDialog, PropertiesDialog } from '../common/ItemDialogs';
import { BaseItem } from '../common/ItemOperations';
import { TrashService } from '../../services/TrashService';

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'article' | 'page' | 'header' | 'footer' | 'custom';
  thumbnail?: string;
  components: any[];
  locked?: boolean; // Se true, componentes não podem ser editados quando aplicados
  category?: 'content' | 'structure'; // content = editável, structure = header/footer
  createdAt: string;
  updatedAt: string;
}

interface TemplateManagerProps {
  onSelectTemplate?: (template: Template) => void;
  type?: 'article' | 'page' | 'header' | 'footer' | 'custom';
}

export function TemplateManager({ onSelectTemplate, type }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [selectedType, setSelectedType] = useState<Template['type']>(type || 'page');
  const [filterType, setFilterType] = useState<'all' | Template['type']>('all');
  
  // Estados para os diálogos
  const [moveDialog, setMoveDialog] = useState<{ open: boolean; item: Template | null }>({ open: false, item: null });
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; item: Template | null }>({ open: false, item: null });
  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; item: Template | null }>({ open: false, item: null });
  const [propertiesDialog, setPropertiesDialog] = useState<{ open: boolean; item: Template | null }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Template | null }>({ open: false, item: null });

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
    if (stored) {
      const existing = JSON.parse(stored);
      // Se já existem templates, não criar padrões novamente
      if (existing.length > 0) return;
    }

    const defaultTemplates: Template[] = [
      // ============ TEMPLATES DE CABEÇALHO ============
      {
        id: 'template-header-default',
        name: 'Cabeçalho Padrão',
        description: 'Cabeçalho com logo e menu de navegação',
        type: 'header',
        locked: true,
        category: 'structure',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          {
            id: 'header-comp-1',
            type: 'container',
            locked: true,
            props: { className: 'header-container' },
            styles: { 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem 2rem',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e5e7eb',
              position: 'sticky',
              top: '0',
              zIndex: '50'
            },
            children: [
              {
                id: 'header-logo',
                type: 'heading',
                locked: true,
                props: { tag: 'h1', text: 'Meu Site' },
                styles: { fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }
              },
              {
                id: 'header-nav',
                type: 'navigation',
                locked: true,
                props: {
                  items: [
                    { label: 'Início', url: '/' },
                    { label: 'Sobre', url: '/sobre' },
                    { label: 'Serviços', url: '/servicos' },
                    { label: 'Contato', url: '/contato' }
                  ]
                },
                styles: { display: 'flex', gap: '2rem' }
              }
            ]
          }
        ]
      },
      {
        id: 'template-header-minimal',
        name: 'Cabeçalho Minimalista',
        description: 'Cabeçalho simples e clean',
        type: 'header',
        locked: true,
        category: 'structure',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          {
            id: 'header-minimal-1',
            type: 'container',
            locked: true,
            props: {},
            styles: { 
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#f9fafb'
            },
            children: [
              {
                id: 'header-minimal-logo',
                type: 'heading',
                locked: true,
                props: { tag: 'h1', text: 'LOGO' },
                styles: { fontSize: '2rem', fontWeight: '300', letterSpacing: '0.1em' }
              }
            ]
          }
        ]
      },

      // ============ TEMPLATES DE RODAPÉ ============
      {
        id: 'template-footer-default',
        name: 'Rodapé Padrão',
        description: 'Rodapé com informações e links',
        type: 'footer',
        locked: true,
        category: 'structure',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          {
            id: 'footer-comp-1',
            type: 'container',
            locked: true,
            props: {},
            styles: { 
              backgroundColor: '#1f2937',
              color: '#ffffff',
              padding: '3rem 2rem 1rem',
              marginTop: 'auto'
            },
            children: [
              {
                id: 'footer-grid',
                type: 'grid',
                locked: true,
                props: { columns: 3, gap: '2rem' },
                styles: { marginBottom: '2rem' },
                children: [
                  {
                    id: 'footer-col-1',
                    type: 'container',
                    locked: true,
                    props: {},
                    children: [
                      {
                        id: 'footer-title-1',
                        type: 'heading',
                        locked: true,
                        props: { tag: 'h3', text: 'Sobre' },
                        styles: { marginBottom: '1rem' }
                      },
                      {
                        id: 'footer-text-1',
                        type: 'paragraph',
                        locked: true,
                        props: { text: 'Informações sobre a empresa' },
                        styles: { color: '#d1d5db', fontSize: '0.875rem' }
                      }
                    ]
                  },
                  {
                    id: 'footer-col-2',
                    type: 'container',
                    locked: true,
                    props: {},
                    children: [
                      {
                        id: 'footer-title-2',
                        type: 'heading',
                        locked: true,
                        props: { tag: 'h3', text: 'Links' },
                        styles: { marginBottom: '1rem' }
                      },
                      {
                        id: 'footer-links',
                        type: 'list',
                        locked: true,
                        props: {
                          items: [
                            { text: 'Home', url: '/' },
                            { text: 'Sobre', url: '/sobre' },
                            { text: 'Contato', url: '/contato' }
                          ]
                        },
                        styles: { color: '#d1d5db', fontSize: '0.875rem' }
                      }
                    ]
                  },
                  {
                    id: 'footer-col-3',
                    type: 'container',
                    locked: true,
                    props: {},
                    children: [
                      {
                        id: 'footer-title-3',
                        type: 'heading',
                        locked: true,
                        props: { tag: 'h3', text: 'Contato' },
                        styles: { marginBottom: '1rem' }
                      },
                      {
                        id: 'footer-text-3',
                        type: 'paragraph',
                        locked: true,
                        props: { text: 'contato@exemplo.com\n(11) 1234-5678' },
                        styles: { color: '#d1d5db', fontSize: '0.875rem', whiteSpace: 'pre-line' }
                      }
                    ]
                  }
                ]
              },
              {
                id: 'footer-copyright',
                type: 'paragraph',
                locked: true,
                props: { text: '© 2025 Todos os direitos reservados' },
                styles: { 
                  textAlign: 'center',
                  paddingTop: '2rem',
                  borderTop: '1px solid #374151',
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                }
              }
            ]
          }
        ]
      },

      // ============ TEMPLATES DE ARTIGO ============
      {
        id: 'template-article-basic',
        name: 'Artigo Básico',
        description: 'Template simples com título, imagem e texto',
        type: 'article',
        category: 'content',
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
            props: { src: '', alt: 'Imagem destaque' },
            styles: { width: '100%', borderRadius: '0.5rem', marginBottom: '2rem' }
          },
          {
            id: 'comp-4',
            type: 'paragraph',
            props: { text: 'Digite o conteúdo do artigo aqui...' },
            styles: { marginBottom: '1rem', lineHeight: '1.8', fontSize: '1.125rem' }
          }
        ]
      },
      {
        id: 'template-article-featured',
        name: 'Artigo Destaque',
        description: 'Com hero section e destaques',
        type: 'article',
        category: 'content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
          {
            id: 'comp-1',
            type: 'hero',
            props: { 
              title: 'Título do Artigo em Destaque',
              subtitle: 'Subtítulo ou resumo do artigo'
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

      // ============ TEMPLATES DE PÁGINA ============
      {
        id: 'template-page-landing',
        name: 'Landing Page',
        description: 'Página de destino completa',
        type: 'page',
        category: 'content',
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
        category: 'content',
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
                props: { src: '', alt: 'Sobre' },
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
                    props: { text: 'Digite sua história aqui...' },
                    styles: { lineHeight: '1.8' }
                  }
                ]
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
      locked: selectedType === 'header' || selectedType === 'footer',
      category: selectedType === 'header' || selectedType === 'footer' ? 'structure' : 'content',
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

  const handleDeleteTemplate = (template: Template) => {
    setDeleteDialog({ open: true, item: template });
  };

  const handleDeleteConfirm = () => {
    if (!deleteDialog.item) return;

    // Mover para lixeira
    TrashService.moveToTrash(
      { ...deleteDialog.item, name: deleteDialog.item.name },
      'template',
      'current-user'
    );

    const updatedTemplates = templates.filter(t => t.id !== deleteDialog.item!.id);
    saveTemplates(updatedTemplates);
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

  // Funções do menu de contexto
  const handleContextCopy = (template: Template) => {
    handleDuplicateTemplate(template);
  };

  const handleContextMove = (template: Template) => {
    setMoveDialog({ open: true, item: template });
  };

  const handleContextRename = (template: Template) => {
    setRenameDialog({ open: true, item: template });
  };

  const handleContextHistory = (template: Template) => {
    setHistoryDialog({ open: true, item: template });
  };

  const handleContextCopyPath = async (template: Template) => {
    const path = `/templates/${template.id}`;
    const { copyToClipboard } = await import('../../utils/clipboard');
    const success = await copyToClipboard(path);
    
    if (success) {
      toast.success('Caminho copiado!');
    } else {
      toast.error('Erro ao copiar caminho');
    }
  };

  const handleContextProperties = (template: Template) => {
    setPropertiesDialog({ open: true, item: template });
  };

  const handleContextDelete = (template: Template) => {
    handleDeleteTemplate(template);
  };

  const handleMoveConfirm = (newPath: string) => {
    if (moveDialog.item) {
      // Simular movimentação (já que templates não têm pastas ainda)
      toast.success(`Template "${moveDialog.item.name}" movido!`);
    }
  };

  const handleRenameConfirm = (newName: string) => {
    if (renameDialog.item) {
      const updatedTemplate: Template = {
        ...renameDialog.item,
        name: newName,
        updatedAt: new Date().toISOString()
      };
      
      const updatedTemplates = templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t);
      saveTemplates(updatedTemplates);
    }
  };

  const handleHistoryRestore = (entry: any) => {
    toast.success('Versão restaurada do histórico');
  };

  const filteredTemplates = templates.filter(t => {
    if (type) return t.type === type;
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const getTypeLabel = (type: Template['type']) => {
    const labels = {
      page: 'Página',
      article: 'Artigo',
      header: 'Cabeçalho',
      footer: 'Rodapé',
      custom: 'Personalizado'
    };
    return labels[type];
  };

  const getTypeIcon = (type: Template['type']) => {
    if (type === 'article') return <Newspaper className="w-3 h-3" />;
    if (type === 'header' || type === 'footer') return <Lock className="w-3 h-3" />;
    return <Layout className="w-3 h-3" />;
  };

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
    <div className={onSelectTemplate ? "" : "p-6"}>
      {!onSelectTemplate && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Templates</h2>
              <p className="text-gray-600">Gerencie templates para páginas, artigos, cabeçalhos e rodapés</p>
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
          <div className="flex gap-2 mb-6">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              size="sm"
            >
              Todos
            </Button>
            <Button
              variant={filterType === 'page' ? 'default' : 'outline'}
              onClick={() => setFilterType('page')}
              size="sm"
            >
              Páginas
            </Button>
            <Button
              variant={filterType === 'article' ? 'default' : 'outline'}
              onClick={() => setFilterType('article')}
              size="sm"
            >
              Artigos
            </Button>
            <Button
              variant={filterType === 'header' ? 'default' : 'outline'}
              onClick={() => setFilterType('header')}
              size="sm"
            >
              Cabeçalhos
            </Button>
            <Button
              variant={filterType === 'footer' ? 'default' : 'outline'}
              onClick={() => setFilterType('footer')}
              size="sm"
            >
              Rodapés
            </Button>
          </div>
        </>
      )}

      {onSelectTemplate && (
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-semibold">Selecione um Template</h3>
          <div className="flex gap-2">
            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImportTemplate}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </span>
              </Button>
            </label>
            <Button size="sm" onClick={() => setShowNewDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo
            </Button>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <ScrollArea className={onSelectTemplate ? "h-[500px] pr-4" : ""}>
        <div className={`grid grid-cols-1 ${onSelectTemplate ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-4`}>
          {filteredTemplates.map((template) => (
            <Card key={template.id} className={`hover:shadow-lg transition-shadow ${onSelectTemplate ? 'hover:border-indigo-500' : ''}`}>
              <CardHeader className={onSelectTemplate ? "p-4" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className={`${onSelectTemplate ? 'text-base' : 'text-lg'} mb-1 truncate flex items-center gap-2`}>
                      {template.name}
                      {template.locked && <Lock className="w-3 h-3 text-gray-400" />}
                    </CardTitle>
                    <p className={`text-xs text-gray-600 ${onSelectTemplate ? 'line-clamp-2' : ''}`}>
                      {template.description}
                    </p>
                  </div>
                  <Badge 
                    variant={template.type === 'article' ? 'default' : template.type === 'page' ? 'secondary' : 'outline'} 
                    className="shrink-0"
                  >
                    {getTypeIcon(template.type)}
                  </Badge>
                </div>
                {template.category && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {template.category === 'structure' ? 'Estrutura' : 'Conteúdo'}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className={onSelectTemplate ? "p-4 pt-0" : ""}>
                {/* Preview */}
                <div className={`bg-gray-100 rounded p-4 ${onSelectTemplate ? 'mb-3 h-24' : 'mb-4 h-32'} flex items-center justify-center text-gray-400`}>
                  <FileText className={onSelectTemplate ? 'w-8 h-8' : 'w-12 h-12'} />
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  <p>Tipo: {getTypeLabel(template.type)}</p>
                  <p>{template.components.length} componente(s)</p>
                  {template.locked && (
                    <p className="text-amber-600 font-medium">🔒 Bloqueado para edição</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {onSelectTemplate ? (
                    <Button 
                      onClick={() => onSelectTemplate(template)}
                      size="sm"
                      className="w-full"
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
      </ScrollArea>

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
              <Select value={selectedType} onValueChange={(value: Template['type']) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Página</SelectItem>
                  <SelectItem value="article">Artigo</SelectItem>
                  <SelectItem value="header">Cabeçalho (bloqueado)</SelectItem>
                  <SelectItem value="footer">Rodapé (bloqueado)</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              {(selectedType === 'header' || selectedType === 'footer') && (
                <p className="text-xs text-amber-600 mt-2">
                  🔒 Este template será bloqueado para edição quando aplicado
                </p>
              )}
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
