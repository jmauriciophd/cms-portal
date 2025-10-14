import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { X, Palette, Code, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface StylePanelProps {
  component: any;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

export function StylePanel({ component, onUpdate, onClose }: StylePanelProps) {
  const [activeTab, setActiveTab] = useState('styles');

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      styles: {
        ...component.styles,
        [key]: value
      }
    });
  };

  const updateProp = (key: string, value: any) => {
    onUpdate({
      props: {
        ...component.props,
        [key]: value
      }
    });
  };

  const colors = [
    '#000000', '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db',
    '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
    '#10b981', '#059669', '#047857', '#065f46', '#064e3b',
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
    '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Editar Componente</h3>
          <p className="text-xs text-gray-600">{component.type}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="content" className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex-1">
            <Palette className="w-4 h-4 mr-2" />
            Estilos
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1">
            <Code className="w-4 h-4 mr-2" />
            Avançado
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 px-4 pb-4">
          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Propriedades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {component.type === 'heading' && (
                  <>
                    <div>
                      <Label>Tag</Label>
                      <Select
                        value={component.props.tag || 'h2'}
                        onValueChange={(value) => updateProp('tag', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h1">H1</SelectItem>
                          <SelectItem value="h2">H2</SelectItem>
                          <SelectItem value="h3">H3</SelectItem>
                          <SelectItem value="h4">H4</SelectItem>
                          <SelectItem value="h5">H5</SelectItem>
                          <SelectItem value="h6">H6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Texto</Label>
                      <Input
                        value={component.props.text || ''}
                        onChange={(e) => updateProp('text', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {component.type === 'paragraph' && (
                  <div>
                    <Label>Texto</Label>
                    <Textarea
                      value={component.props.text || ''}
                      onChange={(e) => updateProp('text', e.target.value)}
                      rows={4}
                    />
                  </div>
                )}

                {component.type === 'image' && (
                  <>
                    <div>
                      <Label>URL da Imagem</Label>
                      <Input
                        value={component.props.src || ''}
                        onChange={(e) => updateProp('src', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Texto Alternativo</Label>
                      <Input
                        value={component.props.alt || ''}
                        onChange={(e) => updateProp('alt', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {component.type === 'button' && (
                  <>
                    <div>
                      <Label>Texto do Botão</Label>
                      <Input
                        value={component.props.text || ''}
                        onChange={(e) => updateProp('text', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Link (URL)</Label>
                      <Input
                        value={component.props.href || ''}
                        onChange={(e) => updateProp('href', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Ação (JavaScript)</Label>
                      <Textarea
                        value={component.props.onClick || ''}
                        onChange={(e) => updateProp('onClick', e.target.value)}
                        placeholder="alert('Clicou!')"
                        rows={2}
                      />
                    </div>
                  </>
                )}

                {component.type === 'hero' && (
                  <>
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={component.props.title || ''}
                        onChange={(e) => updateProp('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Subtítulo</Label>
                      <Input
                        value={component.props.subtitle || ''}
                        onChange={(e) => updateProp('subtitle', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Texto do Botão</Label>
                      <Input
                        value={component.props.buttonText || ''}
                        onChange={(e) => updateProp('buttonText', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Imagem de Fundo (URL)</Label>
                      <Input
                        value={component.props.backgroundImage || ''}
                        onChange={(e) => updateProp('backgroundImage', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </>
                )}

                {component.type === 'card' && (
                  <>
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={component.props.title || ''}
                        onChange={(e) => updateProp('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={component.props.description || ''}
                        onChange={(e) => updateProp('description', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Imagem (URL)</Label>
                      <Input
                        value={component.props.image || ''}
                        onChange={(e) => updateProp('image', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </>
                )}

                {component.type === 'grid' && (
                  <>
                    <div>
                      <Label>Número de Colunas</Label>
                      <Slider
                        value={[component.props.columns || 3]}
                        onValueChange={([value]) => updateProp('columns', value)}
                        min={1}
                        max={6}
                        step={1}
                      />
                      <div className="text-sm text-gray-600 mt-1 text-center">
                        {component.props.columns || 3} colunas
                      </div>
                    </div>
                    <div>
                      <Label>Espaçamento (Gap)</Label>
                      <Input
                        value={component.props.gap || '1rem'}
                        onChange={(e) => updateProp('gap', e.target.value)}
                        placeholder="1rem"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Styles Tab */}
          <TabsContent value="styles" className="space-y-4 mt-4">
            {/* Layout */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Layout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Input
                      value={component.styles.width || ''}
                      onChange={(e) => updateStyle('width', e.target.value)}
                      placeholder="auto"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Input
                      value={component.styles.height || ''}
                      onChange={(e) => updateStyle('height', e.target.value)}
                      placeholder="auto"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Width</Label>
                    <Input
                      value={component.styles.maxWidth || ''}
                      onChange={(e) => updateStyle('maxWidth', e.target.value)}
                      placeholder="none"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Height</Label>
                    <Input
                      value={component.styles.maxHeight || ''}
                      onChange={(e) => updateStyle('maxHeight', e.target.value)}
                      placeholder="none"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Display</Label>
                  <Select
                    value={component.styles.display || 'block'}
                    onValueChange={(value) => updateStyle('display', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="inline-block">Inline Block</SelectItem>
                      <SelectItem value="flex">Flex</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="inline">Inline</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {component.styles.display === 'flex' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Justify</Label>
                        <Select
                          value={component.styles.justifyContent || 'flex-start'}
                          onValueChange={(value) => updateStyle('justifyContent', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flex-start">Start</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="flex-end">End</SelectItem>
                            <SelectItem value="space-between">Space Between</SelectItem>
                            <SelectItem value="space-around">Space Around</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Align</Label>
                        <Select
                          value={component.styles.alignItems || 'stretch'}
                          onValueChange={(value) => updateStyle('alignItems', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flex-start">Start</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="flex-end">End</SelectItem>
                            <SelectItem value="stretch">Stretch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Gap</Label>
                      <Input
                        value={component.styles.gap || ''}
                        onChange={(e) => updateStyle('gap', e.target.value)}
                        placeholder="1rem"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Spacing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Espaçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs mb-2 block">Padding</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      value={component.styles.paddingTop || ''}
                      onChange={(e) => updateStyle('paddingTop', e.target.value)}
                      placeholder="Top"
                    />
                    <Input
                      value={component.styles.paddingRight || ''}
                      onChange={(e) => updateStyle('paddingRight', e.target.value)}
                      placeholder="Right"
                    />
                    <Input
                      value={component.styles.paddingBottom || ''}
                      onChange={(e) => updateStyle('paddingBottom', e.target.value)}
                      placeholder="Bottom"
                    />
                    <Input
                      value={component.styles.paddingLeft || ''}
                      onChange={(e) => updateStyle('paddingLeft', e.target.value)}
                      placeholder="Left"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Margin</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      value={component.styles.marginTop || ''}
                      onChange={(e) => updateStyle('marginTop', e.target.value)}
                      placeholder="Top"
                    />
                    <Input
                      value={component.styles.marginRight || ''}
                      onChange={(e) => updateStyle('marginRight', e.target.value)}
                      placeholder="Right"
                    />
                    <Input
                      value={component.styles.marginBottom || ''}
                      onChange={(e) => updateStyle('marginBottom', e.target.value)}
                      placeholder="Bottom"
                    />
                    <Input
                      value={component.styles.marginLeft || ''}
                      onChange={(e) => updateStyle('marginLeft', e.target.value)}
                      placeholder="Left"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tipografia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    value={component.styles.fontSize || ''}
                    onChange={(e) => updateStyle('fontSize', e.target.value)}
                    placeholder="1rem"
                  />
                </div>
                <div>
                  <Label className="text-xs">Font Weight</Label>
                  <Select
                    value={component.styles.fontWeight?.toString() || 'normal'}
                    onValueChange={(value) => updateStyle('fontWeight', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 - Thin</SelectItem>
                      <SelectItem value="200">200 - Extra Light</SelectItem>
                      <SelectItem value="300">300 - Light</SelectItem>
                      <SelectItem value="normal">400 - Normal</SelectItem>
                      <SelectItem value="500">500 - Medium</SelectItem>
                      <SelectItem value="600">600 - Semibold</SelectItem>
                      <SelectItem value="bold">700 - Bold</SelectItem>
                      <SelectItem value="800">800 - Extra Bold</SelectItem>
                      <SelectItem value="900">900 - Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Text Align</Label>
                  <Select
                    value={component.styles.textAlign || 'left'}
                    onValueChange={(value) => updateStyle('textAlign', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Line Height</Label>
                  <Input
                    value={component.styles.lineHeight || ''}
                    onChange={(e) => updateStyle('lineHeight', e.target.value)}
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs">Letter Spacing</Label>
                  <Input
                    value={component.styles.letterSpacing || ''}
                    onChange={(e) => updateStyle('letterSpacing', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs mb-2 block">Cor do Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={component.styles.color || '#000000'}
                      onChange={(e) => updateStyle('color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={component.styles.color || ''}
                      onChange={(e) => updateStyle('color', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  <div className="grid grid-cols-10 gap-1 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateStyle('color', color)}
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={component.styles.background || '#ffffff'}
                      onChange={(e) => updateStyle('background', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={component.styles.background || ''}
                      onChange={(e) => updateStyle('background', e.target.value)}
                      placeholder="transparent"
                      className="flex-1"
                    />
                  </div>
                  <div className="grid grid-cols-10 gap-1 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateStyle('background', color)}
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Border */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Borda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Border Width</Label>
                  <Input
                    value={component.styles.borderWidth || ''}
                    onChange={(e) => updateStyle('borderWidth', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-xs">Border Style</Label>
                  <Select
                    value={component.styles.borderStyle || 'solid'}
                    onValueChange={(value) => updateStyle('borderStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={component.styles.borderColor || '#000000'}
                      onChange={(e) => updateStyle('borderColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={component.styles.borderColor || ''}
                      onChange={(e) => updateStyle('borderColor', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Border Radius</Label>
                  <Input
                    value={component.styles.borderRadius || ''}
                    onChange={(e) => updateStyle('borderRadius', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Effects */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Efeitos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Opacity</Label>
                  <Slider
                    value={[parseFloat(component.styles.opacity || '1') * 100]}
                    onValueChange={([value]) => updateStyle('opacity', (value / 100).toString())}
                    min={0}
                    max={100}
                    step={1}
                  />
                  <div className="text-xs text-gray-600 mt-1 text-center">
                    {Math.round(parseFloat(component.styles.opacity || '1') * 100)}%
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Box Shadow</Label>
                  <Input
                    value={component.styles.boxShadow || ''}
                    onChange={(e) => updateStyle('boxShadow', e.target.value)}
                    placeholder="0 4px 6px rgba(0,0,0,0.1)"
                  />
                </div>
                <div>
                  <Label className="text-xs">Transform</Label>
                  <Input
                    value={component.styles.transform || ''}
                    onChange={(e) => updateStyle('transform', e.target.value)}
                    placeholder="rotate(45deg)"
                  />
                </div>
                <div>
                  <Label className="text-xs">Transition</Label>
                  <Input
                    value={component.styles.transition || ''}
                    onChange={(e) => updateStyle('transition', e.target.value)}
                    placeholder="all 0.3s ease"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">CSS Personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={component.customCSS || ''}
                  onChange={(e) => onUpdate({ customCSS: e.target.value })}
                  placeholder=".meu-componente { color: red; }"
                  rows={8}
                  className="font-mono text-xs"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">JavaScript Personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={component.customJS || ''}
                  onChange={(e) => onUpdate({ customJS: e.target.value })}
                  placeholder="console.log('Hello');"
                  rows={8}
                  className="font-mono text-xs"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">ID e Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">ID</Label>
                  <Input
                    value={component.props.id || ''}
                    onChange={(e) => updateProp('id', e.target.value)}
                    placeholder="meu-id"
                  />
                </div>
                <div>
                  <Label className="text-xs">Classes CSS</Label>
                  <Input
                    value={component.props.className || ''}
                    onChange={(e) => updateProp('className', e.target.value)}
                    placeholder="classe1 classe2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
