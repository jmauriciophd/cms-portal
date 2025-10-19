/**
 * Demo do Page Builder
 * Página de teste com templates pré-carregados
 */

import React, { useState } from 'react';
import { HierarchicalPageBuilder } from './HierarchicalPageBuilder';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  FileText, Grid3x3, HelpCircle, Columns, MessageSquare, 
  Sparkles, ChevronRight, Layout, Lightbulb, BookOpen, Code2
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
            Page Builder
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Sistema completo de drag & drop com suporte a aninhamento profundo
          </p>
          <div className="flex justify-center gap-4 flex-wrap mb-6">
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
          
          {/* Botão Dicas Rápidas */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="gap-2">
                <Lightbulb className="w-5 h-5" />
                Dicas Rápidas
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Guia do Page Builder</SheetTitle>
                <SheetDescription>
                  Recursos, exemplos e instruções de uso
                </SheetDescription>
              </SheetHeader>
              
              <Tabs defaultValue="recursos" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="recursos" className="gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Recursos</span>
                  </TabsTrigger>
                  <TabsTrigger value="exemplos" className="gap-1.5">
                    <Code2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Exemplos</span>
                  </TabsTrigger>
                  <TabsTrigger value="como-usar" className="gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Como Usar</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Tab Recursos */}
                <TabsContent value="recursos" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                    <div className="mt-4 space-y-4">
                      <Card className="p-6 border-purple-200 dark:border-purple-800">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                          <Layout className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Containers Aninhados</h3>
                        <p className="text-sm text-muted-foreground">
                          Arraste componentes para dentro de sections, divs, grids e mais. Profundidade ilimitada.
                        </p>
                      </Card>
                      
                      <Card className="p-6 border-blue-200 dark:border-blue-800">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                          <Grid3x3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Validação Inteligente</h3>
                        <p className="text-sm text-muted-foreground">
                          Sistema valida automaticamente tipos aceitos, limites de filhos e previne loops.
                        </p>
                      </Card>
                      
                      <Card className="p-6 border-green-200 dark:border-green-800">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                          <Sparkles className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Controles Visuais</h3>
                        <p className="text-sm text-muted-foreground">
                          Barra de ferramentas inline, drop zones coloridos, contador de filhos e mais.
                        </p>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                {/* Tab Exemplos */}
                <TabsContent value="exemplos" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                    <div className="mt-4 space-y-4">
                      <Card className="p-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-indigo-600" />
                          Estrutura Simples
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-xs space-y-1">
                          <div>📦 section</div>
                          <div className="ml-4">└─ 📦 container</div>
                          <div className="ml-8">├─ 📄 heading</div>
                          <div className="ml-8">├─ 📄 paragraph</div>
                          <div className="ml-8">└─ 📄 button</div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Uma seção básica com container, título, texto e botão.
                        </p>
                      </Card>
                      
                      <Card className="p-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-purple-600" />
                          Estrutura Aninhada
                        </h3>
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
                        <p className="text-xs text-muted-foreground mt-3">
                          Grid com múltiplos cards, cada um com seu conteúdo.
                        </p>
                      </Card>
                      
                      <Card className="p-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-blue-600" />
                          Hero Section Completa
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-xs space-y-1">
                          <div>📦 hero</div>
                          <div className="ml-4">└─ 📦 flexColumn</div>
                          <div className="ml-8">├─ 📄 heading (h1)</div>
                          <div className="ml-8">├─ 📄 paragraph</div>
                          <div className="ml-8">└─ 📦 flexRow</div>
                          <div className="ml-12">├─ 📄 button</div>
                          <div className="ml-12">└─ 📄 link</div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Seção hero com título, descrição e botões de ação.
                        </p>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                {/* Tab Como Usar */}
                <TabsContent value="como-usar" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                    <div className="mt-4 space-y-4">
                      <Card className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            1
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Escolha um Template</h3>
                            <p className="text-sm text-muted-foreground">
                              Selecione um template pré-pronto ou comece do zero com uma página em branco.
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            2
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Arraste Componentes</h3>
                            <p className="text-sm text-muted-foreground">
                              Da biblioteca para a área de edição ou dentro de containers para criar estruturas aninhadas.
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            3
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Organize a Hierarquia</h3>
                            <p className="text-sm text-muted-foreground">
                              Use os controles ≡ para reordenar elementos e + para adicionar filhos aos containers.
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            4
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Entenda as Drop Zones</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Ao arrastar um componente, você verá três áreas coloridas:
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li><strong className="text-foreground">Topo (azul):</strong> Adiciona antes do elemento</li>
                              <li><strong className="text-foreground">Meio (verde):</strong> Adiciona dentro (apenas containers)</li>
                              <li><strong className="text-foreground">Fundo (azul):</strong> Adiciona depois do elemento</li>
                            </ul>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            5
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Personalize</h3>
                            <p className="text-sm text-muted-foreground">
                              Use o painel de propriedades à direita para editar classes CSS, props e estilos dos componentes.
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            6
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">Salve seu Trabalho</h3>
                            <p className="text-sm text-muted-foreground">
                              Pressione <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs border">Ctrl+S</kbd> para salvar. 
                              O sistema também faz auto-save a cada 30 segundos automaticamente.
                            </p>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-semibold mb-1">Dica Especial</h3>
                            <p className="text-sm text-muted-foreground">
                              Você pode clicar diretamente em um componente na biblioteca para adicioná-lo ao final da página, 
                              sem precisar arrastar!
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
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
      </div>
    </div>
  );
}
