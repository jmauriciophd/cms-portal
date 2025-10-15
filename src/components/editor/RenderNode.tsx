import React, { useState, useRef, useEffect } from 'react';
import { useBuilderStore, BuilderNode, ContainerNode } from '../../store/useBuilderStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface RenderNodeProps {
  node: BuilderNode;
  level?: number;
}

export function RenderNode({ node, level = 0 }: RenderNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const {
    selectedNodeId,
    hoveredNodeId,
    selectNode,
    setHoveredNode,
    updateNode,
    removeNode,
    duplicateNode,
  } = useBuilderStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: node.id,
    data: { node }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const isContainer = 'children' in node && node.children !== undefined;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isContainer) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerText;
      updateNode(node.id, { content: newContent });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(node.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(node.id);
  };

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  // Renderizar diferentes tipos de componentes
  const renderContent = () => {
    if (isContainer) {
      const containerNode = node as ContainerNode;
      const isEmpty = !containerNode.children || containerNode.children.length === 0;
      
      return (
        <div className="relative">
          {/* Header do Container */}
          <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded border border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs font-medium text-gray-600 uppercase">
              {node.type}
            </span>
            <span className="text-xs text-gray-400">
              ({containerNode.children?.length || 0} {containerNode.children?.length === 1 ? 'item' : 'itens'})
            </span>
          </div>

          {/* Área de drop */}
          {!isCollapsed && (
            <div 
              className={`min-h-[80px] rounded-md transition-colors ${
                isEmpty 
                  ? 'border-2 border-dashed border-gray-300 bg-gray-50' 
                  : 'border border-gray-200'
              } ${isHovered ? 'border-blue-400 bg-blue-50' : ''}`}
            >
              {isEmpty ? (
                <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
                  Solte componentes aqui
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {containerNode.children.map((child) => (
                    <RenderNode key={child.id} node={child} level={level + 1} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Componentes simples (text, button, etc)
    switch (node.type) {
      case 'heading':
        return (
          <h2
            ref={contentRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={node.className}
            style={node.styles}
          >
            {node.content || 'Título'}
          </h2>
        );

      case 'paragraph':
        return (
          <p
            ref={contentRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={node.className}
            style={node.styles}
          >
            {node.content || 'Parágrafo'}
          </p>
        );

      case 'button':
        return (
          <button
            ref={contentRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={node.className}
            style={node.styles}
          >
            {node.content || 'Botão'}
          </button>
        );

      case 'image':
        return (
          <div className="relative group">
            <img
              src={node.content || 'https://via.placeholder.com/400x300'}
              alt=""
              className={node.className}
              style={node.styles}
            />
            {isSelected && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded" />
            )}
          </div>
        );

      case 'link':
        return (
          <a
            ref={contentRef}
            href="#"
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              if (!isEditing) e.preventDefault();
            }}
            className={node.className}
            style={node.styles}
          >
            {node.content || 'Link'}
          </a>
        );

      case 'text':
      default:
        return (
          <span
            ref={contentRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={node.className}
            style={node.styles}
          >
            {node.content || 'Texto'}
          </span>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHoveredNode(node.id)}
      onMouseLeave={() => setHoveredNode(null)}
      className={`relative group ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${isHovered && !isSelected ? 'ring-1 ring-blue-300' : ''}`}
    >
      {/* Toolbar do componente */}
      {isSelected && (
        <div className="absolute -top-8 left-0 flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs z-10">
          <button
            {...attributes}
            {...listeners}
            className="cursor-move p-1 hover:bg-blue-600 rounded"
          >
            <GripVertical className="w-3 h-3" />
          </button>
          <span className="px-1">{node.type}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDuplicate}
            className="h-6 w-6 p-0 hover:bg-blue-600"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-6 w-6 p-0 hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Conteúdo do componente */}
      <div className={node.className} style={node.styles}>
        {renderContent()}
      </div>

      {/* Hint de edição */}
      {isHovered && !isContainer && !isEditing && (
        <div className="absolute bottom-full left-0 mb-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Duplo clique para editar
        </div>
      )}
    </div>
  );
}
