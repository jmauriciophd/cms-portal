import React, { useEffect, useState } from 'react';
import { useBuilderStore, BuilderNode } from '../../store/useBuilderStore';
import { BuilderSidebar } from '../editor/BuilderSidebar';
import { RenderNode } from '../editor/RenderNode';
import { BuilderPropertiesPanel } from '../editor/BuilderPropertiesPanel';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Undo,
  Redo,
  Save,
  Download,
  Upload,
  Trash2,
  Eye,
  Code,
  FileJson,
  Play
} from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';

export function PageBuilder() {
  const {
    nodes,
    addNode,
    moveNode,
    undo,
    redo,
    saveLayout,
    loadLayout,
    clearLayout,
    exportJSON,
    exportHTML,
    importJSON,
    selectNode,
  } = useBuilderStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showJSONExport, setShowJSONExport] = useState(false);
  const [showHTMLExport, setShowHTMLExport] = useState(false);
  const [showJSONImport, setShowJSONImport] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [exportedJSON, setExportedJSON] = useState('');
  const [exportedHTML, setExportedHTML] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Carregar layout ao montar
  useEffect(() => {
    loadLayout();
  }, []);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (nodes.length > 0) {
        saveLayout();
        console.log('Layout salvo automaticamente');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [nodes, saveLayout]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Ctrl/Cmd + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Aqui podemos adicionar lógica de preview do drop
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Se está arrastando da paleta
    if (activeId.startsWith('palette-')) {
      const type = active.data.current?.type;
      if (type) {
        // Se dropou em um container, adicionar como filho
        if (overId !== 'canvas-root') {
          addNode(type, overId);
        } else {
          // Adicionar na raiz
          addNode(type, null);
        }
        toast.success(`${type} adicionado!`);
      }
      return;
    }

    // Se está movendo um nó existente
    if (activeId !== overId) {
      // Determinar se está dropando em um container ou reordenando
      const overNode = findNodeById(nodes, overId);
      const isContainer = overNode && 'children' in overNode;

      if (isContainer) {
        // Mover para dentro do container
        moveNode(activeId, overId);
      } else {
        // Reordenar no mesmo nível
        moveNode(activeId, null);
      }
      toast.success('Componente movido!');
    }
  };

  const findNodeById = (nodes: BuilderNode[], id: string): BuilderNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if ('children' in node && node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSave = () => {
    saveLayout();
    toast.success('Layout salvo com sucesso!');
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todo o layout?')) {
      clearLayout();
      toast.success('Layout limpo!');
    }
  };

  const handleExportJSON = () => {
    const json = exportJSON();
    setExportedJSON(json);
    setShowJSONExport(true);
  };

  const handleExportHTML = () => {
    const html = exportHTML();
    setExportedHTML(html);
    setShowHTMLExport(true);
  };

  const handleImportJSON = () => {
    setShowJSONImport(true);
  };

  const handleConfirmImport = () => {
    try {
      importJSON(importValue);
      setShowJSONImport(false);
      setImportValue('');
      toast.success('Layout importado com sucesso!');
    } catch (error) {
      toast.error('Erro ao importar JSON. Verifique o formato.');
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado para a área de transferência!`);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} baixado!`);
  };

  // Gerar lista de IDs para SortableContext
  const getAllNodeIds = (nodes: BuilderNode[]): string[] => {
    const ids: string[] = [];
    nodes.forEach(node => {
      ids.push(node.id);
      if ('children' in node && node.children) {
        ids.push(...getAllNodeIds(node.children));
      }
    });
    return ids;
  };

  const allNodeIds = getAllNodeIds(nodes);

  return (
    <div className="flex h-screen bg-gray-100">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Sidebar com componentes */}
        <BuilderSidebar />

        {/* Canvas principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-gray-900">Page Builder</h1>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  title="Desfazer (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  title="Refazer (Ctrl+Shift+Z)"
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </div>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  title="Salvar (Ctrl+S)"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  title="Limpar tudo"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
              >
                <FileJson className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportHTML}
              >
                <Code className="w-4 h-4 mr-2" />
                HTML
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportJSON}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </div>
          </div>

          {/* Canvas área de edição */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto">
              <SortableContext
                items={allNodeIds}
                strategy={verticalListSortingStrategy}
              >
                <div
                  id="canvas-root"
                  className="bg-white rounded-lg shadow-md p-6 min-h-[80vh]"
                  onClick={() => selectNode(null)}
                >
                  {nodes.length === 0 ? (
                    <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Canvas vazio
                        </h3>
                        <p className="text-gray-500">
                          Arraste componentes da sidebar para começar
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {nodes.map(node => (
                        <RenderNode key={node.id} node={node} />
                      ))}
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>
        </div>

        {/* Painel de propriedades */}
        <BuilderPropertiesPanel />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && activeId.startsWith('palette-') ? (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg">
              Arrastando componente...
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Dialog: Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview da Página</DialogTitle>
            <DialogDescription>
              Visualização de como sua página ficará
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-gray-50 rounded-lg p-6">
            {nodes.map(node => (
              <RenderNode key={node.id} node={node} />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Export JSON */}
      <Dialog open={showJSONExport} onOpenChange={setShowJSONExport}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Exportar JSON</DialogTitle>
            <DialogDescription>
              Copie ou baixe o JSON da estrutura da página
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={exportedJSON}
            readOnly
            className="font-mono text-sm h-96"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(exportedJSON, 'JSON')}
            >
              Copiar
            </Button>
            <Button
              onClick={() => downloadFile(exportedJSON, 'page-layout.json')}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Export HTML */}
      <Dialog open={showHTMLExport} onOpenChange={setShowHTMLExport}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Exportar HTML</DialogTitle>
            <DialogDescription>
              Copie ou baixe o HTML completo da página
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={exportedHTML}
            readOnly
            className="font-mono text-sm h-96"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(exportedHTML, 'HTML')}
            >
              Copiar
            </Button>
            <Button
              onClick={() => downloadFile(exportedHTML, 'page.html')}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Import JSON */}
      <Dialog open={showJSONImport} onOpenChange={setShowJSONImport}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Importar JSON</DialogTitle>
            <DialogDescription>
              Cole o JSON de um layout para importar
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={importValue}
            onChange={(e) => setImportValue(e.target.value)}
            placeholder='[{"id":"...","type":"container","children":[...]}]'
            className="font-mono text-sm h-96"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowJSONImport(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmImport}>
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
