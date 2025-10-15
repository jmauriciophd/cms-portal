import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { X, Palette, Type, Layout, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function BuilderPropertiesPanel() {
  const { nodes, selectedNodeId, updateNode, selectNode } = useBuilderStore();
  
  // Estado local para evitar travamentos
  const [localContent, setLocalContent] = useState('');
  const [localClassName, setLocalClassName] = useState('');
  const [customCSS, setCustomCSS] = useState('');

  // Encontrar nó selecionado
  const findNodeById = (nodes: any[], id: string): any => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = selectedNodeId ? findNodeById(nodes, selectedNodeId) : null;

  // Sincronizar estado local com nó selecionado
  useEffect(() => {
    if (selectedNode) {
      setLocalContent(selectedNode.content || '');
      setLocalClassName(selectedNode.className || '');
    } else {
      setLocalContent('');
      setLocalClassName('');
    }
  }, [selectedNodeId, selectedNode?.id]);

  if (!selectedNodeId) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <Settings className="w-16 h-16 mb-4" />
        <p className="text-sm">Selecione um componente</p>
        <p className="text-xs">para editar propriedades</p>
      </div>
    );
  }

  if (!selectedNode) {
    return null;
  }

  // Handlers com debounce manual
  const handleContentChange = (value: string) => {
    setLocalContent(value);
    // Atualizar imediatamente no store
    updateNode(selectedNodeId, { content: value });
  };

  const handleClassChange = (value: string) => {
    setLocalClassName(value);
    // Atualizar imediatamente no store
    updateNode(selectedNodeId, { className: value });
  };

  const handleStyleChange = (property: string, value: string) => {
    const newStyles = { ...(selectedNode.styles || {}), [property]: value };
    updateNode(selectedNodeId, { styles: newStyles });
  };

  const addClass = (newClass: string) => {
    const currentClasses = localClassName.trim();
    const classArray = currentClasses ? currentClasses.split(' ') : [];
    
    // Evitar duplicatas
    if (!classArray.includes(newClass)) {
      const updated = [...classArray, newClass].join(' ');
      setLocalClassName(updated);
      updateNode(selectedNodeId, { className: updated });
    }
  };

  const commonSpacingClasses = [
    'p-0', 'p-2', 'p-4', 'p-6', 'p-8',
    'px-2', 'px-4', 'px-6', 'px-8',
    'py-2', 'py-4', 'py-6', 'py-8',
    'm-0', 'm-2', 'm-4', 'm-6', 'm-8',
  ];

  const commonColorClasses = [
    'bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-gray-200',
    'bg-blue-50', 'bg-blue-100', 'bg-blue-500', 'bg-blue-600',
    'bg-green-50', 'bg-green-100', 'bg-green-500',
    'bg-red-50', 'bg-red-100', 'bg-red-500',
    'text-gray-900', 'text-gray-600', 'text-gray-500',
    'text-blue-600', 'text-green-600', 'text-red-600',
  ];

  const commonBorderClasses = [
    'border', 'border-2', 'border-4',
    'border-gray-200', 'border-gray-300', 'border-blue-500',
    'rounded', 'rounded-md', 'rounded-lg', 'rounded-full',
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Propriedades</h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedNode.type} • {selectedNode.id.slice(0, 8)}...
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectNode(null)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">
                <Type className="w-4 h-4 mr-1" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="style">
                <Palette className="w-4 h-4 mr-1" />
                Estilo
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Layout className="w-4 h-4 mr-1" />
                Layout
              </TabsTrigger>
            </TabsList>

            {/* Tab: Conteúdo */}
            <TabsContent value="content" className="space-y-4">
              {/* Texto/Conteúdo */}
              {selectedNode.type !== 'image' && !('children' in selectedNode) && (
                <div>
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    value={localContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Digite o conteúdo..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Digite livremente. Mudanças são salvas automaticamente.
                  </p>
                </div>
              )}

              {/* URL da Imagem */}
              {selectedNode.type === 'image' && (
                <div>
                  <Label htmlFor="imageUrl">URL da Imagem</Label>
                  <Input
                    id="imageUrl"
                    value={localContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cole a URL da imagem
                  </p>
                </div>
              )}

              {/* Info para Containers */}
              {'children' in selectedNode && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="text-sm text-blue-900 font-medium mb-1">
                    Container
                  </div>
                  <div className="text-xs text-blue-700">
                    Este é um container que pode conter outros componentes.
                    Arraste elementos para dentro dele.
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    {selectedNode.children.length} {selectedNode.children.length === 1 ? 'item' : 'itens'}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab: Estilo */}
            <TabsContent value="style" className="space-y-4">
              {/* Classes do Tailwind */}
              <div>
                <Label htmlFor="className">Classes CSS (Tailwind)</Label>
                <Textarea
                  id="className"
                  value={localClassName}
                  onChange={(e) => handleClassChange(e.target.value)}
                  placeholder="p-4 bg-blue-500 text-white rounded..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separe as classes com espaços
                </p>
              </div>

              <Separator />

              {/* Cores Rápidas */}
              <div>
                <Label className="mb-2 block">Cores Comuns</Label>
                <div className="grid grid-cols-3 gap-2">
                  {commonColorClasses.slice(0, 12).map(cls => (
                    <button
                      key={cls}
                      onClick={() => addClass(cls)}
                      className={`${cls} border border-gray-300 rounded px-2 py-1 text-xs hover:ring-2 hover:ring-blue-500`}
                      title={cls}
                    >
                      {cls.split('-').pop()}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Clique para adicionar a classe
                </p>
              </div>

              <Separator />

              {/* Bordas */}
              <div>
                <Label className="mb-2 block">Bordas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {commonBorderClasses.slice(0, 8).map(cls => (
                    <Button
                      key={cls}
                      variant="outline"
                      size="sm"
                      onClick={() => addClass(cls)}
                      className="text-xs"
                    >
                      {cls}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* CSS Inline */}
              <div>
                <Label htmlFor="customCSS">CSS Personalizado</Label>
                <Textarea
                  id="customCSS"
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  placeholder="background: linear-gradient(...);"
                  rows={3}
                  className="resize-none"
                />
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => {
                    const styles = customCSS.split(';').reduce((acc: any, rule) => {
                      const [prop, value] = rule.split(':').map(s => s.trim());
                      if (prop && value) acc[prop] = value;
                      return acc;
                    }, {});
                    updateNode(selectedNodeId, { styles });
                    setCustomCSS('');
                  }}
                >
                  Aplicar CSS
                </Button>
              </div>
            </TabsContent>

            {/* Tab: Layout */}
            <TabsContent value="layout" className="space-y-4">
              {/* Espaçamento */}
              <div>
                <Label className="mb-2 block">Espaçamento (Padding/Margin)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {commonSpacingClasses.slice(0, 10).map(cls => (
                    <Button
                      key={cls}
                      variant="outline"
                      size="sm"
                      onClick={() => addClass(cls)}
                      className="text-xs"
                    >
                      {cls}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Display */}
              <div>
                <Label htmlFor="display">Display</Label>
                <Select
                  onValueChange={(value) => addClass(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="inline-block">Inline Block</SelectItem>
                    <SelectItem value="flex">Flex</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Flex */}
              <div>
                <Label htmlFor="flexDirection">Flex Direction</Label>
                <Select
                  onValueChange={(value) => addClass(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-row">Row</SelectItem>
                    <SelectItem value="flex-col">Column</SelectItem>
                    <SelectItem value="flex-row-reverse">Row Reverse</SelectItem>
                    <SelectItem value="flex-col-reverse">Column Reverse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Justify & Align */}
              <div>
                <Label htmlFor="justify">Justify Content</Label>
                <Select
                  onValueChange={(value) => addClass(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="justify-start">Start</SelectItem>
                    <SelectItem value="justify-center">Center</SelectItem>
                    <SelectItem value="justify-end">End</SelectItem>
                    <SelectItem value="justify-between">Between</SelectItem>
                    <SelectItem value="justify-around">Around</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="align">Align Items</Label>
                <Select
                  onValueChange={(value) => addClass(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="items-start">Start</SelectItem>
                    <SelectItem value="items-center">Center</SelectItem>
                    <SelectItem value="items-end">End</SelectItem>
                    <SelectItem value="items-stretch">Stretch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Width/Height */}
              <div>
                <Label htmlFor="width">Width</Label>
                <Select
                  onValueChange={(value) => addClass(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="w-full">Full (100%)</SelectItem>
                    <SelectItem value="w-1/2">1/2 (50%)</SelectItem>
                    <SelectItem value="w-1/3">1/3 (33%)</SelectItem>
                    <SelectItem value="w-1/4">1/4 (25%)</SelectItem>
                    <SelectItem value="w-auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {/* Info adicional */}
          <div className="mt-6 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>ID:</strong> {selectedNode.id}</div>
              <div><strong>Tipo:</strong> {selectedNode.type}</div>
              {'children' in selectedNode && (
                <div><strong>Filhos:</strong> {selectedNode.children.length}</div>
              )}
            </div>
          </div>

          {/* Dica de uso */}
          <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-xs text-blue-900">
              💡 <strong>Dica:</strong> Digite livremente nos campos de texto. 
              As mudanças são aplicadas automaticamente!
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
