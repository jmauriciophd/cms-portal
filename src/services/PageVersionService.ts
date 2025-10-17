/**
 * PageVersionService - Serviço para gerenciamento de versões de páginas
 * 
 * Funcionalidades:
 * - Upload/Download de páginas
 * - Versionamento automático
 * - Detecção de conflitos
 * - Histórico completo
 * - Restauração de versões
 * - Validação e sanitização
 */

import { SecurityService } from './SecurityService';
import { AuditService } from './AuditService';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  folder?: string;
  template?: string;
  meta?: {
    robots?: string;
    description?: string;
    keywords?: string;
  };
  author?: string;
  authorId?: string;
}

export interface PageVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  data: PageData;
  description: string;
  author: string;
  authorId: string;
  createdAt: string;
  fileSize: number;
  checksum: string;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

export interface PageExport {
  version: string;
  exportedAt: string;
  exportedBy: string;
  page: PageData;
  metadata: {
    originalId: string;
    versionNumber: number;
    checksum: string;
  };
}

export interface UploadResult {
  success: boolean;
  action: 'created' | 'updated' | 'replaced' | 'cancelled';
  page?: PageData;
  version?: PageVersion;
  conflict?: {
    existingPage: PageData;
    reason: string;
  };
  error?: string;
}

export interface VersionHistoryEntry {
  version: PageVersion;
  canRestore: boolean;
  canDelete: boolean;
  isCurrent: boolean;
}

// ============================================================================
// SERVIÇO PRINCIPAL
// ============================================================================

class PageVersionServiceClass {
  private readonly STORAGE_KEY_PAGES = 'pages';
  private readonly STORAGE_KEY_VERSIONS = 'page_versions';
  private readonly EXPORT_VERSION = '1.0.0';
  private readonly MAX_VERSIONS_PER_PAGE = 50;

  // ==========================================================================
  // DOWNLOAD DE PÁGINAS
  // ==========================================================================

  /**
   * Exporta uma página para download
   */
  exportPage(pageId: string): void {
    const page = this.getPageById(pageId);
    if (!page) {
      throw new Error('Página não encontrada');
    }

    const versions = this.getPageVersions(pageId);
    const currentVersion = versions.length > 0 ? versions[0] : null;
    const user = SecurityService.getCurrentUser();

    const exportData: PageExport = {
      version: this.EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      exportedBy: user?.name || 'Desconhecido',
      page,
      metadata: {
        originalId: page.id,
        versionNumber: currentVersion?.versionNumber || 1,
        checksum: this.calculateChecksum(page)
      }
    };

    // Criar arquivo JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Criar nome de arquivo seguro
    const safeSlug = this.sanitizeFileName(page.slug || page.title);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `page-${safeSlug}-${timestamp}.json`;
    
    // Download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    // Auditoria
    AuditService.log({
      action: 'page_exported',
      userId: user?.id || 'unknown',
      details: {
        pageId: page.id,
        pageTitle: page.title,
        filename
      },
      severity: 'low'
    });
  }

