/**
 * Renderização Hierárquica de Componentes
 * Suporta aninhamento e estrutura pai-filho
 */

import React from 'react';
import { DroppableContainer } from './DroppableContainer';
import { hierarchyService } from '../../services/HierarchyService';

export interface HierarchicalNode {
  id: string;
  type: string;
  props?: Record<string, any>;
  styles?: React.CSSProperties;
  children?: HierarchicalNode[];
  slots?: Record<string, HierarchicalNode[]>;
  content?: string;
  className?: string;
}

interface HierarchicalRenderNodeProps {
  node: HierarchicalNode;
  depth?: number;
  index?: number;
  onDrop: (draggedNode: any, targetNodeId: string, position: 'before' | 'after' | 'inside', index?: number) => void;
  onAddChild: (parentId: string, componentType?: string) => void;
  onRemove: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<HierarchicalNode>) => void;
  selectedNodeId: string | null;
  isPreview?: boolean;
}

export function HierarchicalRenderNode({
  node,
  depth = 0,
  index = 0,
  onDrop,
  onAddChild,
  onRemove,
  onDuplicate,
  onSelect,
  onUpdateNode,
  selectedNodeId,
  isPreview = false
}: HierarchicalRenderNodeProps) {
  const isSelected = selectedNodeId === node.id;
  const canHaveChildren = hierarchyService.canHaveChildren(node.type);
  const hasSlots = hierarchyService.hasSlots(node.type);
  
  // Renderiza o componente base
  const renderComponent = () => {
    // Props que devem ser convertidos para estilos CSS
    const styleProps = [
      'fontSize', 'fontWeight', 'color', 'backgroundColor', 'padding', 'margin',
      'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'borderRadius', 'borderWidth', 'borderColor', 'borderStyle',
      'textAlign', 'lineHeight', 'letterSpacing', 'textDecoration',
      'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
      'display', 'position', 'top', 'right', 'bottom', 'left',
      'zIndex', 'opacity', 'transform', 'transition', 'cursor',
      'overflow', 'textColor', 'gap', 'flexDirection', 'alignItems',
      'justifyContent', 'gridTemplateColumns', 'gridTemplateRows',
      'flexWrap', 'flex', 'flexGrow', 'flexShrink', 'flexBasis',
      'gridColumn', 'gridRow', 'gridArea', 'order'
    ];
    
    // Props customizados do componente (não vão para o DOM)
    const componentProps = [
      'text', 'content', 'level', 'tag', 'variant', 'size', 'fullWidth',
      'buttonType', 'inputType', 'rows', 'columns', 'direction', 'wrap',
      'justifyContent', 'alignItems', 'columnSpan', 'rowSpan', 'title',
      'label', 'type', 'required', 'placeholder'
    ];
    
    // Props HTML válidos que podem ser passados diretamente
    const validHTMLProps = [
      'id', 'name', 'value', 'disabled', 'readOnly', 'checked',
      'autoFocus', 'autoComplete', 'tabIndex', 'aria-label', 'aria-labelledby',
      'aria-describedby', 'role', 'data-*', 'onClick', 'onChange', 'onSubmit',
      'onFocus', 'onBlur', 'onMouseEnter', 'onMouseLeave'
    ];
    
    // Extrair estilos
    const customStyles: React.CSSProperties = {};
    const htmlProps: Record<string, any> = {};
    
    Object.entries(node.props || {}).forEach(([key, value]) => {
      if (styleProps.includes(key)) {
        // Converter para estilo CSS
        if (key === 'textColor') {
          customStyles.color = value;
        } else {
          customStyles[key as keyof React.CSSProperties] = value;
        }
      } else if (componentProps.includes(key)) {
        // Props do componente - não passar para o DOM
        // Esses serão tratados especificamente em cada caso do switch
      } else if (key.startsWith('data-') || key.startsWith('aria-') || validHTMLProps.includes(key)) {
        // Props HTML válidos
        htmlProps[key] = value;
      }
    });
    
    const combinedProps = {
      ...htmlProps,
      style: { ...customStyles, ...node.styles },
      className: node.className
    };
    
    switch (node.type) {
      // ========================================
      // CONTAINERS
      // ========================================
      case 'section':
        return (
          <section {...combinedProps}>
            {renderChildren()}
          </section>
        );
      
      case 'container':
      case 'div':
        return (
          <div {...combinedProps}>
            {renderChildren()}
          </div>
        );
      
      case 'header':
        return (
          <header {...combinedProps}>
            {renderChildren()}
          </header>
        );
      
      case 'footer':
        return (
          <footer {...combinedProps}>
            {renderChildren()}
          </footer>
        );
      
      case 'nav':
        return (
          <nav {...combinedProps}>
            {renderChildren()}
          </nav>
        );
      
      case 'article':
        return (
          <article {...combinedProps}>
            {renderChildren()}
          </article>
        );
      
      case 'aside':
        return (
          <aside {...combinedProps}>
            {renderChildren()}
          </aside>
        );
      
      // ========================================
      // LAYOUTS
      // ========================================
      case 'grid':
        return (
          <div
            {...combinedProps}
            style={{
              display: 'grid',
              gridTemplateColumns: node.props?.columns || 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: node.props?.gap || '1rem',
              ...node.styles
            }}
          >
            {renderChildren()}
          </div>
        );
      
      case 'gridItem':
        return (
          <div
            {...combinedProps}
            style={{
              gridColumn: node.props?.columnSpan || 'auto',
              gridRow: node.props?.rowSpan || 'auto',
              ...node.styles
            }}
          >
            {renderChildren()}
          </div>
        );
      
      case 'flexbox':
        return (
          <div
            {...combinedProps}
            style={{
              display: 'flex',
              flexDirection: node.props?.direction || 'row',
              justifyContent: node.props?.justifyContent || 'flex-start',
              alignItems: node.props?.alignItems || 'flex-start',
              gap: node.props?.gap || '1rem',
              flexWrap: node.props?.wrap || 'nowrap',
              ...node.styles
            }}
          >
            {renderChildren()}
          </div>
        );
      
      case 'flexRow':
        return (
          <div
            {...combinedProps}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: node.props?.justifyContent || 'flex-start',
              alignItems: node.props?.alignItems || 'center',
              gap: node.props?.gap || '1rem',
              flexWrap: node.props?.wrap || 'nowrap',
              ...node.styles
            }}
          >
            {renderChildren()}
          </div>
        );
      
      case 'flexColumn':
        return (
          <div
            {...combinedProps}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: node.props?.justifyContent || 'flex-start',
              alignItems: node.props?.alignItems || 'stretch',
              gap: node.props?.gap || '1rem',
              ...node.styles
            }}
          >
            {renderChildren()}
          </div>
        );
      
      case 'columns':
        return (
          <div
            {...combinedProps}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${node.children?.length || 2}, 1fr)`,
              gap: node.props?.gap || '1rem',
              ...node.styles
            }}
          >
            {renderChildren()}
          </div>
        );
      
      case 'column':
        return (
          <div {...combinedProps}>
            {renderChildren()}
          </div>
        );
      
      // ========================================
      // COMPONENTES INTERATIVOS
      // ========================================
      case 'accordion':
        return (
          <div {...combinedProps} className="space-y-2">
            {node.children?.map((child, idx) => (
              <HierarchicalRenderNode
                key={child.id}
                node={child}
                depth={depth + 1}
                index={idx}
                onDrop={onDrop}
                onAddChild={onAddChild}
                onRemove={onRemove}
                onDuplicate={onDuplicate}
                onSelect={onSelect}
                onUpdateNode={onUpdateNode}
                selectedNodeId={selectedNodeId}
                isPreview={isPreview}
              />
            ))}
          </div>
        );
      
      case 'accordionItem':
        return (
          <details {...combinedProps} className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer">
              {node.props?.title || 'Accordion Item'}
            </summary>
            <div className="mt-2">
              {node.slots?.content && renderSlot('content')}
            </div>
          </details>
        );
      
      case 'tabs':
        return (
          <div {...combinedProps}>
            <div className="flex border-b">
              {node.children?.map((child, idx) => (
                <button
                  key={child.id}
                  className="px-4 py-2 border-b-2 border-transparent hover:border-blue-500"
                >
                  {child.props?.label || `Tab ${idx + 1}`}
                </button>
              ))}
            </div>
            <div className="p-4">
              {renderChildren()}
            </div>
          </div>
        );
      
      case 'tab':
        return (
          <div {...combinedProps}>
            {node.slots?.content && renderSlot('content')}
          </div>
        );
      
      case 'carousel':
        return (
          <div {...combinedProps} className="relative overflow-hidden">
            <div className="flex">
              {renderChildren()}
            </div>
          </div>
        );
      
      case 'carouselSlide':
        return (
          <div {...combinedProps} className="flex-shrink-0 w-full">
            {renderChildren()}
          </div>
        );
      
      // ========================================
      // CARDS
      // ========================================
      case 'card':
        return (
          <div {...combinedProps} className="border rounded-lg shadow">
            {renderChildren()}
          </div>
        );
      
      case 'cardHeader':
        return (
          <div {...combinedProps} className="p-4 border-b">
            {renderChildren()}
          </div>
        );
      
      case 'cardBody':
        return (
          <div {...combinedProps} className="p-4">
            {renderChildren()}
          </div>
        );
      
      case 'cardFooter':
        return (
          <div {...combinedProps} className="p-4 border-t">
            {renderChildren()}
          </div>
        );
      
      // ========================================
      // FORMULÁRIOS
      // ========================================
      case 'form':
        return (
          <form {...combinedProps} onSubmit={(e) => e.preventDefault()}>
            {renderChildren()}
          </form>
        );
      
      case 'formGroup':
        return (
          <div {...combinedProps} className="mb-4">
            {renderChildren()}
          </div>
        );
      
      // ========================================
      // ELEMENTOS LEAF
      // ========================================
      case 'heading':
        const HeadingTag = (node.props?.level || node.props?.tag || 'h2') as keyof JSX.IntrinsicElements;
        const headingContent = node.props?.content || node.content || node.props?.text || 'Heading';
        return <HeadingTag {...combinedProps}>{headingContent}</HeadingTag>;
      
      case 'paragraph':
        const paragraphContent = node.props?.content || node.content || node.props?.text || 'Paragraph text';
        return <p {...combinedProps}>{paragraphContent}</p>;
      
      case 'text':
        const textContent = node.props?.content || node.content || node.props?.text || 'Text';
        return <span {...combinedProps}>{textContent}</span>;
      
      case 'button':
        const buttonContent = node.props?.text || node.content || 'Button';
        return (
          <button {...combinedProps} type={node.props?.buttonType || 'button'}>
            {buttonContent}
          </button>
        );
      
      case 'image':
        return (
          <img
            {...combinedProps}
            src={node.props?.src || 'https://via.placeholder.com/400x300'}
            alt={node.props?.alt || 'Image'}
          />
        );
      
      case 'video':
        return (
          <video {...combinedProps} controls>
            <source src={node.props?.src || ''} type={node.props?.type || 'video/mp4'} />
          </video>
        );
      
      case 'link':
        return (
          <a {...combinedProps} href={node.props?.href || '#'}>
            {node.content || node.props?.text || 'Link'}
          </a>
        );
      
      case 'input':
        return (
          <input
            {...combinedProps}
            type={node.props?.inputType || 'text'}
            placeholder={node.props?.placeholder || ''}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            {...combinedProps}
            placeholder={node.props?.placeholder || ''}
            rows={node.props?.rows || 4}
          >
            {node.content || ''}
          </textarea>
        );
      
      case 'select':
        return (
          <select {...combinedProps}>
            {node.props?.options?.map((option: any, idx: number) => (
              <option key={idx} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'label':
        return <label {...combinedProps}>{node.content || node.props?.text || 'Label'}</label>;
      
      case 'badge':
        return (
          <span
            {...combinedProps}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${node.className || 'bg-blue-100 text-blue-800'}`}
          >
            {node.props?.text || node.content || 'Badge'}
          </span>
        );
      
      // ========================================
      // LISTAS
      // ========================================
      case 'list':
        const ListTag = node.props?.ordered ? 'ol' : 'ul';
        return (
          <ListTag {...combinedProps}>
            {renderChildren()}
          </ListTag>
        );
      
      case 'listItem':
        return (
          <li {...combinedProps}>
            {node.children && node.children.length > 0 ? renderChildren() : (node.content || 'List item')}
          </li>
        );
      
      // ========================================
      // BLOCOS
      // ========================================
      case 'blockquote':
        return (
          <blockquote {...combinedProps}>
            {renderChildren()}
          </blockquote>
        );
      
      case 'code':
        return <code {...combinedProps}>{node.content || 'code'}</code>;
      
      case 'pre':
        return (
          <pre {...combinedProps}>
            {renderChildren()}
          </pre>
        );
      
      case 'spacer':
        return <div {...combinedProps} style={{ height: node.props?.height || '20px', ...node.styles }} />;
      
      case 'divider':
      case 'hr':
        return <hr {...combinedProps} />;
      
      default:
        return (
          <div {...combinedProps}>
            <p className="text-red-500">Unknown component type: {node.type}</p>
            {renderChildren()}
          </div>
        );
    }
  };
  
  // Renderiza os filhos recursivamente
  const renderChildren = () => {
    if (!node.children || node.children.length === 0) {
      return null;
    }
    
    return node.children.map((child, idx) => (
      <HierarchicalRenderNode
        key={child.id}
        node={child}
        depth={depth + 1}
        index={idx}
        onDrop={onDrop}
        onAddChild={onAddChild}
        onRemove={onRemove}
        onDuplicate={onDuplicate}
        onSelect={onSelect}
        onUpdateNode={onUpdateNode}
        selectedNodeId={selectedNodeId}
        isPreview={isPreview}
      />
    ));
  };
  
  // Renderiza um slot específico
  const renderSlot = (slotName: string) => {
    if (!node.slots || !node.slots[slotName]) {
      return null;
    }
    
    return node.slots[slotName].map((child, idx) => (
      <HierarchicalRenderNode
        key={child.id}
        node={child}
        depth={depth + 1}
        index={idx}
        onDrop={onDrop}
        onAddChild={onAddChild}
        onRemove={onRemove}
        onDuplicate={onDuplicate}
        onSelect={onSelect}
        onUpdateNode={onUpdateNode}
        selectedNodeId={selectedNodeId}
        isPreview={isPreview}
      />
    ));
  };
  
  // No modo preview, apenas renderiza o componente
  if (isPreview) {
    return <>{renderComponent()}</>;
  }
  
  // No modo edição, envolve com DroppableContainer
  return (
    <DroppableContainer
      node={node}
      onDrop={onDrop}
      onAddChild={onAddChild}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      onSelect={onSelect}
      isSelected={isSelected}
      depth={depth}
      index={index}
      canReorder={depth > 0} // Não permite arrastar o nó raiz
      showControls={!isPreview}
    >
      {renderComponent()}
    </DroppableContainer>
  );
}
