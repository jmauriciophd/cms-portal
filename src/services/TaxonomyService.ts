/**
 * Serviço de Taxonomia - Gerencia Tags, Categorias e Chapéus
 * Sistema completo para organização e pesquisa de conteúdo
 */

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: string;
  createdBy: string;
  usageCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  order: number;
  createdAt: string;
  createdBy: string;
  usageCount: number;
}

export interface TaxonomyAssignment {
  contentId: string;
  contentType: 'page' | 'article';
  tags: string[]; // Array de IDs de tags
  categories: string[]; // Array de IDs de categorias
  primaryTag?: string; // "Chapéu" - primeira tag
  primaryCategory?: string; // Categoria principal
  assignedAt: string;
  assignedBy: string;
}

export interface SearchFilters {
  tags?: string[];
  categories?: string[];
  contentType?: 'page' | 'article' | 'all';
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  status?: 'published' | 'draft' | 'all';
}

export interface SearchResult {
  id: string;
  type: 'page' | 'article';
  title: string;
  excerpt?: string;
  chapeu?: string; // Tag ou categoria principal
  chapeuColor?: string;
  tags: Tag[];
  categories: Category[];
  publishedAt?: string;
  author?: string;
  thumbnail?: string;
  url: string;
}

export interface GroupedResults {
  byCategory: Map<string, SearchResult[]>;
  byTag: Map<string, SearchResult[]>;
  recent: SearchResult[];
  popular: SearchResult[];
  all: SearchResult[];
}

class TaxonomyService {
  private tags: Map<string, Tag> = new Map();
  private categories: Map<string, Category> = new Map();
  private assignments: Map<string, TaxonomyAssignment> = new Map();
  
  // Cache para pesquisa rápida
  private searchCache: Map<string, { results: SearchResult[]; timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutos
  
  constructor() {
    this.loadData();
    this.initializeDefaultTaxonomies();
  }
  
  /**
   * Carrega dados do localStorage
   */
  private loadData(): void {
    try {
      // Carregar tags
      const storedTags = localStorage.getItem('cms_tags');
      if (storedTags) {
        const tagsArray: Tag[] = JSON.parse(storedTags);
        tagsArray.forEach(tag => this.tags.set(tag.id, tag));
      }
      
      // Carregar categorias
      const storedCategories = localStorage.getItem('cms_categories');
      if (storedCategories) {
        const categoriesArray: Category[] = JSON.parse(storedCategories);
        categoriesArray.forEach(cat => this.categories.set(cat.id, cat));
      }
      
      // Carregar atribuições
      const storedAssignments = localStorage.getItem('cms_taxonomy_assignments');
      if (storedAssignments) {
        const assignmentsArray: TaxonomyAssignment[] = JSON.parse(storedAssignments);
        assignmentsArray.forEach(assignment => 
          this.assignments.set(assignment.contentId, assignment)
        );
      }
    } catch (error) {
      console.error('Error loading taxonomy data:', error);
    }
  }
  
  /**
   * Salva dados no localStorage
   */
  private saveData(): void {
    try {
      // Salvar tags
      const tagsArray = Array.from(this.tags.values());
      localStorage.setItem('cms_tags', JSON.stringify(tagsArray));
      
      // Salvar categorias
      const categoriesArray = Array.from(this.categories.values());
      localStorage.setItem('cms_categories', JSON.stringify(categoriesArray));
      
      // Salvar atribuições
      const assignmentsArray = Array.from(this.assignments.values());
      localStorage.setItem('cms_taxonomy_assignments', JSON.stringify(assignmentsArray));
      
      // Limpar cache de pesquisa
      this.searchCache.clear();
    } catch (error) {
      console.error('Error saving taxonomy data:', error);
    }
  }
  
  /**
   * Inicializa taxonomias padrão se não existirem
   */
  private initializeDefaultTaxonomies(): void {
    if (this.categories.size === 0) {
      const defaultCategories: Omit<Category, 'id' | 'createdAt' | 'usageCount'>[] = [
        { name: 'Notícias', slug: 'noticias', color: '#3B82F6', icon: '📰', order: 1, createdBy: 'system', description: 'Notícias gerais' },
        { name: 'Eventos', slug: 'eventos', color: '#10B981', icon: '📅', order: 2, createdBy: 'system', description: 'Eventos e acontecimentos' },
        { name: 'Artigos', slug: 'artigos', color: '#8B5CF6', icon: '📝', order: 3, createdBy: 'system', description: 'Artigos e análises' },
        { name: 'Comunicados', slug: 'comunicados', color: '#F59E0B', icon: '📢', order: 4, createdBy: 'system', description: 'Comunicados oficiais' },
        { name: 'Documentos', slug: 'documentos', color: '#EF4444', icon: '📄', order: 5, createdBy: 'system', description: 'Documentos e publicações' },
      ];
      
      defaultCategories.forEach(cat => {
        this.createCategory(cat as any);
      });
    }
  }
  
  /**
   * Gera slug a partir do nome
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // ============ TAGS ============
  
  /**
   * Cria nova tag
   */
  createTag(data: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>): Tag {
    const tag: Tag = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      slug: data.slug || this.generateSlug(data.name),
      description: data.description,
      color: data.color || this.generateRandomColor(),
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy,
      usageCount: 0
    };
    
    this.tags.set(tag.id, tag);
    this.saveData();
    return tag;
  }
  
