/**
 * Biblioteca de Componentes Melhorada
 * Interface moderna com visualização aprimorada de componentes, cards e templates
 */

import React, { useState, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { 
  Box, Layout, Grid3x3, Layers, Menu, FileText,
  Image, Video, Type, Heading as HeadingIcon, AlignLeft,
  Link as LinkIcon, Square, Circle, List, ListOrdered, Quote,
  Code, Minus, MoreHorizontal, Columns, Rows, Container,
  Frame, Package, Search, LayoutGrid, LayoutList,
  Star, Clock, TrendingUp, Filter, X, ChevronDown,
  Sparkles, Heart, FileCode
} from 'lucide-react';
import { hierarchyService } from '../../services/HierarchyService';
import { hierarchicalTemplateService } from '../../services/HierarchicalTemplateService';
import { HierarchicalNode } from './HierarchicalRenderNode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
  tags?: string[];
}

// Definições completas de componentes
const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  // CONTAINERS
  {
    type: 'section',
    label: 'Seção',
    icon: <Container className="w-5 h-5" />,
    category: 'containers',
    description: 'Container principal de seção com espaçamento padrão',
    acceptsChildren: true,
    defaultProps: { id: '' },
    defaultStyles: { padding: '3rem 1rem', minHeight: '300px', backgroundColor: '#ffffff' },
    preview: (
      <div className="w-full h-20 border-2 border-dashed border-indigo-300 bg-indigo-50 rounded flex items-center justify-center">
        <span className="text-sm font-medium text-indigo-600">Seção Completa</span>
      </div>
    ),
    tags: ['container', 'section', 'wrapper']
  },
  {
    type: 'container',
    label: 'Container',
    icon: <Box className="w-5 h-5" />,
    category: 'containers',
    description: 'Container genérico para agrupar elementos',
    acceptsChildren: true,
    defaultProps: {},
    defaultStyles: { padding: '1.5rem', backgroundColor: '#f9fafb' },
    preview: (
      <div className="w-full h-16 border-2 border-gray-300 bg-gray-50 rounded flex items-center justify-center">
        <span className="text-xs text-gray-600">Container</span>
      </div>
    ),
    tags: ['container', 'box', 'wrapper']
  },
  {
    type: 'div',
    label: 'Div',
    icon: <Square className="w-5 h-5" />,
    category: 'containers',
    description: 'Div HTML padrão - elemento mais básico',
    acceptsChildren: true,
    defaultProps: {},
    preview: (
      <div className="w-full h-12 border border-gray-300 rounded flex items-center justify-center">
        <span className="text-xs text-gray-500">Div</span>
      </div>
    ),
    tags: ['div', 'basic', 'html']
  },
  
  // LAYOUTS
  {
    type: 'grid',
    label: 'Grid',
    icon: <Grid3x3 className="w-5 h-5" />,
    category: 'layouts',
    description: 'Layout em grid CSS - até 4 colunas',
    acceptsChildren: true,
    defaultProps: { columns: 3, gap: '1rem' },
    defaultStyles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
    preview: (
      <div className="grid grid-cols-3 gap-1 w-full">
        <div className="h-8 bg-blue-200 rounded"></div>
        <div className="h-8 bg-blue-200 rounded"></div>
        <div className="h-8 bg-blue-200 rounded"></div>
      </div>
    ),
    tags: ['grid', 'layout', 'columns']
  },
  {
    type: 'flexRow',
    label: 'Flex Row',
    icon: <Columns className="w-5 h-5" />,
    category: 'layouts',
    description: 'Layout flexível horizontal',
    acceptsChildren: true,
    defaultProps: { gap: '1rem', align: 'center' },
    defaultStyles: { display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' },
    preview: (
      <div className="flex gap-2 w-full">
        <div className="h-8 w-1/3 bg-green-200 rounded"></div>
        <div className="h-8 w-1/3 bg-green-200 rounded"></div>
        <div className="h-8 w-1/3 bg-green-200 rounded"></div>
      </div>
    ),
    tags: ['flex', 'row', 'horizontal']
  },
  {
    type: 'flexColumn',
    label: 'Flex Column',
    icon: <Rows className="w-5 h-5" />,
    category: 'layouts',
    description: 'Layout flexível vertical',
    acceptsChildren: true,
    defaultProps: { gap: '1rem' },
    defaultStyles: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    preview: (
      <div className="flex flex-col gap-1 w-full">
        <div className="h-4 bg-purple-200 rounded"></div>
        <div className="h-4 bg-purple-200 rounded"></div>
        <div className="h-4 bg-purple-200 rounded"></div>
      </div>
    ),
    tags: ['flex', 'column', 'vertical']
  },
  
  // CARDS
  {
    type: 'card',
    label: 'Card',
    icon: <Frame className="w-5 h-5" />,
    category: 'cards',
    description: 'Card com borda e sombra',
    acceptsChildren: true,
    defaultStyles: { 
      padding: '1.5rem', 
      border: '1px solid #e5e7eb', 
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    preview: (
      <div className="w-full p-4 border rounded-lg shadow-sm bg-white">
        <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
        <div className="h-2 bg-gray-100 rounded w-full"></div>
      </div>
    ),
    tags: ['card', 'container', 'shadow']
  },
  {
    type: 'cardWithHeader',
    label: 'Card com Cabeçalho',
    icon: <FileText className="w-5 h-5" />,
    category: 'cards',
    description: 'Card com cabeçalho destacado',
    acceptsChildren: true,
    defaultStyles: { 
      border: '1px solid #e5e7eb', 
      borderRadius: '0.5rem',
      overflow: 'hidden'
    },
    preview: (
      <div className="w-full border rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2">
          <div className="h-2 bg-white/80 rounded w-1/2"></div>
        </div>
        <div className="p-3 bg-white">
          <div className="h-2 bg-gray-200 rounded mb-1"></div>
          <div className="h-2 bg-gray-100 rounded"></div>
        </div>
      </div>
    ),
    tags: ['card', 'header', 'title']
  },
  
  // INTERACTIVE
  {
    type: 'hero',
    label: 'Hero Section',
    icon: <Sparkles className="w-5 h-5" />,
    category: 'interactive',
    description: 'Seção hero com fundo e call-to-action',
    acceptsChildren: true,
    defaultStyles: { 
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    preview: (
      <div className="w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded flex items-center justify-center">
        <span className="text-white font-bold">Hero</span>
      </div>
    ),
    tags: ['hero', 'banner', 'cta']
  },
  {
    type: 'accordion',
    label: 'Accordion',
    icon: <List className="w-5 h-5" />,
    category: 'interactive',
    description: 'Acordeão expansível',
    acceptsChildren: true,
    defaultProps: { items: 3 },
    preview: (
      <div className="w-full space-y-1">
        <div className="border rounded p-2 bg-white flex items-center gap-2">
          <ChevronDown className="w-3 h-3" />
          <div className="h-2 bg-gray-300 rounded flex-1"></div>
        </div>
        <div className="border rounded p-2 bg-gray-50">
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
    tags: ['accordion', 'collapse', 'faq']
  },
  {
    type: 'tabs',
    label: 'Tabs',
    icon: <Layers className="w-5 h-5" />,
    category: 'interactive',
    description: 'Abas de navegação',
    acceptsChildren: true,
    defaultProps: { tabs: 3 },
    preview: (
      <div className="w-full">
        <div className="flex gap-1 border-b pb-1">
          <div className="px-3 py-1 bg-blue-500 text-white text-xs rounded-t">Tab 1</div>
          <div className="px-3 py-1 bg-gray-200 text-xs rounded-t">Tab 2</div>
        </div>
        <div className="border p-2 rounded-b">
          <div className="h-2 bg-gray-100 rounded"></div>
        </div>
      </div>
    ),
    tags: ['tabs', 'navigation', 'panels']
  },
  
  // TEXT
  {
    type: 'heading',
    label: 'Título',
    icon: <HeadingIcon className="w-5 h-5" />,
    category: 'text',
    description: 'Título H1-H6 configurável',
    acceptsChildren: false,
    defaultProps: { tag: 'h2', text: 'Título da Seção' },
    defaultStyles: { marginBottom: '1rem' },
    preview: <div className="font-bold text-lg">Título</div>,
    tags: ['heading', 'title', 'h1', 'h2', 'h3']
  },
  {
    type: 'paragraph',
    label: 'Parágrafo',
    icon: <AlignLeft className="w-5 h-5" />,
    category: 'text',
    description: 'Parágrafo de texto',
    acceptsChildren: false,
    defaultProps: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    defaultStyles: { lineHeight: '1.6', marginBottom: '1rem' },
    preview: <div className="text-sm text-gray-600">Lorem ipsum dolor sit amet...</div>,
    tags: ['paragraph', 'text', 'content']
  },
  {
    type: 'text',
    label: 'Texto Inline',
    icon: <Type className="w-5 h-5" />,
    category: 'text',
    description: 'Texto simples (span)',
    acceptsChildren: false,
    defaultProps: { text: 'Texto' },
    preview: <span className="text-sm">Texto</span>,
    tags: ['text', 'span', 'inline']
  },
  
  // MEDIA
  {
    type: 'image',
    label: 'Imagem',
    icon: <Image className="w-5 h-5" />,
    category: 'media',
    description: 'Imagem com alt text',
    acceptsChildren: false,
    defaultProps: { src: 'https://via.placeholder.com/600x400', alt: 'Imagem' },
    defaultStyles: { width: '100%', height: 'auto', borderRadius: '0.5rem' },
    preview: (
      <div className="w-full h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
        <Image className="w-6 h-6 text-gray-400" />
      </div>
    ),
    tags: ['image', 'img', 'photo']
  },
  {
    type: 'video',
    label: 'Vídeo',
    icon: <Video className="w-5 h-5" />,
    category: 'media',
    description: 'Player de vídeo HTML5',
    acceptsChildren: false,
    defaultProps: { src: '', controls: true },
    defaultStyles: { width: '100%', borderRadius: '0.5rem' },
    preview: (
      <div className="w-full h-16 bg-black rounded flex items-center justify-center">
        <Video className="w-6 h-6 text-white" />
      </div>
    ),
    tags: ['video', 'media', 'player']
  },
  
  // CONTROLS
  {
    type: 'button',
    label: 'Botão',
    icon: <Circle className="w-5 h-5" />,
    category: 'controls',
    description: 'Botão clicável estilizado',
    acceptsChildren: false,
    defaultProps: { text: 'Clique Aqui', buttonType: 'button' },
    defaultStyles: { 
      padding: '0.75rem 1.5rem', 
      background: '#3B82F6', 
      color: '#fff', 
      border: 'none', 
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '500'
    },
    preview: (
      <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded font-medium" disabled>
        Botão
      </button>
    ),
    tags: ['button', 'cta', 'click']
  },
  {
    type: 'link',
    label: 'Link',
    icon: <LinkIcon className="w-5 h-5" />,
    category: 'controls',
    description: 'Link/Hiperlink',
    acceptsChildren: false,
    defaultProps: { text: 'Clique aqui', href: '#' },
    defaultStyles: { color: '#3B82F6', textDecoration: 'underline' },
    preview: <a href="#" className="text-blue-500 underline text-sm">Link</a>,
    tags: ['link', 'anchor', 'href']
  },
  
  // FORMS
  {
    type: 'form',
    label: 'Formulário',
    icon: <FileText className="w-5 h-5" />,
    category: 'forms',
    description: 'Formulário HTML',
    acceptsChildren: true,
    defaultStyles: { padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' },
    preview: (
      <div className="border rounded p-2 space-y-2">
        <div className="h-2 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 border rounded"></div>
        <div className="h-6 bg-blue-500 rounded w-1/4"></div>
      </div>
    ),
    tags: ['form', 'input', 'submit']
  },
  {
    type: 'input',
    label: 'Campo de Texto',
    icon: <Square className="w-5 h-5" />,
    category: 'forms',
    description: 'Campo de entrada de texto',
    acceptsChildren: false,
    defaultProps: { inputType: 'text', placeholder: 'Digite aqui...' },
    defaultStyles: { 
      padding: '0.5rem 0.75rem', 
      border: '1px solid #d1d5db', 
      borderRadius: '0.375rem',
      width: '100%'
    },
    preview: (
      <input 
        type="text" 
        placeholder="Campo de texto" 
        className="border rounded px-3 py-2 text-sm w-full" 
        readOnly 
      />
    ),
    tags: ['input', 'text', 'field']
  },
  
  // LISTS
  {
    type: 'list',
    label: 'Lista',
    icon: <List className="w-5 h-5" />,
    category: 'lists',
    description: 'Lista não ordenada (UL)',
    acceptsChildren: true,
    defaultStyles: { paddingLeft: '1.5rem', listStyleType: 'disc' },
    preview: (
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    ),
    tags: ['list', 'ul', 'bullet']
  },
  {
    type: 'orderedList',
    label: 'Lista Numerada',
    icon: <ListOrdered className="w-5 h-5" />,
    category: 'lists',
    description: 'Lista ordenada (OL)',
    acceptsChildren: true,
    defaultStyles: { paddingLeft: '1.5rem', listStyleType: 'decimal' },
    preview: (
      <ol className="list-decimal list-inside text-sm space-y-1">
        <li>Primeiro</li>
        <li>Segundo</li>
        <li>Terceiro</li>
      </ol>
    ),
    tags: ['list', 'ol', 'numbered']
  },
  
  // OTHER
  {
    type: 'spacer',
    label: 'Espaçador',
    icon: <Minus className="w-5 h-5" />,
    category: 'other',
    description: 'Espaço vertical configurável',
    acceptsChildren: false,
    defaultProps: { height: '40px' },
    preview: <div className="h-8 border-t border-b border-dashed border-gray-300" />,
    tags: ['spacer', 'space', 'gap']
  },
  {
    type: 'divider',
    label: 'Divisor',
    icon: <Minus className="w-5 h-5" />,
    category: 'other',
    description: 'Linha divisória horizontal (HR)',
    acceptsChildren: false,
    defaultProps: {},
    defaultStyles: { borderTop: '1px solid #e5e7eb', margin: '1.5rem 0' },
    preview: <hr className="border-t border-gray-300" />,
    tags: ['divider', 'hr', 'separator']
  },
  {
    type: 'code',
    label: 'Código',
    icon: <Code className="w-5 h-5" />,
    category: 'other',
    description: 'Bloco de código',
    acceptsChildren: false,
    defaultProps: { code: 'console.log("Hello");' },
    defaultStyles: { 
      background: '#1e293b', 
      color: '#e2e8f0',
      padding: '1rem', 
      borderRadius: '0.375rem', 
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      overflow: 'auto'
    },
    preview: (
      <code className="block bg-gray-900 text-gray-100 px-2 py-1 rounded text-xs font-mono">
        code
      </code>
    ),
    tags: ['code', 'pre', 'syntax']
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: <Box className="w-4 h-4" /> },
  { id: 'containers', label: 'Containers', icon: <Container className="w-4 h-4" /> },
  { id: 'layouts', label: 'Layouts', icon: <Layout className="w-4 h-4" /> },
  { id: 'cards', label: 'Cards', icon: <Frame className="w-4 h-4" /> },
  { id: 'interactive', label: 'Interativos', icon: <Layers className="w-4 h-4" /> },
  { id: 'forms', label: 'Formulários', icon: <FileText className="w-4 h-4" /> },
  { id: 'text', label: 'Textos', icon: <Type className="w-4 h-4" /> },
  { id: 'media', label: 'Mídia', icon: <Image className="w-4 h-4" /> },
  { id: 'controls', label: 'Controles', icon: <Circle className="w-4 h-4" /> },
  { id: 'lists', label: 'Listas', icon: <List className="w-4 h-4" /> },
  { id: 'other', label: 'Outros', icon: <MoreHorizontal className="w-4 h-4" /> }
];

interface DraggableComponentProps {
  definition: ComponentDefinition;
  onComponentClick?: (definition: ComponentDefinition) => void;
  viewMode: 'grid' | 'list';
}

function DraggableComponent({ definition, onComponentClick, viewMode }: DraggableComponentProps) {
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
    if (onComponentClick && !isDragging) {
      e.stopPropagation();
      onComponentClick(definition);
    }
  };

  if (!definition || !definition.type) {
    console.error('Invalid definition:', definition);
    return null;
  }

  if (viewMode === 'list') {
    return (
      <div 
        ref={drag} 
        onClick={handleClick}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        className="cursor-pointer"
      >
        <Card className="hover:shadow-sm transition-shadow hover:border-gray-300">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="truncate">{definition.label}</span>
                  {definition.acceptsChildren && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Container</Badge>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 truncate">
                  {definition.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      ref={drag} 
      onClick={handleClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-pointer group w-full max-w-[140px] mx-auto"
    >
      <Card className="h-full hover:shadow-sm transition-shadow border-gray-200 bg-white">
        <CardContent className="p-2.5 flex flex-col gap-2">
          {/* Título */}
          <div className="text-center">
            <h3 className="text-[11px] font-medium mb-0.5 truncate leading-tight">{definition.label}</h3>
            <p className="text-[9px] text-gray-500 truncate leading-tight">
              {definition.description}
            </p>
          </div>
          
          {/* Preview Visual */}
          <div className="bg-gray-50 rounded p-2 flex items-center justify-center h-[70px] border border-gray-100">
            <div className="scale-[0.6] origin-center">
              {definition.preview}
            </div>
          </div>

          {/* Badge */}
          <div className="flex flex-col gap-1 items-center">
            {definition.acceptsChildren && (
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-[9px] px-1.5 py-0">
                Container
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ImprovedComponentLibraryProps {
  onComponentClick?: (definition: ComponentDefinition) => void;
  onTemplateSelect?: (nodes: HierarchicalNode[], templateId: string) => void;
}

export function ImprovedComponentLibrary({ 
  onComponentClick,
  onTemplateSelect 
}: ImprovedComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mainTab, setMainTab] = useState<'components' | 'templates'>('components');
  const [templateTab, setTemplateTab] = useState<'all' | 'favorites' | 'recent'>('all');

  // Componentes filtrados
  const filteredComponents = useMemo(() => {
    return COMPONENT_DEFINITIONS.filter(comp => {
      const matchesSearch = 
        comp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Templates
  const allTemplates = hierarchicalTemplateService.getAllTemplates();
  const filteredTemplates = useMemo(() => {
    let templates = allTemplates;
    
    if (templateTab === 'favorites') {
      templates = hierarchicalTemplateService.getFavoriteTemplates();
    } else if (templateTab === 'recent') {
      templates = hierarchicalTemplateService.getRecentTemplates(20);
    }

    if (searchTerm) {
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return templates;
  }, [allTemplates, templateTab, searchTerm]);

  const handleTemplateClick = (template: any) => {
    if (onTemplateSelect) {
      hierarchicalTemplateService.incrementUsageCount(template.id);
      onTemplateSelect(template.nodes, template.id);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    hierarchicalTemplateService.toggleFavorite(templateId);
  };

  const containerComponents = filteredComponents.filter(c => c.acceptsChildren);
  const leafComponents = filteredComponents.filter(c => !c.acceptsChildren);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-950">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-lg">Biblioteca</h2>
            <p className="text-xs text-muted-foreground">
              {mainTab === 'components' ? 'Arraste ou clique para inserir' : 'Selecione um template'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar componentes ou templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 m-4 mb-0">
          <TabsTrigger value="components" className="gap-2">
            <Package className="w-4 h-4" />
            Componentes
            <Badge variant="secondary" className="ml-auto">
              {filteredComponents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileCode className="w-4 h-4" />
            Templates
            <Badge variant="secondary" className="ml-auto">
              {filteredTemplates.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* COMPONENTS TAB */}
        <TabsContent value="components" className="flex-1 flex flex-col mt-0">
          {/* Category Filter */}
          <div className="px-4 py-3 border-b bg-white dark:bg-gray-950">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="whitespace-nowrap gap-2"
                >
                  {cat.icon}
                  <span className="hidden sm:inline">{cat.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Components Grid/List */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full w-full">
              <div className="p-4 pb-8">
              {filteredComponents.length === 0 ? (
                <div className="text-center py-12">
                  <Box className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Nenhum componente encontrado</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="mt-2"
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {containerComponents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-indigo-600">
                        <Container className="w-4 h-4" />
                        Containers ({containerComponents.length})
                      </h3>
                      <div className={
                        viewMode === 'grid'
                          ? 'grid gap-3'
                          : 'space-y-2'
                      } style={viewMode === 'grid' ? { gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' } : undefined}>
                        {containerComponents.map(comp => (
                          <ErrorBoundary 
                            key={comp.type} 
                            fallback={
                              <div className="text-xs text-red-500 p-2 border border-red-200 rounded">
                                Erro: {comp.label}
                              </div>
                            }
                          >
                            <DraggableComponent 
                              definition={comp} 
                              onComponentClick={onComponentClick}
                              viewMode={viewMode}
                            />
                          </ErrorBoundary>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {leafComponents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-purple-600">
                        <Package className="w-4 h-4" />
                        Elementos ({leafComponents.length})
                      </h3>
                      <div className={
                        viewMode === 'grid'
                          ? 'grid gap-3'
                          : 'space-y-2'
                      } style={viewMode === 'grid' ? { gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' } : undefined}>
                        {leafComponents.map(comp => (
                          <ErrorBoundary 
                            key={comp.type} 
                            fallback={
                              <div className="text-xs text-red-500 p-2 border border-red-200 rounded">
                                Erro: {comp.label}
                              </div>
                            }
                          >
                            <DraggableComponent 
                              definition={comp} 
                              onComponentClick={onComponentClick}
                              viewMode={viewMode}
                            />
                          </ErrorBoundary>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
          </div>
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="flex-1 flex flex-col mt-0">
          {/* Template Filter */}
          <div className="px-4 py-3 border-b bg-white dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <Button
                variant={templateTab === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTemplateTab('all')}
                className="gap-2"
              >
                <Box className="w-4 h-4" />
                Todos
              </Button>
              <Button
                variant={templateTab === 'favorites' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTemplateTab('favorites')}
                className="gap-2"
              >
                <Heart className="w-4 h-4" />
                Favoritos
              </Button>
              <Button
                variant={templateTab === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTemplateTab('recent')}
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                Recentes
              </Button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full w-full">
              <div className="p-4 pb-8">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Nenhum template encontrado</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Crie um template salvando uma página no Page Builder
                  </p>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? 'grid gap-3'
                    : 'space-y-3'
                } style={viewMode === 'grid' ? { gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' } : undefined}>
                  {filteredTemplates.map(template => (
                    <div key={template.id} className="w-full max-w-[140px] mx-auto">
                      <Card 
                        className="cursor-pointer hover:shadow-sm transition-shadow border-gray-200 bg-white h-full"
                        onClick={() => handleTemplateClick(template)}
                      >
                        <CardContent className="p-2.5 flex flex-col gap-2 relative">
                          {/* Botão Favorito Absoluto */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1.5 right-1.5 h-4 w-4 p-0 hover:bg-transparent z-10"
                            onClick={(e) => toggleFavorite(e, template.id)}
                          >
                            <Heart 
                              className={`w-2.5 h-2.5 ${template.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                            />
                          </Button>

                          {/* Título */}
                          <div className="text-center pr-4">
                            <h3 className="text-[11px] font-medium mb-0.5 truncate leading-tight">
                              {template.name}
                            </h3>
                            <p className="text-[9px] text-gray-500 truncate leading-tight">
                              {template.description}
                            </p>
                          </div>

                          {/* Preview/Placeholder */}
                          <div className="bg-gray-50 rounded p-2 flex items-center justify-center h-[70px] border border-gray-100">
                            <FileCode className="w-5 h-5 text-gray-300" />
                          </div>
                          
                          {/* Badge */}
                          <div className="flex flex-col gap-1 items-center">
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-[9px] px-1.5 py-0">
                              {template.type}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export também as definições para uso externo
export { COMPONENT_DEFINITIONS, CATEGORIES };
export type { ComponentDefinition };
