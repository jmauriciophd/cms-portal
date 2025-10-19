/**
 * Design System Sync Service
 * Gerencia sincronização com Figma, GitHub e outras fontes
 */

import { designSystemService, DesignSystemTokens, DesignSystemVersion, ChangelogEntry, MigrationRule } from './DesignSystemService';
import { auditService } from './AuditService';

export interface SyncSource {
  type: 'figma' | 'github' | 'url' | 'file';
  id: string;
  name: string;
  config: FigmaConfig | GitHubConfig | URLConfig;
  enabled: boolean;
  lastSync?: number;
  autoSync?: boolean;
  syncInterval?: number; // minutes
}

export interface FigmaConfig {
  fileKey: string;
  accessToken: string;
  nodeIds?: string[];
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token?: string;
}

export interface URLConfig {
  url: string;
  headers?: Record<string, string>;
}

export interface SyncResult {
  success: boolean;
  timestamp: number;
  source: string;
  changes: ChangelogEntry[];
  errors?: string[];
  warnings?: string[];
  newVersion?: string;
}

export interface DiffResult {
  added: string[];
  modified: string[];
  removed: string[];
  renamed: Array<{ from: string; to: string }>;
  migrations: MigrationRule[];
  impact: 'low' | 'medium' | 'high' | 'breaking';
}

class DesignSystemSyncService {
  private readonly SOURCES_KEY = 'ds_sync_sources';
  private readonly SYNC_HISTORY_KEY = 'ds_sync_history';
  private syncIntervals: Map<string, number> = new Map();

