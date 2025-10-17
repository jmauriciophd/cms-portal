/**
 * Gerenciador de Taxonomia
 * Interface administrativa para gerenciar tags e categorias
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { 
  Plus, Edit, Trash2, Tag as TagIcon, Folder, 
  TrendingUp, Search, Download, Upload, BarChart3, Crown
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { taxonomyService, type Tag, type Category } from '../../services/TaxonomyService';

interface TaxonomyManagerProps {
  currentUser: any;
}

export function TaxonomyManager({ currentUser }: TaxonomyManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  
  const [tagForm, setTagForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6'
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    icon: '',
    parentId: '',
    order: 0
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setTags(taxonomyService.getTags());
    setCategories(taxonomyService.getCategories());
  };
  
  // ============ TAGS ============
  
  const handleCreateTag = () => {
    if (!tagForm.name.trim()) {
      toast.error('Nome da tag é obrigatório');
      return;
    }
    
    try {
      taxonomyService.createTag({
        ...tagForm,
        createdBy: currentUser.id
      });
      
      loadData();
      setIsEditingTag(false);
      setTagForm({ name: '', slug: '', description: '', color: '#3B82F6' });
      toast.success('Tag criada com sucesso');
    } catch (error) {
      toast.error('Erro ao criar tag');
      console.error(error);
    }
  };
  
  const handleUpdateTag = () => {
    if (!selectedTag) return;
    
    try {
      taxonomyService.updateTag(selectedTag.id, tagForm);
      loadData();
      setIsEditingTag(false);
      setSelectedTag(null);
      toast.success('Tag atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar tag');
      console.error(error);
    }
  };
  
  const handleDeleteTag = (tag: Tag) => {
    if (!confirm(`Deseja realmente excluir a tag "${tag.name}"?`)) return;
    
    try {
      taxonomyService.deleteTag(tag.id);
      loadData();
      toast.success('Tag excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir tag');
      console.error(error);
    }
  };
  
  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    setTagForm({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color || '#3B82F6'
    });
    setIsEditingTag(true);
  };
  
  // ============ CATEGORIAS ============
  
  const handleCreateCategory = () => {
    if (!categoryForm.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }
    
    try {
      taxonomyService.createCategory({
        ...categoryForm,
        createdBy: currentUser.id,
        order: categoryForm.order || categories.length + 1
      });
      
      loadData();
      setIsEditingCategory(false);
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        color: '#3B82F6',
        icon: '',
        parentId: '',
        order: 0
      });
      toast.success('Categoria criada com sucesso');
    } catch (error) {
      toast.error('Erro ao criar categoria');
      console.error(error);
    }
  };
  
  const handleUpdateCategory = () => {
    if (!selectedCategory) return;
    
    try {
      taxonomyService.updateCategory(selectedCategory.id, categoryForm);
      loadData();
      setIsEditingCategory(false);
      setSelectedCategory(null);
      toast.success('Categoria atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar categoria');
      console.error(error);
    }
  };
  
  const handleDeleteCategory = (category: Category) => {
    if (!confirm(`Deseja realmente excluir a categoria "${category.name}"?`)) return;
    
    try {
      taxonomyService.deleteCategory(category.id);
      loadData();
      toast.success('Categoria excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir categoria');
      console.error(error);
    }
  };
  
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3B82F6',
      icon: category.icon || '',
      parentId: category.parentId || '',
      order: category.order
    });
    setIsEditingCategory(true);
  };
  
  // ============ UTILITÁRIOS ============
  
  const handleExport = () => {
    const data = taxonomyService.exportData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taxonomy-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso');
  };
  
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        taxonomyService.importData(data);
        loadData();
        toast.success('Dados importados com sucesso');
      } catch (error) {
        toast.error('Erro ao importar dados');
        console.error(error);
      }
    };
    
    input.click();
  };
  
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.slug.includes(searchTerm.toLowerCase())
  );
  
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.includes(searchTerm.toLowerCase())
  );
  
  const totalTagUsage = tags.reduce((sum, tag) => sum + tag.usageCount, 0);
  const totalCategoryUsage = categories.reduce((sum, cat) => sum + cat.usageCount, 0);
  const mostUsedTags = [...tags].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);
  const mostUsedCategories = [...categories].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gerenciamento de Tags e Categorias</h1>
          <p className="text-muted-foreground">
            Organize seu conteúdo com tags e categorias. A primeira tag/categoria será o "chapéu"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Tags</p>
              <p className="text-2xl">{tags.length}</p>
            </div>
            <TagIcon className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Categorias</p>
              <p className="text-2xl">{categories.length}</p>
            </div>
            <Folder className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Uso de Tags</p>
              <p className="text-2xl">{totalTagUsage}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Uso de Categorias</p>
              <p className="text-2xl">{totalCategoryUsage}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
        </Card>
      </div>
      
      {/* Mais Usadas */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            Tags Mais Usadas
          </h3>
          <div className="space-y-2">
            {mostUsedTags.map((tag, index) => (
              <div key={tag.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  <Badge style={{ backgroundColor: tag.color, color: '#fff' }}>
                    {tag.name}
                  </Badge>
                </div>
                <Badge variant="secondary">{tag.usageCount} usos</Badge>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            Categorias Mais Usadas
          </h3>
          <div className="space-y-2">
            {mostUsedCategories.map((cat, index) => (
              <div key={cat.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  <Badge style={{ backgroundColor: cat.color, color: '#fff' }}>
                    {cat.icon && <span className="mr-1">{cat.icon}</span>}
                    {cat.name}
                  </Badge>
                </div>
                <Badge variant="secondary">{cat.usageCount} usos</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <Separator />
      
      {/* Busca */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar tags e categorias..."
          className="pl-9"
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="tags" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tags">
            <TagIcon className="w-4 h-4 mr-2" />
            Tags ({filteredTags.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Folder className="w-4 h-4 mr-2" />
            Categorias ({filteredCategories.length})
          </TabsTrigger>
        </TabsList>
        
        {/* TAGS TAB */}
        <TabsContent value="tags" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isEditingTag} onOpenChange={setIsEditingTag}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setSelectedTag(null);
                  setTagForm({ name: '', slug: '', description: '', color: '#3B82F6' });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedTag ? 'Editar Tag' : 'Nova Tag'}
                  </DialogTitle>
                  <DialogDescription>
                    Tags ajudam a organizar e categorizar conteúdo de forma flexível
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tag-name">Nome</Label>
                    <Input
                      id="tag-name"
                      value={tagForm.name}
                      onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                      placeholder="Ex: Urgente, Destaque, etc"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tag-slug">Slug (URL amigável)</Label>
                    <Input
                      id="tag-slug"
                      value={tagForm.slug}
                      onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })}
                      placeholder="Deixe vazio para gerar automaticamente"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tag-description">Descrição</Label>
                    <Textarea
                      id="tag-description"
                      value={tagForm.description}
                      onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
                      placeholder="Descreva o propósito desta tag"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tag-color">Cor</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tag-color"
                        type="color"
                        value={tagForm.color}
                        onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={tagForm.color}
                        onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsEditingTag(false);
                      setSelectedTag(null);
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={selectedTag ? handleUpdateTag : handleCreateTag}>
                      {selectedTag ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <ScrollArea className="h-[500px]">
            <div className="grid gap-2">
              {filteredTags.map(tag => (
                <Card key={tag.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: tag.color }}
                      >
                        <TagIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4>{tag.name}</h4>
                          <Badge variant="secondary">{tag.usageCount} usos</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          /{tag.slug}
                        </p>
                        {tag.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {tag.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditTag(tag)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTag(tag)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* CATEGORIES TAB */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setSelectedCategory(null);
                  setCategoryForm({
                    name: '',
                    slug: '',
                    description: '',
                    color: '#3B82F6',
                    icon: '',
                    parentId: '',
                    order: categories.length + 1
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </DialogTitle>
                  <DialogDescription>
                    Categorias criam uma estrutura hierárquica para organizar conteúdo
                  </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-4 pr-4">
                    <div>
                      <Label htmlFor="cat-name">Nome</Label>
                      <Input
                        id="cat-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="Ex: Notícias, Eventos, etc"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cat-slug">Slug (URL amigável)</Label>
                      <Input
                        id="cat-slug"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        placeholder="Deixe vazio para gerar automaticamente"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cat-description">Descrição</Label>
                      <Textarea
                        id="cat-description"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="Descreva o propósito desta categoria"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cat-icon">Ícone (emoji)</Label>
                      <Input
                        id="cat-icon"
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                        placeholder="📰 📅 📝 etc"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cat-color">Cor</Label>
                      <div className="flex gap-2">
                        <Input
                          id="cat-color"
                          type="color"
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cat-order">Ordem</Label>
                      <Input
                        id="cat-order"
                        type="number"
                        value={categoryForm.order}
                        onChange={(e) => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {
                        setIsEditingCategory(false);
                        setSelectedCategory(null);
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={selectedCategory ? handleUpdateCategory : handleCreateCategory}>
                        {selectedCategory ? 'Atualizar' : 'Criar'}
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
          
          <ScrollArea className="h-[500px]">
            <div className="grid gap-2">
              {filteredCategories.map(category => (
                <Card key={category.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon || <Folder className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4>{category.name}</h4>
                          <Badge variant="secondary">{category.usageCount} usos</Badge>
                          <Badge variant="outline">Ordem: {category.order}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          /{category.slug}
                        </p>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