  /**
   * Exporta múltiplas páginas
   */
  exportPages(pageIds: string[]): void {
    const user = SecurityService.getCurrentUser();
    const pages = pageIds.map(id => this.getPageById(id)).filter(Boolean) as PageData[];

    if (pages.length === 0) {
      throw new Error('Nenhuma página válida para exportar');
    }

    const exportData = {
      version: this.EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      exportedBy: user?.name || 'Desconhecido',
      pages: pages.map(page => ({
        page,
        metadata: {
          originalId: page.id,
          checksum: this.calculateChecksum(page)
        }
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `pages-export-${timestamp}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    AuditService.log({
      action: 'pages_exported',
      userId: user?.id || 'unknown',
      details: {
        count: pages.length,
        pageIds: pageIds,
        filename
      },
      severity: 'low'
    });
  }

  // ==========================================================================
  // UPLOAD DE PÁGINAS
  // ==========================================================================

  /**
   * Processa upload de arquivo de página
   */
  async uploadPage(file: File): Promise<UploadResult> {
    try {
      // Validações básicas
      if (!file.name.endsWith('.json')) {
        return {
          success: false,
          action: 'cancelled',
          error: 'Formato de arquivo inválido. Use apenas arquivos .json'
        };
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        return {
          success: false,
          action: 'cancelled',
          error: 'Arquivo muito grande. Tamanho máximo: 10MB'
        };
      }

      // Ler conteúdo do arquivo
      const content = await this.readFileContent(file);
      const importData = JSON.parse(content);

      // Validar estrutura
      const validation = this.validateImportData(importData);
      if (!validation.valid) {
        return {
          success: false,
          action: 'cancelled',
          error: validation.error
        };
      }

      // Extrair página do formato de exportação
      const pageData = importData.page || importData;

      // Sanitizar dados
      const sanitizedPage = this.sanitizePageData(pageData);

      // Verificar se página já existe
      const existingPage = this.findPageBySlug(sanitizedPage.slug);

      if (existingPage) {
        // Conflito detectado
        return {
          success: false,
          action: 'cancelled',
          conflict: {
            existingPage,
            reason: 'Uma página com o mesmo slug já existe'
          }
        };
      }

      // Criar nova página
      const result = this.createPageFromImport(sanitizedPage);

      return {
        success: true,
        action: 'created',
        page: result.page,
        version: result.version
      };

    } catch (error: any) {
      return {
        success: false,
        action: 'cancelled',
        error: error.message || 'Erro ao processar arquivo'
      };
    }
  }

  /**
   * Upload com opção de substituir página existente
   */
  async uploadPageWithReplace(file: File, replaceExisting: boolean, existingPageId?: string): Promise<UploadResult> {
    try {
      const content = await this.readFileContent(file);
      const importData = JSON.parse(content);
      const validation = this.validateImportData(importData);

      if (!validation.valid) {
        return {
          success: false,
          action: 'cancelled',
          error: validation.error
        };
      }

      const pageData = importData.page || importData;
      const sanitizedPage = this.sanitizePageData(pageData);

      if (replaceExisting && existingPageId) {
        // Substituir página existente
        const result = this.replaceExistingPage(existingPageId, sanitizedPage);
        return {
          success: true,
          action: 'replaced',
          page: result.page,
          version: result.version
        };
      } else {
        // Criar nova página com novo ID
        sanitizedPage.id = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const result = this.createPageFromImport(sanitizedPage);
        return {
          success: true,
          action: 'created',
          page: result.page,
          version: result.version
        };
      }

    } catch (error: any) {
      return {
        success: false,
        action: 'cancelled',
        error: error.message || 'Erro ao processar arquivo'
      };
    }
  }

  // ==========================================================================
  // GERENCIAMENTO DE VERSÕES
  // ==========================================================================

  /**
   * Cria uma nova versão da página
   */
  createVersion(pageId: string, description: string = 'Atualização automática'): PageVersion {
    const page = this.getPageById(pageId);
    if (!page) {
      throw new Error('Página não encontrada');
    }

    const user = SecurityService.getCurrentUser();
    const versions = this.getPageVersions(pageId);
    const latestVersionNumber = versions.length > 0 ? versions[0].versionNumber : 0;

    const version: PageVersion = {
      id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pageId,
      versionNumber: latestVersionNumber + 1,
      data: JSON.parse(JSON.stringify(page)),
      description,
      author: user?.name || 'Sistema',
      authorId: user?.id || 'system',
      createdAt: new Date().toISOString(),
      fileSize: JSON.stringify(page).length,
      checksum: this.calculateChecksum(page),
      changes: versions.length > 0 ? this.calculateChanges(versions[0].data, page) : []
    };

    // Salvar versão
    const allVersions = this.getAllVersions();
    allVersions.push(version);

    // Limitar número de versões
    const pageVersions = allVersions.filter(v => v.pageId === pageId);
    if (pageVersions.length > this.MAX_VERSIONS_PER_PAGE) {
      const versionsToKeep = pageVersions.slice(0, this.MAX_VERSIONS_PER_PAGE);
      const versionsToRemove = pageVersions.slice(this.MAX_VERSIONS_PER_PAGE);
      
      const finalVersions = allVersions.filter(v => 
        v.pageId !== pageId || versionsToKeep.some(keep => keep.id === v.id)
      );
      
      localStorage.setItem(this.STORAGE_KEY_VERSIONS, JSON.stringify(finalVersions));
    } else {
      localStorage.setItem(this.STORAGE_KEY_VERSIONS, JSON.stringify(allVersions));
    }

    // Auditoria
    AuditService.log({
      action: 'page_version_created',
      userId: user?.id || 'system',
      details: {
        pageId,
        versionNumber: version.versionNumber,
        description
      },
      severity: 'low'
    });

    return version;
  }

  /**
   * Obtém histórico de versões de uma página
   */
  getVersionHistory(pageId: string): VersionHistoryEntry[] {
    const versions = this.getPageVersions(pageId);
    const user = SecurityService.getCurrentUser();

    return versions.map((version, index) => ({
      version,
      canRestore: index > 0, // Não pode restaurar a versão atual
      canDelete: index > 0 && versions.length > 2, // Manter pelo menos 2 versões
      isCurrent: index === 0
    }));
  }

  /**
   * Restaura uma versão específica
   */
  restoreVersion(pageId: string, versionId: string): { page: PageData; newVersion: PageVersion } {
    const version = this.getVersionById(versionId);
    if (!version || version.pageId !== pageId) {
      throw new Error('Versão não encontrada');
    }

    // Criar backup da versão atual antes de restaurar
    const currentPage = this.getPageById(pageId);
    if (currentPage) {
      this.createVersion(pageId, `Backup antes de restaurar v${version.versionNumber}`);
    }

    // Restaurar dados da versão
    const restoredPage: PageData = {
      ...version.data,
      id: pageId, // Manter o mesmo ID
      updatedAt: new Date().toISOString()
    };

    // Atualizar página
    const pages = this.getAllPages();
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex >= 0) {
      pages[pageIndex] = restoredPage;
      localStorage.setItem(this.STORAGE_KEY_PAGES, JSON.stringify(pages));
    }

    // Criar nova versão pós-restauração
    const newVersion = this.createVersion(pageId, `Restaurado da versão ${version.versionNumber}`);

    const user = SecurityService.getCurrentUser();
    AuditService.log({
      action: 'page_version_restored',
      userId: user?.id || 'system',
      details: {
        pageId,
        restoredVersionNumber: version.versionNumber,
        newVersionNumber: newVersion.versionNumber
      },
      severity: 'medium'
    });

    return { page: restoredPage, newVersion };
  }

  /**
   * Deleta uma versão específica
   */
  deleteVersion(versionId: string): boolean {
    const allVersions = this.getAllVersions();
    const version = allVersions.find(v => v.id === versionId);

    if (!version) {
      return false;
    }

    // Não permitir deletar a versão atual
    const pageVersions = allVersions.filter(v => v.pageId === version.pageId)
      .sort((a, b) => b.versionNumber - a.versionNumber);

    if (pageVersions[0].id === versionId) {
      throw new Error('Não é possível deletar a versão atual');
    }

    // Manter pelo menos 2 versões
    if (pageVersions.length <= 2) {
      throw new Error('Deve manter pelo menos 2 versões');
    }

    // Remover versão
    const updatedVersions = allVersions.filter(v => v.id !== versionId);
    localStorage.setItem(this.STORAGE_KEY_VERSIONS, JSON.stringify(updatedVersions));

    const user = SecurityService.getCurrentUser();
    AuditService.log({
      action: 'page_version_deleted',
      userId: user?.id || 'system',
      details: {
        versionId,
        pageId: version.pageId,
        versionNumber: version.versionNumber
      },
      severity: 'medium'
    });

    return true;
  }

  /**
   * Compara duas versões
   */
  compareVersions(versionId1: string, versionId2: string): Array<{ field: string; oldValue: any; newValue: any }> {
    const v1 = this.getVersionById(versionId1);
    const v2 = this.getVersionById(versionId2);

    if (!v1 || !v2) {
      throw new Error('Versão não encontrada');
    }

    return this.calculateChanges(v1.data, v2.data);
  }

  // ==========================================================================
  // UTILITÁRIOS
  // ==========================================================================

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }

  private validateImportData(data: any): { valid: boolean; error?: string } {
    if (!data) {
      return { valid: false, error: 'Arquivo vazio ou inválido' };
    }

    // Verificar se é exportação válida
    const page = data.page || data;

    if (!page.title || typeof page.title !== 'string') {
      return { valid: false, error: 'Campo "title" é obrigatório' };
    }

    if (!page.slug || typeof page.slug !== 'string') {
      return { valid: false, error: 'Campo "slug" é obrigatório' };
    }

    if (!page.content || typeof page.content !== 'string') {
      return { valid: false, error: 'Campo "content" é obrigatório' };
    }

    return { valid: true };
  }

  private sanitizePageData(data: any): PageData {
    const user = SecurityService.getCurrentUser();
    
    return {
      id: data.id || `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: this.sanitizeString(data.title),
      slug: this.sanitizeSlug(data.slug),
      content: data.content, // HTML é mantido
      excerpt: data.excerpt ? this.sanitizeString(data.excerpt) : undefined,
      featuredImage: data.featuredImage,
      status: ['draft', 'published', 'scheduled'].includes(data.status) ? data.status : 'draft',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledDate: data.scheduledDate,
      folder: data.folder || '',
      template: data.template,
      meta: data.meta,
      author: user?.name,
      authorId: user?.id
    };
  }

  private sanitizeString(str: string): string {
    return str.trim().replace(/<script[^>]*>.*?<\/script>/gi, '');
  }

  private sanitizeSlug(slug: string): string {
    return slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }

  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private calculateChanges(oldData: any, newData: any): Array<{ field: string; oldValue: any; newValue: any }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    const keys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

    keys.forEach(key => {
      const oldValue = oldData?.[key];
      const newValue = newData?.[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: key, oldValue, newValue });
      }
    });

    return changes;
  }

