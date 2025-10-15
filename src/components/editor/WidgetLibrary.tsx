import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Type,
  Heading,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Star,
  User,
  BarChart3,
  Table,
  List,
  Grid3x3,
  ChevronDown,
  ChevronRight,
  Search,
  MousePointer2,
  Menu,
  MapPin,
  Calendar,
  Clock,
  Mail,
  Phone,
  Share2,
  PlayCircle,
  Music,
  Film,
  Code,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';

interface Widget {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'individual' | 'basico' | 'geral' | 'tema' | 'woocommerce';
  description: string;
  premium?: boolean;
}

const widgets: Widget[] = [
  // Individual
  { id: 'title-post', name: 'Título do post', icon: Heading, category: 'individual', description: 'Título do post atual' },
  { id: 'excerpt-post', name: 'Resumo do post', icon: FileText, category: 'individual', description: 'Resumo/excerto do post' },
  { id: 'featured-image', name: 'Imagem destacada', icon: ImageIcon, category: 'individual', description: 'Imagem de destaque' },
  { id: 'author-box', name: 'Caixa de autor', icon: User, category: 'individual', description: 'Informações do autor' },
  { id: 'post-comments', name: 'Comentários do post', icon: MessageSquare, category: 'individual', description: 'Seção de comentários' },
  { id: 'post-navigation', name: 'Navegação de posts', icon: Menu, category: 'individual', description: 'Links prev/next' },
  { id: 'post-info', name: 'Informações do post', icon: FileText, category: 'individual', description: 'Meta informações' },
  
  // Básico
  { id: 'heading', name: 'Título', icon: Heading, category: 'basico', description: 'Títulos H1-H6' },
  { id: 'text', name: 'Editor de texto', icon: Type, category: 'basico', description: 'Texto rico editável' },
  { id: 'image', name: 'Imagem', icon: ImageIcon, category: 'basico', description: 'Imagem estática' },
  { id: 'video', name: 'Vídeo', icon: Video, category: 'basico', description: 'Player de vídeo' },
  { id: 'button', name: 'Botão', icon: MousePointer2, category: 'basico', description: 'Botão clicável' },
  { id: 'divider', name: 'Divisor', icon: Separator, category: 'basico', description: 'Linha divisória' },
  { id: 'spacer', name: 'Espaçador', icon: Settings, category: 'basico', description: 'Espaço vazio' },
  { id: 'google-maps', name: 'Google Maps', icon: MapPin, category: 'basico', description: 'Mapa incorporado' },
  { id: 'icon', name: 'Ícone', icon: Star, category: 'basico', description: 'Ícone SVG' },
  { id: 'icon-box', name: 'Caixa de ícone', icon: Grid3x3, category: 'basico', description: 'Ícone + texto' },
  { id: 'star-rating', name: 'Avaliação', icon: Star, category: 'basico', description: 'Estrelas de avaliação' },
  { id: 'image-box', name: 'Caixa de imagem', icon: ImageIcon, category: 'basico', description: 'Imagem com overlay' },
  { id: 'icon-list', name: 'Lista de ícones', icon: List, category: 'basico', description: 'Lista com ícones' },
  { id: 'counter', name: 'Contador', icon: BarChart3, category: 'basico', description: 'Contador animado' },
  { id: 'progress-bar', name: 'Barra de progresso', icon: BarChart3, category: 'basico', description: 'Barra de porcentagem' },
  { id: 'testimonial', name: 'Depoimento', icon: MessageSquare, category: 'basico', description: 'Card de testemunho' },
  { id: 'tabs', name: 'Abas', icon: Menu, category: 'basico', description: 'Navegação por abas' },
  { id: 'accordion', name: 'Acordeão', icon: ChevronDown, category: 'basico', description: 'Conteúdo colapsável' },
  { id: 'toggle', name: 'Alternar', icon: Settings, category: 'basico', description: 'Toggle on/off' },
  { id: 'social-icons', name: 'Ícones sociais', icon: Share2, category: 'basico', description: 'Links de redes sociais' },
  { id: 'alert', name: 'Alerta', icon: MessageSquare, category: 'basico', description: 'Caixa de aviso' },
  { id: 'audio', name: 'SoundCloud', icon: Music, category: 'basico', description: 'Player SoundCloud' },
  { id: 'shortcode', name: 'Shortcode', icon: Code, category: 'basico', description: 'Executar shortcode' },
  { id: 'html', name: 'HTML', icon: Code, category: 'basico', description: 'Código HTML customizado' },
  { id: 'menu-anchor', name: 'Âncora de menu', icon: LinkIcon, category: 'basico', description: 'Link âncora' },
  { id: 'read-more', name: 'Leia mais', icon: FileText, category: 'basico', description: 'Botão expandir' },
  
  // Geral
  { id: 'form', name: 'Formulário', icon: FileText, category: 'geral', description: 'Formulário de contato' },
  { id: 'login', name: 'Login', icon: User, category: 'geral', description: 'Formulário de login' },
  { id: 'search', name: 'Busca', icon: Search, category: 'geral', description: 'Campo de busca' },
  { id: 'breadcrumb', name: 'Breadcrumb', icon: Menu, category: 'geral', description: 'Navegação hierárquica' },
  { id: 'sitemap', name: 'Mapa do site', icon: Menu, category: 'geral', description: 'Estrutura do site' },
  
  // Tema
  { id: 'site-logo', name: 'Logo do site', icon: ImageIcon, category: 'tema', description: 'Logo principal' },
  { id: 'site-title', name: 'Título do site', icon: Heading, category: 'tema', description: 'Nome do site' },
  { id: 'page-title', name: 'Título da página', icon: Heading, category: 'tema', description: 'Título atual' },
  { id: 'post-content', name: 'Conteúdo do post', icon: FileText, category: 'tema', description: 'Corpo do post' },
];

