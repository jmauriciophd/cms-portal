import { useState, useEffect, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Code, 
  Settings, 
  GripVertical,
  Image as ImageIcon,
  Save,
  Undo,
  Redo,
  Calendar as CalendarIcon,
  Clock,
  EyeOff,
  AlertTriangle,
  FolderOpen,
  Upload,
  Check
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { StylePanel } from './StylePanel';
import { ComponentLibrary } from './ComponentLibrary';
import { ComponentTreeView } from './ComponentTreeView';
import { TemplateSelector } from './TemplateSelector';
import { InlineEditor } from './InlineEditor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Component {
  id: string;
  type: string;
  props: any;
  styles: React.CSSProperties;
  customCSS?: string;
  customJS?: string;
  children?: Component[];
}

interface UnifiedEditorProps {
  type: 'article' | 'page';
  initialTitle?: string;
  initialSlug?: string;
  initialComponents?: Component[];
  initialStatus?: 'draft' | 'scheduled' | 'published';
  initialScheduledDate?: string;
  initialMeta?: {
    robots?: string;
    description?: string;
  };
  onSave: (data: {
    title: string;
    slug: string;
    components: Component[];
    status: 'draft' | 'scheduled' | 'published';
    scheduledDate?: string;
    meta?: {
      robots?: string;
      description?: string;
    };
  }) => void;
  onCancel: () => void;
}