  /**
   * Atualiza tag
   */
  updateTag(id: string, updates: Partial<Tag>): Tag | null {
    const tag = this.tags.get(id);
    if (!tag) return null;
    
    const updated = { ...tag, ...updates };
    this.tags.set(id, updated);
    this.saveData();
    return updated;
  }
  
  /**
   * Remove tag
   */
  deleteTag(id: string): boolean {
    const tag = this.tags.get(id);
    if (!tag) return false;
    
    // Remove tag de todas as atribuições
    this.assignments.forEach(assignment => {
      assignment.tags = assignment.tags.filter(tagId => tagId !== id);
      if (assignment.primaryTag === id) {
        assignment.primaryTag = assignment.tags[0];
      }
    });
    
    this.tags.delete(id);
    this.saveData();
    return true;
  }
  
  /**
   * Obtém tag por ID
   */
  getTag(id: string): Tag | undefined {
    return this.tags.get(id);
  }
  
  /**
   * Lista todas as tags
   */
  getTags(): Tag[] {
    return Array.from(this.tags.values()).sort((a, b) => 
      b.usageCount - a.usageCount || a.name.localeCompare(b.name)
    );
  }
  
  /**
   * Busca tags por nome
   */
  searchTags(query: string): Tag[] {
    const lowerQuery = query.toLowerCase();
    return this.getTags().filter(tag =>
      tag.name.toLowerCase().includes(lowerQuery) ||
      tag.slug.includes(lowerQuery)
    );
  }
  
  // ============ CATEGORIAS ============
  
  /**
   * Cria nova categoria
   */
  createCategory(data: Omit<Category, 'id' | 'createdAt' | 'usageCount'>): Category {
    const category: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      slug: data.slug || this.generateSlug(data.name),
      description: data.description,
      color: data.color || this.generateRandomColor(),
      icon: data.icon,
      parentId: data.parentId,
      order: data.order || this.categories.size + 1,
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy,
      usageCount: 0
    };
    