  private createPageFromImport(pageData: PageData): { page: PageData; version: PageVersion } {
    // Adicionar página
    const pages = this.getAllPages();
    pages.push(pageData);
    localStorage.setItem(this.STORAGE_KEY_PAGES, JSON.stringify(pages));

    // Criar versão inicial
    const version = this.createVersion(pageData.id, 'Importado do arquivo');

    const user = SecurityService.getCurrentUser();
    AuditService.log({
      action: 'page_imported',
      userId: user?.id || 'system',
      details: {
        pageId: pageData.id,
        pageTitle: pageData.title,
        slug: pageData.slug
      },
      severity: 'medium'
    });

    return { page: pageData, version };
  }

  private replaceExistingPage(pageId: string, newData: PageData): { page: PageData; version: PageVersion } {
    const pages = this.getAllPages();
    const pageIndex = pages.findIndex(p => p.id === pageId);

    if (pageIndex < 0) {
      throw new Error('Página não encontrada');
    }

    // Criar versão de backup antes de substituir
    this.createVersion(pageId, 'Backup antes de importação');

    // Atualizar página mantendo o ID original
    const updatedPage: PageData = {
      ...newData,
      id: pageId,
      createdAt: pages[pageIndex].createdAt, // Manter data de criação original
      updatedAt: new Date().toISOString()
    };

    pages[pageIndex] = updatedPage;
    localStorage.setItem(this.STORAGE_KEY_PAGES, JSON.stringify(pages));

    // Criar nova versão
    const version = this.createVersion(pageId, 'Substituído por importação');

    const user = SecurityService.getCurrentUser();
    AuditService.log({
      action: 'page_replaced_import',
      userId: user?.id || 'system',
      details: {
        pageId,
        pageTitle: updatedPage.title
      },
      severity: 'high'
    });

    return { page: updatedPage, version };
  }

