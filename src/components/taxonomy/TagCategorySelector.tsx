/**
 * Seletor de Tags e Categorias
 * Interface para editores atribuírem taxonomia ao conteúdo
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  X, Plus, Tag as TagIcon, Folder, Crown, Search, 
  AlertCircle, CheckCircle, Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { taxonomyService, type Tag, type Category } from '../../services/TaxonomyService';

interface TagCategorySelectorProps {
  contentId?: string;
  contentType: 'page' | 'article';
  selectedTags?: string[];
  selectedCategories?: string[];
  onChange?: (tags: string[], categories: string[]) => void;
  currentUser: any;
}

export function TagCategorySelector({
  contentId,
  contentType,
  selectedTags = [],
  selectedCategories = [],
  onChange,
  currentUser
}: TagCategorySelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(selectedTags);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(selectedCategories);
  
  const [tagSearch, setTagSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  
  useEffect(() => {
    loadTaxonomies();
  }, []);
  
  useEffect(() => {
    setSelectedTagIds(selectedTags);
  }, [selectedTags]);
  
  useEffect(() => {
    setSelectedCategoryIds(selectedCategories);
  }, [selectedCategories]);
  
  const loadTaxonomies = () => {
    setTags(taxonomyService.getTags());
    setCategories(taxonomyService.getCategories());
  };
  
  const handleTagToggle = (tagId: string) => {
    const newSelection = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    
    setSelectedTagIds(newSelection);
    onChange?.(newSelection, selectedCategoryIds);
  };
  
  const handleCategoryToggle = (categoryId: string) => {
    const newSelection = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter(id => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    
    setSelectedCategoryIds(newSelection);
    onChange?.(selectedTagIds, newSelection);
  };
  
  const handleMoveTag = (tagId: string, direction: 'up' | 'down') => {
    const currentIndex = selectedTagIds.indexOf(tagId);
    if (currentIndex === -1) return;
    
    const newSelection = [...selectedTagIds];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= newSelection.length) return;
    
    [newSelection[currentIndex], newSelection[newIndex]] = 
    [newSelection[newIndex], newSelection[currentIndex]];
    
    setSelectedTagIds(newSelection);
    onChange?.(newSelection, selectedCategoryIds);
  };
  
  const handleMoveCategory = (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = selectedCategoryIds.indexOf(categoryId);
    if (currentIndex === -1) return;
    
    const newSelection = [...selectedCategoryIds];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= newSelection.length) return;
    
    [newSelection[currentIndex], newSelection[newIndex]] = 
    [newSelection[newIndex], newSelection[currentIndex]];
    
    setSelectedCategoryIds(newSelection);
    onChange?.(selectedTagIds, newSelection);
  };
  
  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast.error('Digite um nome para a tag');
      return;
    }
    
    try {
      const tag = taxonomyService.createTag({
        name: newTagName.trim(),
        slug: '',
        createdBy: currentUser.id
      });
      
      setTags([...tags, tag]);
      setSelectedTagIds([...selectedTagIds, tag.id]);
      onChange?.([...selectedTagIds, tag.id], selectedCategoryIds);
      setNewTagName('');
      setIsCreatingTag(false);
      toast.success(`Tag "${tag.name}" criada com sucesso`);
    } catch (error) {
      toast.error('Erro ao criar tag');
      console.error(error);
    }
  };
  
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );
  
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  
  const getSelectedTags = () => {
    return selectedTagIds
      .map(id => tags.find(t => t.id === id))
      .filter(Boolean) as Tag[];
  };
  
  const getSelectedCategories = () => {
    return selectedCategoryIds
      .map(id => categories.find(c => c.id === id))
      .filter(Boolean) as Category[];
  };
  
  const primaryTag = getSelectedTags()[0];
  const primaryCategory = getSelectedCategories()[0];
  const chapeu = primaryTag || primaryCategory;
  
  return (
    <div className="space-y-6">
      {/* Chapéu Principal */}
      {chapeu && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <h3 className="text-sm">Chapéu Principal</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              style={{ 
                backgroundColor: chapeu.color,
                color: '#fff'
              }}
              className="text-lg px-3 py-1"
            >
              {chapeu.name}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Este será exibido como destaque no conteúdo
            </p>
          </div>
        </Card>
      )}
      
      {/* Tags Selecionadas */}
      {selectedTagIds.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              <h3 className="text-sm">Tags Selecionadas</h3>
              <Badge variant="secondary">{selectedTagIds.length}</Badge>
            </div>
            {selectedTagIds.length > 1 && (
              <p className="text-xs text-muted-foreground">
                <Info className="w-3 h-3 inline mr-1" />
                Use ↑↓ para reordenar
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {getSelectedTags().map((tag, index) => (
              <div
                key={tag.id}
                className="flex items-center gap-1 group"
              >
                {index === 0 && (
                  <Crown className="w-3 h-3 text-yellow-600" />
                )}
                <Badge
                  style={{ 
                    backgroundColor: tag.color,
                    color: '#fff'
                  }}
                  className="pr-1"
                >
                  <span>{tag.name}</span>
                  <div className="flex items-center gap-0.5 ml-2">
                    {index > 0 && (
                      <button
                        onClick={() => handleMoveTag(tag.id, 'up')}
                        className="hover:bg-white/20 rounded p-0.5"
                        title="Mover para cima"
                      >
                        ↑
                      </button>
                    )}
                    {index < selectedTagIds.length - 1 && (
                      <button
                        onClick={() => handleMoveTag(tag.id, 'down')}
                        className="hover:bg-white/20 rounded p-0.5"
                        title="Mover para baixo"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => handleTagToggle(tag.id)}
                      className="hover:bg-white/20 rounded p-0.5"
                      title="Remover"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Categorias Selecionadas */}
      {selectedCategoryIds.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              <h3 className="text-sm">Categorias Selecionadas</h3>
              <Badge variant="secondary">{selectedCategoryIds.length}</Badge>
            </div>
            {selectedCategoryIds.length > 1 && (
              <p className="text-xs text-muted-foreground">
                <Info className="w-3 h-3 inline mr-1" />
                Use ↑↓ para reordenar
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {getSelectedCategories().map((category, index) => (
              <div
                key={category.id}
                className="flex items-center gap-1 group"
              >
                {index === 0 && !primaryTag && (
                  <Crown className="w-3 h-3 text-yellow-600" />
                )}
                <Badge
                  style={{ 
                    backgroundColor: category.color,
                    color: '#fff'
                  }}
                  className="pr-1"
                >
                  {category.icon && <span className="mr-1">{category.icon}</span>}
                  <span>{category.name}</span>
                  <div className="flex items-center gap-0.5 ml-2">
                    {index > 0 && (
                      <button
                        onClick={() => handleMoveCategory(category.id, 'up')}
                        className="hover:bg-white/20 rounded p-0.5"
                        title="Mover para cima"
                      >
                        ↑
                      </button>
                    )}
                    {index < selectedCategoryIds.length - 1 && (
                      <button
                        onClick={() => handleMoveCategory(category.id, 'down')}
                        className="hover:bg-white/20 rounded p-0.5"
                        title="Mover para baixo"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => handleCategoryToggle(category.id)}
                      className="hover:bg-white/20 rounded p-0.5"
                      title="Remover"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {/* Seletor de Tags */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              <h3 className="text-sm">Tags Disponíveis</h3>
            </div>
            <Dialog open={isCreatingTag} onOpenChange={setIsCreatingTag}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-3 h-3 mr-1" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Tag</DialogTitle>
                  <DialogDescription>
                    A tag será criada e automaticamente adicionada a este conteúdo
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-tag-name">Nome da Tag</Label>
                    <Input
                      id="new-tag-name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Ex: Urgente, Destaque, etc"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateTag();
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsCreatingTag(false);
                      setNewTagName('');
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTag}>
                      Criar Tag
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Buscar tags..."
              className="pl-9"
            />
          </div>
          
          <ScrollArea className="h-64">
            <div className="space-y-1">
              {filteredTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm">{tag.name}</span>
                      {tag.usageCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {tag.usageCount}
                        </Badge>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </button>
                );
              })}
              
              {filteredTags.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma tag encontrada</p>
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => setIsCreatingTag(true)}
                  >
                    Criar nova tag
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
        
        {/* Seletor de Categorias */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Folder className="w-4 h-4" />
            <h3 className="text-sm">Categorias Disponíveis</h3>
          </div>
          
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Buscar categorias..."
              className="pl-9"
            />
          </div>
          
          <ScrollArea className="h-64">
            <div className="space-y-1">
              {filteredCategories.map(category => {
                const isSelected = selectedCategoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {category.icon && <span>{category.icon}</span>}
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm">{category.name}</span>
                      {category.usageCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {category.usageCount}
                        </Badge>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </button>
                );
              })}
              
              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma categoria encontrada</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
      
      {/* Ajuda */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
            <p><strong>Chapéu:</strong> A primeira tag ou categoria selecionada aparecerá como destaque principal</p>
            <p><strong>Ordem:</strong> Use os botões ↑↓ para reordenar e definir qual será o chapéu</p>
            <p><strong>Pesquisa:</strong> Tags e categorias facilitam que usuários encontrem conteúdo relacionado</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
