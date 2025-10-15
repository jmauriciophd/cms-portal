import { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { GripVertical, Trash2, Copy, Eye, EyeOff, Settings } from 'lucide-react';

interface Component {
  id: string;
  type: string;
  props: any;
  styles: React.CSSProperties;
  children?: Component[];
  visible?: boolean;
}

interface InlineEditorProps {
  component: Component;
  isSelected: boolean;
  onClick: () => void;
  onUpdate: (updates: Partial<Component>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  index: number;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export function InlineEditor({
  component,
  isSelected,
  onClick,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  index,
  isEditing,
  onEditStart,
  onEditEnd
}: InlineEditorProps) {
  const [localValue, setLocalValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'canvas-component',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'canvas-component',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    }
  });

  useEffect(() => {
    if (isEditing) {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (['heading', 'text', 'paragraph', 'button'].includes(component.type)) {
      const value = component.props?.text || component.props?.content || '';
      setLocalValue(value);
      onEditStart();
    }
  };

  const handleSave = () => {
    if (localValue !== (component.props?.text || component.props?.content || '')) {
      onUpdate({
        props: {
          ...component.props,
          text: localValue,
          content: localValue
        }
      });
    }
    onEditEnd();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && component.type !== 'paragraph') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onEditEnd();
    }
  };

  const renderComponent = () => {
    const baseStyles: React.CSSProperties = {
      ...component.styles,
      opacity: component.visible === false ? 0.3 : 1,
      pointerEvents: component.visible === false ? 'none' : 'auto'
    };

    // Modo de edição inline
    if (isEditing && ['heading', 'text', 'paragraph', 'button'].includes(component.type)) {
      if (component.type === 'paragraph') {
        return (
          <Textarea
            ref={textareaRef}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[100px]"
            style={baseStyles}
          />
        );
      } else {
        return (
          <Input
            ref={inputRef}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full"
            style={baseStyles}
          />
        );
      }
    }

    // Renderização normal
    switch (component.type) {
      case 'heading':
      case 'h1':
      case 'h2':
      case 'h3':
        const level = component.props?.level || 2;
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag style={baseStyles}>
            {component.props?.text || 'Título'}
          </HeadingTag>
        );

      case 'paragraph':
      case 'text':
        return (
          <p style={baseStyles}>
            {component.props?.text || component.props?.content || 'Texto'}
          </p>
        );

      case 'image':
        return (
          <img
            src={component.props?.url || component.props?.src || 'https://via.placeholder.com/400x300'}
            alt={component.props?.alt || 'Imagem'}
            style={{ ...baseStyles, maxWidth: '100%', height: 'auto' }}
          />
        );

      case 'button':
        return (
          <button
            style={{
              ...baseStyles,
              padding: '10px 20px',
              background: component.styles?.background || '#4F46E5',
              color: component.styles?.color || 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {component.props?.text || 'Botão'}
          </button>
        );

      case 'container':
      case 'div':
        return (
          <div style={{ ...baseStyles, border: '1px dashed #ccc', padding: '20px', minHeight: '100px' }}>
            {component.children && component.children.length > 0 ? (
              component.children.map((child, idx) => (
                <InlineEditor
                  key={child.id}
                  component={child}
                  isSelected={false}
                  onClick={() => {}}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                  onMove={() => {}}
                  index={idx}
                  isEditing={false}
                  onEditStart={() => {}}
                  onEditEnd={() => {}}
                />
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center">Container vazio - Arraste componentes aqui</p>
            )}
          </div>
        );

      case 'list':
        const items = component.props?.items || ['Item 1', 'Item 2'];
        return (
          <ul style={baseStyles}>
            {items.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );

      default:
        return (
          <div style={baseStyles} className="border border-dashed border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-500">Componente: {component.type}</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`
        relative group mb-3 transition-all
        ${isDragging ? 'opacity-50' : ''}
        ${isSelected ? 'ring-2 ring-indigo-500 rounded' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Toolbar (aparece ao selecionar) */}
      {isSelected && !isEditing && (
        <div className="absolute -top-10 left-0 bg-white border rounded shadow-lg px-2 py-1 flex items-center gap-1 z-10">
          <div className="cursor-move" ref={drag}>
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ visible: component.visible === false ? true : false });
            }}
            title={component.visible === false ? 'Mostrar' : 'Ocultar'}
          >
            {component.visible === false ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicar"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Excluir"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </Button>
        </div>
      )}

      {/* Hover indicator */}
      {!isSelected && (
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-300 rounded pointer-events-none" />
      )}

      {/* Component content */}
      <div className="relative">
        {renderComponent()}
      </div>

      {/* Double click hint */}
      {isSelected && !isEditing && ['heading', 'text', 'paragraph', 'button'].includes(component.type) && (
        <div className="absolute bottom-full left-0 mb-1 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
          Clique duplo para editar
        </div>
      )}
    </div>
  );
}
