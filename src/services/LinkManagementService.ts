/**
 * SERVIÇO DE GERENCIAMENTO DE LINKS
 * 
 * Sistema completo para gerenciar links internos e externos
 * com validação automática, atualização de referências e
 * verificação de links quebrados.
 */

export interface Link {
  id: string;
  title: string;
  url: string;
  type: 'internal' | 'external';
  resourceType: 'page' | 'article' | 'file' | 'image' | 'pdf' | 'custom';
  resourceId?: string; // ID do recurso (página, artigo, arquivo)
  resourcePath?: string; // Caminho do recurso
  slug?: string;
  status: 'active' | 'broken' | 'pending' | 'redirect';
  statusCode?: number;
  redirectTo?: string;
  description?: string;
  tags?: string[];
  metadata?: {
    folder?: string;
    fileSize?: number;
    mimeType?: string;
    dimensions?: { width: number; height: number };
    createdBy?: string;
    updatedBy?: string;
  };
  analytics?: {
    clickCount: number;
    lastClicked?: string;
    referrers?: string[];
  };
  validation?: {
    lastChecked: string;
    lastValidAt?: string;
    checkFrequency: number; // horas
    autoCheck: boolean;
    errorMessage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LinkCheckResult {
  linkId: string;
  status: 'active' | 'broken' | 'redirect';
  statusCode?: number;
  redirectTo?: string;
  errorMessage?: string;
  checkedAt: string;
}

export interface LinkReference {
  fromResource: string; // ID do recurso que contém o link
  fromType: 'page' | 'article' | 'file';
  linkId: string;
  occurrences: number;
  locations?: string[]; // Onde o link aparece (ex: "paragraph-5", "heading-2")
}

export class LinkManagementService {
  private static STORAGE_KEY = 'cms-links';
  private static REFERENCES_KEY = 'cms-link-references';
  private static ANALYTICS_KEY = 'cms-link-analytics';

  /**
   * Gera URL para um recurso baseado no tipo e slug
   */
  private static generateResourceUrl(
    resourceType: string,
    slug: string,
    folder?: string
  ): string {
    const baseUrl = window.location.origin;
    
    switch (resourceType) {
      case 'page':
        return `${baseUrl}/${slug}`;
      case 'article':
        return `${baseUrl}/artigos/${slug}`;
      case 'file':
      case 'pdf':
      case 'image':
        const path = folder ? `${folder}/${slug}` : slug;
        return `${baseUrl}/files/${path}`;
      default:
        return `${baseUrl}/${slug}`;
    }
  }

  /**
   * Cria automaticamente um link para um recurso
   */
  static createLinkForResource(params: {
    title: string;
    slug: string;
    resourceType: 'page' | 'article' | 'file' | 'image' | 'pdf';
    resourceId: string;
    folder?: string;
    description?: string;
    metadata?: any;
    createdBy?: string;
  }): Link {
    const url = this.generateResourceUrl(
      params.resourceType,
      params.slug,
      params.folder
    );

    const link: Link = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: params.title,
      url: url,
      type: 'internal',
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourcePath: params.folder,
      slug: params.slug,
      status: 'active',
      description: params.description || `Link para ${params.title}`,
      tags: [params.resourceType, params.folder || 'root'],
      metadata: {
        ...params.metadata,
        folder: params.folder,
        createdBy: params.createdBy
      },
      analytics: {
        clickCount: 0
      },
      validation: {
        lastChecked: new Date().toISOString(),
        lastValidAt: new Date().toISOString(),
        checkFrequency: 24, // 24 horas
        autoCheck: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveLink(link);
    return link;
  }

  /**
   * Cria link externo
   */
  static createExternalLink(params: {
    title: string;
    url: string;
    description?: string;
    tags?: string[];
    autoCheck?: boolean;
    checkFrequency?: number;
  }): Link {
    const link: Link = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: params.title,
      url: params.url,
      type: 'external',
      resourceType: 'custom',
      status: 'pending', // Será verificado
      description: params.description,
      tags: params.tags || ['external'],
      analytics: {
        clickCount: 0
      },
      validation: {
        lastChecked: new Date().toISOString(),
        checkFrequency: params.checkFrequency || 24,
        autoCheck: params.autoCheck !== false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveLink(link);
    
    // Verifica o link imediatamente
    if (link.validation?.autoCheck) {
      this.checkExternalLink(link.id);
    }

    return link;
  }

  /**
   * Salva ou atualiza um link
   */
  static saveLink(link: Link): void {
    const links = this.getAllLinks();
    const index = links.findIndex(l => l.id === link.id);
    
    link.updatedAt = new Date().toISOString();
    
    if (index >= 0) {
      links[index] = link;
    } else {
      links.push(link);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(links));
  }

  /**
   * Obtém todos os links
   */
  static getAllLinks(): Link[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing links:', error);
      return [];
    }
  }

  /**
   * Obtém link por ID
   */
  static getLinkById(id: string): Link | null {
    const links = this.getAllLinks();
    return links.find(l => l.id === id) || null;
  }

  /**
   * Obtém links por recurso
   */
  static getLinksByResource(resourceId: string): Link[] {
    const links = this.getAllLinks();
    return links.filter(l => l.resourceId === resourceId);
  }

  /**
   * Obtém links por tipo
   */
  static getLinksByType(type: 'internal' | 'external'): Link[] {
    const links = this.getAllLinks();
    return links.filter(l => l.type === type);
  }

  /**
   * Obtém links por status
   */
  static getLinksByStatus(status: Link['status']): Link[] {
    const links = this.getAllLinks();
    return links.filter(l => l.status === status);
  }

  /**
   * Busca links
   */
  static searchLinks(query: string): Link[] {
    const links = this.getAllLinks();
    const lowerQuery = query.toLowerCase();
    
    return links.filter(link => 
      link.title.toLowerCase().includes(lowerQuery) ||
      link.url.toLowerCase().includes(lowerQuery) ||
      link.description?.toLowerCase().includes(lowerQuery) ||
      link.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Atualiza link quando recurso é renomeado/movido
   */
  static updateLinkForResource(params: {
    resourceId: string;
    newSlug?: string;
    newTitle?: string;
    newFolder?: string;
  }): void {
    const links = this.getAllLinks();
    let updated = false;

    links.forEach(link => {
      if (link.resourceId === params.resourceId) {
        if (params.newSlug && link.slug !== params.newSlug) {
          link.slug = params.newSlug;
          link.url = this.generateResourceUrl(
            link.resourceType,
            params.newSlug,
            params.newFolder || link.metadata?.folder
          );
          updated = true;
        }

        if (params.newTitle && link.title !== params.newTitle) {
          link.title = params.newTitle;
          updated = true;
        }

        if (params.newFolder !== undefined && link.metadata?.folder !== params.newFolder) {
          if (!link.metadata) link.metadata = {};
          link.metadata.folder = params.newFolder;
          link.resourcePath = params.newFolder;
          link.url = this.generateResourceUrl(
            link.resourceType,
            link.slug || '',
            params.newFolder
          );
          link.tags = link.tags?.filter(t => !t.startsWith('folder:')).concat([`folder:${params.newFolder}`]);
          updated = true;
        }

        if (updated) {
          link.updatedAt = new Date().toISOString();
        }
      }
    });

    if (updated) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(links));
    }
  }

  /**
   * Deleta link
   */
  static deleteLink(id: string): void {
    const links = this.getAllLinks();
    const filtered = links.filter(l => l.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));

    // Remove referências
    this.deleteAllReferences(id);
  }

  /**
   * Deleta links de um recurso
   */
  static deleteLinksForResource(resourceId: string): void {
    const links = this.getAllLinks();
    const filtered = links.filter(l => l.resourceId !== resourceId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Verifica link externo
   */
  static async checkExternalLink(linkId: string): Promise<LinkCheckResult> {
    const link = this.getLinkById(linkId);
    if (!link || link.type !== 'external') {
      throw new Error('Link not found or not external');
    }

    const result: LinkCheckResult = {
      linkId,
      status: 'active',
      checkedAt: new Date().toISOString()
    };

    try {
      // Em produção real, você faria uma requisição HTTP
      // Aqui simulamos uma verificação
      const response = await this.simulateLinkCheck(link.url);
      
      result.statusCode = response.status;
      
      if (response.status >= 200 && response.status < 300) {
        result.status = 'active';
        link.status = 'active';
        if (!link.validation) link.validation = {} as any;
        link.validation.lastValidAt = result.checkedAt;
      } else if (response.status >= 300 && response.status < 400) {
        result.status = 'redirect';
        result.redirectTo = response.redirectTo;
        link.status = 'redirect';
        link.redirectTo = response.redirectTo;
      } else {
        result.status = 'broken';
        result.errorMessage = `HTTP ${response.status}`;
        link.status = 'broken';
        if (link.validation) {
          link.validation.errorMessage = result.errorMessage;
        }
      }
    } catch (error: any) {
      result.status = 'broken';
      result.errorMessage = error.message || 'Network error';
      link.status = 'broken';
      if (link.validation) {
        link.validation.errorMessage = result.errorMessage;
      }
    }

    if (link.validation) {
      link.validation.lastChecked = result.checkedAt;
    }
    this.saveLink(link);

    return result;
  }

  /**
   * Simula verificação de link (em produção, faria fetch real)
   */
  private static async simulateLinkCheck(url: string): Promise<{
    status: number;
    redirectTo?: string;
  }> {
    // Simulação: Links com "broken" no URL são considerados quebrados
    if (url.includes('broken')) {
      return { status: 404 };
    }
    // Links com "redirect" são considerados redirecionamentos
    if (url.includes('redirect')) {
      return { status: 301, redirectTo: url + '-new' };
    }
    // Outros são considerados válidos
    return { status: 200 };
  }

  /**
   * Verifica todos os links externos
   */
  static async checkAllExternalLinks(): Promise<LinkCheckResult[]> {
    const externalLinks = this.getLinksByType('external');
    const results: LinkCheckResult[] = [];

    for (const link of externalLinks) {
      if (link.validation?.autoCheck) {
        try {
          const result = await this.checkExternalLink(link.id);
          results.push(result);
        } catch (error) {
          console.error(`Error checking link ${link.id}:`, error);
        }
      }
    }

    return results;
  }

  /**
   * Obtém links que precisam ser verificados
   */
  static getLinksNeedingCheck(): Link[] {
    const links = this.getAllLinks();
    const now = new Date();

    return links.filter(link => {
      if (link.type !== 'external' || !link.validation?.autoCheck) {
        return false;
      }

      const lastChecked = new Date(link.validation.lastChecked);
      const hoursSinceCheck = (now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60);
      
      return hoursSinceCheck >= (link.validation.checkFrequency || 24);
    });
  }

  /**
   * Registra referência de link (onde o link é usado)
   */
  static addLinkReference(reference: LinkReference): void {
    const refs = this.getAllReferences();
    const existing = refs.find(
      r => r.linkId === reference.linkId && r.fromResource === reference.fromResource
    );

    if (existing) {
      existing.occurrences = reference.occurrences;
      existing.locations = reference.locations;
    } else {
      refs.push(reference);
    }

    localStorage.setItem(this.REFERENCES_KEY, JSON.stringify(refs));
  }

  /**
   * Obtém todas as referências
   */
  static getAllReferences(): LinkReference[] {
    const stored = localStorage.getItem(this.REFERENCES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Obtém referências de um link
   */
  static getLinkReferences(linkId: string): LinkReference[] {
    const refs = this.getAllReferences();
    return refs.filter(r => r.linkId === linkId);
  }

  /**
   * Deleta referências de um link
   */
  static deleteAllReferences(linkId: string): void {
    const refs = this.getAllReferences();
    const filtered = refs.filter(r => r.linkId !== linkId);
    localStorage.setItem(this.REFERENCES_KEY, JSON.stringify(filtered));
  }

  /**
   * Registra clique em link (analytics)
   */
  static recordLinkClick(linkId: string, referrer?: string): void {
    const link = this.getLinkById(linkId);
    if (!link) return;

    if (!link.analytics) {
      link.analytics = { clickCount: 0 };
    }

    link.analytics.clickCount++;
    link.analytics.lastClicked = new Date().toISOString();
    
    if (referrer) {
      if (!link.analytics.referrers) {
        link.analytics.referrers = [];
      }
      if (!link.analytics.referrers.includes(referrer)) {
        link.analytics.referrers.push(referrer);
      }
    }

    this.saveLink(link);
  }

  /**
   * Obtém estatísticas de links
   */
  static getStatistics() {
    const links = this.getAllLinks();
    const refs = this.getAllReferences();

    return {
      total: links.length,
      internal: links.filter(l => l.type === 'internal').length,
      external: links.filter(l => l.type === 'external').length,
      active: links.filter(l => l.status === 'active').length,
      broken: links.filter(l => l.status === 'broken').length,
      pending: links.filter(l => l.status === 'pending').length,
      redirect: links.filter(l => l.status === 'redirect').length,
      byResourceType: {
        page: links.filter(l => l.resourceType === 'page').length,
        article: links.filter(l => l.resourceType === 'article').length,
        file: links.filter(l => l.resourceType === 'file').length,
        image: links.filter(l => l.resourceType === 'image').length,
        pdf: links.filter(l => l.resourceType === 'pdf').length,
        custom: links.filter(l => l.resourceType === 'custom').length
      },
      totalClicks: links.reduce((sum, l) => sum + (l.analytics?.clickCount || 0), 0),
      totalReferences: refs.length,
      needingCheck: this.getLinksNeedingCheck().length
    };
  }

  /**
   * Exporta links para JSON
   */
  static exportLinks(): string {
    const links = this.getAllLinks();
    const refs = this.getAllReferences();
    
    return JSON.stringify({
      links,
      references: refs,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * Importa links de JSON
   */
  static importLinks(json: string): { success: boolean; count: number; errors: string[] } {
    const errors: string[] = [];
    let count = 0;

    try {
      const data = JSON.parse(json);
      
      if (data.links && Array.isArray(data.links)) {
        const currentLinks = this.getAllLinks();
        
        data.links.forEach((link: Link) => {
          // Verifica se já existe
          if (!currentLinks.find(l => l.id === link.id)) {
            currentLinks.push(link);
            count++;
          } else {
            errors.push(`Link ${link.id} já existe`);
          }
        });

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentLinks));
      }

      if (data.references && Array.isArray(data.references)) {
        const currentRefs = this.getAllReferences();
        currentRefs.push(...data.references);
        localStorage.setItem(this.REFERENCES_KEY, JSON.stringify(currentRefs));
      }

      return { success: true, count, errors };
    } catch (error: any) {
      return { success: false, count: 0, errors: [error.message] };
    }
  }

  /**
   * Limpa links órfãos (sem recurso correspondente)
   */
  static cleanupOrphanLinks(): number {
    // Esta função seria implementada com verificação real dos recursos
    // Por ora, retorna 0
    return 0;
  }
}
