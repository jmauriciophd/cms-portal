import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  Code, 
  Settings, 
  Move,
  GripVertical,
  Layout,
  Type,
  Image as ImageIcon,
  Grid3x3,
  ListOrdered,
  Video,
  FormInput,
  Square,
  AlignLeft,
  Save,
  Undo,
  Redo,
  Palette,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { StylePanel } from './StylePanel';
import { ComponentLibrary } from './ComponentLibrary';

interface Component {
  id: string;
  type: string;
  props: any;
  styles: React.CSSProperties;
  customCSS?: string;
  customJS?: string;
  children?: Component[];
}

interface VisualEditorProps {
  initialComponents?: Component[];
  onSave: (components: Component[]) => void;
  mode?: 'page' | 'article' | 'template';
}

export function VisualEditor({ initialComponents = [], onSave, mode = 'page' }: VisualEditorProps) {
  const [components, setComponents] = useState<Component[]>(initialComponents);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [history, setHistory] = useState<Component[][]>([initialComponents]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [showCode, setShowCode] = useState(false);

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

  const addComponent = (type: string, props: any = {}, styles: React.CSSProperties = {}) => {
    const newComponent: Component = {
      id: `component-${Date.now()}-${Math.random()}`,
      type,
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
        if (comp.children) {
          return { ...comp, children: updateRecursive(comp.children) };
        }
        return comp;
      });
    };

    const newComponents = updateRecursive(components);
    setComponents(newComponents);
    addToHistory(newComponents);
    
    if (selectedComponent?.id === id) {
      setSelectedComponent({ ...selectedComponent, ...updates });
    }
  };

  const deleteComponent = (id: string) => {
    const deleteRecursive = (comps: Component[]): Component[] => {
      return comps.filter(comp => {
        if (comp.id === id) return false;
        if (comp.children) {
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

  const duplicateComponent = (comp: Component) => {
    const duplicate = JSON.parse(JSON.stringify(comp));
    duplicate.id = `component-${Date.now()}-${Math.random()}`;
    const newComponents = [...components, duplicate];
    setComponents(newComponents);
    addToHistory(newComponents);
    toast.success('Componente duplicado');
  };

  const moveComponent = (dragIndex: number, hoverIndex: number) => {
    const newComponents = [...components];
    const [removed] = newComponents.splice(dragIndex, 1);
    newComponents.splice(hoverIndex, 0, removed);
    setComponents(newComponents);
    addToHistory(newComponents);
  };

  const handleSave = () => {
    onSave(components);
    toast.success('Alterações salvas!');
  };

  const exportHTML = () => {
    const html = generateHTML(components);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'page.html';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('HTML exportado!');
  };

  const generateHTML = (comps: Component[]): string => {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página Exportada</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    ${comps.map(c => c.customCSS || '').join('\n')}
  </style>
</head>
<body>
  ${comps.map(c => renderComponentHTML(c)).join('\n')}
  <script>
    ${comps.map(c => c.customJS || '').join('\n')}
  </script>
</body>
</html>`;
  };

  const renderComponentHTML = (comp: Component): string => {
    const styleString = Object.entries(comp.styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');

    switch (comp.type) {
      case 'heading':
        return `<${comp.props.tag || 'h2'} style="${styleString}">${comp.props.text || 'Título'}</${comp.props.tag || 'h2'}>`;
      case 'paragraph':
        return `<p style="${styleString}">${comp.props.text || 'Parágrafo'}</p>`;
      case 'image':
        return `<img src="${comp.props.src || ''}" alt="${comp.props.alt || ''}" style="${styleString}" />`;
      case 'button':
        return `<button style="${styleString}" onclick="${comp.props.onClick || ''}">${comp.props.text || 'Botão'}</button>`;
      case 'container':
        return `<div style="${styleString}">${comp.children?.map(c => renderComponentHTML(c)).join('') || ''}</div>`;
      default:
        return `<div style="${styleString}"></div>`;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        {/* Toolbar */}
        <div className="w-16 bg-white border-r flex flex-col items-center py-4 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            title="Preview"
          >
            <Eye className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            title="Ver Código"
          >
            <Code className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex === 0}
            title="Desfazer"
          >
            <Undo className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            title="Refazer"
          >
            <Redo className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            title="Salvar"
          >
            <Save className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportHTML}
            title="Exportar HTML"
          >
            <Code className="w-5 h-5" />
          </Button>
        </div>

        {/* Component Library */}
        {!previewMode && (
          <div className="w-72 bg-white border-r">
            <ComponentLibrary onAddComponent={addComponent} />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8">
          {showCode ? (
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-full overflow-auto">
              <pre>{JSON.stringify(components, null, 2)}</pre>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg min-h-[800px] p-8">
              {components.length === 0 ? (
                <div className="h-[600px] flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <Layout className="w-16 h-16 mx-auto mb-4" />
                    <p>Arraste componentes da biblioteca para começar</p>
                  </div>
                </div>
              ) : (
                components.map((comp, index) => (
                  <DraggableComponent
                    key={comp.id}
                    component={comp}
                    index={index}
                    isSelected={selectedComponent?.id === comp.id}
                    isPreview={previewMode}
                    onSelect={() => setSelectedComponent(comp)}
                    onUpdate={(updates) => updateComponent(comp.id, updates)}
                    onDelete={() => deleteComponent(comp.id)}
                    onDuplicate={() => duplicateComponent(comp)}
                    onMove={moveComponent}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Style Panel */}
        {!previewMode && selectedComponent && (
          <div className="w-96 bg-white border-l">
            <StylePanel
              component={selectedComponent}
              onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
              onClose={() => setSelectedComponent(null)}
            />
          </div>
        )}
      </div>
    </DndProvider>
  );
}

interface DraggableComponentProps {
  component: Component;
  index: number;
  isSelected: boolean;
  isPreview: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Component>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

function DraggableComponent({
  component,
  index,
  isSelected,
  isPreview,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove
}: DraggableComponentProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'component',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    }
  });

  const renderComponent = () => {
    const { type, props, styles, children } = component;

    switch (type) {
      case 'heading':
        const Tag = (props.tag || 'h2') as any;
        return <Tag style={styles}>{props.text || 'Título'}</Tag>;
      
      case 'paragraph':
        return <p style={styles}>{props.text || 'Parágrafo de texto.'}</p>;
      
      case 'image':
        return (
          <img 
            src={props.src || 'https://via.placeholder.com/400x300'} 
            alt={props.alt || 'Imagem'} 
            style={styles}
          />
        );
      
      case 'button':
        return (
          <button style={styles} onClick={() => props.onClick && eval(props.onClick)}>
            {props.text || 'Botão'}
          </button>
        );
      
      case 'container':
        return (
          <div style={styles}>
            {children?.map((child, i) => (
              <div key={child.id}>{/* Render nested components */}</div>
            ))}
          </div>
        );
      
      case 'hero':
        return (
          <div style={{ 
            minHeight: '400px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            ...styles 
          }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{props.title || 'Título Hero'}</h1>
              <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>{props.subtitle || 'Subtítulo da seção'}</p>
              {props.buttonText && (
                <button style={{ 
                  padding: '1rem 2rem', 
                  fontSize: '1.125rem',
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}>
                  {props.buttonText}
                </button>
              )}
            </div>
          </div>
        );
      
      case 'card':
        return (
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '0.5rem', 
            padding: '1.5rem',
            background: 'white',
            ...styles 
          }}>
            {props.image && <img src={props.image} alt="" style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }} />}
            <h3 style={{ marginBottom: '0.5rem' }}>{props.title || 'Título do Card'}</h3>
            <p style={{ color: '#6b7280' }}>{props.description || 'Descrição do card'}</p>
          </div>
        );
      
      case 'grid':
        return (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${props.columns || 3}, 1fr)`,
            gap: props.gap || '1rem',
            ...styles 
          }}>
            {children?.map((child, i) => (
              <div key={child.id}>{/* Render grid items */}</div>
            ))}
          </div>
        );

      case 'form':
        return (
          <form style={styles}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nome:</label>
              <input type="text" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
              <input type="email" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
            </div>
            <button type="submit" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
              Enviar
            </button>
          </form>
        );

      case 'video':
        return (
          <div style={styles}>
            <video controls style={{ width: '100%', borderRadius: '0.5rem' }}>
              <source src={props.src || ''} type="video/mp4" />
            </video>
          </div>
        );

      case 'divider':
        return <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '2rem 0', ...styles }} />;

      default:
        return <div style={styles}>Componente desconhecido: {type}</div>;
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`relative group ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-indigo-500' : ''} ${!isPreview ? 'hover:ring-2 hover:ring-indigo-300' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPreview) onSelect();
      }}
      style={{ opacity: isDragging ? 0.5 : 1, cursor: isPreview ? 'default' : 'move' }}
    >
      {!isPreview && (
        <div className="absolute -top-8 left-0 right-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white px-2 py-1 rounded-t text-xs z-10">
          <div className="flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            <span>{component.type}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-1 hover:bg-indigo-700 rounded"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 hover:bg-red-600 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      {renderComponent()}
    </div>
  );
}
