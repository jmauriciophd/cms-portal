/**
 * Biblioteca de Componentes Hierárquicos
 * Organizada por categorias e com suporte a drag-and-drop
 */

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { 
  Box, Layout, Grid3x3, Layers, Menu, FileText,
  Image, Video, Type, Heading as HeadingIcon, AlignLeft,
  Link as LinkIcon, Square, Circle,
  List, ListOrdered, Quote, Code, Minus, MoreHorizontal,
  Columns, Rows, BoxSelect, Folder, ChevronRight,
  Container, Frame, Package
} from 'lucide-react';
import { hierarchyService } from '../../services/HierarchyService';
import { HierarchicalNode } from './HierarchicalRenderNode';

interface ComponentDefinition {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  acceptsChildren: boolean;
  defaultProps?: Record<string, any>;
  defaultStyles?: React.CSSProperties;
  preview: React.ReactNode;
}

const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  // ========================================
  // CONTAINERS
  // ========================================
  {
    type: 'section',
    label: 'Seção',
    icon: <Container className="w-4 h-4" />,
    category: 'containers',
    description: 'Container principal de seção',
    acceptsChildren: true,
    defaultProps: { id: '' },
    defaultStyles: { padding: '2rem', minHeight: '200px' },
    preview: <div className="border-2 border-dashed p-4 text-center text-sm">Seção</div>
  },
  {
    type: 'container',
    label: 'Container',
    icon: <Box className="w-4 h-4" />,
    category: 'containers',
    description: 'Container genérico para agrupar elementos',
    acceptsChildren: true,
    defaultProps: {},
    defaultStyles: { padding: '1rem' },
    preview: <div className="border p-3 text-xs">Container</div>
  },
  {
    type: 'div',
    label: 'Div',
    icon: <Square className="w-4 h-4" />,
    category: 'containers',
    description: 'Div HTML padrão',
    acceptsChildren: true,
    defaultProps: {},
    preview: <div className="border p-2 text-xs">Div</div>
  },
  {
    type: 'header',
    label: 'Header',
    icon: <Layout className="w-4 h-4" />,
    category: 'containers',
    description: 'Cabeçalho da página',
    acceptsChildren: true,
    defaultStyles: { padding: '1rem', borderBottom: '1px solid #e5e7eb' },
    preview: <div className="border-b p-2 text-xs">Header</div>
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: <Layout className="w-4 h-4" />,
    category: 'containers',
    description: 'Rodapé da página',
    acceptsChildren: true,
    defaultStyles: { padding: '1rem', borderTop: '1px solid #e5e7eb' },
    preview: <div className="border-t p-2 text-xs">Footer</div>
  },
  {
    type: 'nav',
    label: 'Navegação',
    icon: <Menu className="w-4 h-4" />,
    category: 'containers',
    description: 'Menu de navegação',
    acceptsChildren: true,
    defaultStyles: { display: 'flex', gap: '1rem', padding: '1rem' },
    preview: <div className="flex gap-2 p-2 text-xs">Nav</div>
  },
  {
    type: 'article',
    label: 'Article',
    icon: <FileText className="w-4 h-4" />,
    category: 'containers',
    description: 'Artigo ou conteúdo principal',
    acceptsChildren: true,
    defaultStyles: { padding: '2rem' },
    preview: <div className="border p-3 text-xs">Article</div>
  },
  {
    type: 'aside',
    label: 'Aside',
    icon: <BoxSelect className="w-4 h-4" />,
    category: 'containers',
    description: 'Conteúdo lateral',
    acceptsChildren: true,
    defaultStyles: { padding: '1rem', background: '#f3f4f6' },
    preview: <div className="bg-gray-100 p-2 text-xs">Aside</div>
  },
  
  // ========================================
  // LAYOUTS
  // ========================================
  {
    type: 'grid',
    label: 'Grid',
    icon: <Grid3x3 className="w-4 h-4" />,
    category: 'layouts',
    description: 'Layout em grade responsivo',
    acceptsChildren: true,
    defaultProps: { columns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' },
    preview: <div className="grid grid-cols-2 gap-1"><div className="bg-gray-200 h-6" /><div className="bg-gray-200 h-6" /></div>
  },
  {
    type: 'gridItem',
    label: 'Grid Item',
    icon: <Square className="w-4 h-4" />,
    category: 'layouts',
    description: 'Item de uma grade',
    acceptsChildren: true,
    defaultProps: {},
    preview: <div className="bg-gray-200 p-2 text-xs">Item</div>
  },
  {
    type: 'flexbox',
    label: 'Flexbox',
    icon: <Layers className="w-4 h-4" />,
    category: 'layouts',
    description: 'Layout flexível',
    acceptsChildren: true,
    defaultProps: { direction: 'row', gap: '1rem' },
    preview: <div className="flex gap-1"><div className="bg-gray-200 flex-1 h-6" /><div className="bg-gray-200 flex-1 h-6" /></div>
  },
  {
    type: 'columns',
    label: 'Colunas',
    icon: <Columns className="w-4 h-4" />,
    category: 'layouts',
    description: 'Layout de colunas',
    acceptsChildren: true,
    defaultProps: { gap: '1rem' },
    preview: <div className="grid grid-cols-2 gap-1"><div className="bg-gray-200 h-8" /><div className="bg-gray-200 h-8" /></div>
  },
  {
    type: 'column',
    label: 'Coluna',
    icon: <Frame className="w-4 h-4" />,
    category: 'layouts',
    description: 'Uma coluna individual',
    acceptsChildren: true,
    defaultProps: {},
    preview: <div className="bg-gray-200 p-2 text-xs">Col</div>
  },
  
  // ========================================
  // INTERATIVOS
  // ========================================
  {
    type: 'accordion',
    label: 'Accordion',
    icon: <List className="w-4 h-4" />,
    category: 'interactive',
    description: 'Lista expansível',
    acceptsChildren: true,
    defaultProps: {},
    preview: <div className="border rounded text-xs p-1">▼ Accordion</div>
  },
  {
    type: 'accordionItem',
    label: 'Accordion Item',
    icon: <ChevronRight className="w-4 h-4" />,
    category: 'interactive',
    description: 'Item de accordion',
    acceptsChildren: false,
    defaultProps: { title: 'Item' },
    preview: <div className="border-t px-2 py-1 text-xs">▸ Item</div>
  },
  {
    type: 'tabs',
    label: 'Tabs',
    icon: <Folder className="w-4 h-4" />,
    category: 'interactive',
    description: 'Abas de navegação',
    acceptsChildren: true,
    defaultProps: {},
    preview: <div className="border-b flex gap-2 text-xs pb-1"><span>Tab 1</span><span>Tab 2</span></div>
  },
  {
    type: 'tab',
    label: 'Tab',
    icon: <Package className="w-4 h-4" />,
    category: 'interactive',
    description: 'Uma aba individual',
    acceptsChildren: false,
    defaultProps: { label: 'Tab' },
    preview: <div className="text-xs">Tab</div>
  },
  {
    type: 'carousel',
    label: 'Carousel',
    icon: <Layers className="w-4 h-4" />,
    category: 'interactive',
    description: 'Carrossel de imagens/conteúdo',
    acceptsChildren: true,
    defaultProps: {},
    preview: <div className="border rounded p-2 text-xs">◀ Slide ▶</div>
  },
  {
    type: 'carouselSlide',
    label: 'Slide',
    icon: <Square className="w-4 h-4" />,
    category: 'interactive',
    description: 'Slide do carrossel',
    acceptsChildren: true,
    defaultProps: {},
    preview: <div className="bg-gray-200 p-2 text-xs">Slide</div>
  },
  
  // ========================================
  // CARDS
  // ========================================
  {
    type: 'card',
    label: 'Card',
    icon: <Square className="w-4 h-4" />,
    category: 'cards',
    description: 'Card/Cartão',
    acceptsChildren: true,
    defaultStyles: { border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' },
    preview: <div className="border rounded p-2 text-xs">Card</div>
  },
  {
    type: 'cardHeader',
    label: 'Card Header',
    icon: <Layout className="w-4 h-4" />,
    category: 'cards',
    description: 'Cabeçalho do card',
    acceptsChildren: true,
    preview: <div className="border-b p-2 text-xs">Header</div>
  },
  {
    type: 'cardBody',
    label: 'Card Body',
    icon: <FileText className="w-4 h-4" />,
    category: 'cards',
    description: 'Corpo do card',
    acceptsChildren: true,
    preview: <div className="p-2 text-xs">Body</div>
  },
  {
    type: 'cardFooter',
    label: 'Card Footer',
    icon: <Layout className="w-4 h-4" />,
    category: 'cards',
    description: 'Rodapé do card',
    acceptsChildren: true,
    preview: <div className="border-t p-2 text-xs">Footer</div>
  },
  
  // ========================================
  // FORMULÁRIOS
  // ========================================
  {
    type: 'form',
    label: 'Formulário',
    icon: <FileText className="w-4 h-4" />,
    category: 'forms',
    description: 'Formulário HTML',
    acceptsChildren: true,
    defaultProps: { method: 'POST', action: '#' },
    preview: <div className="border p-2 text-xs">Form</div>
  },
  {
    type: 'formGroup',
    label: 'Form Group',
    icon: <Box className="w-4 h-4" />,
    category: 'forms',
    description: 'Grupo de campo de formulário',
    acceptsChildren: true,
    preview: <div className="space-y-1"><div className="h-3 bg-gray-200" /><div className="h-6 bg-gray-300" /></div>
  },
  
  // ========================================
  // TEXTOS
  // ========================================
  {
    type: 'heading',
    label: 'Título',
    icon: <HeadingIcon className="w-4 h-4" />,
    category: 'text',
    description: 'Título H1-H6',
    acceptsChildren: false,
    defaultProps: { tag: 'h2', text: 'Título' },
    preview: <div className="font-bold text-xs">Título</div>
  },
  {
    type: 'paragraph',
    label: 'Parágrafo',
    icon: <AlignLeft className="w-4 h-4" />,
    category: 'text',
    description: 'Parágrafo de texto',
    acceptsChildren: false,
    defaultProps: { text: 'Texto do parágrafo' },
    preview: <div className="text-xs">Parágrafo</div>
  },
  {
    type: 'text',
    label: 'Texto',
    icon: <Type className="w-4 h-4" />,
    category: 'text',
    description: 'Texto simples (span)',
    acceptsChildren: false,
    defaultProps: { text: 'Texto' },
    preview: <span className="text-xs">Texto</span>
  },
  
  // ========================================
  // MÍDIA
  // ========================================
  {
    type: 'image',
    label: 'Imagem',
    icon: <Image className="w-4 h-4" />,
    category: 'media',
    description: 'Imagem',
    acceptsChildren: false,
    defaultProps: { src: 'https://via.placeholder.com/400x300', alt: 'Imagem' },
    preview: <div className="bg-gray-200 h-8 flex items-center justify-center text-xs">🖼️</div>
  },
  {
    type: 'video',
    label: 'Vídeo',
    icon: <Video className="w-4 h-4" />,
    category: 'media',
    description: 'Player de vídeo',
    acceptsChildren: false,
    defaultProps: { src: '', controls: true },
    preview: <div className="bg-gray-200 h-8 flex items-center justify-center text-xs">▶️</div>
  },
  
  // ========================================
  // CONTROLES
  // ========================================
  {
    type: 'button',
    label: 'Botão',
    icon: <Circle className="w-4 h-4" />,
    category: 'controls',
    description: 'Botão clicável',
    acceptsChildren: false,
    defaultProps: { text: 'Botão', buttonType: 'button' },
    defaultStyles: { padding: '0.5rem 1rem', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '0.25rem' },
    preview: <button type="button" className="bg-blue-500 text-white px-2 py-1 rounded text-xs" disabled>Botão</button>
  },
  {
    type: 'link',
    label: 'Link',
    icon: <LinkIcon className="w-4 h-4" />,
    category: 'controls',
    description: 'Link/Hiperlink',
    acceptsChildren: false,
    defaultProps: { text: 'Link', href: '#' },
    defaultStyles: { color: '#3B82F6', textDecoration: 'underline' },
    preview: <span className="text-blue-500 underline text-xs">Link</span>
  },
  {
    type: 'input',
    label: 'Input',
    icon: <Square className="w-4 h-4" />,
    category: 'controls',
    description: 'Campo de entrada',
    acceptsChildren: false,
    defaultProps: { inputType: 'text', placeholder: 'Digite...' },
    preview: <input type="text" placeholder="Input" className="border rounded px-2 py-1 text-xs w-full" readOnly />
  },
  {
    type: 'textarea',
    label: 'Textarea',
    icon: <FileText className="w-4 h-4" />,
    category: 'controls',
    description: 'Área de texto',
    acceptsChildren: false,
    defaultProps: { placeholder: 'Digite...', rows: 4 },
    preview: <textarea placeholder="Textarea" className="border rounded px-2 py-1 text-xs w-full" rows={2} readOnly />
  },
  
  // ========================================
  // LISTAS
  // ========================================
  {
    type: 'list',
    label: 'Lista',
    icon: <List className="w-4 h-4" />,
    category: 'lists',
    description: 'Lista (UL/OL)',
    acceptsChildren: true,
    defaultProps: { ordered: false },
    preview: <ul className="list-disc pl-4 text-xs"><li>Item</li></ul>
  },
  {
    type: 'listItem',
    label: 'Item de Lista',
    icon: <Minus className="w-4 h-4" />,
    category: 'lists',
    description: 'Item de lista (LI)',
    acceptsChildren: true,
    defaultProps: {},
    preview: <li className="text-xs">Item</li>
  },
  
  // ========================================
  // OUTROS
  // ========================================
  {
    type: 'blockquote',
    label: 'Citação',
    icon: <Quote className="w-4 h-4" />,
    category: 'other',
    description: 'Bloco de citação',
    acceptsChildren: true,
    defaultStyles: { borderLeft: '4px solid #e5e7eb', paddingLeft: '1rem', fontStyle: 'italic' },
    preview: <blockquote className="border-l-4 pl-2 italic text-xs">Citação</blockquote>
  },
  {
    type: 'code',
    label: 'Código',
    icon: <Code className="w-4 h-4" />,
    category: 'other',
    description: 'Bloco de código',
    acceptsChildren: false,
    defaultProps: {},
    defaultStyles: { background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace' },
    preview: <code className="bg-gray-100 px-1 rounded text-xs font-mono">code</code>
  },
  {
    type: 'spacer',
    label: 'Espaçador',
    icon: <Minus className="w-4 h-4" />,
    category: 'other',
    description: 'Espaço vertical',
    acceptsChildren: false,
    defaultProps: { height: '20px' },
    preview: <div className="h-4 border-t border-b border-dashed" />
  },
  {
    type: 'divider',
    label: 'Divisor',
    icon: <Minus className="w-4 h-4" />,
    category: 'other',
    description: 'Linha divisória (HR)',
    acceptsChildren: false,
    defaultProps: {},
    preview: <hr className="border-t" />
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: <Box /> },
  { id: 'containers', label: 'Containers', icon: <Container /> },
  { id: 'layouts', label: 'Layouts', icon: <Layout /> },
  { id: 'interactive', label: 'Interativos', icon: <Layers /> },
  { id: 'cards', label: 'Cards', icon: <Square /> },
  { id: 'forms', label: 'Formulários', icon: <FileText /> },
  { id: 'text', label: 'Textos', icon: <Type /> },
  { id: 'media', label: 'Mídia', icon: <Image /> },
  { id: 'controls', label: 'Controles', icon: <Circle /> },
  { id: 'lists', label: 'Listas', icon: <List /> },
  { id: 'other', label: 'Outros', icon: <MoreHorizontal /> }
];

interface DraggableComponentProps {
  definition: ComponentDefinition;
  onComponentClick?: (definition: ComponentDefinition) => void;
}

function DraggableComponent({ definition, onComponentClick }: DraggableComponentProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'COMPONENT',
    item: {
      type: 'COMPONENT',
      componentType: definition.type,
      fromLibrary: true,
      definition
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  const handleClick = (e: React.MouseEvent) => {
    // Se tiver callback de clique e não estiver arrastando
    if (onComponentClick && !isDragging) {
      e.stopPropagation();
      onComponentClick(definition);
    }
  };
  
  // Validação de segurança
  if (!definition || !definition.type) {
    console.error('Invalid definition:', definition);
    return null;
  }
  
  return (
    <div 
      ref={drag} 
      onClick={handleClick} 
      title="Arraste ou clique para inserir"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Card className="p-3 cursor-pointer hover:shadow-md transition-all">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            {definition.icon || <Box className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium truncate">{definition.label || 'Componente'}</span>
              {definition.acceptsChildren && (
                <Badge variant="secondary" className="text-xs">
                  Container
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {definition.description || 'Sem descrição'}
            </p>
            <div className="border rounded p-1 bg-white dark:bg-gray-950">
              {definition.preview || <div className="text-xs text-gray-400">Preview</div>}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface HierarchicalComponentLibraryProps {
  onComponentClick?: (definition: ComponentDefinition) => void;
}

export function HierarchicalComponentLibrary({ onComponentClick }: HierarchicalComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const filteredComponents = COMPONENT_DEFINITIONS.filter(comp => {
    const matchesSearch = comp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const containerComponents = filteredComponents.filter(c => c.acceptsChildren);
  const leafComponents = filteredComponents.filter(c => !c.acceptsChildren);
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="mb-2">Biblioteca de Componentes</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Arraste ou clique nos componentes para inserir
        </p>
        <Input
          placeholder="Buscar componentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 lg:grid-cols-4 gap-1 p-2">
          {CATEGORIES.slice(0, 8).map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredComponents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum componente encontrado</p>
              </div>
            ) : (
              <>
                {containerComponents.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Container className="w-4 h-4" />
                      Containers ({containerComponents.length})
                    </h3>
                    <div className="space-y-2">
                      {containerComponents.map(comp => (
                        <ErrorBoundary key={comp.type} fallback={<div className="text-xs text-red-500 p-2">Erro ao carregar: {comp.label}</div>}>
                          <DraggableComponent 
                            definition={comp} 
                            onComponentClick={onComponentClick}
                          />
                        </ErrorBoundary>
                      ))}
                    </div>
                  </div>
                )}
                
                {leafComponents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Componentes ({leafComponents.length})
                    </h3>
                    <div className="space-y-2">
                      {leafComponents.map(comp => (
                        <ErrorBoundary key={comp.type} fallback={<div className="text-xs text-red-500 p-2">Erro ao carregar: {comp.label}</div>}>
                          <DraggableComponent 
                            definition={comp} 
                            onComponentClick={onComponentClick}
                          />
                        </ErrorBoundary>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </Tabs>
      
      <div className="p-4 border-t bg-muted/50">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Dica:</strong> Containers aceitam filhos</p>
          <p>🎯 Total: {filteredComponents.length} componentes</p>
        </div>
      </div>
    </div>
  );
}