  // Getters privados
  private getAllPages(): PageData[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_PAGES);
    return stored ? JSON.parse(stored) : [];
  }

  private getPageById(id: string): PageData | undefined {
    return this.getAllPages().find(p => p.id === id);
  }

  private findPageBySlug(slug: string): PageData | undefined {
    return this.getAllPages().find(p => p.slug === slug);
  }

  private getAllVersions(): PageVersion[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_VERSIONS);
    return stored ? JSON.parse(stored) : [];
  }

  private getPageVersions(pageId: string): PageVersion[] {
    return this.getAllVersions()
      .filter(v => v.pageId === pageId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  private getVersionById(id: string): PageVersion | undefined {
    return this.getAllVersions().find(v => v.id === id);
  }

  /**
   * Obtém estatísticas de versionamento
   */
  getStatistics(): {
    totalPages: number;
    totalVersions: number;
    averageVersionsPerPage: number;
    totalSize: number;
  } {
    const pages = this.getAllPages();
    const versions = this.getAllVersions();
    const totalSize = versions.reduce((sum, v) => sum + v.fileSize, 0);

    return {
      totalPages: pages.length,
      totalVersions: versions.length,
      averageVersionsPerPage: pages.length > 0 ? versions.length / pages.length : 0,
      totalSize
    };
  }

  /**
   * Limpa versões antigas mantendo as últimas N versões de cada página
   */
  cleanOldVersions(keepLast: number = 10): number {
    const allVersions = this.getAllVersions();
    const pageGroups = new Map<string, PageVersion[]>();

    // Agrupar por página
    allVersions.forEach(version => {
      const group = pageGroups.get(version.pageId) || [];
      group.push(version);
      pageGroups.set(version.pageId, group);
    });

    // Manter apenas as últimas N versões de cada página
    const versionsToKeep: PageVersion[] = [];
    let removedCount = 0;

    pageGroups.forEach((versions) => {
      const sorted = versions.sort((a, b) => b.versionNumber - a.versionNumber);
      versionsToKeep.push(...sorted.slice(0, keepLast));
      removedCount += Math.max(0, sorted.length - keepLast);
    });

    localStorage.setItem(this.STORAGE_KEY_VERSIONS, JSON.stringify(versionsToKeep));

    const user = SecurityService.getCurrentUser();
    AuditService.log({
      action: 'versions_cleaned',
      userId: user?.id || 'system',
      details: {
        removedCount,
        keptVersions: versionsToKeep.length
      },
      severity: 'low'
    });

    return removedCount;
  }
}

// Exportar instância singleton
export const PageVersionService = new PageVersionServiceClass();