  /**
   * Obtém todas as fontes de sincronização
   */
  getSources(): SyncSource[] {
    const stored = localStorage.getItem(this.SOURCES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Adiciona uma fonte de sincronização
   */
  addSource(source: SyncSource): void {
    const sources = this.getSources();
    sources.push(source);
    localStorage.setItem(this.SOURCES_KEY, JSON.stringify(sources));

    if (source.autoSync && source.syncInterval) {
      this.startAutoSync(source);
    }

    auditService.log('design_system_source_added', null, {
      sourceType: source.type,
      sourceName: source.name
    });
  }

  /**
   * Atualiza uma fonte de sincronização
   */
  updateSource(sourceId: string, updates: Partial<SyncSource>): void {
    const sources = this.getSources();
    const index = sources.findIndex(s => s.id === sourceId);
    
    if (index >= 0) {
      sources[index] = { ...sources[index], ...updates };
      localStorage.setItem(this.SOURCES_KEY, JSON.stringify(sources));

      // Atualiza auto-sync se necessário
      if (updates.autoSync !== undefined || updates.syncInterval !== undefined) {
        this.stopAutoSync(sourceId);
        if (sources[index].autoSync && sources[index].syncInterval) {
          this.startAutoSync(sources[index]);
        }
      }
    }
  }

  /**
   * Remove uma fonte
   */
  removeSource(sourceId: string): void {
    this.stopAutoSync(sourceId);
    const sources = this.getSources().filter(s => s.id !== sourceId);
    localStorage.setItem(this.SOURCES_KEY, JSON.stringify(sources));
  }

  /**
   * Sincroniza com uma fonte
   */
  async sync(sourceId: string): Promise<SyncResult> {
    const source = this.getSources().find(s => s.id === sourceId);
    if (!source) {
      return {
        success: false,
        timestamp: Date.now(),
        source: sourceId,
        changes: [],
        errors: ['Source not found']
      };
    }

    try {
      let tokens: DesignSystemTokens | null = null;

      switch (source.type) {
        case 'figma':
          tokens = await this.syncFromFigma(source.config as FigmaConfig);
          break;
        case 'github':
          tokens = await this.syncFromGitHub(source.config as GitHubConfig);
          break;
        case 'url':
          tokens = await this.syncFromURL(source.config as URLConfig);
          break;
      }

      if (!tokens) {
        return {
          success: false,
          timestamp: Date.now(),
          source: source.name,
          changes: [],
          errors: ['Failed to fetch tokens']
        };
      }

      // Calcula diff
      const diff = this.calculateDiff(tokens);

      // Cria nova versão
      const newVersion = this.createNewVersion(tokens, diff, source.name);

      // Salva
      designSystemService.saveVersion(newVersion);

      // Atualiza fonte
      this.updateSource(sourceId, { lastSync: Date.now() });

      // Salva histórico
      this.saveSyncHistory({
        success: true,
        timestamp: Date.now(),
        source: source.name,
        changes: diff.migrations.map(m => ({
          type: 'update',
          category: 'token',
          id: m.from,
          newValue: m.to,
          migration: m,
          impact: diff.impact
        })),
        newVersion: newVersion.version
      });

      auditService.log('design_system_synced', null, {
        source: source.name,
        version: newVersion.version,
        changes: diff.migrations.length
      });

      return {
        success: true,
        timestamp: Date.now(),
        source: source.name,
        changes: newVersion.changelog,
        newVersion: newVersion.version
      };

    } catch (error: any) {
      const result: SyncResult = {
        success: false,
        timestamp: Date.now(),
        source: source.name,
        changes: [],
        errors: [error.message]
      };

      this.saveSyncHistory(result);
      return result;
    }
  }

  /**
   * Sincroniza do Figma
   */
  private async syncFromFigma(config: FigmaConfig): Promise<DesignSystemTokens | null> {
    const { fileKey, accessToken } = config;

    try {
      // Busca arquivo do Figma
      const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
        headers: {
          'X-Figma-Token': accessToken
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Figma');
      }

      const data = await response.json();

      // Extrai estilos e tokens
      const tokens = this.extractFigmaTokens(data);

      return tokens;
    } catch (error) {
      console.error('Figma sync error:', error);
      return null;
    }
  }

  /**
   * Extrai tokens do arquivo Figma
   */
  private extractFigmaTokens(figmaData: any): DesignSystemTokens {
    const tokens: DesignSystemTokens = {
      $schema: 'https://design-tokens.org',
      color: {},
      typography: {},
      spacing: {},
      radius: {},
      shadow: {}
    };

    // Extrai cores dos estilos
    if (figmaData.styles) {
      Object.values(figmaData.styles).forEach((style: any) => {
        if (style.styleType === 'FILL') {
          const name = style.name.toLowerCase().replace(/\s+/g, '-');
          const color = this.figmaColorToHex(style);
          if (color && tokens.color) {
            this.setNestedToken(tokens.color, name, { value: color });
          }
        }
      });
    }

    // Extrai variáveis locais (Figma Variables)
    if (figmaData.document && figmaData.document.children) {
      this.traverseFigmaNodes(figmaData.document.children, tokens);
    }

    return tokens;
  }

  /**
   * Converte cor do Figma para hex
   */
  private figmaColorToHex(color: any): string | null {
    if (!color.fills || color.fills.length === 0) return null;
    
    const fill = color.fills[0];
    if (fill.type !== 'SOLID') return null;

    const { r, g, b } = fill.color;
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Percorre nós do Figma
   */
  private traverseFigmaNodes(nodes: any[], tokens: DesignSystemTokens): void {
    nodes.forEach(node => {
      // Extrai informações de texto para tipografia
      if (node.type === 'TEXT' && tokens.typography) {
        const style = node.style || {};
        if (style.fontFamily) {
          this.setNestedToken(tokens.typography, 'fontFamily.body', {
            value: style.fontFamily
          });
        }
      }

      // Recursivo
      if (node.children) {
        this.traverseFigmaNodes(node.children, tokens);
      }
    });
  }

  /**
   * Define token aninhado
   */
  private setNestedToken(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Sincroniza do GitHub
   */
  private async syncFromGitHub(config: GitHubConfig): Promise<DesignSystemTokens | null> {
    const { owner, repo, branch, path, token } = config;

    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      };

      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch from GitHub');
      }

      const data = await response.json();

      // Decodifica conteúdo base64
      const content = atob(data.content);
      const tokens = JSON.parse(content) as DesignSystemTokens;

      return tokens;
    } catch (error) {
      console.error('GitHub sync error:', error);
      return null;
    }
  }

  /**
   * Sincroniza de URL
   */
  private async syncFromURL(config: URLConfig): Promise<DesignSystemTokens | null> {
    try {
      const response = await fetch(config.url, {
        headers: config.headers || {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from URL');
      }

      const tokens = await response.json() as DesignSystemTokens;
      return tokens;
    } catch (error) {
      console.error('URL sync error:', error);
      return null;
    }
  }

  /**
   * Calcula diff entre versões
   */
  private calculateDiff(newTokens: DesignSystemTokens): DiffResult {
    const current = designSystemService.getCurrentDesignSystem();
    const oldFlat = current ? designSystemService.flattenTokens(current.tokens) : {};
    const newFlat = designSystemService.flattenTokens(newTokens);

    const added: string[] = [];
    const modified: string[] = [];
    const removed: string[] = [];
    const migrations: MigrationRule[] = [];

    // Verifica adições e modificações
    for (const key of Object.keys(newFlat)) {
      if (!(key in oldFlat)) {
        added.push(key);
      } else if (oldFlat[key] !== newFlat[key]) {
        modified.push(key);
        migrations.push({
          from: key,
          to: key,
          automatic: true,
          notes: `Updated from ${oldFlat[key]} to ${newFlat[key]}`
        });
      }
    }

    // Verifica remoções
    for (const key of Object.keys(oldFlat)) {
      if (!(key in newFlat)) {
        removed.push(key);
      }
    }

    // Calcula impacto
    let impact: 'low' | 'medium' | 'high' | 'breaking' = 'low';
    if (removed.length > 0) {
      impact = 'breaking';
    } else if (modified.length > 10) {
      impact = 'high';
    } else if (modified.length > 0) {
      impact = 'medium';
    }

    return { added, modified, removed, renamed: [], migrations, impact };
  }

  /**
   * Cria nova versão
   */
  private createNewVersion(
    tokens: DesignSystemTokens,
    diff: DiffResult,
    sourceName: string
  ): DesignSystemVersion {
    const current = designSystemService.getCurrentDesignSystem();
    const oldVersion = current?.version || '0.0.0';
    const [major, minor, patch] = oldVersion.split('.').map(Number);

    let newVersion: string;
    if (diff.impact === 'breaking') {
      newVersion = `${major + 1}.0.0`;
    } else if (diff.impact === 'high') {
      newVersion = `${major}.${minor + 1}.0`;
    } else {
      newVersion = `${major}.${minor}.${patch + 1}`;
    }

    const changelog: ChangelogEntry[] = [];

    diff.added.forEach(key => {
      changelog.push({
        type: 'add',
        category: 'token',
        id: key,
        newValue: designSystemService.getToken(key),
        impact: 'low'
      });
    });

    diff.modified.forEach(key => {
      changelog.push({
        type: 'update',
        category: 'token',
        id: key,
        newValue: designSystemService.getToken(key),
        impact: 'medium'
      });
    });

    diff.removed.forEach(key => {
      changelog.push({
        type: 'remove',
        category: 'token',
        id: key,
        impact: 'breaking'
      });
    });

    return {
      version: newVersion,
      timestamp: Date.now(),
      tokens,
      components: current?.components || [],
      changelog,
      breaking: diff.impact === 'breaking'
    };
  }

  /**
   * Salva histórico de sincronização
   */
  private saveSyncHistory(result: SyncResult): void {
    const history = this.getSyncHistory();
    history.unshift(result);
    
    // Mantém apenas últimas 50 sincronizações
    if (history.length > 50) {
      history.splice(50);
    }

    localStorage.setItem(this.SYNC_HISTORY_KEY, JSON.stringify(history));
  }

  /**
   * Obtém histórico
   */
  getSyncHistory(): SyncResult[] {
    const stored = localStorage.getItem(this.SYNC_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Inicia sincronização automática
   */
  private startAutoSync(source: SyncSource): void {
    if (!source.syncInterval) return;

    const intervalId = window.setInterval(() => {
      this.sync(source.id);
    }, source.syncInterval * 60 * 1000);

    this.syncIntervals.set(source.id, intervalId);
  }

  /**
   * Para sincronização automática
   */
  private stopAutoSync(sourceId: string): void {
    const intervalId = this.syncIntervals.get(sourceId);
    if (intervalId) {
      clearInterval(intervalId);
      this.syncIntervals.delete(sourceId);
    }
  }

  /**
   * Aplica migração
   */
  applyMigration(migration: MigrationRule): boolean {
    try {
      const ds = designSystemService.getCurrentDesignSystem();
      if (!ds) return false;

      // Atualiza referências em componentes
      ds.components.forEach(component => {
        component.variants.forEach(variant => {
          Object.keys(variant.tokens).forEach(key => {
            if (variant.tokens[key] === `{${migration.from}}`) {
              variant.tokens[key] = `{${migration.to}}`;
            }
          });
        });
      });

      designSystemService.saveVersion(ds);

      auditService.log('design_system_migration_applied', null, {
        from: migration.from,
        to: migration.to
      });

      return true;
    } catch (error) {
      console.error('Migration error:', error);
      return false;
    }
  }

  /**
   * Valida integridade do Design System
   */
  validate(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const ds = designSystemService.getCurrentDesignSystem();
    if (!ds) {
      errors.push('No Design System loaded');
      return { valid: false, errors, warnings };
    }

    // Valida referências de tokens
    ds.components.forEach(component => {
      component.variants.forEach(variant => {
        Object.entries(variant.tokens).forEach(([key, ref]) => {
          if (typeof ref === 'string' && ref.startsWith('{')) {
            const resolved = designSystemService.resolveTokenReference(ref, ds.tokens);
            if (resolved === ref) {
              errors.push(`Invalid token reference in ${component.id}.${variant.id}.${key}: ${ref}`);
            }
          }
        });
      });
    });

    // Valida contraste de cores
    const colorTokens = designSystemService.flattenTokens(ds.tokens.color || {});
    Object.entries(colorTokens).forEach(([key, value]) => {
      if (key.includes('text') && key.includes('bg')) {
        // Encontra par de foreground/background
        const fgKey = key.replace('bg', 'fg');
        const fg = colorTokens[fgKey];
        if (fg && typeof value === 'string' && typeof fg === 'string') {
          const contrast = designSystemService.validateContrast(fg, value);
          if (!contrast.valid) {
            warnings.push(`Low contrast ratio (${contrast.ratio}) for ${key}: ${fg} on ${value}`);
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const designSystemSyncService = new DesignSystemSyncService();
