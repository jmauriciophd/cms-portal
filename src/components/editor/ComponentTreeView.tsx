import { useState } from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy,
  GripVertical,
  Layers
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';

interface Component {
  id: string;
  type: string;
  props: any;
  styles: React.CSSProperties;
  customCSS?: string;
  customJS?: string;
  children?: Component[];
  visible?: boolean;
}

interface ComponentTreeViewProps {
  components: Component[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

export function ComponentTreeView({
  components,
  selectedId,
  onSelect,
  onMove,
  onDelete,
  onDuplicate,
  onToggleVisibility
}: ComponentTreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const TreeNode = ({ component, level = 0 }: { component: Component; level?: number }) => {
    const hasChildren = component.children && component.children.length > 0;
    const isExpanded = expandedIds.has(component.id);
    const isSelected = selectedId === component.id;

    const [{ isDragging }, drag] = useDrag({
      type: 'tree-node',
      item: { id: component.id, type: component.type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    });

    const [{ isOver, canDrop }, drop] = useDrop({
      accept: 'tree-node',
      drop: (item: { id: string }, monitor) => {
        if (item.id !== component.id && !monitor.didDrop()) {
          // Determinar posição baseado no mouse
          onMove(item.id, component.id, 'inside');
        }
      },
      canDrop: (item) => {
        // Não pode dropar em si mesmo
        return item.id !== component.id;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop()
      })
    });

    return (
      <div>
        <div
          ref={(node) => drag(drop(node))}
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
            transition-colors
            ${isSelected ? 'bg-indigo-100 border-l-2 border-indigo-500' : 'hover:bg-gray-50'}
            ${isDragging ? 'opacity-50' : ''}
            ${isOver && canDrop ? 'bg-indigo-50' : ''}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(component.id);
          }}
        >
          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(component.id);
              }}
              className="p-0 w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Drag Handle */}
          <GripVertical className="w-3 h-3 text-gray-400" />

          {/* Component Info */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="text-xs">
              {component.type}
            </Badge>
            {component.props?.text && (
              <span className="text-xs text-gray-600 truncate">
                {component.props.text.substring(0, 20)}
              </span>
            )}
            {component.props?.title && (
              <span className="text-xs text-gray-600 truncate">
                {component.props.title.substring(0, 20)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(component.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={component.visible === false ? 'Mostrar' : 'Ocultar'}
            >
              {component.visible === false ? (
                <EyeOff className="w-3 h-3 text-gray-400" />
              ) : (
                <Eye className="w-3 h-3 text-gray-500" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(component.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Duplicar"
            >
              <Copy className="w-3 h-3 text-gray-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(component.id);
              }}
              className="p-1 hover:bg-red-100 rounded"
              title="Excluir"
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {component.children!.map((child) => (
              <TreeNode key={child.id} component={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Estrutura da Página</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {components.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Nenhum componente</p>
              <p className="text-xs mt-1">Arraste da biblioteca</p>
            </div>
          ) : (
            components.map((component) => (
              <TreeNode key={component.id} component={component} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
