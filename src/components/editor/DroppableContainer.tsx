/**
 * Container com suporte a Drag & Drop hierárquico
 * Permite arrastar componentes para dentro e reordenar
 */

import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { hierarchyService } from '../../services/HierarchyService';
import { Plus, GripVertical, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';

export interface DroppableContainerProps {
  node: any;
  children?: React.ReactNode;
  onDrop: (draggedNode: any, targetNodeId: string, position: 'before' | 'after' | 'inside', index?: number) => void;
  onAddChild: (parentId: string, componentType?: string) => void;
  onRemove: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  isSelected: boolean;
  depth?: number;
  index?: number;
  canReorder?: boolean;
  showControls?: boolean;
}

interface DragItem {
  type: 'COMPONENT';
  nodeId?: string;
  componentType: string;
  node?: any;
  fromLibrary?: boolean;
}

interface DropPosition {
  position: 'top' | 'middle' | 'bottom';
  index?: number;
}

export function DroppableContainer({
  node,
  children,
  onDrop,
  onAddChild,
  onRemove,
  onDuplicate,
  onSelect,
  isSelected,
  depth = 0,
  index = 0,
  canReorder = true,
  showControls = true
}: DroppableContainerProps) {
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const canHaveChildren = hierarchyService.canHaveChildren(node.type);
  const hasChildren = node.children && node.children.length > 0;
  
  // Configurar drag
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'COMPONENT',
    item: (): DragItem => ({
      type: 'COMPONENT',
      nodeId: node.id,
      componentType: node.type,
      node: node,
      fromLibrary: false
    }),
    canDrag: () => canReorder,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  // Configurar drop
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: 'COMPONENT',
    canDrop: (item, monitor) => {
      // Não pode dropar em si mesmo
      if (item.nodeId === node.id) {
        return false;
      }
      
      // Não pode dropar um pai dentro de um filho (previne loop)
      if (item.nodeId && isDescendant(item.nodeId, node.id)) {
        return false;
      }
      
      // Verifica se o componente aceita filhos
      if (!canHaveChildren) {
        return false;
      }
      
      // Verifica se pode adicionar esse tipo de filho
      const canAdd = hierarchyService.canAddChild(node.type, item.componentType);
      if (!canAdd) {
        return false;
      }
      
      // Verifica se pode adicionar mais filhos
      const childrenCount = node.children?.length || 0;
      const canAddMore = hierarchyService.canAddMoreChildren(node.type, childrenCount);
      
      return canAddMore;
    },
    hover: (item, monitor) => {
      if (!containerRef.current) return;
      
      const hoverBoundingRect = containerRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverHeight = hoverBoundingRect.height;
      
      // Divide em 3 áreas: topo (20%), meio (60%), fundo (20%)
      const topThreshold = hoverHeight * 0.2;
      const bottomThreshold = hoverHeight * 0.8;
      
      if (hoverClientY < topThreshold) {
        setDropPosition({ position: 'top' });
      } else if (hoverClientY > bottomThreshold) {
        setDropPosition({ position: 'bottom' });
      } else {
        setDropPosition({ position: 'middle' });
      }
    },
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        const pos = dropPosition?.position || 'middle';
        
        if (pos === 'middle') {
          // Drop dentro do container
          onDrop(item.node || item, node.id, 'inside');
        } else if (pos === 'top') {
          // Drop antes do container
          onDrop(item.node || item, node.id, 'before', index);
        } else {
          // Drop depois do container
          onDrop(item.node || item, node.id, 'after', index);
        }
        
        toast.success('Componente adicionado com sucesso');
      }
      
      setDropPosition(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  });
  
  // Combinar refs
  const attachRef = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (canReorder) {
      drag(el);
    }
    drop(el);
  };
  
  // Verifica se um nó é descendente de outro
  function isDescendant(ancestorId: string, nodeId: string): boolean {
    function checkNode(currentNode: any): boolean {
      if (currentNode.id === nodeId) return true;
      if (currentNode.children) {
        return currentNode.children.some((child: any) => checkNode(child));
      }
      return false;
    }
    
    return checkNode(node);
  }
  
  // Estilo do container
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    minHeight: canHaveChildren ? '50px' : 'auto',
    opacity: isDragging ? 0.5 : 1,
    transition: 'all 0.2s',
    outline: isSelected ? '2px solid #3B82F6' : isHovered ? '1px dashed #94A3B8' : 'none',
    outlineOffset: '2px',
    marginLeft: `${depth * 20}px`
  };
  
  // Classe do drop indicator
  const getDropIndicatorClass = () => {
    if (!isOver || !canDrop || !dropPosition) return '';
    
    const baseClass = 'absolute left-0 right-0 h-0.5 bg-blue-500 z-50';
    
    if (dropPosition.position === 'top') {
      return `${baseClass} -top-1`;
    } else if (dropPosition.position === 'bottom') {
      return `${baseClass} -bottom-1`;
    } else {
      return 'absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded z-40';
    }
  };
  
  return (
    <div
      ref={attachRef}
      style={containerStyle}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
    >
      {/* Drop Indicator */}
      {isOver && canDrop && dropPosition && (
        <div className={getDropIndicatorClass()} />
      )}
      
      {/* Controles do Container */}
      {showControls && (isHovered || isSelected) && (
        <div className="absolute -top-8 left-0 bg-white dark:bg-gray-800 border rounded-lg shadow-lg px-2 py-1 flex items-center gap-1 z-50">
          {/* Tipo do componente */}
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 px-2">
            {node.type}
          </span>
          
          {/* Handle para arrastar */}
          {canReorder && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 cursor-move"
              title="Arrastar"
            >
              <GripVertical className="w-3 h-3" />
            </Button>
          )}
          
          {/* Adicionar filho */}
          {canHaveChildren && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              title="Adicionar componente filho"
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
          
          {/* Colapsar/Expandir */}
          {hasChildren && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              title={isCollapsed ? 'Expandir' : 'Colapsar'}
            >
              {isCollapsed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>
          )}
          
          {/* Duplicar */}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(node.id);
            }}
            title="Duplicar"
          >
            <Copy className="w-3 h-3" />
          </Button>
          
          {/* Remover */}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(node.id);
            }}
            title="Remover"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      {/* Conteúdo do container */}
      <div className={isCollapsed ? 'hidden' : ''}>
        {children}
      </div>
      
      {/* Empty state para containers vazios */}
      {canHaveChildren && !hasChildren && !isCollapsed && (
        <div
          className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
        >
          <div className="text-center">
            <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">
              Arraste componentes aqui ou clique para adicionar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {node.type}
            </p>
          </div>
        </div>
      )}
      
      {/* Badge de informação */}
      {canHaveChildren && hasChildren && !isCollapsed && (
        <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-tl">
          {node.children.length} {node.children.length === 1 ? 'filho' : 'filhos'}
        </div>
      )}
    </div>
  );
}

/**
 * Componente de drop zone vazio para áreas onde não há componentes
 */
export function EmptyDropZone({
  onDrop,
  acceptedTypes,
  label = 'Arraste componentes aqui'
}: {
  onDrop: (item: any) => void;
  acceptedTypes?: string[];
  label?: string;
}) {
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: 'COMPONENT',
    canDrop: (item) => {
      if (acceptedTypes && !acceptedTypes.includes(item.componentType)) {
        return false;
      }
      return true;
    },
    drop: (item) => {
      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });
  
  return (
    <div
      ref={drop}
      className={`
        min-h-32 border-2 border-dashed rounded-lg flex items-center justify-center
        transition-all duration-200
        ${isOver && canDrop
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
        }
        ${!canDrop && isOver ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}
      `}
    >
      <div className="text-center">
        <Plus className={`w-8 h-8 mx-auto mb-2 ${isOver && canDrop ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className={`text-sm ${isOver && canDrop ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
          {isOver && canDrop ? 'Solte aqui' : label}
        </p>
        {acceptedTypes && acceptedTypes.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Aceita: {acceptedTypes.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
