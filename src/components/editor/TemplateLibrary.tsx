import React, { useState } from 'react';
import { X, Search, Star, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';

interface Template {
  id: string;
  name: string;
  category: 'hero' | 'features' | 'cta' | 'pricing' | 'testimonials' | 'footer' | 'contact';
  preview: string;
  isPro?: boolean;
  data: any;
}

const templates: Template[] = [
  {
    id: 'hero-1',
    name: 'Hero Moderno',
    category: 'hero',
    preview: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Hero+Moderno',
    data: {
      type: 'section',
      columns: [
        {
          width: 60,
          widgets: [
            { type: 'heading', content: 'Transforme Sua Presença Digital' },
            { type: 'text', content: 'Soluções profissionais para o seu negócio crescer online' },
            { type: 'button', content: 'Começar Agora' }
          ]
        },
        {
          width: 40,
          widgets: [
            { type: 'image', src: 'https://via.placeholder.com/600x400' }
          ]
        }
      ]
    }
  },
  {
    id: 'hero-2',
    name: 'Hero Centralizado',
    category: 'hero',
    preview: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Hero+Central',
    data: {
      type: 'section',
      columns: [
        {
          width: 100,
          widgets: [
            { type: 'heading', content: 'Bem-vindo ao Futuro', align: 'center' },
            { type: 'text', content: 'Inovação que transforma negócios', align: 'center' },
            { type: 'button', content: 'Saiba Mais', align: 'center' }
          ]
        }
      ]
    }
  },
  {
    id: 'features-1',
    name: 'Recursos 3 Colunas',
    category: 'features',
    preview: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Recursos+3+Col',
    data: {
      type: 'section',
      columns: [
        {
          width: 33.33,
          widgets: [
            { type: 'icon', icon: 'zap' },
            { type: 'heading', content: 'Rápido' },
            { type: 'text', content: 'Performance otimizada' }
          ]
        },
        {
          width: 33.33,
          widgets: [
            { type: 'icon', icon: 'shield' },
            { type: 'heading', content: 'Seguro' },
            { type: 'text', content: 'Proteção de dados' }
          ]
        },
        {
          width: 33.33,
          widgets: [
            { type: 'icon', icon: 'star' },
            { type: 'heading', content: 'Premium' },
            { type: 'text', content: 'Qualidade superior' }
          ]
        }
      ]
    }
  },
  {
    id: 'cta-1',
    name: 'CTA com Fundo',
    category: 'cta',
    preview: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=CTA+Destaque',
    data: {
      type: 'section',
      background: 'gradient',
      columns: [
        {
          width: 100,
          widgets: [
            { type: 'heading', content: 'Pronto para começar?', align: 'center' },
            { type: 'text', content: 'Junte-se a milhares de clientes satisfeitos', align: 'center' },
            { type: 'button', content: 'Experimente Grátis', align: 'center' }
          ]
        }
      ]
    }
  },
  {
    id: 'pricing-1',
    name: 'Preços 3 Planos',
    category: 'pricing',
    preview: 'https://via.placeholder.com/400x300/ec4899/ffffff?text=Pre%C3%A7os',
    isPro: true,
    data: {
      type: 'section',
      columns: [
        {
          width: 33.33,
          widgets: [
            { type: 'heading', content: 'Básico', align: 'center' },
            { type: 'text', content: 'R$ 29/mês', align: 'center', size: 'large' },
            { type: 'list', items: ['5 usuários', '10 GB storage', 'Suporte email'] },
            { type: 'button', content: 'Escolher' }
          ]
        },
        {
          width: 33.33,
          widgets: [
            { type: 'heading', content: 'Pro', align: 'center' },
            { type: 'text', content: 'R$ 79/mês', align: 'center', size: 'large' },
            { type: 'list', items: ['20 usuários', '50 GB storage', 'Suporte 24/7'] },
            { type: 'button', content: 'Escolher' }
          ]
        },
        {
          width: 33.33,
          widgets: [
            { type: 'heading', content: 'Enterprise', align: 'center' },
            { type: 'text', content: 'Personalizado', align: 'center', size: 'large' },
            { type: 'list', items: ['Ilimitado', 'Ilimitado', 'Suporte dedicado'] },
            { type: 'button', content: 'Contato' }
          ]
        }
      ]
    }
  },
  {
    id: 'testimonials-1',
    name: 'Depoimentos Carousel',
    category: 'testimonials',
    preview: 'https://via.placeholder.com/400x300/06b6d4/ffffff?text=Depoimentos',
    data: {
      type: 'section',
      columns: [
        {
          width: 100,
          widgets: [
            { type: 'heading', content: 'O que nossos clientes dizem', align: 'center' },
            { type: 'testimonial', author: 'João Silva', role: 'CEO', content: 'Excelente serviço!' },
            { type: 'testimonial', author: 'Maria Santos', role: 'Gerente', content: 'Superou expectativas' }
          ]
        }
      ]
    }
  },
  {
    id: 'contact-1',
    name: 'Contato com Mapa',
    category: 'contact',
    preview: 'https://via.placeholder.com/400x300/14b8a6/ffffff?text=Contato',
    data: {
      type: 'section',
      columns: [
        {
          width: 50,
          widgets: [
            { type: 'heading', content: 'Entre em Contato' },
            { type: 'form', fields: ['nome', 'email', 'mensagem'] }
          ]
        },
        {
          width: 50,
          widgets: [
            { type: 'map', location: 'São Paulo, SP' }
          ]
        }
      ]
    }
  },
  {
    id: 'footer-1',
    name: 'Rodapé 4 Colunas',
    category: 'footer',
    preview: 'https://via.placeholder.com/400x300/64748b/ffffff?text=Rodap%C3%A9',
    data: {
      type: 'section',
      background: 'dark',
      columns: [
        {
          width: 25,
          widgets: [
            { type: 'heading', content: 'Empresa' },
            { type: 'link', content: 'Sobre' },
            { type: 'link', content: 'Equipe' },
            { type: 'link', content: 'Carreiras' }
          ]
        },
        {
          width: 25,
          widgets: [
            { type: 'heading', content: 'Produto' },
            { type: 'link', content: 'Recursos' },
            { type: 'link', content: 'Preços' },
            { type: 'link', content: 'FAQ' }
          ]
        },
        {
          width: 25,
          widgets: [
            { type: 'heading', content: 'Suporte' },
            { type: 'link', content: 'Ajuda' },
            { type: 'link', content: 'Documentação' },
            { type: 'link', content: 'Contato' }
          ]
        },
        {
          width: 25,
          widgets: [
            { type: 'heading', content: 'Social' },
            { type: 'social-icons', platforms: ['facebook', 'twitter', 'instagram'] }
          ]
        }
      ]
    }
  }
];

interface TemplateLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export function TemplateLibrary({ open, onClose, onSelect }: TemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'Todos', count: templates.length },
    { id: 'hero', name: 'Hero', count: templates.filter(t => t.category === 'hero').length },
    { id: 'features', name: 'Recursos', count: templates.filter(t => t.category === 'features').length },
    { id: 'cta', name: 'CTA', count: templates.filter(t => t.category === 'cta').length },
    { id: 'pricing', name: 'Preços', count: templates.filter(t => t.category === 'pricing').length },
    { id: 'testimonials', name: 'Depoimentos', count: templates.filter(t => t.category === 'testimonials').length },
    { id: 'contact', name: 'Contato', count: templates.filter(t => t.category === 'contact').length },
    { id: 'footer', name: 'Rodapé', count: templates.filter(t => t.category === 'footer').length },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Biblioteca de Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-3 gap-4 p-2">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Preview Image */}
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    {template.isPro && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500">
                        <Star className="w-3 h-3 mr-1" />
                        PRO
                      </Badge>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          // Preview
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelect(template);
                          onClose();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Inserir
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                    <p className="text-xs text-gray-500 capitalize mt-1">{template.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { templates };
export type { Template };
