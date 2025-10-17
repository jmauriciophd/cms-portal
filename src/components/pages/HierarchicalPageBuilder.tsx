/**
 * Page Builder Hierárquico
 * Integração completa do sistema de hierarquia com drag & drop
 */

import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Save, Undo, Redo, Eye, Code, Download, Upload, 
  Trash2, Play, Grid3x3, Layers, FileJson, Settings, LayoutTemplate
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import { HierarchicalRenderNode, HierarchicalNode } from '../editor/HierarchicalRenderNode';
import { HierarchicalComponentLibrary } from '../editor/HierarchicalComponentLibrary';
import { EmptyDropZone } from '../editor/DroppableContainer';
import { hierarchyService } from '../../services/HierarchyService';
import { SaveAsTemplateDialog } from './SaveAsTemplateDialog';
import { TemplateLibrarySelector } from './TemplateLibrarySelector';

interface HierarchicalPageBuilderProps {
  pageId?: string;
  initialContent?: HierarchicalNode[];
  onSave?: (nodes: HierarchicalNode[]) => void;
  onCancel?: () => void;
}

export function HierarchicalPageBuilder({
  pageId,
  initialContent = [],
  onSave,
  onCancel
}: HierarchicalPageBuilderProps) {
  const [nodes, setNodes] = useState<HierarchicalNode[]>(initialContent);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<HierarchicalNode[][]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [showPreview, setShowPreview] = useState(false);
  const [showCodeView, setShowCodeView] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [exportedCode, setExportedCode] = useState('');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Auto-save
  useEffect(() => {
    const saveTimer = setInterval(() => {
      if (nodes.length > 0 && pageId) {
        handleAutoSave();
      }
    }, 30000); // A cada 30 segundos
    
    return () => clearInterval(saveTimer);
  }, [nodes, pageId]);
  
  // Adicionar ao histórico
  const addToHistory = useCallback((newNodes: HierarchicalNode[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newNodes)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  // Helpers de navegação na árvore
  const findNodeById = (nodesList: HierarchicalNode[], id: string): HierarchicalNode | null => {
    for (const node of nodesList) {
      if (node.id === id) return node;
      
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
      
      if (node.slots) {
        for (const slotKey in node.slots) {
          const found = findNodeById(node.slots[slotKey], id);
          if (found) return found;
        }
      }
    }
    return null;
  };
  
  const findParentNode = (nodesList: HierarchicalNode[], targetId: string, parent: HierarchicalNode | null = null): HierarchicalNode | null => {
    for (const node of nodesList) {
      if (node.id === targetId) return parent;
      
      if (node.children) {
        const found = findParentNode(node.children, targetId, node);
        if (found) return found;
      }
      
      if (node.slots) {
        for (const slotKey in node.slots) {
          const found = findParentNode(node.slots[slotKey], targetId, node);
          if (found) return found;
        }
      }
    }
    return null;
  };
  
  const removeNodeById = (nodesList: HierarchicalNode[], id: string): HierarchicalNode[] => {
    return nodesList.filter(node => {
      if (node.id === id) return false;
      
      if (node.children) {
        node.children = removeNodeById(node.children, id);
      }
      
      if (node.slots) {
        for (const slotKey in node.slots) {
          node.slots[slotKey] = removeNodeById(node.slots[slotKey], id);
        }
      }
      
      return true;
    });
  };
  
  // Criar novo componente
  const createComponent = useCallback((type: string, definition?: any): HierarchicalNode => {
    const newNode: HierarchicalNode = {
      id: uuidv4(),
      type,
      props: definition?.defaultProps || {},
      styles: definition?.defaultStyles || {},
      children: [],
      className: ''
    };
    
    // Adicionar filhos padrão se existirem
    const defaultChildren = hierarchyService.getDefaultChildren(type);
    if (defaultChildren.length > 0) {
      newNode.children = defaultChildren.map(childType => createComponent(childType));
    }
    
    // Inicializar slots se necessário
    const hasSlots = hierarchyService.hasSlots(type);
    if (hasSlots) {
      const slots = hierarchyService.getSlots(type);
      if (slots) {
        newNode.slots = {};
        for (const slotName in slots) {
          newNode.slots[slotName] = [];
        }
      }
    }
    
    return newNode;
  }, []);
  
  // Handle drop
  const handleDrop = useCallback((draggedItem: any, targetNodeId: string, position: 'before' | 'after' | 'inside', index?: number) => {
    let newNode: HierarchicalNode;
    
    // Se vier da biblioteca, criar novo nó
    if (draggedItem.fromLibrary) {
      newNode = createComponent(draggedItem.componentType, draggedItem.definition);
    } else {
      // Se for reordenação, usar o nó existente
      newNode = draggedItem.node || draggedItem;
    }
    
    const targetNode = findNodeById(nodes, targetNodeId);
    if (!targetNode && position !== 'before' && position !== 'after') {
      toast.error('Nó de destino não encontrado');
      return;
    }
    
    // Validações
    if (position === 'inside') {
      if (!targetNode) return;
      
      const canAdd = hierarchyService.canAddChild(targetNode.type, newNode.type);
      if (!canAdd) {
        const error = hierarchyService.getErrorMessage(targetNode.type, newNode.type);
        toast.error(error);
        return;
      }
      
      const childrenCount = targetNode.children?.length || 0;
      const canAddMore = hierarchyService.canAddMoreChildren(targetNode.type, childrenCount);
      if (!canAddMore) {
        toast.error('Limite de filhos atingido');
        return;
      }
    }
    
    // Remover de posição anterior se for reordenação
    let updatedNodes = [...nodes];
    if (!draggedItem.fromLibrary && draggedItem.nodeId) {
      updatedNodes = removeNodeById(updatedNodes, draggedItem.nodeId);
    }
    
    // Inserir na nova posição
    const insertIntoTree = (nodesList: HierarchicalNode[]): HierarchicalNode[] => {
      return nodesList.map(node => {
        if (node.id === targetNodeId) {
          if (position === 'inside') {
            return {
              ...node,
              children: [...(node.children || []), newNode]
            };
          }
          return node;
        }
        
        if (node.children) {
          node.children = insertIntoTree(node.children);
        }
        
        return node;
      });
    };
    
    if (position === 'before' || position === 'after') {
      // Inserir antes ou depois do nó alvo
      const parent = findParentNode(updatedNodes, targetNodeId);
      
      if (parent && parent.children) {
        const targetIndex = parent.children.findIndex(n => n.id === targetNodeId);
        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
        parent.children.splice(insertIndex, 0, newNode);
      } else {
        // Inserir na raiz
        const targetIndex = updatedNodes.findIndex(n => n.id === targetNodeId);
        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
        updatedNodes.splice(insertIndex, 0, newNode);
      }
    } else {
      updatedNodes = insertIntoTree(updatedNodes);
    }
    
    setNodes(updatedNodes);
    addToHistory(updatedNodes);
    setSelectedNodeId(newNode.id);
  }, [nodes, createComponent, addToHistory]);
  
  // Handle adicionar filho
  const handleAddChild = useCallback((parentId: string, componentType?: string) => {
    const parent = findNodeById(nodes, parentId);
    if (!parent) return;
    
    // Obter tipos aceitos
    const acceptedTypes = hierarchyService.getAcceptedChildTypes(parent.type);
    
    // Se não especificou tipo, usar o primeiro aceito ou 'div'
    let type = componentType;
    if (!type) {
      if (acceptedTypes && acceptedTypes.length > 0) {
        type = acceptedTypes[0];
      } else {
        type = 'div';
      }
    }
    
    const newChild = createComponent(type);
    
    const updatedNodes = nodes.map(node => {
      const updateNode = (n: HierarchicalNode): HierarchicalNode => {
        if (n.id === parentId) {
          return {
            ...n,
            children: [...(n.children || []), newChild]
          };
        }
        
        if (n.children) {
          return {
            ...n,
            children: n.children.map(updateNode)
          };
        }
        
        return n;
      };
      
      return updateNode(node);
    });
    
    setNodes(updatedNodes);
    addToHistory(updatedNodes);
    setSelectedNodeId(newChild.id);
    toast.success('Componente adicionado');
  }, [nodes, createComponent, addToHistory]);
  
  // Handle remover
  const handleRemove = useCallback((nodeId: string) => {
    const updatedNodes = removeNodeById(nodes, nodeId);
    setNodes(updatedNodes);
    addToHistory(updatedNodes);
    setSelectedNodeId(null);
    toast.success('Componente removido');
  }, [nodes, addToHistory]);
  
  // Handle duplicar
  const handleDuplicate = useCallback((nodeId: string) => {
    const nodeToDuplicate = findNodeById(nodes, nodeId);
    if (!nodeToDuplicate) return;
    
    const cloneNodeDeep = (node: HierarchicalNode): HierarchicalNode => {
      const cloned = {
        ...node,
        id: uuidv4()
      };
      
      if (node.children) {
        cloned.children = node.children.map(cloneNodeDeep);
      }
      
      if (node.slots) {
        cloned.slots = {};
        for (const slotKey in node.slots) {
          cloned.slots[slotKey] = node.slots[slotKey].map(cloneNodeDeep);
        }
      }
      
      return cloned;
    };
    
    const duplicated = cloneNodeDeep(nodeToDuplicate);
    
    // Inserir logo após o original
    const parent = findParentNode(nodes, nodeId);
    
    const updatedNodes = nodes.map(node => {
      const updateNode = (n: HierarchicalNode): HierarchicalNode => {
        if (parent && n.id === parent.id && n.children) {
          const index = n.children.findIndex(c => c.id === nodeId);
          const newChildren = [...n.children];
          newChildren.splice(index + 1, 0, duplicated);
          return { ...n, children: newChildren };
        }
        
        if (n.children) {
          return { ...n, children: n.children.map(updateNode) };
        }
        
        return n;
      };
      
      return updateNode(node);
    });
    
    // Se não tem pai, inserir na raiz
    if (!parent) {
      const index = nodes.findIndex(n => n.id === nodeId);
      updatedNodes.splice(index + 1, 0, duplicated);
    }
    
    setNodes(updatedNodes);
    addToHistory(updatedNodes);
    setSelectedNodeId(duplicated.id);
    toast.success('Componente duplicado');
  }, [nodes, addToHistory]);
  
  // Handle update node
  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<HierarchicalNode>) => {
    const updatedNodes = nodes.map(node => {
      const updateNode = (n: HierarchicalNode): HierarchicalNode => {
        if (n.id === nodeId) {
          return { ...n, ...updates };
        }
        
        if (n.children) {
          return { ...n, children: n.children.map(updateNode) };
        }
        
        if (n.slots) {
          const newSlots = { ...n.slots };
          for (const slotKey in newSlots) {
            newSlots[slotKey] = newSlots[slotKey].map(updateNode);
          }
          return { ...n, slots: newSlots };
        }
        
        return n;
      };
      
      return updateNode(node);
    });
    
    setNodes(updatedNodes);
    addToHistory(updatedNodes);
  }, [nodes, addToHistory]);
  
  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setNodes(history[historyIndex - 1]);
      toast.success('Desfeito');
    }
  }, [history, historyIndex]);
  
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setNodes(history[historyIndex + 1]);
      toast.success('Refeito');
    }
  }, [history, historyIndex]);
  
  // Save - Abre o diálogo
  const handleSave = useCallback(() => {
    // Validar antes de salvar
    const validation = hierarchyService.validateTree({
      id: 'root',
      type: 'section',
      children: nodes
    });
    
    if (!validation.valid) {
      toast.error('Existem erros na estrutura');
      console.error('Erros de validação:', validation.errors);
      return;
    }
    
    // Abre o diálogo de salvamento
    setShowSaveDialog(true);
  }, [nodes]);
  
  // Callback do diálogo de salvamento
  const handleSaveComplete = useCallback((type: 'page' | 'template', id: string) => {
    if (onSave && type === 'page') {
      onSave(nodes);
    }
    toast.success(`${type === 'page' ? 'Página' : 'Template'} salvo com sucesso!`);
  }, [nodes, onSave]);
  
  const handleAutoSave = useCallback(() => {
    localStorage.setItem(`page_builder_${pageId || 'default'}_autosave`, JSON.stringify(nodes));
    console.log('Auto-save realizado');
  }, [nodes, pageId]);
  
  // Export/Import
  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify(nodes, null, 2);
    setExportedCode(json);
    setShowExportDialog(true);
  }, [nodes]);
  
  const handleExportHTML = useCallback(() => {
    // Gerar HTML limpo (simplificado)
    const generateHTML = (node: HierarchicalNode): string => {
      const tag = node.type === 'heading' ? (node.props?.tag || 'h2') : node.type;
      const styleStr = node.styles ? ` style="${Object.entries(node.styles).map(([k, v]) => `${k}: ${v}`).join('; ')}"` : '';
      const classStr = node.className ? ` class="${node.className}"` : '';
      const propsStr = Object.entries(node.props || {})
        .filter(([k]) => k !== 'tag' && k !== 'text')
        .map(([k, v]) => ` ${k}="${v}"`)
        .join('');
      
      const content = node.content || node.props?.text || '';
      const childrenHTML = node.children ? node.children.map(generateHTML).join('') : '';
      
      return `<${tag}${classStr}${styleStr}${propsStr}>${content}${childrenHTML}</${tag}>`;
    };
    
    const html = nodes.map(generateHTML).join('\n');
    setExportedCode(html);
    setShowExportDialog(true);
  }, [nodes]);
  
  const handleImportJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(importValue);
      if (Array.isArray(parsed)) {
        setNodes(parsed);
        addToHistory(parsed);
        setShowImportDialog(false);
        setImportValue('');
        toast.success('Layout importado com sucesso');
      } else {
        toast.error('Formato inválido. Deve ser um array de nós.');
      }
    } catch (error) {
      toast.error('Erro ao importar JSON');
      console.error(error);
    }
  }, [importValue, addToHistory]);
  
  // Clear
  const handleClear = useCallback(() => {
    if (confirm('Deseja realmente limpar todo o conteúdo?')) {
      setNodes([]);
      addToHistory([]);
      setSelectedNodeId(null);
      toast.success('Conteúdo limpo');
    }
  }, [addToHistory]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      }
      
      if (e.key === 'Delete' && selectedNodeId) {
        e.preventDefault();
        handleRemove(selectedNodeId);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, handleUndo, handleRedo, handleSave, handleRemove]);
  
  const selectedNode = selectedNodeId ? findNodeById(nodes, selectedNodeId) : null;
  
  return (
    <div className="h-screen flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-white dark:bg-gray-900 p-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              title="Desfazer (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              title="Refazer (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPreview(!showPreview)}
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCodeView(!showCodeView)}
              title="Ver Código"
            >
              <Code className="w-4 h-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportJSON}
              title="Exportar JSON"
            >
              <FileJson className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportHTML}
              title="Exportar HTML"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowImportDialog(true)}
              title="Importar JSON"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            title="Limpar tudo"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTemplateLibrary(true)}
            title="Aplicar Template"
          >
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Templates
          </Button>
          
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {nodes.length} componente{nodes.length !== 1 ? 's' : ''}
            </span>
            
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Component Library */}
          <div className="w-80 border-r">
            <HierarchicalComponentLibrary 
              onComponentClick={(definition) => {
                // Ao clicar em um componente, adiciona ao final da árvore
                const newNode = createComponent(definition.type, definition);
                if (nodes.length === 0) {
                  setNodes([newNode]);
                  addToHistory([newNode]);
                } else {
                  const updatedNodes = [...nodes, newNode];
                  setNodes(updatedNodes);
                  addToHistory(updatedNodes);
                }
                setSelectedNodeId(newNode.id);
                toast.success(`${definition.label} inserido!`);
              }}
            />
          </div>
          
          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
            <div className={`
              mx-auto p-8 transition-all
              ${viewMode === 'desktop' ? 'max-w-none' : ''}
              ${viewMode === 'tablet' ? 'max-w-3xl' : ''}
              ${viewMode === 'mobile' ? 'max-w-md' : ''}
            `}>
              {nodes.length === 0 ? (
                <EmptyDropZone
                  onDrop={(item) => {
                    const newNode = createComponent(item.componentType, item.definition);
                    setNodes([newNode]);
                    addToHistory([newNode]);
                    setSelectedNodeId(newNode.id);
                  }}
                  label="Arraste componentes aqui para começar"
                />
              ) : (
                nodes.map((node, index) => (
                  <HierarchicalRenderNode
                    key={node.id}
                    node={node}
                    index={index}
                    onDrop={handleDrop}
                    onAddChild={handleAddChild}
                    onRemove={handleRemove}
                    onDuplicate={handleDuplicate}
                    onSelect={setSelectedNodeId}
                    onUpdateNode={handleUpdateNode}
                    selectedNodeId={selectedNodeId}
                    isPreview={showPreview}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* Properties Panel */}
          <div className="w-80 border-l bg-white dark:bg-gray-900">
            <div className="p-4">
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Propriedades</h3>
                    <div className="text-sm text-muted-foreground">
                      Tipo: {selectedNode.type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {selectedNode.id}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Class Name</Label>
                    <Input
                      value={selectedNode.className || ''}
                      onChange={(e) => handleUpdateNode(selectedNode.id, { className: e.target.value })}
                      placeholder="Ex: bg-blue-500 p-4"
                    />
                  </div>
                  
                  {selectedNode.props && Object.keys(selectedNode.props).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Props</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedNode.props).map(([key, value]) => (
                            <div key={key}>
                              <Label className="text-xs">{key}</Label>
                              <Input
                                value={String(value)}
                                onChange={(e) => {
                                  handleUpdateNode(selectedNode.id, {
                                    props: { ...selectedNode.props, [key]: e.target.value }
                                  });
                                }}
                                className="text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {selectedNode.children && selectedNode.children.length > 0 && (
                    <>
                      <Separator />
                      <div className="text-sm">
                        <strong>Filhos:</strong> {selectedNode.children.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Selecione um componente</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Código Exportado</DialogTitle>
              <DialogDescription>
                Copie o código abaixo
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={exportedCode}
              readOnly
              rows={20}
              className="font-mono text-xs"
            />
            <Button onClick={() => {
              navigator.clipboard.writeText(exportedCode);
              toast.success('Código copiado!');
            }}>
              Copiar
            </Button>
          </DialogContent>
        </Dialog>
        
        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Importar JSON</DialogTitle>
              <DialogDescription>
                Cole o JSON do layout abaixo
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder="Cole o JSON aqui..."
              rows={20}
              className="font-mono text-xs"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImportJSON}>
                Importar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Save As Template Dialog */}
        <SaveAsTemplateDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          nodes={nodes}
          onSaveComplete={handleSaveComplete}
          suggestedName={pageId || 'Nova Página'}
        />
        
        {/* Template Library Selector */}
        <TemplateLibrarySelector
          open={showTemplateLibrary}
          onOpenChange={setShowTemplateLibrary}
          onSelectTemplate={(templateNodes, templateId) => {
            setNodes(templateNodes);
            addToHistory(templateNodes);
            toast.success('Template aplicado!');
          }}
        />
      </div>
  );
}