interface DraggableWidgetProps {
  widget: Widget;
}

function DraggableWidget({ widget }: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `widget-${widget.id}`,
    data: { widget }
  });

  const Icon = widget.icon;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        relative flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg
        cursor-move hover:border-blue-400 hover:shadow-md transition-all
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
      title={widget.description}
    >
      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mb-2">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
      <div className="text-xs text-center text-gray-700 font-medium">
        {widget.name}
      </div>
      {widget.premium && (
        <Badge variant="secondary" className="absolute top-1 right-1 text-[10px] px-1">
          PRO
        </Badge>
      )}
    </div>
  );
}

export function WidgetLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basico']);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredWidgets = widgets.filter(widget =>
    widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    widget.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoriesMap = {
    individual: { name: 'Individual', widgets: filteredWidgets.filter(w => w.category === 'individual') },
    basico: { name: 'Básico', widgets: filteredWidgets.filter(w => w.category === 'basico') },
    geral: { name: 'Geral', widgets: filteredWidgets.filter(w => w.category === 'geral') },
    tema: { name: 'Tema', widgets: filteredWidgets.filter(w => w.category === 'tema') },
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Widgets</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar widget..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="elementor" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
          <TabsTrigger value="elementor">Elementor</TabsTrigger>
          <TabsTrigger value="globais">Globais</TabsTrigger>
        </TabsList>

        <TabsContent value="elementor" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {Object.entries(categoriesMap).map(([key, { name, widgets }]) => {
                if (widgets.length === 0) return null;
                const isExpanded = expandedCategories.includes(key);

                return (
                  <div key={key}>
                    <button
                      onClick={() => toggleCategory(key)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="font-medium text-gray-700">{name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {widgets.length}
                        </Badge>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="grid grid-cols-3 gap-2 mt-2 pl-6">
                        {widgets.map(widget => (
                          <DraggableWidget key={widget.id} widget={widget} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="globais" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="text-center text-gray-400 py-8">
                <Settings className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Widgets globais disponíveis em breve</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { widgets };
export type { Widget };
