/**
 * Serviço de Gerenciamento de Templates Hierárquicos
 * Integrado ao Page Builder Hierárquico
 */

import { HierarchicalNode } from '../components/editor/HierarchicalRenderNode';
import { defaultTemplates } from '../utils/defaultTemplates';

export type TemplateType = 'page' | 'article' | 'header' | 'footer' | 'section' | 'custom';

export interface HierarchicalTemplate {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  category: string;
  tags: string[];
  thumbnail?: string;
  nodes: HierarchicalNode[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    version: number;
    usageCount: number;
  };
  settings: {
    isPublic: boolean;
    isFavorite: boolean;
    allowEdit: boolean;
  };
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

class HierarchicalTemplateService {
  private storageKey = 'hierarchical_templates';
  private categoriesKey = 'template_categories';
  private statsKey = 'template_stats';

  /**
   * Inicializar categorias padrão
   */
  private initializeDefaultCategories(): TemplateCategory[] {
    return [
      {
        id: 'landing',
        name: 'Landing Pages',
        description: 'Páginas de destino e conversão',
        icon: '🚀',
        count: 0
      },
      {
        id: 'blog',
        name: 'Blog/Artigos',
        description: 'Templates para posts e artigos',
        icon: '📝',
        count: 0
      },
      {
        id: 'institutional',
        name: 'Institucional',
        description: 'Páginas sobre, contato, serviços',
        icon: '🏢',
        count: 0
      },
      {
        id: 'ecommerce',
        name: 'E-commerce',
        description: 'Produtos, checkout, carrinho',
        icon: '🛒',
        count: 0
      },
      {
        id: 'portfolio',
        name: 'Portfólio',
        description: 'Galerias e showcases',
        icon: '🎨',
        count: 0
      },
      {
        id: 'components',
        name: 'Componentes',
        description: 'Headers, footers, seções',
        icon: '🧩',
        count: 0
      }
    ];
  }

