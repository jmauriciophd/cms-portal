/**
 * Sistema de Pesquisa Dinâmica
 * Pesquisa e filtragem de conteúdo por tags e categorias
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, Filter, X, Tag as TagIcon, Folder, 
  Calendar, TrendingUp, Grid, List, Crown, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  taxonomyService, 
  type SearchFilters, 
  type SearchResult,
  type Tag,
  type Category 
} from '../../services/TaxonomyService';

export function SearchSystem() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [contentType, setContentType] = useState<'all' | 'page' | 'article'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'title'>('recent');
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    setTags(taxonomyService.getTags());
    setCategories(taxonomyService.getCategories());
  }, []);
  
  useEffect(() => {
    performSearch();
  }, [searchTerm, selectedTags, selectedCategories, contentType, dateFrom, dateTo]);
  
  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      const filters: SearchFilters = {
        searchTerm: searchTerm || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        contentType: contentType === 'all' ? undefined : contentType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status: 'published'
      };
      
      // Simula delay de pesquisa para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const searchResults = taxonomyService.search(filters);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro ao realizar pesquisa');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedCategories([]);
    setContentType('all');
    setDateFrom('');
    setDateTo('');
  };
  
  const sortedResults = useMemo(() => {
    const sorted = [...results];
    
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.publishedAt || 0).getTime();
          const dateB = new Date(b.publishedAt || 0).getTime();
          return dateB - dateA;
        });
      
      case 'popular':
        return sorted.sort((a, b) => {
          const scoreA = a.tags.length + a.categories.length;
          const scoreB = b.tags.length + b.categories.length;
          return scoreB - scoreA;
        });
      
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      
      default:
        return sorted;
    }
  }, [results, sortBy]);
  
  const groupedResults = useMemo(() => {
    return taxonomyService.groupResults(results);
  }, [results]);
  
  const hasActiveFilters = 
    searchTerm.length > 0 ||
    selectedTags.length > 0 ||
    selectedCategories.length > 0 ||
    contentType !== 'all' ||
    dateFrom.length > 0 ||
    dateTo.length > 0;
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Pesquisa de Conteúdo</h1>
        <p className="text-muted-foreground">
          Encontre páginas e artigos por tags, categorias e palavras-chave
        </p>
      </div>
      
      {/* Barra de Pesquisa */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título ou conteúdo..."
              className="pl-9"
            />
          </div>
          <Button onClick={performSearch} disabled={isSearching}>
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </Card>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Filtros Laterais */}
        <Card className="col-span-3 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <h3>Filtros</h3>
          </div>
          
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6 pr-4">
              {/* Tipo de Conteúdo */}
              <div>
                <Label>Tipo de Conteúdo</Label>
                <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="page">Páginas</SelectItem>
                    <SelectItem value="article">Artigos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              {/* Categorias */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Categorias</Label>
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary">{selectedCategories.length}</Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        selectedCategories.includes(category.id)
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {category.icon && <span className="text-sm">{category.icon}</span>}
                        <span className="text-sm">{category.name}</span>
                      </div>
                      {category.usageCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {category.usageCount}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Tags</Label>
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary">{selectedTags.length}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 20).map(tag => (
                    <Badge
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      style={{ 
                        backgroundColor: selectedTags.includes(tag.id) ? tag.color : '#e5e7eb',
                        color: selectedTags.includes(tag.id) ? '#fff' : '#000',
                        cursor: 'pointer'
                      }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Data */}
              <div>
                <Label>Período</Label>
                <div className="space-y-2 mt-2">
                  <div>
                    <Label htmlFor="date-from" className="text-xs">De</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-to" className="text-xs">Até</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>
        
        {/* Resultados */}
        <div className="col-span-9 space-y-4">
          {/* Controles de Visualização */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                </span>
                {isSearching && (
                  <span className="text-sm text-muted-foreground animate-pulse">
                    Buscando...
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais Recentes</SelectItem>
                    <SelectItem value="popular">Mais Populares</SelectItem>
                    <SelectItem value="title">Título (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border rounded-lg">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Lista de Resultados */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                Todos ({sortedResults.length})
              </TabsTrigger>
              <TabsTrigger value="recent">
                Recentes ({groupedResults.recent.length})
              </TabsTrigger>
              <TabsTrigger value="popular">
                Populares ({groupedResults.popular.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4">
                  {sortedResults.map(result => (
                    <ResultCard key={result.id} result={result} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedResults.map(result => (
                    <ResultListItem key={result.id} result={result} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4">
                  {groupedResults.recent.map(result => (
                    <ResultCard key={result.id} result={result} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {groupedResults.recent.map(result => (
                    <ResultListItem key={result.id} result={result} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4">
                  {groupedResults.popular.map(result => (
                    <ResultCard key={result.id} result={result} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {groupedResults.popular.map(result => (
                    <ResultListItem key={result.id} result={result} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {results.length === 0 && !isSearching && (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou usar outros termos de busca
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: SearchResult }) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      {result.thumbnail && (
        <img
          src={result.thumbnail}
          alt={result.title}
          className="w-full h-40 object-cover rounded-lg mb-3"
        />
      )}
      
      {result.chapeu && (
        <Badge
          style={{ backgroundColor: result.chapeuColor, color: '#fff' }}
          className="mb-2"
        >
          <Crown className="w-3 h-3 mr-1" />
          {result.chapeu}
        </Badge>
      )}
      
      <h3 className="mb-2 line-clamp-2">{result.title}</h3>
      
      {result.excerpt && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {result.excerpt}
        </p>
      )}
      
      <div className="flex flex-wrap gap-1 mb-3">
        {result.categories.slice(0, 2).map(cat => (
          <Badge key={cat.id} variant="outline" className="text-xs">
            {cat.icon && <span className="mr-1">{cat.icon}</span>}
            {cat.name}
          </Badge>
        ))}
        {result.tags.slice(0, 3).map(tag => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="text-xs"
            style={{ backgroundColor: tag.color + '20', color: tag.color }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {result.publishedAt && new Date(result.publishedAt).toLocaleDateString('pt-BR')}
        </div>
        <Badge variant="outline">{result.type === 'page' ? 'Página' : 'Artigo'}</Badge>
      </div>
      
      <Button variant="outline" className="w-full mt-3" size="sm" asChild>
        <a href={result.url} target="_blank" rel="noopener noreferrer">
          Ver Conteúdo
          <ExternalLink className="w-3 h-3 ml-2" />
        </a>
      </Button>
    </Card>
  );
}

function ResultListItem({ result }: { result: SearchResult }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {result.thumbnail && (
          <img
            src={result.thumbnail}
            alt={result.title}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              {result.chapeu && (
                <Badge
                  style={{ backgroundColor: result.chapeuColor, color: '#fff' }}
                  className="mb-1 text-xs"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {result.chapeu}
                </Badge>
              )}
              <h3 className="line-clamp-1">{result.title}</h3>
            </div>
            <Badge variant="outline">{result.type === 'page' ? 'Página' : 'Artigo'}</Badge>
          </div>
          
          {result.excerpt && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {result.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {result.categories.slice(0, 2).map(cat => (
                <Badge key={cat.id} variant="outline" className="text-xs">
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </Badge>
              ))}
              {result.tags.slice(0, 3).map(tag => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {result.publishedAt && new Date(result.publishedAt).toLocaleDateString('pt-BR')}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
