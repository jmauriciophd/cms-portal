/**
 * Demo do Page Builder Hierárquico
 * Página de teste com templates pré-carregados
 */

import React, { useState } from 'react';
import { HierarchicalPageBuilder } from './HierarchicalPageBuilder';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  FileText, Grid3x3, HelpCircle, Columns, MessageSquare, 
  Sparkles, ChevronRight, Layout
} from 'lucide-react';
import { hierarchicalTemplates } from '../../utils/hierarchicalTemplates';
import { HierarchicalNode } from '../editor/HierarchicalRenderNode';

export function HierarchicalBuilderDemo() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<HierarchicalNode[] | null>(null);
  
  const templates = [
    {
      id: 'blank',
      name: 'Página em Branco',
      description: 'Comece do zero com uma tela vazia',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-gray-500',
      data: []
    },
    {
      id: 'hero',
      name: 'Hero Section',
      description: 'Seção principal com título, subtítulo e botões',
      icon: <Layout className="w-8 h-8" />,
      color: 'bg-purple-500',
      data: [hierarchicalTemplates.hero]
    },
    {
      id: 'features',
      name: 'Grid de Features',
      description: 'Grade 3x1 com cards de recursos',
      icon: <Grid3x3 className="w-8 h-8" />,
      color: 'bg-blue-500',
      data: [hierarchicalTemplates.features]
    },
    {
      id: 'faq',
      name: 'FAQ Accordion',
      description: 'Perguntas frequentes com accordion',
      icon: <HelpCircle className="w-8 h-8" />,
      color: 'bg-green-500',
      data: [hierarchicalTemplates.faq]
    },
    {
      id: 'two-columns',
      name: 'Duas Colunas',
      description: 'Layout de 2 colunas com texto e imagem',
      icon: <Columns className="w-8 h-8" />,
      color: 'bg-orange-500',
      data: [hierarchicalTemplates.twoColumns]
    },
    {
      id: 'contact',
      name: 'Formulário de Contato',
      description: 'Formulário completo com validação',
      icon: <MessageSquare className="w-8 h-8" />,
      color: 'bg-pink-500',
      data: [hierarchicalTemplates.contactForm]
    },
    {
      id: 'full',
      name: 'Landing Page Completa',
      description: 'Página completa com todos os componentes',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      data: hierarchicalTemplates.fullPage
    }
  ];
  
  const handleSelectTemplate = (template: typeof templates[0]) => {
    setSelectedTemplate(template.data);
    setIsBuilding(true);
  };
  
  const handleSave = (nodes: HierarchicalNode[]) => {
    console.log('Salvando página:', nodes);
    localStorage.setItem('hierarchical_page_demo', JSON.stringify(nodes));
    alert('Página salva com sucesso! Veja o console para os dados.');
    setIsBuilding(false);
  };
  
  const handleCancel = () => {
    setIsBuilding(false);
    setSelectedTemplate(null);
  };
  
  if (isBuilding) {
    return (
      <HierarchicalPageBuilder
        pageId="demo"
        initialContent={selectedTemplate || []}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Page Builder Hierárquico
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Sistema completo de drag & drop com suporte a aninhamento profundo
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="text-sm">
              50+ Componentes
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Hierarquia Ilimitada
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Validação Automática
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Drag & Drop Fluido
            </Badge>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
              <Layout className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Containers Aninhados</h3>
            <p className="text-sm text-muted-foreground">
              Arraste componentes para dentro de sections, divs, grids e mais. Profundidade ilimitada.
            </p>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
              <Grid3x3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Validação Inteligente</h3>
            <p className="text-sm text-muted-foreground">
              Sistema valida automaticamente tipos aceitos, limites de filhos e previne loops.
            </p>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Controles Visuais</h3>
            <p className="text-sm text-muted-foreground">
              Barra de ferramentas inline, drop zones coloridos, contador de filhos e mais.
            </p>
          </Card>
        </div>
        
        {/* Templates */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Escolha um Template</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <Card
                key={template.id}
                className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-purple-500"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className={`w-16 h-16 ${template.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                  {template.icon}
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                  {template.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {template.data.length === 0 ? 'Vazio' : `${template.data.length} seção${template.data.length !== 1 ? 'ões' : ''}`}
                  </Badge>
                  
                  <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Instructions */}
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <h2 className="text-2xl font-semibold mb-4">Como Usar</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                Escolha um Template
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione um template acima ou comece do zero
              </p>
              
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                Arraste Componentes
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Da biblioteca para a área de edição ou dentro de containers
              </p>
              
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                Organize a Hierarquia
              </h3>
              <p className="text-sm text-muted-foreground">
                Use os controles ≡ para reordenar, + para adicionar filhos
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
                Drop Zones
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Topo:</strong> Adiciona antes<br />
                <strong>Meio:</strong> Adiciona dentro (containers)<br />
                <strong>Fundo:</strong> Adiciona depois
              </p>
              
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
                Personalize
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use o painel de propriedades para editar classes e props
              </p>
              
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">6</span>
                Salve
              </h3>
              <p className="text-sm text-muted-foreground">
                Ctrl+S para salvar. Auto-save a cada 30 segundos.
              </p>
            </div>
          </div>
        </Card>
        
        {/* Examples */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Exemplos de Hierarquia</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Estrutura Simples</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-xs space-y-1">
                <div>📦 section</div>
                <div className="ml-4">└─ 📦 container</div>
                <div className="ml-8">├─ 📄 heading</div>
                <div className="ml-8">├─ 📄 paragraph</div>
                <div className="ml-8">└─ 📄 button</div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Estrutura Aninhada</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-xs space-y-1">
                <div>📦 section</div>
                <div className="ml-4">└─ 📦 grid</div>
                <div className="ml-8">├─ 📦 gridItem</div>
                <div className="ml-12">└─ 📦 card</div>
                <div className="ml-16">├─ 📄 heading</div>
                <div className="ml-16">└─ 📄 paragraph</div>
                <div className="ml-8">└─ 📦 gridItem</div>
                <div className="ml-12">└─ 📦 card ...</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
