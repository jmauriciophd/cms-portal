import { useBuilderStore } from '../../store/useBuilderStore';
import { X, FileText, Palette, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ContentTab } from './PropertyTabs/ContentTab';
import { StyleTab } from './PropertyTabs/StyleTab';
import { SettingsTab } from './PropertyTabs/SettingsTab';

export function BuilderPropertiesPanel() {
  const { nodes, selectedNodeId, selectNode } = useBuilderStore();

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

  if (!selectedNodeId) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <Settings className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-sm font-medium">Selecione um componente</p>
        <p className="text-xs mt-1">para editar suas propriedades</p>
      </div>
    );
  }

  if (!selectedNode) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Propriedades
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectNode(null)}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-gray-200 bg-white h-auto p-0">
          <TabsTrigger 
            value="content" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 py-3"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger 
            value="style"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 py-3"
          >
            <Palette className="w-4 h-4 mr-1.5" />
            Estilos
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 py-3"
          >
            <Settings className="w-4 h-4 mr-1.5" />
            Config
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="content" className="mt-0">
            <ContentTab />
          </TabsContent>

          <TabsContent value="style" className="mt-0">
            <StyleTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <SettingsTab />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer com info do componente */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">ID:</span>
            <span className="font-mono">{selectedNode.id.slice(0, 8)}...</span>
          </div>
          {'children' in selectedNode && (
            <div className="flex justify-between">
              <span className="text-gray-500">Filhos:</span>
              <span>{selectedNode.children.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
