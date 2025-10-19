/**
 * Serviço de Gerenciamento de Multisites
 * Permite gerenciar múltiplos sites a partir de uma única instalação
 * 
 * NOTA: Este é um exemplo de implementação. Não está ativo por padrão.
 * Para ativar, siga as instruções em ANALISE-MULTISITES-VIABILIDADE.md
 */

export interface Site {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    favicon?: string;
  };
  settings: {
    language: string;
    timezone: string;
    dateFormat: string;
    siteTitle: string;
    siteDescription: string;
    homepage?: string;
  };
  features: {
    enableBlog: boolean;
    enablePages: boolean;
    enableMedia: boolean;
    enableComments: boolean;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface SiteStats {
  pages: number;
  articles: number;
  files: number;
  users: number;
  storage: number;
}

class MultisiteService {
  private currentSiteId: string | null = null;
  private readonly STORAGE_KEY = 'multisite-sites';
  private readonly CURRENT_SITE_KEY = 'multisite-current';

  /**
   * Inicializa o serviço e cria site padrão se necessário
   */
  initialize(): void {
    const sites = this.getSites();
    if (sites.length === 0) {
      // Criar site padrão
      const defaultSite = this.createSite({
        name: 'Site Principal',
        slug: 'principal',
        description: 'Site principal do Portal CMS',
        settings: {
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          dateFormat: 'DD/MM/YYYY',
          siteTitle: 'Portal CMS',
          siteDescription: 'Sistema de Gerenciamento de Conteúdo'
        }
      });
      this.setCurrentSite(defaultSite.id);
    } else {
      // Carregar último site usado
      const lastSiteId = localStorage.getItem(this.CURRENT_SITE_KEY);
      if (lastSiteId && sites.find(s => s.id === lastSiteId)) {
        this.currentSiteId = lastSiteId;
      } else {
        this.currentSiteId = sites[0].id;
      }
    }
  }

  /**
   * Cria um novo site
   */
  createSite(data: Partial<Site>): Site {
    const sites = this.getSites();
    
    // Gerar slug único
    let slug = data.slug || this.slugify(data.name || 'novo-site');
    let counter = 1;
    while (sites.some(s => s.slug === slug)) {
      slug = `${data.slug || this.slugify(data.name || 'novo-site')}-${counter}`;
      counter++;
    }

    const newSite: Site = {
      id: `site-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name || 'Novo Site',
      slug,
      domain: data.domain,
      description: data.description || '',
      status: data.status || 'active',
      theme: {
        primaryColor: data.theme?.primaryColor || '#667eea',
        secondaryColor: data.theme?.secondaryColor || '#764ba2',
        logo: data.theme?.logo,
        favicon: data.theme?.favicon
      },
      settings: {
        language: data.settings?.language || 'pt-BR',
        timezone: data.settings?.timezone || 'America/Sao_Paulo',
        dateFormat: data.settings?.dateFormat || 'DD/MM/YYYY',
        siteTitle: data.settings?.siteTitle || data.name || 'Novo Site',
        siteDescription: data.settings?.siteDescription || '',
        homepage: data.settings?.homepage
      },
      features: {
        enableBlog: data.features?.enableBlog ?? true,
        enablePages: data.features?.enablePages ?? true,
        enableMedia: data.features?.enableMedia ?? true,
        enableComments: data.features?.enableComments ?? false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy
    };

    sites.push(newSite);
    this.saveSites(sites);

    return newSite;
  }

  /**
   * Obtém todos os sites
   */
  getSites(): Site[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Erro ao carregar sites:', error);
      return [];
    }
  }

  /**
   * Obtém um site pelo ID
   */
  getSiteById(id: string): Site | null {
    const sites = this.getSites();
    return sites.find(s => s.id === id) || null;
  }

  /**
   * Obtém um site pelo slug
   */
  getSiteBySlug(slug: string): Site | null {
    const sites = this.getSites();
    return sites.find(s => s.slug === slug) || null;
  }

  /**
   * Obtém um site pelo domínio
   */
  getSiteByDomain(domain: string): Site | null {
    const sites = this.getSites();
    return sites.find(s => s.domain === domain) || null;
  }

  /**
   * Atualiza um site
   */
  updateSite(id: string, data: Partial<Site>): Site | null {
    const sites = this.getSites();
    const index = sites.findIndex(s => s.id === id);
    
    if (index === -1) return null;

    sites[index] = {
      ...sites[index],
      ...data,
      id: sites[index].id, // Não permitir mudança de ID
      updatedAt: new Date().toISOString()
    };

    this.saveSites(sites);
    return sites[index];
  }

  /**
   * Deleta um site (e todos os seus dados)
   */
  deleteSite(id: string): boolean {
    const sites = this.getSites();
    const index = sites.findIndex(s => s.id === id);
    
    if (index === -1) return false;

    // Não permitir deletar se for o último site
    if (sites.length === 1) {
      throw new Error('Não é possível deletar o último site');
    }

    // Deletar dados do site
    this.deleteSiteData(id);

    // Remover da lista
    sites.splice(index, 1);
    this.saveSites(sites);

    // Se era o site atual, mudar para outro
    if (this.currentSiteId === id) {
      this.setCurrentSite(sites[0].id);
    }

    return true;
  }

  /**
   * Define o site atual
   */
  setCurrentSite(siteId: string): void {
    const site = this.getSiteById(siteId);
    if (!site) {
      throw new Error(`Site não encontrado: ${siteId}`);
    }

    this.currentSiteId = siteId;
    localStorage.setItem(this.CURRENT_SITE_KEY, siteId);

    // Disparar evento para componentes reagirem
    window.dispatchEvent(new CustomEvent('siteChanged', { 
      detail: { siteId, site } 
    }));
  }

  /**
   * Obtém o site atual
   */
  getCurrentSite(): Site | null {
    if (!this.currentSiteId) return null;
    return this.getSiteById(this.currentSiteId);
  }

  /**
   * Obtém o ID do site atual
   */
  getCurrentSiteId(): string | null {
    return this.currentSiteId;
  }

  /**
   * Gera chave de storage com namespace do site
   */
  getStorageKey(key: string): string {
    const siteId = this.getCurrentSiteId();
    if (!siteId) return key;
    return `site-${siteId}-${key}`;
  }

  /**
   * Obtém estatísticas de um site
   */
  getSiteStats(siteId: string): SiteStats {
    const stats: SiteStats = {
      pages: 0,
      articles: 0,
      files: 0,
      users: 0,
      storage: 0
    };

    // Páginas
    const pagesKey = `site-${siteId}-pages`;
    const pages = localStorage.getItem(pagesKey);
    if (pages) {
      stats.pages = JSON.parse(pages).length;
      stats.storage += pages.length;
    }

    // Artigos
    const articlesKey = `site-${siteId}-articles`;
    const articles = localStorage.getItem(articlesKey);
    if (articles) {
      stats.articles = JSON.parse(articles).length;
      stats.storage += articles.length;
    }

    // Arquivos
    const filesKey = `site-${siteId}-files`;
    const files = localStorage.getItem(filesKey);
    if (files) {
      stats.files = JSON.parse(files).length;
      stats.storage += files.length;
    }

    return stats;
  }

  /**
   * Duplica um site
   */
  duplicateSite(sourceId: string, newName: string): Site {
    const sourceSite = this.getSiteById(sourceId);
    if (!sourceSite) {
      throw new Error('Site fonte não encontrado');
    }

    // Criar novo site
    const newSite = this.createSite({
      ...sourceSite,
      name: newName,
      slug: this.slugify(newName)
    });

    // Copiar dados
    this.copySiteData(sourceId, newSite.id);

    return newSite;
  }

  /**
   * Exporta configuração de um site
   */
  exportSite(siteId: string): string {
    const site = this.getSiteById(siteId);
    if (!site) throw new Error('Site não encontrado');

    const exportData = {
      site,
      data: this.getSiteData(siteId),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Importa configuração de um site
   */
  importSite(jsonData: string): Site {
    const data = JSON.parse(jsonData);
    
    // Criar site
    const newSite = this.createSite(data.site);

    // Importar dados
    if (data.data) {
      Object.entries(data.data).forEach(([key, value]) => {
        const storageKey = `site-${newSite.id}-${key}`;
        localStorage.setItem(storageKey, JSON.stringify(value));
      });
    }

    return newSite;
  }

  // Métodos privados

  private saveSites(sites: Site[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sites));
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private deleteSiteData(siteId: string): void {
    const keys = Object.keys(localStorage);
    const sitePrefix = `site-${siteId}-`;
    
    keys.forEach(key => {
      if (key.startsWith(sitePrefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  private copySiteData(sourceId: string, targetId: string): void {
    const keys = Object.keys(localStorage);
    const sourcePrefix = `site-${sourceId}-`;
    
    keys.forEach(key => {
      if (key.startsWith(sourcePrefix)) {
        const suffix = key.substring(sourcePrefix.length);
        const targetKey = `site-${targetId}-${suffix}`;
        const value = localStorage.getItem(key);
        if (value) {
          localStorage.setItem(targetKey, value);
        }
      }
    });
  }

  private getSiteData(siteId: string): Record<string, any> {
    const data: Record<string, any> = {};
    const keys = Object.keys(localStorage);
    const sitePrefix = `site-${siteId}-`;
    
    keys.forEach(key => {
      if (key.startsWith(sitePrefix)) {
        const suffix = key.substring(sitePrefix.length);
        const value = localStorage.getItem(key);
        if (value) {
          try {
            data[suffix] = JSON.parse(value);
          } catch {
            data[suffix] = value;
          }
        }
      }
    });

    return data;
  }
}

// Singleton instance
export const multisiteService = new MultisiteService();

// Hook para usar em componentes React
import { useState, useEffect } from 'react';

export function useMultisite() {
  const [currentSite, setCurrentSite] = useState<Site | null>(
    multisiteService.getCurrentSite()
  );

  useEffect(() => {
    const handleSiteChange = (event: CustomEvent) => {
      setCurrentSite(event.detail.site);
    };

    window.addEventListener('siteChanged', handleSiteChange as EventListener);
    
    return () => {
      window.removeEventListener('siteChanged', handleSiteChange as EventListener);
    };
  }, []);

  return {
    currentSite,
    sites: multisiteService.getSites(),
    switchSite: (siteId: string) => multisiteService.setCurrentSite(siteId),
    createSite: (data: Partial<Site>) => multisiteService.createSite(data),
    updateSite: (id: string, data: Partial<Site>) => multisiteService.updateSite(id, data),
    deleteSite: (id: string) => multisiteService.deleteSite(id),
    getStorageKey: (key: string) => multisiteService.getStorageKey(key)
  };
}