    this.categories.set(category.id, category);
    this.saveData();
    return category;
  }
  
  /**
   * Atualiza categoria
   */
  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const category = this.categories.get(id);
    if (!category) return null;
    
    const updated = { ...category, ...updates };
    this.categories.set(id, updated);
    this.saveData();
    return updated;
  }
  
  /**
   * Remove categoria
   */
  deleteCategory(id: string): boolean {
    const category = this.categories.get(id);
    if (!category) return false;
    
    // Remove categoria de todas as atribuições
    this.assignments.forEach(assignment => {
      assignment.categories = assignment.categories.filter(catId => catId !== id);
      if (assignment.primaryCategory === id) {
        assignment.primaryCategory = assignment.categories[0];
      }
    });
    
    // Remove subcategorias
    this.getSubcategories(id).forEach(subcat => {
      this.deleteCategory(subcat.id);
    });
    
    this.categories.delete(id);
    this.saveData();
    return true;
  }
  
  /**
   * Obtém categoria por ID
   */
  getCategory(id: string): Category | undefined {
    return this.categories.get(id);
  }
  
  /**
   * Lista todas as categorias
   */
  getCategories(): Category[] {
    return Array.from(this.categories.values()).sort((a, b) => 
      a.order - b.order || a.name.localeCompare(b.name)
    );
  }
  
  /**
   * Obtém categorias raiz (sem pai)
   */
  getRootCategories(): Category[] {
    return this.getCategories().filter(cat => !cat.parentId);
  }
  
  /**
   * Obtém subcategorias de uma categoria
   */
  getSubcategories(parentId: string): Category[] {
    return this.getCategories().filter(cat => cat.parentId === parentId);
  }
  
  /**
   * Busca categorias por nome
   */
  searchCategories(query: string): Category[] {
    const lowerQuery = query.toLowerCase();
    return this.getCategories().filter(cat =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.slug.includes(lowerQuery)
    );
  }
  
  // ============ ATRIBUIÇÕES ============
  
  /**
   * Atribui tags e categorias a conteúdo
   */
  assignTaxonomy(
    contentId: string,
    contentType: 'page' | 'article',
    tags: string[],
    categories: string[],
    userId: string
  ): TaxonomyAssignment {
    const assignment: TaxonomyAssignment = {
      contentId,
      contentType,
      tags,
      categories,
      primaryTag: tags[0], // Primeiro = chapéu
      primaryCategory: categories[0],
      assignedAt: new Date().toISOString(),
      assignedBy: userId
    };
    
    this.assignments.set(contentId, assignment);
    
    // Atualiza contadores de uso
    tags.forEach(tagId => {
      const tag = this.tags.get(tagId);
      if (tag) {
        tag.usageCount++;
        this.tags.set(tagId, tag);
      }
    });
    
    categories.forEach(catId => {
      const category = this.categories.get(catId);
      if (category) {
        category.usageCount++;
        this.categories.set(catId, category);
      }
    });
    
    this.saveData();
    return assignment;
  }
  
  /**
   * Obtém atribuição de conteúdo
   */
  getAssignment(contentId: string): TaxonomyAssignment | undefined {
    return this.assignments.get(contentId);
  }
  
  /**
   * Remove atribuição
   */
  removeAssignment(contentId: string): boolean {
    const assignment = this.assignments.get(contentId);
    if (!assignment) return false;
    
    // Decrementa contadores
    assignment.tags.forEach(tagId => {
      const tag = this.tags.get(tagId);
      if (tag && tag.usageCount > 0) {
        tag.usageCount--;
        this.tags.set(tagId, tag);
      }
    });
    
    assignment.categories.forEach(catId => {
      const category = this.categories.get(catId);
      if (category && category.usageCount > 0) {
        category.usageCount--;
        this.categories.set(catId, category);
      }
    });
    
    this.assignments.delete(contentId);
    this.saveData();
    return true;
  }
  
  // ============ PESQUISA ============
  
  /**
   * Pesquisa conteúdo com filtros
   */
  search(filters: SearchFilters): SearchResult[] {
    const cacheKey = JSON.stringify(filters);
    const cached = this.searchCache.get(cacheKey);
    
    // Retorna do cache se válido
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.results;
    }
    
    // Busca conteúdo
    const pages = this.getPages();
    const articles = this.getArticles();
    
    let allContent = [...pages, ...articles];
    
    // Filtro por tipo de conteúdo
    if (filters.contentType && filters.contentType !== 'all') {
      allContent = allContent.filter(c => c.type === filters.contentType);
    }
    
    // Filtro por status
    if (filters.status && filters.status !== 'all') {
      allContent = allContent.filter(c => 
        (c as any).status === filters.status
      );
    }
    
    // Filtro por tags
    if (filters.tags && filters.tags.length > 0) {
      allContent = allContent.filter(content => {
        const assignment = this.assignments.get(content.id);
        if (!assignment) return false;
        return filters.tags!.some(tagId => assignment.tags.includes(tagId));
      });
    }
    
    // Filtro por categorias
    if (filters.categories && filters.categories.length > 0) {
      allContent = allContent.filter(content => {
        const assignment = this.assignments.get(content.id);
        if (!assignment) return false;
        return filters.categories!.some(catId => assignment.categories.includes(catId));
      });
    }
    
    // Filtro por data
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      allContent = allContent.filter(c => {
        const contentDate = new Date(c.publishedAt || '');
        return contentDate >= fromDate;
      });
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      allContent = allContent.filter(c => {
        const contentDate = new Date(c.publishedAt || '');
        return contentDate <= toDate;
      });
    }
    
    // Filtro por termo de busca
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      allContent = allContent.filter(c =>
        c.title.toLowerCase().includes(term) ||
        (c.excerpt && c.excerpt.toLowerCase().includes(term))
      );
    }
    
    // Converte para SearchResult
    const results: SearchResult[] = allContent.map(content => {
      const assignment = this.assignments.get(content.id);
      const chapeu = this.getChapeu(content.id);
      
      return {
        id: content.id,
        type: content.type,
        title: content.title,
        excerpt: content.excerpt || content.summary,
        chapeu: chapeu?.name,
        chapeuColor: chapeu?.color,
        tags: assignment ? assignment.tags.map(id => this.tags.get(id)!).filter(Boolean) : [],
        categories: assignment ? assignment.categories.map(id => this.categories.get(id)!).filter(Boolean) : [],
        publishedAt: content.publishedAt,
        author: content.author,
        thumbnail: content.thumbnail,
        url: content.url
      };
    });
    
    // Atualiza cache
    this.searchCache.set(cacheKey, {
      results,
      timestamp: Date.now()
    });
    
    return results;
  }
  
  /**
   * Agrupa resultados de pesquisa
   */
  groupResults(results: SearchResult[]): GroupedResults {
    const byCategory = new Map<string, SearchResult[]>();
    const byTag = new Map<string, SearchResult[]>();
    
    results.forEach(result => {
      // Agrupa por categoria
      result.categories.forEach(cat => {
        if (!byCategory.has(cat.id)) {
          byCategory.set(cat.id, []);
        }
        byCategory.get(cat.id)!.push(result);
      });
      
      // Agrupa por tag
      result.tags.forEach(tag => {
        if (!byTag.has(tag.id)) {
          byTag.set(tag.id, []);
        }
        byTag.get(tag.id)!.push(result);
      });
    });
    
    // Ordena por data (mais recentes)
    const recent = [...results].sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    }).slice(0, 10);
    
    // Mais populares (mais tags/categorias)
    const popular = [...results].sort((a, b) => {
      const scoreA = a.tags.length + a.categories.length;
      const scoreB = b.tags.length + b.categories.length;
      return scoreB - scoreA;
    }).slice(0, 10);
    
    return {
      byCategory,
      byTag,
      recent,
      popular,
      all: results
    };
  }
  
  /**
   * Obtém "chapéu" (tag ou categoria principal)
   */
  getChapeu(contentId: string): Tag | Category | null {
    const assignment = this.assignments.get(contentId);
    if (!assignment) return null;
    
    // Prioriza tag primária
    if (assignment.primaryTag) {
      return this.tags.get(assignment.primaryTag) || null;
    }
    
    // Senão usa categoria primária
    if (assignment.primaryCategory) {
      return this.categories.get(assignment.primaryCategory) || null;
    }
    
    return null;
  }
  
  /**
   * Obtém conteúdo relacionado
   */
  getRelatedContent(contentId: string, limit: number = 5): SearchResult[] {
    const assignment = this.assignments.get(contentId);
    if (!assignment) return [];
    
    const results = this.search({
      tags: assignment.tags,
      categories: assignment.categories
    });
    
    // Remove o próprio conteúdo
    const filtered = results.filter(r => r.id !== contentId);
    
    // Ordena por relevância (mais tags/categorias em comum)
    const sorted = filtered.sort((a, b) => {
      const scoreA = a.tags.filter(t => assignment.tags.includes(t.id)).length +
                     a.categories.filter(c => assignment.categories.includes(c.id)).length;
      const scoreB = b.tags.filter(t => assignment.tags.includes(t.id)).length +
                     b.categories.filter(c => assignment.categories.includes(c.id)).length;
      return scoreB - scoreA;
    });
    
    return sorted.slice(0, limit);
  }
  
  // ============ UTILITÁRIOS ============
  
  /**
   * Gera cor aleatória
   */
  private generateRandomColor(): string {
    const colors = [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  /**
   * Obtém páginas do localStorage
   */
  private getPages(): any[] {
    try {
      const stored = localStorage.getItem('cms_pages');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  /**
   * Obtém artigos do localStorage
   */
  private getArticles(): any[] {
    try {
      const stored = localStorage.getItem('cms_articles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  /**
   * Limpa cache de pesquisa
   */
  clearCache(): void {
    this.searchCache.clear();
  }
  
  /**
   * Exporta dados de taxonomia
   */
  exportData(): { tags: Tag[]; categories: Category[]; assignments: TaxonomyAssignment[] } {
    return {
      tags: this.getTags(),
      categories: this.getCategories(),
      assignments: Array.from(this.assignments.values())
    };
  }
  
  /**
   * Importa dados de taxonomia
   */
  importData(data: { tags?: Tag[]; categories?: Category[]; assignments?: TaxonomyAssignment[] }): void {
    if (data.tags) {
      data.tags.forEach(tag => this.tags.set(tag.id, tag));
    }
    
    if (data.categories) {
      data.categories.forEach(cat => this.categories.set(cat.id, cat));
    }
    
    if (data.assignments) {
      data.assignments.forEach(a => this.assignments.set(a.contentId, a));
    }
    
    this.saveData();
  }
}

// Singleton instance
export const taxonomyService = new TaxonomyService();
