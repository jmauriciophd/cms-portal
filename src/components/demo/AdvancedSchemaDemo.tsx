/**
 * DEMONSTRAÇÃO DO SISTEMA DE SCHEMAS AVANÇADOS
 * Interface visual para explorar todos os componentes e propriedades
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Book, 
  Code, 
  Eye, 
  Layers,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { AdvancedPropertyEditor } from '../editor/AdvancedPropertyEditor';
import { AdvancedTemplatePreview } from '../templates/AdvancedTemplatePreview';
import {
  BaseComponentProperties,
  initializeComponent,
  COMPONENT_SCHEMAS,
  ContainerProperties,
  TextProperties,
  HeadingProperties,
  ImageProperties,
  ButtonProperties
} from '../../utils/advancedComponentSchemas';

export function AdvancedSchemaDemo() {
  const [selectedType, setSelectedType] = useState<string>('container');
  const [demoComponent, setDemoComponent] = useState<Partial<BaseComponentProperties>>(
    initializeComponent('container', {
      name: 'Container Demo',
      width: '100%',
      maxWidth: '64rem',
      padding: '2rem',
      margin: '0 auto',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.5rem',
      boxShadow: {
        offsetX: '0',
        offsetY: '4px',
        blur: '6px',
        spread: '0',
        color: 'rgba(0,0,0,0.1)',
        inset: false
      }
    } as Partial<ContainerProperties>)
  );

  const componentTypes = [
    { id: 'container', name: 'Container', category: 'Estrutural' },
    { id: 'section', name: 'Section', category: 'Estrutural' },
    { id: 'grid', name: 'Grid', category: 'Estrutural' },
    { id: 'text', name: 'Text', category: 'Conteúdo' },
    { id: 'heading', name: 'Heading', category: 'Conteúdo' },
    { id: 'image', name: 'Image', category: 'Conteúdo' },
    { id: 'button', name: 'Button', category: 'Conteúdo' },
    { id: 'link', name: 'Link', category: 'Conteúdo' },
    { id: 'icon', name: 'Icon', category: 'Conteúdo' },
    { id: 'card', name: 'Card', category: 'Conteúdo' },
    { id: 'header', name: 'Header', category: 'Navegação' },
    { id: 'footer', name: 'Footer', category: 'Navegação' },
    { id: 'tabs', name: 'Tabs', category: 'Navegação' },
    { id: 'accordion', name: 'Accordion', category: 'Navegação' },
    { id: 'modal', name: 'Modal', category: 'Navegação' },
    { id: 'form', name: 'Form', category: 'Formulário' },
    { id: 'input', name: 'Input', category: 'Formulário' },
    { id: 'select', name: 'Select', category: 'Formulário' },
    { id: 'checkbox', name: 'Checkbox', category: 'Formulário' },
    { id: 'divider', name: 'Divider', category: 'Utilitário' },
    { id: 'spacer', name: 'Spacer', category: 'Utilitário' }
  ];

  const categories = ['Estrutural', 'Conteúdo', 'Navegação', 'Formulário', 'Utilitário'];

  const handleComponentChange = (type: string) => {
    setSelectedType(type);
    
    // Criar exemplo específico para cada tipo
    let example: Partial<BaseComponentProperties>;
    
    switch (type) {
      case 'heading':
        example = initializeComponent('heading', {
          name: 'Título Demo',
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '1rem'
        } as Partial<HeadingProperties>);
        break;
      
      case 'button':
        example = initializeComponent('button', {
          name: 'Botão Demo',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '600'
        } as Partial<ButtonProperties>);
        break;
      
      case 'text':
        example = initializeComponent('text', {
          name: 'Texto Demo',
          fontSize: '1rem',
          lineHeight: '1.5',
          color: '#374151'
        } as Partial<TextProperties>);
        break;
      
      default:
        example = initializeComponent(type, {
          name: `${type} Demo`,
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.25rem'
        });
    }
    
    setDemoComponent(example);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold">Sistema de Schemas Avançados</h1>
            <p className="text-muted-foreground">
              Explore todos os componentes e suas propriedades avançadas
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Destaques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Componentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{componentTypes.length}</div>
            <p className="text-xs text-muted-foreground">tipos disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code className="w-4 h-4" />
              Propriedades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100+</div>
            <p className="text-xs text-muted-foreground">propriedades configuráveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              TypeScript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">type-safe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Acessível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">WCAG AA</div>
            <p className="text-xs text-muted-foreground">compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="explorer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="explorer">
            <Layers className="w-4 h-4 mr-2" />
            Explorer
          </TabsTrigger>
          <TabsTrigger value="editor">
            <Code className="w-4 h-4 mr-2" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="docs">
            <Book className="w-4 h-4 mr-2" />
            Documentação
          </TabsTrigger>
        </TabsList>

        {/* EXPLORER TAB */}
        <TabsContent value="explorer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seletor de Componentes */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Selecione um Componente</CardTitle>
                <CardDescription>
                  Escolha um tipo para ver suas propriedades
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {categories.map(category => (
                    <div key={category} className="px-4 py-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        {category}
                      </div>
                      <div className="space-y-1">
                        {componentTypes
                          .filter(t => t.category === category)
                          .map(type => (
                            <Button
                              key={type.id}
                              variant={selectedType === type.id ? 'secondary' : 'ghost'}
                              className="w-full justify-start text-sm"
                              onClick={() => handleComponentChange(type.id)}
                            >
                              {type.name}
                            </Button>
                          ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Preview & Propriedades</CardTitle>
                <CardDescription>
                  Visualização do componente selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedTemplatePreview component={demoComponent} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* EDITOR TAB */}
        <TabsContent value="editor">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor de Propriedades */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Editor de Propriedades</CardTitle>
                <CardDescription>
                  Edite todas as propriedades do componente
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-hidden">
                  <AdvancedPropertyEditor
                    component={demoComponent}
                    onChange={(updates) => {
                      setDemoComponent({ ...demoComponent, ...updates });
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview Ao Vivo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview Ao Vivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-8 min-h-[200px] flex items-center justify-center"
                  style={{
                    width: demoComponent.width,
                    height: demoComponent.height,
                    backgroundColor: demoComponent.backgroundColor,
                    color: demoComponent.color,
                    fontFamily: demoComponent.fontFamily,
                    fontSize: demoComponent.fontSize,
                    fontWeight: demoComponent.fontWeight,
                    borderRadius: demoComponent.borderRadius,
                    margin: demoComponent.margin,
                    padding: demoComponent.padding,
                    opacity: demoComponent.opacity,
                    borderWidth: demoComponent.borderWidth,
                    borderStyle: demoComponent.borderStyle as any,
                    borderColor: demoComponent.borderColor,
                  }}
                >
                  <div className="text-center">
                    <div className="font-semibold mb-1">
                      {demoComponent.name || 'Componente'}
                    </div>
                    <div className="text-xs opacity-50">
                      {demoComponent.componentType}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DOCS TAB */}
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentação Completa</CardTitle>
              <CardDescription>
                Guia detalhado de uso e referência
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h3>Sistema de Schemas Avançados</h3>
              <p>
                Este sistema fornece uma estrutura completa e tipada para definir componentes
                com propriedades avançadas de layout, estilo, acessibilidade e responsividade.
              </p>

              <h4>Núcleo Comum (BaseComponentProperties)</h4>
              <ul>
                <li><strong>Identidade:</strong> id, name, componentType, locked, visibility</li>
                <li><strong>Layout:</strong> width, height, min/max, zIndex</li>
                <li><strong>Espaçamento:</strong> margin, padding (em/rem/%/px)</li>
                <li><strong>Tipografia:</strong> fontFamily, fontSize, fontWeight, lineHeight</li>
                <li><strong>Cores:</strong> color, backgroundColor</li>
                <li><strong>Bordas:</strong> borderRadius, borderWidth, borderStyle</li>
                <li><strong>Efeitos:</strong> boxShadow, opacity, filter, transform</li>
                <li><strong>Animações:</strong> transition, animation</li>
                <li><strong>Estados:</strong> hover, focus, active, disabled</li>
                <li><strong>Responsividade:</strong> breakpoints (xs, sm, md, lg, xl)</li>
                <li><strong>Acessibilidade:</strong> role, aria-*, tabIndex</li>
              </ul>

              <h4>Componentes Disponíveis</h4>
              <p>
                <Badge>Container</Badge>{' '}
                <Badge>Section</Badge>{' '}
                <Badge>Grid</Badge>{' '}
                <Badge>Text</Badge>{' '}
                <Badge>Heading</Badge>{' '}
                <Badge>Image</Badge>{' '}
                <Badge>Button</Badge>{' '}
                <Badge>Link</Badge>{' '}
                <Badge>Icon</Badge>{' '}
                <Badge>Card</Badge>{' '}
                <Badge>Header</Badge>{' '}
                <Badge>Footer</Badge>{' '}
                <Badge>Tabs</Badge>{' '}
                <Badge>Accordion</Badge>{' '}
                <Badge>Modal</Badge>{' '}
                <Badge>Form</Badge>{' '}
                <Badge>Input</Badge>{' '}
                <Badge>Select</Badge>{' '}
                e muito mais...
              </p>

              <h4>Exemplo de Uso</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`import { initializeComponent, ContainerProperties } from '@/utils/advancedComponentSchemas';

const hero = initializeComponent('container', {
  name: 'Hero Section',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  padding: '4rem 2rem',
  backgroundColor: '#667eea',
  borderRadius: '0.5rem',
  boxShadow: {
    offsetX: '0',
    offsetY: '0.75rem',
    blur: '1.5rem',
    spread: '0',
    color: 'rgba(0,0,0,0.1)'
  },
  breakpoints: {
    md: { padding: '6rem 3rem' }
  }
} as Partial<ContainerProperties>);`}
              </pre>

              <p className="text-sm text-muted-foreground mt-4">
                Consulte <code>/SISTEMA-SCHEMAS-AVANCADOS.md</code> para a documentação completa.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