export function UnifiedEditor({
  type,
  initialTitle = '',
  initialSlug = '',
  initialComponents = [],
  initialStatus = 'draft',
  initialScheduledDate,
  initialMeta,
  onSave,
  onCancel
}: UnifiedEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [components, setComponents] = useState<Component[]>(initialComponents);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [history, setHistory] = useState<Component[][]>([initialComponents]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>(initialStatus);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    initialScheduledDate ? new Date(initialScheduledDate) : undefined
  );
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [lastDirectory, setLastDirectory] = useState<string>('');
  const [meta, setMeta] = useState(initialMeta || { robots: 'index,follow', description: '' });
  const [showTemplateSelector, setShowTemplateSelector] = useState(!initialTitle && !initialComponents.length);
  const [showTreeView, setShowTreeView] = useState(true);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);

  // Load last directory from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lastImageDirectory');
    if (saved) {
      setLastDirectory(saved);
    }
  }, []);

  const addToHistory = (newComponents: Component[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newComponents)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents(history[historyIndex + 1]);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!initialSlug || slug === generateSlug(initialTitle)) {
      setSlug(generateSlug(value));
    }
  };

  const addComponent = (componentType: string, props: any = {}, styles: React.CSSProperties = {}) => {
    const newComponent: Component = {
      id: `component-${Date.now()}-${Math.random()}`,
      type: componentType,
      props,
      styles,
      children: []
    };
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    addToHistory(newComponents);
    toast.success('Componente adicionado');
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    const updateRecursive = (comps: Component[]): Component[] => {
      return comps.map(comp => {
        if (comp.id === id) {
          return { ...comp, ...updates };
        }
        if (comp.children && comp.children.length > 0) {
          return { ...comp, children: updateRecursive(comp.children) };
        }
        return comp;
      });
    };
    const newComponents = updateRecursive(components);
    setComponents(newComponents);
    addToHistory(newComponents);
  };

  const deleteComponent = (id: string) => {
    const deleteRecursive = (comps: Component[]): Component[] => {
      return comps.filter(comp => {
        if (comp.id === id) return false;
        if (comp.children && comp.children.length > 0) {
          comp.children = deleteRecursive(comp.children);
        }
        return true;
      });
    };
    const newComponents = deleteRecursive(components);
    setComponents(newComponents);
    addToHistory(newComponents);
    setSelectedComponent(null);
    toast.success('Componente removido');
  };

  const duplicateComponent = (id: string) => {
    const findAndDuplicate = (comps: Component[]): Component[] => {
      const result: Component[] = [];
      comps.forEach(comp => {
        result.push(comp);
        if (comp.id === id) {
          const duplicate = JSON.parse(JSON.stringify(comp));
          duplicate.id = `component-${Date.now()}-${Math.random()}`;
          // Regenerar IDs dos filhos também
          if (duplicate.children) {
            duplicate.children = regenerateIds(duplicate.children);
          }
          result.push(duplicate);
        }
      });
      return result;
    };
    const newComponents = findAndDuplicate(components);
    setComponents(newComponents);
    addToHistory(newComponents);
    toast.success('Componente duplicado');
  };

  const regenerateIds = (comps: Component[]): Component[] => {
    return comps.map(comp => ({
      ...comp,
      id: `component-${Date.now()}-${Math.random()}`,
      children: comp.children ? regenerateIds(comp.children) : undefined
    }));
  };

  const toggleVisibility = (id: string) => {
    const toggleRecursive = (comps: Component[]): Component[] => {
      return comps.map(comp => {
        if (comp.id === id) {
          return { ...comp, visible: comp.visible === false ? true : false };
        }
        if (comp.children && comp.children.length > 0) {
          return { ...comp, children: toggleRecursive(comp.children) };
        }
        return comp;
      });
    };
    const newComponents = toggleRecursive(components);
    setComponents(newComponents);
    addToHistory(newComponents);
  };

  const moveComponentInTree = (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
    // Implementar lógica de mover na árvore
    const newComponents = [...components];
    // TODO: Implementar movimento hierárquico
    setComponents(newComponents);
    addToHistory(newComponents);
  };

  const handleTemplateSelect = (template: any) => {
    if (template && template.components) {
      setComponents(template.components);
      addToHistory(template.components);
      toast.success(`Template "${template.name}" aplicado`);
    }
    setShowTemplateSelector(false);
  };

  const moveComponent = (dragIndex: number, hoverIndex: number) => {
    const newComponents = [...components];
    const [removed] = newComponents.splice(dragIndex, 1);
    newComponents.splice(hoverIndex, 0, removed);
    setComponents(newComponents);
    addToHistory(newComponents);
  };

  const handleSave = (saveStatus?: 'draft' | 'scheduled' | 'published') => {
    const finalStatus = saveStatus || status;

    if (finalStatus === 'scheduled' && !scheduledDate) {
      toast.error('Por favor, selecione uma data para agendar');
      return;
    }

    if (!title.trim()) {
      toast.error('Por favor, adicione um título');
      return;
    }

    let finalScheduledDate: string | undefined;
    if (finalStatus === 'scheduled' && scheduledDate) {
      const [hours, minutes] = scheduledTime.split(':');
      const dateWithTime = new Date(scheduledDate);
      dateWithTime.setHours(parseInt(hours), parseInt(minutes));
      finalScheduledDate = dateWithTime.toISOString();
    }

    onSave({
      title,
      slug,
      components,
      status: finalStatus,
      scheduledDate: finalScheduledDate,
      meta
    });

    const statusText = 
      finalStatus === 'published' ? 'publicado' :
      finalStatus === 'scheduled' ? 'agendado' :
      'salvo como rascunho';
    
    toast.success(`${type === 'article' ? 'Matéria' : 'Página'} ${statusText} com sucesso!`);
  };

  const handleUnpublish = () => {
    setStatus('draft');
    setMeta({ ...meta, robots: 'noindex,nofollow' });
    setShowUnpublishDialog(false);
    
    onSave({
      title,
      slug,
      components,
      status: 'draft',
      meta: { ...meta, robots: 'noindex,nofollow' }
    });

    toast.success(`${type === 'article' ? 'Matéria' : 'Página'} despublicada e removida dos mecanismos de busca`);
  };

  // Componente não usado mais - substituído por InlineEditor
  // const DraggableComponent = ...

  const ImagePickerTab = () => {
    const [files, setFiles] = useState<any[]>([]);
    const [currentPath, setCurrentPath] = useState(lastDirectory || '/Arquivos/imagens');
    const [selectedImage, setSelectedImage] = useState<string>('');

    useEffect(() => {
      loadFiles();
    }, [currentPath]);

    const loadFiles = () => {
      let allFiles: any[] = [];
      try {
        const stored = localStorage.getItem('files') || '[]';
        const parsed = JSON.parse(stored);
        allFiles = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Erro ao carregar arquivos:', e);
        allFiles = [];
      }
      
      const filesInPath = allFiles.filter((f: any) => {
        if (f.type === 'folder') return f.path === currentPath;
        return f.path === currentPath && ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.mimeType);
      });
      setFiles(filesInPath);
    };

    const handleImageSelect = () => {
      if (selectedImage) {
        addComponent('image', { url: selectedImage, alt: 'Imagem selecionada' });
        localStorage.setItem('lastImageDirectory', currentPath);
        setLastDirectory(currentPath);
        setShowImagePicker(false);
        toast.success('Imagem adicionada');
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">{currentPath}</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className={`cursor-pointer border-2 rounded-lg p-2 transition-all ${
                selectedImage === file.url ? 'border-indigo-500' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedImage(file.url)}
            >
              {file.type === 'folder' ? (
                <div
                  className="flex flex-col items-center justify-center h-24 bg-gray-100 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPath(`${currentPath}/${file.name}`);
                  }}
                >
                  <FolderOpen className="w-8 h-8 text-gray-400" />
                  <span className="text-xs mt-2">{file.name}</span>
                </div>
              ) : (
                <div>
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded"
                  />
                  <span className="text-xs mt-1 block truncate">{file.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button onClick={handleImageSelect} disabled={!selectedImage} className="w-full">
          <Check className="w-4 h-4 mr-2" />
          Inserir Imagem Selecionada
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* Template Selector */}
      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        type={type}
        onSelectTemplate={handleTemplateSelect}
      />

      <div className="h-screen flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {type === 'article' ? 'Editor de Matéria' : 'Editor de Página'}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant={status === 'published' ? 'default' : status === 'scheduled' ? 'secondary' : 'outline'}>
                {status === 'published' ? 'Publicado' : status === 'scheduled' ? 'Agendado' : 'Rascunho'}
              </Badge>
              <Button variant="ghost" onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" onClick={undo} disabled={historyIndex === 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" onClick={redo} disabled={historyIndex === history.length - 1}>
                <Redo className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button onClick={() => handleSave('draft')}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Rascunho
              </Button>
            </div>
          </div>

          {/* Title and Slug */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Título</Label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Digite o título"
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-da-url"
              />
            </div>
          </div>

          {/* Publishing Controls */}
          <div className="flex items-center gap-4">
            {/* Schedule Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {scheduledDate ? format(scheduledDate, 'PPP', { locale: ptBR }) : 'Agendar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Schedule Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave('scheduled')}
              disabled={!scheduledDate}
            >
              <Clock className="w-4 h-4 mr-2" />
              Agendar Publicação
            </Button>

            {/* Publish Button */}
            <Button
              size="sm"
              onClick={() => handleSave('published')}
            >
              <Check className="w-4 h-4 mr-2" />
              Publicar Agora
            </Button>

            {/* Unpublish Button (only if published) */}
            {status === 'published' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowUnpublishDialog(true)}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Despublicar
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Components & Tree */}
          <div className="w-80 bg-white border-r overflow-y-auto">
            <Tabs defaultValue="components" className="h-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="components">Biblioteca</TabsTrigger>
                <TabsTrigger value="tree">Estrutura</TabsTrigger>
                <TabsTrigger value="images">Imagens</TabsTrigger>
              </TabsList>
              
              <TabsContent value="components" className="p-4 h-[calc(100%-48px)]">
                <ComponentLibrary onAddComponent={addComponent} />
              </TabsContent>

              <TabsContent value="tree" className="h-[calc(100%-48px)]">
                <ComponentTreeView
                  components={components}
                  selectedId={selectedComponent?.id || null}
                  onSelect={(id) => {
                    const findComponent = (comps: Component[]): Component | null => {
                      for (const comp of comps) {
                        if (comp.id === id) return comp;
                        if (comp.children) {
                          const found = findComponent(comp.children);
                          if (found) return found;
                        }
                      }
                      return null;
                    };
                    const comp = findComponent(components);
                    if (comp) setSelectedComponent(comp);
                  }}
                  onMove={moveComponentInTree}
                  onDelete={deleteComponent}
                  onDuplicate={duplicateComponent}
                  onToggleVisibility={toggleVisibility}
                />
              </TabsContent>

              <TabsContent value="images" className="p-4 h-[calc(100%-48px)]">
                <ImagePickerTab />
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 overflow-y-auto p-6">
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-6">
                {components.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Plus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Adicione componentes da biblioteca</p>
                  </div>
                ) : (
                  <div onClick={() => {
                    setSelectedComponent(null);
                    setEditingComponentId(null);
                  }}>
                    {components.map((component, index) => (
                      <InlineEditor
                        key={component.id}
                        component={component}
                        isSelected={selectedComponent?.id === component.id}
                        onClick={() => {
                          setSelectedComponent(component);
                          setEditingComponentId(null);
                        }}
                        onUpdate={(updates) => updateComponent(component.id, updates)}
                        onDelete={() => deleteComponent(component.id)}
                        onDuplicate={() => duplicateComponent(component.id)}
                        onMove={moveComponent}
                        index={index}
                        isEditing={editingComponentId === component.id}
                        onEditStart={() => setEditingComponentId(component.id)}
                        onEditEnd={() => setEditingComponentId(null)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Properties */}
          {selectedComponent && (
            <div className="w-80 bg-white border-l overflow-y-auto p-4">
              <StylePanel
                component={selectedComponent}
                onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
              />
            </div>
          )}
        </div>

        {/* Unpublish Confirmation Dialog */}
        <AlertDialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Despublicar {type === 'article' ? 'Matéria' : 'Página'}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Remover o conteúdo do site imediatamente</li>
                  <li>Adicionar meta tags noindex,nofollow</li>
                  <li>Impedir indexação por mecanismos de busca</li>
                  <li>Mover para status de rascunho</li>
                </ul>
                <p className="mt-3 font-semibold">Você pode republicar a qualquer momento.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnpublish} className="bg-red-600 hover:bg-red-700">
                Sim, Despublicar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
    </>
  );
}
