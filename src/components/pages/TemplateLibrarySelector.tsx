/**
 * Seletor de Templates da Biblioteca
 * Permite selecionar e aplicar templates salvos
 */

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import {
  Search, Star, Clock, TrendingUp, FileText, Newspaper,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyEnd,
  LayoutTemplate, Sparkles, Trash2, Copy, Download,
  Heart, Eye, Filter
} from 'lucide-react';
import { HierarchicalNode } from '../editor/HierarchicalRenderNode';
import { hierarchicalTemplateService, HierarchicalTemplate, TemplateType } from '../../services/HierarchicalTemplateService';
import { toast } from 'sonner@2.0.3';

interface TemplateLibrarySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (nodes: HierarchicalNode[], templateId: string) => void;
}

export function TemplateLibrarySelector({
  open,
  onOpenChange,
  onSelectTemplate
}: TemplateLibrarySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent' | 'popular'>('all');

  const templates = hierarchicalTemplateService.getAllTemplates();
  const categories = hierarchicalTemplateService.getCategories();
  const stats = hierarchicalTemplateService.getStatistics();

  const typeIcons: Record<TemplateType, any> = {
    page: FileText,
    article: Newspaper,
    header: AlignHorizontalJustifyStart,
    footer: AlignHorizontalJustifyEnd,
    section: LayoutTemplate,
    custom: Sparkles
  };

  // Filtrar templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Filtro por aba
    if (activeTab === 'favorites') {
      result = hierarchicalTemplateService.getFavoriteTemplates();
    } else if (activeTab === 'recent') {
      result = hierarchicalTemplateService.getRecentTemplates(20);
    } else if (activeTab === 'popular') {
      result = hierarchicalTemplateService.getMostUsedTemplates(20);
    }

    // Filtro por busca
    if (searchQuery) {
      result = result.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtro por tipo
    if (selectedType !== 'all') {
      result = result.filter(t => t.type === selectedType);
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }

    return result;
  }, [templates, activeTab, searchQuery, selectedType, selectedCategory]);

  const handleSelectTemplate = (template: HierarchicalTemplate) => {
    hierarchicalTemplateService.incrementUsageCount(template.id);
    onSelectTemplate(template.nodes, template.id);
    toast.success(`Template "${template.name}" aplicado`);
    onOpenChange(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    hierarchicalTemplateService.toggleFavorite(templateId);
    toast.success('Favorito atualizado');
  };

  const handleDuplicateTemplate = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    const duplicated = hierarchicalTemplateService.duplicateTemplate(templateId);
    if (duplicated) {
      toast.success('Template duplicado');
    }
  };

  const handleDeleteTemplate = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir este template?')) {
      hierarchicalTemplateService.deleteTemplate(templateId);
      toast.success('Template excluído');
    }
  };

  const handleExportTemplate = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    const json = hierarchicalTemplateService.exportTemplate(templateId);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${templateId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Template exportado');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-4xl sm:max-w-5xl md:max-w-6xl h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Biblioteca de Templates</DialogTitle>
          <DialogDescription>
            Escolha um template para começar ou crie do zero
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filtros e Busca */}
          <div className="px-6 py-4 border-b space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar templates..."
                className="pl-10"
              />
            </div>

            {/* Estatísticas Rápidas */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                <span>{stats.totalTemplates} templates</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{stats.favorites} favoritos</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>{stats.totalUsage} usos</span>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
              {/* Filtro por Tipo */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">Todos os tipos</option>
                <option value="page">Páginas ({stats.byType.page})</option>
                <option value="article">Artigos ({stats.byType.article})</option>
                <option value="header">Headers ({stats.byType.header})</option>
                <option value="footer">Footers ({stats.byType.footer})</option>
                <option value="section">Seções ({stats.byType.section})</option>
                <option value="custom">Personalizados ({stats.byType.custom})</option>
              </select>

              {/* Filtro por Categoria */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">Todas categorias</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mt-4 grid grid-cols-4">
              <TabsTrigger value="all">
                <LayoutTemplate className="w-4 h-4 mr-2" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="w-4 h-4 mr-2" />
                Favoritos
              </TabsTrigger>
              <TabsTrigger value="recent">
                <Clock className="w-4 h-4 mr-2" />
                Recentes
              </TabsTrigger>
              <TabsTrigger value="popular">
                <TrendingUp className="w-4 h-4 mr-2" />
                Populares
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6">
              <TabsContent value={activeTab} className="mt-4">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <LayoutTemplate className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Nenhum template encontrado' : 'Nenhum template disponível'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? 'Tente outros termos de busca' : 'Crie seu primeiro template!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                    {filteredTemplates.map(template => {
                      const TypeIcon = typeIcons[template.type];
                      
                      return (
                        <Card
                          key={template.id}
                          className="p-4 hover:shadow-lg transition-all cursor-pointer group"
                          onClick={() => handleSelectTemplate(template)}
                        >
                          {/* Thumbnail */}
                          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                            <div className="text-6xl opacity-20">
                              <TypeIcon />
                            </div>
                            
                            {/* Ações rápidas */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 w-7 p-0"
                                onClick={(e) => handleToggleFavorite(e, template.id)}
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    template.settings.isFavorite ? 'fill-red-500 text-red-500' : ''
                                  }`}
                                />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 w-7 p-0"
                                onClick={(e) => handleDuplicateTemplate(e, template.id)}
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 w-7 p-0"
                                onClick={(e) => handleExportTemplate(e, template.id)}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 w-7 p-0"
                                onClick={(e) => handleDeleteTemplate(e, template.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Info */}
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-medium text-sm line-clamp-1">
                                {template.name}
                              </h3>
                              {template.settings.isFavorite && (
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                              )}
                            </div>

                            {template.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {template.description}
                              </p>
                            )}

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                <TypeIcon className="w-3 h-3 mr-1" />
                                {template.type}
                              </Badge>
                              
                              {template.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              
                              {template.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.tags.length - 2}
                                </Badge>
                              )}
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {template.metadata.usageCount} usos
                              </div>
                              <div>
                                v{template.metadata.version}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center bg-muted/30">
          <div className="text-sm text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} {searchQuery || selectedType !== 'all' || selectedCategory !== 'all' ? 'encontrado' : 'disponível'}{filteredTemplates.length !== 1 ? 's' : ''}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
