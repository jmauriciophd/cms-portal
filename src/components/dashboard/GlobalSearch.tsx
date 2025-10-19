/**
 * Componente de Pesquisa Global
 * Barra de pesquisa integrada ao topo do Dashboard com filtros avançados e sugestões
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Search, 
  ChevronDown, 
  Filter, 
  X,
  FileText,
  Layout,
  Image,
  Tag as TagIcon,
  Folder,
  Clock,
  User,
  Calendar,
  Loader2,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useDebounce } from '../hooks/useDebounce';

// Tipos de conteúdo que podem ser pesquisados
type ContentType = 'all' | 'pages' | 'articles' | 'files' | 'templates' | 'snippets' | 'menus';

interface SearchSuggestion {
  id: string;
  title: string;
  type: ContentType;
  path?: string;
  description?: string;
  tags?: string[];
  category?: string;
  author?: string;
  updatedAt?: string;
  icon: any;
  viewId: string; // ID da view para navegar
}

interface SearchFilters {
  contentTypes: ContentType[];
  categories: string[];
  tags: string[];
  dateFrom?: string;
  dateTo?: string;
  author?: string;
  status?: string;
}

interface GlobalSearchProps {
  onNavigate: (viewId: string, itemId?: string) => void;
}

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    contentTypes: ['all'],
    categories: [],
    tags: [],
    status: 'all'
  });

  const searchRef = useRef<HTMLDivElement>(null);

  // Dados mockados para demonstração
  const availableCategories = ['Notícias', 'Tecnologia', 'Esportes', 'Entretenimento', 'Negócios'];
  const availableTags = ['Importante', 'Destaque', 'Urgente', 'Atualização', 'Novo'];
  const availableAuthors = ['Admin', 'Editor', 'João Silva', 'Maria Santos'];

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowFilters(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Indicar quando está pesquisando
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  // Buscar sugestões em tempo real com debounce
  useEffect(() => {
    if (debouncedSearchQuery.length > 0) {
      const results = performSearch(debouncedSearchQuery, filters);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchQuery, filters]);

  // Função auxiliar para normalizar texto (remover acentos e converter para lowercase)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
  };

  // Função auxiliar para formatar tamanho de arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Função de pesquisa
  const performSearch = (query: string, activeFilters: SearchFilters): SearchSuggestion[] => {
    const allContent = getAllContent();
    const normalizedQuery = normalizeText(query);

    console.log('GlobalSearch - Pesquisando:', {
      query,
      normalizedQuery,
      totalItems: allContent.length,
      filters: activeFilters
    });

    const results = allContent
      .filter(item => {
        // Filtro de texto com normalização (remove acentos)
        const matchesQuery = 
          normalizeText(item.title).includes(normalizedQuery) ||
          (item.description && normalizeText(item.description).includes(normalizedQuery)) ||
          item.tags?.some(tag => normalizeText(tag).includes(normalizedQuery)) ||
          (item.category && normalizeText(item.category).includes(normalizedQuery));

        // Filtro de tipo de conteúdo
        const matchesType = 
          activeFilters.contentTypes.includes('all') || 
          activeFilters.contentTypes.includes(item.type);

        // Filtro de categorias
        const matchesCategory = 
          activeFilters.categories.length === 0 ||
          (item.category && activeFilters.categories.includes(item.category));

        // Filtro de tags
        const matchesTags = 
          activeFilters.tags.length === 0 ||
          (item.tags && item.tags.some(tag => activeFilters.tags.includes(tag)));

        return matchesQuery && matchesType && matchesCategory && matchesTags;
      })
      .slice(0, 8); // Limitar a 8 sugestões

    console.log('GlobalSearch - Resultados encontrados:', results.length);
    
    return results;
  };

  // Obter todo o conteúdo do sistema
  const getAllContent = (): SearchSuggestion[] => {
    let pages = [];
    let articles = [];
    let files = [];
    let templates = [];
    let snippets = [];
    let menus = [];

    try {
      // CORRIGIDO: Usar 'pages' ao invés de 'hierarchical-pages'
      const pagesData = localStorage.getItem('pages');
      pages = pagesData ? JSON.parse(pagesData) : [];
      if (!Array.isArray(pages)) pages = [];
    } catch (e) {
      console.error('Error parsing pages:', e);
      pages = [];
    }

    try {
      const articlesData = localStorage.getItem('articles');
      articles = articlesData ? JSON.parse(articlesData) : [];
      if (!Array.isArray(articles)) articles = [];
    } catch (e) {
      console.error('Error parsing articles:', e);
      articles = [];
    }

    try {
      const filesData = localStorage.getItem('files');
      files = filesData ? JSON.parse(filesData) : [];
      if (!Array.isArray(files)) files = [];
    } catch (e) {
      console.error('Error parsing files:', e);
      files = [];
    }

    try {
      // CORRIGIDO: Usar 'templates' ao invés de 'hierarchical-templates'
      const templatesData = localStorage.getItem('templates');
      templates = templatesData ? JSON.parse(templatesData) : [];
      if (!Array.isArray(templates)) templates = [];
    } catch (e) {
      console.error('Error parsing templates:', e);
      templates = [];
    }

    try {
      const snippetsData = localStorage.getItem('snippets');
      snippets = snippetsData ? JSON.parse(snippetsData) : [];
      if (!Array.isArray(snippets)) snippets = [];
    } catch (e) {
      console.error('Error parsing snippets:', e);
      snippets = [];
    }

    try {
      const menusData = localStorage.getItem('menus');
      menus = menusData ? JSON.parse(menusData) : [];
      if (!Array.isArray(menus)) menus = [];
    } catch (e) {
      console.error('Error parsing menus:', e);
      menus = [];
    }

    const allSuggestions: SearchSuggestion[] = [];

    // Páginas
    pages.forEach((page: any) => {
      allSuggestions.push({
        id: page.id,
        title: page.title || 'Página sem título',
        type: 'pages',
        description: page.excerpt || page.description,
        tags: page.tags,
        category: page.category,
        author: page.author,
        updatedAt: page.updatedAt,
        icon: Layout,
        viewId: 'pages'
      });
    });

    // Artigos/Matérias
    articles.forEach((article: any) => {
      allSuggestions.push({
        id: article.id,
        title: article.title || 'Artigo sem título',
        type: 'articles',
        description: article.excerpt,
        tags: article.tags,
        category: article.category,
        author: article.author,
        updatedAt: article.updatedAt,
        icon: FileText,
        viewId: 'editorDemo'
      });
    });

    // Arquivos e Pastas
    files.forEach((file: any) => {
      // Incluir apenas arquivos, não pastas
      if (file.type === 'file') {
        // Determinar ícone baseado no tipo MIME
        let fileIcon = File;
        let fileCategory = 'Arquivo';
        
        if (file.mimeType) {
          if (file.mimeType.startsWith('image/')) {
            fileIcon = FileImage;
            fileCategory = 'Imagem';
          } else if (file.mimeType.startsWith('video/')) {
            fileIcon = FileVideo;
            fileCategory = 'Vídeo';
          } else if (file.mimeType.startsWith('audio/')) {
            fileIcon = FileAudio;
            fileCategory = 'Áudio';
          } else if (file.mimeType.includes('text/') || file.mimeType.includes('code') || file.mimeType.includes('javascript') || file.mimeType.includes('json')) {
            fileIcon = FileCode;
            fileCategory = 'Código';
          } else if (file.mimeType.includes('pdf')) {
            fileIcon = FileText;
            fileCategory = 'PDF';
          }
        }
        
        // Extrair extensão do arquivo
        const extension = file.name.includes('.') ? file.name.split('.').pop()?.toUpperCase() : '';
        
        allSuggestions.push({
          id: file.id,
          title: file.name,
          type: 'files',
          description: `${fileCategory}${extension ? ` (${extension})` : ''} • ${formatFileSize(file.size || 0)}`,
          path: file.path,
          category: fileCategory,
          updatedAt: file.updatedAt,
          icon: fileIcon,
          viewId: 'files'
        });
      }
    });

    // Templates
    templates.forEach((template: any) => {
      allSuggestions.push({
        id: template.id,
        title: template.name || 'Template sem nome',
        type: 'templates',
        description: template.description,
        category: template.category,
        icon: Folder,
        viewId: 'templates'
      });
    });

    // Snippets
    snippets.forEach((snippet: any) => {
      allSuggestions.push({
        id: snippet.id,
        title: snippet.name || 'Snippet sem nome',
        type: 'snippets',
        description: snippet.description,
        tags: snippet.tags,
        icon: FileText,
        viewId: 'snippets'
      });
    });

    // Menus
    menus.forEach((menu: any) => {
      allSuggestions.push({
        id: menu.id,
        title: menu.name || 'Menu sem nome',
        type: 'menus',
        description: menu.description || menu.location,
        icon: Folder,
        viewId: 'menu'
      });
    });

    // Debug: mostrar quantos itens foram encontrados
    console.log('GlobalSearch - Conteúdo carregado:', {
      pages: pages.length,
      articles: articles.length,
      files: files.length,
      templates: templates.length,
      snippets: snippets.length,
      menus: menus.length,
      total: allSuggestions.length
    });

    return allSuggestions;
  };

  // Navegar para item selecionado
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    // Mensagens personalizadas por tipo
    const messages: Record<ContentType, string> = {
      all: 'Abrindo',
      pages: 'Abrindo página',
      articles: 'Abrindo artigo',
      files: 'Abrindo arquivo',
      templates: 'Abrindo template',
      snippets: 'Abrindo snippet',
      menus: 'Abrindo menu'
    };
    
    const message = messages[suggestion.type] || 'Abrindo';
    toast.success(`${message}: ${suggestion.title}`);
    
    // Navegar para a view e selecionar o item
    onNavigate(suggestion.viewId, suggestion.id);
    
    // Para arquivos de imagem ou HTML, podemos tentar visualizar
    if (suggestion.type === 'files' && suggestion.path) {
      // Emitir evento para o FileManager abrir o arquivo
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openFile', { 
          detail: { 
            fileId: suggestion.id,
            filePath: suggestion.path 
          } 
        }));
      }, 200);
    }
    
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Toggle filtro de tipo de conteúdo
  const toggleContentType = (type: ContentType) => {
    if (type === 'all') {
      setFilters({ ...filters, contentTypes: ['all'] });
    } else {
      const currentTypes = filters.contentTypes.filter(t => t !== 'all');
      if (currentTypes.includes(type)) {
        const newTypes = currentTypes.filter(t => t !== type);
        setFilters({ 
          ...filters, 
          contentTypes: newTypes.length === 0 ? ['all'] : newTypes 
        });
      } else {
        setFilters({ ...filters, contentTypes: [...currentTypes, type] });
      }
    }
  };

  // Toggle categoria
  const toggleCategory = (category: string) => {
    const current = filters.categories;
    if (current.includes(category)) {
      setFilters({ ...filters, categories: current.filter(c => c !== category) });
    } else {
      setFilters({ ...filters, categories: [...current, category] });
    }
  };

  // Toggle tag
  const toggleTag = (tag: string) => {
    const current = filters.tags;
    if (current.includes(tag)) {
      setFilters({ ...filters, tags: current.filter(t => t !== tag) });
    } else {
      setFilters({ ...filters, tags: [...current, tag] });
    }
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      contentTypes: ['all'],
      categories: [],
      tags: [],
      status: 'all'
    });
    toast.success('Filtros limpos');
  };

  // Ícone do tipo de conteúdo
  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'pages': return Layout;
      case 'articles': return FileText;
      case 'files': return File;
      case 'templates': return Folder;
      case 'snippets': return FileText;
      case 'menus': return Folder;
      default: return Search;
    }
  };

  // Label do tipo de conteúdo
  const getTypeLabel = (type: ContentType) => {
    switch (type) {
      case 'pages': return 'Páginas';
      case 'articles': return 'Artigos';
      case 'files': return 'Arquivos';
      case 'templates': return 'Templates';
      case 'snippets': return 'Snippets';
      case 'menus': return 'Menus';
      default: return 'Todos';
    }
  };

  const activeFiltersCount = 
    (filters.contentTypes.includes('all') ? 0 : filters.contentTypes.length) +
    filters.categories.length +
    filters.tags.length;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Barra de Pesquisa */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar páginas, artigos, arquivos, templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.length > 0) setShowSuggestions(true);
            }}
            className="pl-10 pr-10 h-11"
          />
          {isSearching && searchQuery && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
          {!isSearching && searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botão de Filtros */}
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => {
            setShowFilters(!showFilters);
            setShowSuggestions(false);
          }}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Painel de Filtros */}
      {showFilters && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros de Pesquisa
            </h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Tipo de Conteúdo */}
            <div>
              <label className="text-sm mb-2 block">Tipo de Conteúdo</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'pages', 'articles', 'files', 'templates', 'snippets', 'menus'] as ContentType[]).map(type => (
                  <Badge
                    key={type}
                    variant={filters.contentTypes.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleContentType(type)}
                  >
                    {getTypeLabel(type)}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Categorias */}
            <div>
              <label className="text-sm mb-2 block flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Categorias
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(category => (
                  <Badge
                    key={category}
                    variant={filters.categories.includes(category) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div>
              <label className="text-sm mb-2 block flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sugestões de Pesquisa */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          <ScrollArea className="max-h-96">
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2">
                {suggestions.length} resultado{suggestions.length !== 1 ? 's' : ''} encontrado{suggestions.length !== 1 ? 's' : ''}
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                          <Icon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">
                              {suggestion.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(suggestion.type)}
                            </Badge>
                          </div>
                          {suggestion.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {suggestion.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            {suggestion.category && (
                              <span className="flex items-center gap-1">
                                <Folder className="w-3 h-3" />
                                {suggestion.category}
                              </span>
                            )}
                            {suggestion.author && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {suggestion.author}
                              </span>
                            )}
                            {suggestion.updatedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(suggestion.updatedAt).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                          {suggestion.tags && suggestion.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {suggestion.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Sem resultados */}
      {showSuggestions && searchQuery && suggestions.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-8 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">Nenhum resultado encontrado</p>
          <p className="text-sm text-gray-400">
            Tente usar termos diferentes ou ajustar os filtros
          </p>
        </div>
      )}
    </div>
  );
}
