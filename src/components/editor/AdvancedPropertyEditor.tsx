/**
 * EDITOR DE PROPRIEDADES AVANÇADO
 * Editor completo para todas as propriedades dos componentes
 */

import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { ScrollArea } from '../ui/scroll-area';
import { 
  BaseComponentProperties,
  BoxShadowConfig,
  TransformConfig,
  AnimationConfig,
  propertiesToCSS,
  getAccessibilityProps
} from '../../utils/advancedComponentSchemas';
import { 
  Layout, 
  Type, 
  Palette, 
  Box, 
  Move, 
  Eye, 
  Zap, 
  MousePointer,
  Smartphone,
  Settings,
  Lock,
  Unlock
} from 'lucide-react';

interface AdvancedPropertyEditorProps {
  component: Partial<BaseComponentProperties>;
  onChange: (updates: Partial<BaseComponentProperties>) => void;
}

export function AdvancedPropertyEditor({ component, onChange }: AdvancedPropertyEditorProps) {
  const [activeTab, setActiveTab] = useState('layout');

  const updateProperty = (key: string, value: any) => {
    onChange({ [key]: value });
  };

  const updateNestedProperty = (parentKey: string, childKey: string, value: any) => {
    const parent = component[parentKey as keyof BaseComponentProperties] || {};
    onChange({
      [parentKey]: {
        ...(typeof parent === 'object' ? parent : {}),
        [childKey]: value
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Propriedades</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateProperty('locked', !component.locked)}
          >
            {component.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {component.name || component.componentType || 'Componente'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="layout">
              <Layout className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="style">
              <Palette className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Zap className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* TAB: LAYOUT */}
          <TabsContent value="layout" className="space-y-4">
            <Accordion type="multiple" defaultValue={['dimensions', 'spacing']}>
              
              {/* Dimensões */}
              <AccordionItem value="dimensions">
                <AccordionTrigger>Dimensões</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Largura</Label>
                      <Input
                        value={component.width || ''}
                        onChange={(e) => updateProperty('width', e.target.value)}
                        placeholder="auto, 100%, 20rem"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Altura</Label>
                      <Input
                        value={component.height || ''}
                        onChange={(e) => updateProperty('height', e.target.value)}
                        placeholder="auto, 100%, 20rem"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Min Width</Label>
                      <Input
                        value={component.minWidth || ''}
                        onChange={(e) => updateProperty('minWidth', e.target.value)}
                        placeholder="0"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Min Height</Label>
                      <Input
                        value={component.minHeight || ''}
                        onChange={(e) => updateProperty('minHeight', e.target.value)}
                        placeholder="0"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Max Width</Label>
                      <Input
                        value={component.maxWidth || ''}
                        onChange={(e) => updateProperty('maxWidth', e.target.value)}
                        placeholder="none"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Height</Label>
                      <Input
                        value={component.maxHeight || ''}
                        onChange={(e) => updateProperty('maxHeight', e.target.value)}
                        placeholder="none"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Z-Index</Label>
                    <Input
                      type="number"
                      value={component.zIndex || 0}
                      onChange={(e) => updateProperty('zIndex', parseInt(e.target.value) || 0)}
                      className="h-8 text-xs"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Espaçamento */}
              <AccordionItem value="spacing">
                <AccordionTrigger>Espaçamento</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <Label className="text-xs mb-2 block">Margin (em/rem/%/px)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={component.marginTop || '0'}
                        onChange={(e) => updateProperty('marginTop', e.target.value)}
                        placeholder="Top"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={component.marginRight || '0'}
                        onChange={(e) => updateProperty('marginRight', e.target.value)}
                        placeholder="Right"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={component.marginBottom || '0'}
                        onChange={(e) => updateProperty('marginBottom', e.target.value)}
                        placeholder="Bottom"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={component.marginLeft || '0'}
                        onChange={(e) => updateProperty('marginLeft', e.target.value)}
                        placeholder="Left"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-2 block">Padding (em/rem/%/px)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={component.paddingTop || '0'}
                        onChange={(e) => updateProperty('paddingTop', e.target.value)}
                        placeholder="Top"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={component.paddingRight || '0'}
                        onChange={(e) => updateProperty('paddingRight', e.target.value)}
                        placeholder="Right"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={component.paddingBottom || '0'}
                        onChange={(e) => updateProperty('paddingBottom', e.target.value)}
                        placeholder="Bottom"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={component.paddingLeft || '0'}
                        onChange={(e) => updateProperty('paddingLeft', e.target.value)}
                        placeholder="Left"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </TabsContent>

          {/* TAB: STYLE */}
          <TabsContent value="style" className="space-y-4">
            <Accordion type="multiple" defaultValue={['typography', 'colors']}>
              
              {/* Tipografia */}
              <AccordionItem value="typography">
                <AccordionTrigger>Tipografia</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Font Family</Label>
                    <Input
                      value={component.fontFamily || ''}
                      onChange={(e) => updateProperty('fontFamily', e.target.value)}
                      placeholder="inherit"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Font Size (em/rem)</Label>
                    <Input
                      value={component.fontSize || ''}
                      onChange={(e) => updateProperty('fontSize', e.target.value)}
                      placeholder="1rem"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Font Weight</Label>
                    <Select
                      value={component.fontWeight?.toString() || '400'}
                      onValueChange={(value) => updateProperty('fontWeight', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Light (300)</SelectItem>
                        <SelectItem value="400">Normal (400)</SelectItem>
                        <SelectItem value="500">Medium (500)</SelectItem>
                        <SelectItem value="600">Semi-Bold (600)</SelectItem>
                        <SelectItem value="700">Bold (700)</SelectItem>
                        <SelectItem value="800">Extra-Bold (800)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Line Height</Label>
                    <Input
                      value={component.lineHeight || ''}
                      onChange={(e) => updateProperty('lineHeight', e.target.value)}
                      placeholder="1.5"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Letter Spacing (em/rem)</Label>
                    <Input
                      value={component.letterSpacing || ''}
                      onChange={(e) => updateProperty('letterSpacing', e.target.value)}
                      placeholder="0"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Text Transform</Label>
                    <Select
                      value={component.textTransform || 'none'}
                      onValueChange={(value) => updateProperty('textTransform', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="uppercase">UPPERCASE</SelectItem>
                        <SelectItem value="lowercase">lowercase</SelectItem>
                        <SelectItem value="capitalize">Capitalize</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Text Decoration</Label>
                    <Select
                      value={component.textDecoration || 'none'}
                      onValueChange={(value) => updateProperty('textDecoration', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="underline">Underline</SelectItem>
                        <SelectItem value="line-through">Line Through</SelectItem>
                        <SelectItem value="overline">Overline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Cores */}
              <AccordionItem value="colors">
                <AccordionTrigger>Cores</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={component.color || '#000000'}
                        onChange={(e) => updateProperty('color', e.target.value)}
                        className="h-8 w-14"
                      />
                      <Input
                        value={component.color || ''}
                        onChange={(e) => updateProperty('color', e.target.value)}
                        placeholder="#000000"
                        className="h-8 flex-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={component.backgroundColor || '#ffffff'}
                        onChange={(e) => updateProperty('backgroundColor', e.target.value)}
                        className="h-8 w-14"
                      />
                      <Input
                        value={component.backgroundColor || ''}
                        onChange={(e) => updateProperty('backgroundColor', e.target.value)}
                        placeholder="transparent"
                        className="h-8 flex-1 text-xs"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Bordas */}
              <AccordionItem value="borders">
                <AccordionTrigger>Bordas e Raio</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Border Radius (em/rem/%/px)</Label>
                    <Input
                      value={component.borderRadius || '0'}
                      onChange={(e) => updateProperty('borderRadius', e.target.value)}
                      placeholder="0.5rem"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Border Width</Label>
                    <Input
                      value={component.borderWidth || '0'}
                      onChange={(e) => updateProperty('borderWidth', e.target.value)}
                      placeholder="1px"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Border Style</Label>
                    <Select
                      value={component.borderStyle || 'solid'}
                      onValueChange={(value) => updateProperty('borderStyle', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={component.borderColor || '#000000'}
                        onChange={(e) => updateProperty('borderColor', e.target.value)}
                        className="h-8 w-14"
                      />
                      <Input
                        value={component.borderColor || ''}
                        onChange={(e) => updateProperty('borderColor', e.target.value)}
                        placeholder="#000000"
                        className="h-8 flex-1 text-xs"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Opacidade */}
              <AccordionItem value="opacity">
                <AccordionTrigger>Opacidade</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Opacidade</Label>
                      <span className="text-xs text-muted-foreground">
                        {((component.opacity || 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[component.opacity !== undefined ? component.opacity * 100 : 100]}
                      onValueChange={(values) => updateProperty('opacity', values[0] / 100)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </TabsContent>

          {/* TAB: ADVANCED */}
          <TabsContent value="advanced" className="space-y-4">
            <Accordion type="multiple">
              
              {/* Transform */}
              <AccordionItem value="transform">
                <AccordionTrigger>Transformações</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Rotate (deg)</Label>
                    <Input
                      type="number"
                      value={component.transform?.rotate || 0}
                      onChange={(e) => updateNestedProperty('transform', 'rotate', parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Scale X</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={component.transform?.scaleX || 1}
                        onChange={(e) => updateNestedProperty('transform', 'scaleX', parseFloat(e.target.value) || 1)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Scale Y</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={component.transform?.scaleY || 1}
                        onChange={(e) => updateNestedProperty('transform', 'scaleY', parseFloat(e.target.value) || 1)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Translate X</Label>
                      <Input
                        value={component.transform?.translateX || '0'}
                        onChange={(e) => updateNestedProperty('transform', 'translateX', e.target.value)}
                        placeholder="0px"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Translate Y</Label>
                      <Input
                        value={component.transform?.translateY || '0'}
                        onChange={(e) => updateNestedProperty('transform', 'translateY', e.target.value)}
                        placeholder="0px"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Box Shadow */}
              <AccordionItem value="shadow">
                <AccordionTrigger>Box Shadow</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Offset X</Label>
                      <Input
                        value={component.boxShadow?.offsetX || '0px'}
                        onChange={(e) => updateNestedProperty('boxShadow', 'offsetX', e.target.value)}
                        placeholder="0px"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Offset Y</Label>
                      <Input
                        value={component.boxShadow?.offsetY || '0px'}
                        onChange={(e) => updateNestedProperty('boxShadow', 'offsetY', e.target.value)}
                        placeholder="0px"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Blur</Label>
                      <Input
                        value={component.boxShadow?.blur || '0px'}
                        onChange={(e) => updateNestedProperty('boxShadow', 'blur', e.target.value)}
                        placeholder="10px"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Spread</Label>
                      <Input
                        value={component.boxShadow?.spread || '0px'}
                        onChange={(e) => updateNestedProperty('boxShadow', 'spread', e.target.value)}
                        placeholder="0px"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Shadow Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={component.boxShadow?.color || '#000000'}
                        onChange={(e) => updateNestedProperty('boxShadow', 'color', e.target.value)}
                        className="h-8 w-14"
                      />
                      <Input
                        value={component.boxShadow?.color || ''}
                        onChange={(e) => updateNestedProperty('boxShadow', 'color', e.target.value)}
                        placeholder="rgba(0,0,0,0.1)"
                        className="h-8 flex-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={component.boxShadow?.inset || false}
                      onCheckedChange={(checked) => updateNestedProperty('boxShadow', 'inset', checked)}
                    />
                    <Label className="text-xs">Inset</Label>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </TabsContent>

          {/* TAB: SETTINGS */}
          <TabsContent value="settings" className="space-y-4">
            <Accordion type="multiple" defaultValue={['identity', 'accessibility']}>
              
              {/* Identidade */}
              <AccordionItem value="identity">
                <AccordionTrigger>Identidade</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <Label className="text-xs">ID</Label>
                    <Input
                      value={component.id || ''}
                      onChange={(e) => updateProperty('id', e.target.value)}
                      className="h-8 text-xs"
                      disabled
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Nome/Label</Label>
                    <Input
                      value={component.name || ''}
                      onChange={(e) => updateProperty('name', e.target.value)}
                      placeholder="Nome do componente"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Classes CSS</Label>
                    <Input
                      value={component.className || ''}
                      onChange={(e) => updateProperty('className', e.target.value)}
                      placeholder="class1 class2"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Tag HTML</Label>
                    <Input
                      value={component.tagName || ''}
                      onChange={(e) => updateProperty('tagName', e.target.value)}
                      placeholder="div, section, article..."
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={component.locked || false}
                      onCheckedChange={(checked) => updateProperty('locked', checked)}
                    />
                    <Label className="text-xs">Bloqueado</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={component.visibility !== false}
                      onCheckedChange={(checked) => updateProperty('visibility', checked)}
                    />
                    <Label className="text-xs">Visível</Label>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Acessibilidade */}
              <AccordionItem value="accessibility">
                <AccordionTrigger>Acessibilidade</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <Label className="text-xs">ARIA Role</Label>
                    <Input
                      value={component.role || ''}
                      onChange={(e) => updateProperty('role', e.target.value)}
                      placeholder="button, navigation..."
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">ARIA Label</Label>
                    <Input
                      value={component.ariaLabel || ''}
                      onChange={(e) => updateProperty('ariaLabel', e.target.value)}
                      placeholder="Descrição para leitores de tela"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Tab Index</Label>
                    <Input
                      type="number"
                      value={component.tabIndex || 0}
                      onChange={(e) => updateProperty('tabIndex', parseInt(e.target.value) || 0)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={component.focusOutline !== false}
                      onCheckedChange={(checked) => updateProperty('focusOutline', checked)}
                    />
                    <Label className="text-xs">Focus Outline</Label>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}