  /**
   * Inicializar templates padrão se não existirem
   */
  private initializeDefaultTemplates(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored || JSON.parse(stored).length === 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(defaultTemplates));
        console.log(`${defaultTemplates.length} templates padrão inicializados`);
      }
    } catch (error) {
      console.error('Erro ao inicializar templates padrão:', error);
    }
  }

  /**
   * Obter todos os templates
   */
  getAllTemplates(): HierarchicalTemplate[] {
    try {
      // Inicializar templates padrão na primeira execução
      this.initializeDefaultTemplates();
      
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      return [];
    }
  }

  /**
   * Obter template por ID
   */
  getTemplateById(id: string): HierarchicalTemplate | null {
    const templates = this.getAllTemplates();
    return templates.find(t => t.id === id) || null;
  }

  /**
   * Obter templates por tipo
   */
  getTemplatesByType(type: TemplateType): HierarchicalTemplate[] {
    const templates = this.getAllTemplates();
    return templates.filter(t => t.type === type);
  }

  /**
   * Obter templates por categoria
   */
  getTemplatesByCategory(category: string): HierarchicalTemplate[] {
    const templates = this.getAllTemplates();
    return templates.filter(t => t.category === category);
  }

  /**
   * Obter templates favoritos
   */
  getFavoriteTemplates(): HierarchicalTemplate[] {
    const templates = this.getAllTemplates();
    return templates.filter(t => t.settings.isFavorite);
  }

  /**
   * Buscar templates
   */
  searchTemplates(query: string): HierarchicalTemplate[] {
    const templates = this.getAllTemplates();
    const lowerQuery = query.toLowerCase();
    
    return templates.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Salvar template
   */
  saveTemplate(template: Omit<HierarchicalTemplate, 'id' | 'metadata'>): HierarchicalTemplate {
    const templates = this.getAllTemplates();
    
    const newTemplate: HierarchicalTemplate = {
      ...template,
      id: this.generateId(),
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: this.getCurrentUser(),
        version: 1,
        usageCount: 0
      }
    };
    
    templates.push(newTemplate);
    this.saveTemplates(templates);
    this.updateCategoryCount(template.category, 1);
    
    return newTemplate;
  }

  /**
   * Atualizar template
   */
  updateTemplate(id: string, updates: Partial<HierarchicalTemplate>): HierarchicalTemplate | null {
    const templates = this.getAllTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    const oldCategory = templates[index].category;
    const newCategory = updates.category;
    
    templates[index] = {
      ...templates[index],
      ...updates,
      metadata: {
        ...templates[index].metadata,
        updatedAt: new Date().toISOString(),
        version: templates[index].metadata.version + 1
      }
    };
    
    this.saveTemplates(templates);
    
    // Atualizar contagem de categorias se mudou
    if (newCategory && newCategory !== oldCategory) {
      this.updateCategoryCount(oldCategory, -1);
      this.updateCategoryCount(newCategory, 1);
    }
    
    return templates[index];
  }

  /**
   * Deletar template
   */
  deleteTemplate(id: string): boolean {
    const templates = this.getAllTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) return false;
    
    const category = templates[index].category;
    templates.splice(index, 1);
    this.saveTemplates(templates);
    this.updateCategoryCount(category, -1);
    
    return true;
  }

  /**
   * Duplicar template
   */
  duplicateTemplate(id: string): HierarchicalTemplate | null {
    const template = this.getTemplateById(id);
    if (!template) return null;
    
    return this.saveTemplate({
      ...template,
      name: `${template.name} (Cópia)`,
      settings: {
        ...template.settings,
        isFavorite: false
      }
    });
  }

  /**
   * Marcar/desmarcar como favorito
   */
  toggleFavorite(id: string): boolean {
    const template = this.getTemplateById(id);
    if (!template) return false;
    
    this.updateTemplate(id, {
      settings: {
        ...template.settings,
        isFavorite: !template.settings.isFavorite
      }
    });
    
    return true;
  }

  /**
   * Incrementar contador de uso
   */
  incrementUsageCount(id: string): void {
    const template = this.getTemplateById(id);
    if (!template) return;
    
    this.updateTemplate(id, {
      metadata: {
        ...template.metadata,
        usageCount: template.metadata.usageCount + 1
      }
    });
  }

  /**
   * Obter templates mais usados
   */
  getMostUsedTemplates(limit: number = 10): HierarchicalTemplate[] {
    const templates = this.getAllTemplates();
    return templates
      .sort((a, b) => b.metadata.usageCount - a.metadata.usageCount)
      .slice(0, limit);
  }

  /**
   * Obter templates recentes
   */
  getRecentTemplates(limit: number = 10): HierarchicalTemplate[] {
    const templates = this.getAllTemplates();
    return templates
      .sort((a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Obter categorias
   */
  getCategories(): TemplateCategory[] {
    try {
      const stored = localStorage.getItem(this.categoriesKey);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Inicializar categorias padrão
      const defaultCategories = this.initializeDefaultCategories();
      localStorage.setItem(this.categoriesKey, JSON.stringify(defaultCategories));
      return defaultCategories;
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      return this.initializeDefaultCategories();
    }
  }

  /**
   * Criar categoria personalizada
   */
  createCategory(category: Omit<TemplateCategory, 'count'>): TemplateCategory {
    const categories = this.getCategories();
    const newCategory: TemplateCategory = {
      ...category,
      count: 0
    };
    
    categories.push(newCategory);
    localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
    
    return newCategory;
  }

  /**
   * Exportar template como JSON
   */
  exportTemplate(id: string): string | null {
    const template = this.getTemplateById(id);
    if (!template) return null;
    
    return JSON.stringify(template, null, 2);
  }

  /**
   * Importar template de JSON
   */
  importTemplate(json: string): HierarchicalTemplate | null {
    try {
      const template = JSON.parse(json) as HierarchicalTemplate;
      
      // Validar estrutura básica
      if (!template.name || !template.nodes || !Array.isArray(template.nodes)) {
        throw new Error('Template inválido');
      }
      
      // Salvar como novo template
      return this.saveTemplate({
        name: template.name,
        description: template.description || '',
        type: template.type || 'custom',
        category: template.category || 'components',
        tags: template.tags || [],
        nodes: template.nodes,
        settings: {
          isPublic: false,
          isFavorite: false,
          allowEdit: true
        }
      });
    } catch (error) {
      console.error('Erro ao importar template:', error);
      return null;
    }
  }

  /**
   * Obter estatísticas
   */
  getStatistics() {
    const templates = this.getAllTemplates();
    const categories = this.getCategories();
    
    return {
      totalTemplates: templates.length,
      byType: {
        page: templates.filter(t => t.type === 'page').length,
        article: templates.filter(t => t.type === 'article').length,
        header: templates.filter(t => t.type === 'header').length,
        footer: templates.filter(t => t.type === 'footer').length,
        section: templates.filter(t => t.type === 'section').length,
        custom: templates.filter(t => t.type === 'custom').length
      },
      favorites: templates.filter(t => t.settings.isFavorite).length,
      totalUsage: templates.reduce((sum, t) => sum + t.metadata.usageCount, 0),
      categories: categories.length
    };
  }

  /**
   * Gerar thumbnail do template (simplificado)
   */
  generateThumbnail(nodes: HierarchicalNode[]): string {
    // Por enquanto, retorna um identificador baseado nos tipos de nós
    const types = this.extractNodeTypes(nodes);
    return `data:image/svg+xml,${encodeURIComponent(this.createSvgThumbnail(types))}`;
  }

  // Métodos auxiliares privados
  
  private saveTemplates(templates: HierarchicalTemplate[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
    } catch (error) {
      console.error('Erro ao salvar templates:', error);
    }
  }

  private generateId(): string {
    return `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUser(): string {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user).username : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private updateCategoryCount(categoryId: string, delta: number): void {
    const categories = this.getCategories();
    const category = categories.find(c => c.id === categoryId);
    
    if (category) {
      category.count = Math.max(0, category.count + delta);
      localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
    }
  }

  private extractNodeTypes(nodes: HierarchicalNode[]): string[] {
    const types: string[] = [];
    
    const traverse = (node: HierarchicalNode) => {
      types.push(node.type);
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
    return [...new Set(types)];
  }

  private createSvgThumbnail(types: string[]): string {
    // SVG simplificado representando o template
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150">
      <rect width="200" height="150" fill="#f3f4f6"/>
      <text x="100" y="75" text-anchor="middle" fill="#6b7280" font-size="12">
        ${types.slice(0, 3).join(', ')}
      </text>
    </svg>`;
  }
}

export const hierarchicalTemplateService = new HierarchicalTemplateService();
