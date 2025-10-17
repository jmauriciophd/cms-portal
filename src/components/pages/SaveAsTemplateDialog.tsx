/**
 * Diálogo para Salvar Página como Template
 * Permite escolher entre salvar como Página, Artigo, Header, Footer ou Template
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { 
  FileText, Newspaper, LayoutTemplate, AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd, Save, Sparkles, Tag
} from 'lucide-react';
import { HierarchicalNode } from '../editor/HierarchicalRenderNode';
import { hierarchicalTemplateService, TemplateType } from '../../services/HierarchicalTemplateService';
import { toast } from 'sonner@2.0.3';

interface SaveAsTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: HierarchicalNode[];
  onSaveComplete?: (type: 'page' | 'template', id: string) => void;
  suggestedName?: string;
}

export function SaveAsTemplateDialog({
  open,
  onOpenChange,
  nodes,
  onSaveComplete,
  suggestedName = ''
}: SaveAsTemplateDialogProps) {
  const [saveType, setSaveType] = useState<'page' | 'template'>('page');
  const [templateType, setTemplateType] = useState<TemplateType>('page');
  const [name, setName] = useState(suggestedName);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('institutional');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveOptions = [
    {
      value: 'page',
      label: 'Salvar como Página',
      description: 'Página normal do site',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      value: 'template',
      label: 'Salvar como Template',
      description: 'Template reutilizável',
      icon: <LayoutTemplate className="w-5 h-5" />,
      color: 'text-purple-600'
    }
  ];

  const templateTypes = [
    {
      value: 'page',
      label: 'Página Completa',
      icon: <FileText className="w-4 h-4" />,
      description: 'Template de página inteira'
    },
    {
      value: 'article',
      label: 'Artigo/Notícia',
      icon: <Newspaper className="w-4 h-4" />,
      description: 'Template para posts e artigos'
    },
    {
      value: 'header',
      label: 'Cabeçalho',
      icon: <AlignHorizontalJustifyStart className="w-4 h-4" />,
      description: 'Template de header/topo'
    },
    {
      value: 'footer',
      label: 'Rodapé',
      icon: <AlignHorizontalJustifyEnd className="w-4 h-4" />,
      description: 'Template de footer/rodapé'
    },
    {
      value: 'section',
      label: 'Seção',
      icon: <LayoutTemplate className="w-4 h-4" />,
      description: 'Seção reutilizável'
    },
    {
      value: 'custom',
      label: 'Personalizado',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Template customizado'
    }
  ];

  const categories = hierarchicalTemplateService.getCategories();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Digite um nome');
      return;
    }

    setSaving(true);

    try {
      if (saveType === 'page') {
        // Salvar como página normal
        const pageId = `page_${Date.now()}`;
        const pageData = {
          id: pageId,
          title: name,
          content: nodes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Salvar no localStorage (ou enviar ao backend)
        const pages = JSON.parse(localStorage.getItem('pages') || '[]');
        pages.push(pageData);
        localStorage.setItem('pages', JSON.stringify(pages));

        toast.success('Página salva com sucesso!');
        onSaveComplete?.('page', pageId);
      } else {
        // Salvar como template
        const template = hierarchicalTemplateService.saveTemplate({
          name,
          description,
          type: templateType,
          category,
          tags,
          nodes,
          settings: {
            isPublic,
            isFavorite,
            allowEdit: true
          }
        });

        toast.success('Template salvo com sucesso!');
        onSaveComplete?.('template', template.id);
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName(suggestedName);
    setDescription('');
    setCategory('institutional');
    setTags([]);
    setTagInput('');
    setIsPublic(false);
    setIsFavorite(false);
    setSaveType('page');
    setTemplateType('page');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Salvar Página</DialogTitle>
          <DialogDescription>
            Escolha como deseja salvar: como página normal ou como template reutilizável
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tipo de Salvamento */}
          <div className="space-y-3">
            <Label>Tipo de Salvamento</Label>
            <div className="grid grid-cols-2 gap-3">
              {saveOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSaveType(option.value as any)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    saveType === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={option.color}>{option.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome..."
            />
          </div>

          {/* Opções específicas para Template */}
          {saveType === 'template' && (
            <>
              {/* Tipo de Template */}
              <div className="space-y-2">
                <Label>Tipo de Template *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {templateTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setTemplateType(type.value as TemplateType)}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        templateType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {type.icon}
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o template..."
                  rows={3}
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                          {cat.count > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {cat.count}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Digite uma tag e pressione Enter"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Configurações */}
              <div className="space-y-3">
                <Label>Configurações</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Template Público</div>
                      <div className="text-xs text-muted-foreground">
                        Disponível para outros usuários
                      </div>
                    </div>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Marcar como Favorito</div>
                      <div className="text-xs text-muted-foreground">
                        Acesso rápido aos favoritos
                      </div>
                    </div>
                    <Switch checked={isFavorite} onCheckedChange={setIsFavorite} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Informações da estrutura */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm font-medium mb-2">Estrutura</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• {nodes.length} componente{nodes.length !== 1 ? 's' : ''} no nível raiz</div>
              <div>• {countTotalNodes(nodes)} componente{countTotalNodes(nodes) !== 1 ? 's' : ''} no total</div>
              <div>• Tipos: {getUniqueTypes(nodes).join(', ')}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : `Salvar ${saveType === 'page' ? 'Página' : 'Template'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Funções auxiliares
function countTotalNodes(nodes: HierarchicalNode[]): number {
  let count = nodes.length;
  
  nodes.forEach(node => {
    if (node.children) {
      count += countTotalNodes(node.children);
    }
    if (node.slots) {
      Object.values(node.slots).forEach(slotNodes => {
        count += countTotalNodes(slotNodes);
      });
    }
  });
  
  return count;
}

function getUniqueTypes(nodes: HierarchicalNode[]): string[] {
  const types = new Set<string>();
  
  const traverse = (node: HierarchicalNode) => {
    types.add(node.type);
    if (node.children) {
      node.children.forEach(traverse);
    }
    if (node.slots) {
      Object.values(node.slots).forEach(slotNodes => {
        slotNodes.forEach(traverse);
      });
    }
  };
  
  nodes.forEach(traverse);
  return Array.from(types).slice(0, 5); // Limita a 5 tipos
}
