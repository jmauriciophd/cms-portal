import React from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { useDraggable } from '@dnd-kit/core';
import {
  Type,
  Heading,
  Square,
  MousePointer,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Layout,
  Boxes,
  Navigation,
  Footer as FooterIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface ComponentPaletteItem {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'container' | 'content' | 'media';
  description?: string;
}

const components: ComponentPaletteItem[] = [
  // Containers
  { 
    type: 'container', 
    label: 'Container', 
    icon: Square, 
    category: 'container',
    description: 'Contêiner flexível para agrupar elementos'
  },
  { 
    type: 'section', 
    label: 'Seção', 
    icon: Layout, 
    category: 'container',
    description: 'Seção de página com espaçamento'
  },
  { 
    type: 'header', 
    label: 'Cabeçalho', 
    icon: Boxes, 
    category: 'container',
    description: 'Área de cabeçalho da página'
  },
  { 
    type: 'footer', 
    label: 'Rodapé', 
    icon: FooterIcon, 
    category: 'container',
    description: 'Área de rodapé da página'
  },
  { 
    type: 'nav', 
    label: 'Navegação', 
    icon: Navigation, 
    category: 'container',
    description: 'Barra de navegação'
  },
  
  // Conteúdo
  { 
    type: 'heading', 
    label: 'Título', 
    icon: Heading, 
    category: 'content',
    description: 'Título de seção (H2)'
  },
  { 
    type: 'paragraph', 
    label: 'Parágrafo', 
    icon: FileText, 
    category: 'content',
    description: 'Bloco de texto com parágrafos'
  },
  { 
    type: 'text', 
    label: 'Texto', 
    icon: Type, 
    category: 'content',
    description: 'Texto simples inline'
  },
  { 
    type: 'button', 
    label: 'Botão', 
    icon: MousePointer, 
    category: 'content',
    description: 'Botão clicável'
  },
  { 
    type: 'link', 
    label: 'Link', 
    icon: LinkIcon, 
    category: 'content',
    description: 'Link de navegação'
  },
  
  // Mídia
  { 
    type: 'image', 
    label: 'Imagem', 
    icon: ImageIcon, 
    category: 'media',
    description: 'Imagem responsiva'
  },
];

interface DraggableComponentProps {
  component: ComponentPaletteItem;
}

function DraggableComponent({ component }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${component.type}`,
    data: { type: component.type }
  });

  const Icon = component.icon;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        p-3 border border-gray-200 rounded-lg cursor-move hover:border-blue-400 hover:bg-blue-50
        transition-all flex items-center gap-3 group
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-blue-100 transition-colors">
        <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{component.label}</div>
        {component.description && (
          <div className="text-xs text-gray-500 truncate">{component.description}</div>
        )}
      </div>
    </div>
  );
}

export function BuilderSidebar() {
  const { nodes, selectedNodeId, clearLayout } = useBuilderStore();
  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  const containerComponents = components.filter(c => c.category === 'container');
  const contentComponents = components.filter(c => c.category === 'content');
  const mediaComponents = components.filter(c => c.category === 'media');

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-1">Componentes</h2>
        <p className="text-sm text-gray-500">Arraste os componentes para o canvas</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Containers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Containers
              </h3>
              <Badge variant="secondary" className="text-xs">
                {containerComponents.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {containerComponents.map(component => (
                <DraggableComponent key={component.type} component={component} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Conteúdo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Conteúdo
              </h3>
              <Badge variant="secondary" className="text-xs">
                {contentComponents.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {contentComponents.map(component => (
                <DraggableComponent key={component.type} component={component} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Mídia */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Mídia
              </h3>
              <Badge variant="secondary" className="text-xs">
                {mediaComponents.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {mediaComponents.map(component => (
                <DraggableComponent key={component.type} component={component} />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Info do nó selecionado */}
      {selectedNode && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-xs font-medium text-gray-500 mb-2">SELECIONADO</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <Type className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">
                {selectedNode.type}
              </div>
              <div className="text-xs text-gray-500 truncate">
                ID: {selectedNode.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
