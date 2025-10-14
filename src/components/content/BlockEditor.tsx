import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import {
  Plus,
  GripVertical,
  Trash,
  Image as ImageIcon,
  Type,
  List,
  Quote,
  Code,
  Video,
  Columns,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'list' | 'quote' | 'code' | 'snippet' | 'custom-list';
  content: string;
  metadata?: {
    level?: number;
    listType?: 'ordered' | 'unordered';
    imageAlt?: string;
    imageSrc?: string;
    snippetId?: string;
    customListId?: string;
    language?: string;
  };
}

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  snippets?: Array<{ id: string; name: string; content: string }>;
  customLists?: Array<{ id: string; name: string; type: string }>;
}

export function BlockEditor({ blocks, onChange, snippets = [], customLists = [] }: BlockEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addBlock = (type: ContentBlock['type'], index?: number) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString() + Math.random(),
      type,
      content: '',
      metadata: type === 'heading' ? { level: 2 } : undefined
    };

    const newBlocks = [...blocks];
    if (index !== undefined) {
      newBlocks.splice(index + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    onChange(newBlocks);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    const newBlocks = blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    );
    onChange(newBlocks);
  };

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter(block => block.id !== id);
    onChange(newBlocks);
    toast.success('Bloco removido');
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const handleImageUpload = (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageSrc = event.target?.result as string;
      updateBlock(blockId, {
        metadata: { ...blocks.find(b => b.id === blockId)?.metadata, imageSrc }
      });
      toast.success('Imagem adicionada');
    };
    reader.readAsDataURL(file);
  };

  const insertSnippet = (blockId: string, snippetId: string) => {
    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    updateBlock(blockId, {
      type: 'snippet',
      content: snippet.content,
      metadata: { snippetId }
    });
    toast.success('Snippet inserido');
  };

  const insertCustomList = (blockId: string, listId: string) => {
    const list = customLists.find(l => l.id === listId);
    if (!list) return;

    updateBlock(blockId, {
      type: 'custom-list',
      content: list.name,
      metadata: { customListId: listId }
    });
    toast.success('Lista personalizada inserida');
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    const isSelected = selectedBlockId === block.id;

    return (
      <Card
        key={block.id}
        className={`mb-4 transition-all ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
        onClick={() => setSelectedBlockId(block.id)}
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Drag Handle & Controls */}
            <div className="flex flex-col gap-1 pt-2">
              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  moveBlock(block.id, 'up');
                }}
                disabled={index === 0}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  moveBlock(block.id, 'down');
                }}
                disabled={index === blocks.length - 1}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Block Content */}
            <div className="flex-1">
              {block.type === 'paragraph' && (
                <Textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Digite seu texto..."
                  rows={4}
                  className="w-full"
                />
              )}

              {block.type === 'heading' && (
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <select
                      value={block.metadata?.level || 2}
                      onChange={(e) => updateBlock(block.id, {
                        metadata: { ...block.metadata, level: parseInt(e.target.value) }
                      })}
                      className="px-2 py-1 border rounded"
                    >
                      <option value={1}>H1</option>
                      <option value={2}>H2</option>
                      <option value={3}>H3</option>
                      <option value={4}>H4</option>
                    </select>
                    <Input
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      placeholder="Título..."
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {block.type === 'image' && (
                <div className="space-y-3">
                  {block.metadata?.imageSrc ? (
                    <div className="relative">
                      <img
                        src={block.metadata.imageSrc}
                        alt={block.metadata.imageAlt || ''}
                        className="w-full rounded-lg max-h-96 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => updateBlock(block.id, {
                          metadata: { ...block.metadata, imageSrc: undefined }
                        })}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleImageUpload(block.id, e)}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Selecionar Imagem
                      </Button>
                    </div>
                  )}
                  <Input
                    value={block.metadata?.imageAlt || ''}
                    onChange={(e) => updateBlock(block.id, {
                      metadata: { ...block.metadata, imageAlt: e.target.value }
                    })}
                    placeholder="Texto alternativo (alt)..."
                  />
                </div>
              )}

              {block.type === 'list' && (
                <div className="space-y-2">
                  <select
                    value={block.metadata?.listType || 'unordered'}
                    onChange={(e) => updateBlock(block.id, {
                      metadata: { ...block.metadata, listType: e.target.value as 'ordered' | 'unordered' }
                    })}
                    className="px-2 py-1 border rounded mb-2"
                  >
                    <option value="unordered">Lista não ordenada</option>
                    <option value="ordered">Lista ordenada</option>
                  </select>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Um item por linha..."
                    rows={5}
                  />
                </div>
              )}

              {block.type === 'quote' && (
                <div className="border-l-4 border-indigo-500 pl-4">
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Digite a citação..."
                    rows={3}
                  />
                </div>
              )}

              {block.type === 'code' && (
                <div className="space-y-2">
                  <Input
                    value={block.metadata?.language || 'javascript'}
                    onChange={(e) => updateBlock(block.id, {
                      metadata: { ...block.metadata, language: e.target.value }
                    })}
                    placeholder="Linguagem (ex: javascript, python)..."
                  />
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Cole seu código aqui..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {block.type === 'snippet' && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-900">Snippet Reutilizável</span>
                  </div>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                </div>
              )}

              {block.type === 'custom-list' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <List className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Lista Personalizada: {block.content}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    ID: {block.metadata?.customListId}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => addBlock('paragraph', index)}>
                    <Type className="w-4 h-4 mr-2" />
                    Parágrafo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('heading', index)}>
                    <Type className="w-4 h-4 mr-2" />
                    Título
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('image', index)}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagem
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('list', index)}>
                    <List className="w-4 h-4 mr-2" />
                    Lista
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('quote', index)}>
                    <Quote className="w-4 h-4 mr-2" />
                    Citação
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('code', index)}>
                    <Code className="w-4 h-4 mr-2" />
                    Código
                  </DropdownMenuItem>
                  {snippets.length > 0 && (
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Snippet
                      <DropdownMenu>
                        <DropdownMenuTrigger className="ml-auto">▶</DropdownMenuTrigger>
                        <DropdownMenuContent side="right">
                          {snippets.map(snippet => (
                            <DropdownMenuItem
                              key={snippet.id}
                              onClick={() => insertSnippet(block.id, snippet.id)}
                            >
                              {snippet.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </DropdownMenuItem>
                  )}
                  {customLists.length > 0 && (
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <List className="w-4 h-4 mr-2" />
                      Lista Personalizada
                      <DropdownMenu>
                        <DropdownMenuTrigger className="ml-auto">▶</DropdownMenuTrigger>
                        <DropdownMenuContent side="right">
                          {customLists.map(list => (
                            <DropdownMenuItem
                              key={list.id}
                              onClick={() => insertCustomList(block.id, list.id)}
                            >
                              {list.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBlock(block.id);
                }}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {blocks.length === 0 ? (
        <Card className="p-12 text-center">
          <Type className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Nenhum bloco adicionado ainda</p>
          <Button onClick={() => addBlock('paragraph')}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Bloco
          </Button>
        </Card>
      ) : (
        <>
          {blocks.map((block, index) => renderBlockEditor(block, index))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => addBlock('paragraph')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Bloco
          </Button>
        </>
      )}
    </div>
  );
}
