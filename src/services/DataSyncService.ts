/**
 * Serviço de Sincronização de Dados
 * Gerencia mapeamento, validação e sincronização de conteúdos com JSON externo
 */

import { mapJsonToFields, sanitizeData, validateFieldValue, type FieldDefinition, type MappedData } from '../utils/fieldTypeMapper';

export interface SyncConfiguration {
  id: string;
  name: string;
  sourceType: 'json' | 'api' | 'file';
  sourceUrl?: string;
  sourceData?: Record<string, any>;
  targetType: 'page' | 'article' | 'custom_list';
  targetId?: string;
  fieldMappings: Record<string, string>; // source field -> target field
  autoSync: boolean;
  syncInterval?: number; // em minutos
  lastSync?: string;
  enabled: boolean;
  transformRules?: TransformRule[];
}

export interface TransformRule {
  field: string;
  type: 'replace' | 'append' | 'prepend' | 'format' | 'lookup' | 'ai_transform';
  params: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  syncedAt: string;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  errors: Array<{ field: string; error: string }>;
  changes: Array<{ field: string; oldValue: any; newValue: any }>;
}

export interface SyncHistory {
  id: string;
  configId: string;
  timestamp: string;
  result: SyncResult;
  triggeredBy: 'manual' | 'auto' | 'schedule';
}

class DataSyncService {
  private configs: Map<string, SyncConfiguration> = new Map();
  private history: SyncHistory[] = [];
  private syncTimers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    this.loadConfigs();
    this.loadHistory();
    this.startAutoSync();
  }
  
  /**
   * Carrega configurações do localStorage
   */
  private loadConfigs(): void {
    try {
      const stored = localStorage.getItem('cms_sync_configs');
      if (stored) {
        const configs = JSON.parse(stored);
        configs.forEach((config: SyncConfiguration) => {
          this.configs.set(config.id, config);
        });
      }
    } catch (error) {
      console.error('Error loading sync configs:', error);
    }
  }
  
  /**
   * Salva configurações no localStorage
   */
  private saveConfigs(): void {
    try {
      const configs = Array.from(this.configs.values());
      localStorage.setItem('cms_sync_configs', JSON.stringify(configs));
    } catch (error) {
      console.error('Error saving sync configs:', error);
    }
  }
  
  /**
   * Carrega histórico do localStorage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem('cms_sync_history');
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync history:', error);
    }
  }
  
  /**
   * Salva histórico no localStorage
   */
  private saveHistory(): void {
    try {
      // Mantém apenas últimas 100 entradas
      const recentHistory = this.history.slice(-100);
      localStorage.setItem('cms_sync_history', JSON.stringify(recentHistory));
    } catch (error) {
      console.error('Error saving sync history:', error);
    }
  }
  
  /**
   * Cria nova configuração de sincronização
   */
  createConfig(config: Omit<SyncConfiguration, 'id' | 'lastSync'>): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newConfig: SyncConfiguration = {
      ...config,
      id,
      lastSync: undefined,
    };
    
    this.configs.set(id, newConfig);
    this.saveConfigs();
    
    if (config.autoSync && config.syncInterval) {
      this.scheduleSync(id);
    }
    
    return id;
  }
  
  /**
   * Atualiza configuração existente
   */
  updateConfig(id: string, updates: Partial<SyncConfiguration>): void {
    const config = this.configs.get(id);
    if (!config) {
      throw new Error(`Config ${id} not found`);
    }
    
    const updated = { ...config, ...updates };
    this.configs.set(id, updated);
    this.saveConfigs();
    
    // Reagenda sync se necessário
    if (updated.autoSync && updated.syncInterval) {
      this.scheduleSync(id);
    } else {
      this.cancelScheduledSync(id);
    }
  }
  
  /**
   * Remove configuração
   */
  deleteConfig(id: string): void {
    this.cancelScheduledSync(id);
    this.configs.delete(id);
    this.saveConfigs();
  }
  
  /**
   * Lista todas as configurações
   */
  getConfigs(): SyncConfiguration[] {
    return Array.from(this.configs.values());
  }
  
  /**
   * Obtém configuração por ID
   */
  getConfig(id: string): SyncConfiguration | undefined {
    return this.configs.get(id);
  }
  
  /**
   * Mapeia JSON para campos do sistema
   */
  async mapJsonData(json: Record<string, any>): Promise<MappedData> {
    return mapJsonToFields(json);
  }
  
  /**
   * Aplica regras de transformação
   */
  private async applyTransformRules(
    data: Record<string, any>,
    rules?: TransformRule[]
  ): Promise<Record<string, any>> {
    if (!rules || rules.length === 0) {
      return data;
    }
    
    const transformed = { ...data };
    
    for (const rule of rules) {
      const value = transformed[rule.field];
      
      switch (rule.type) {
        case 'replace':
          transformed[rule.field] = rule.params.newValue;
          break;
          
        case 'append':
          if (typeof value === 'string') {
            transformed[rule.field] = value + rule.params.suffix;
          }
          break;
          
        case 'prepend':
          if (typeof value === 'string') {
            transformed[rule.field] = rule.params.prefix + value;
          }
          break;
          
        case 'format':
          transformed[rule.field] = this.formatValue(value, rule.params.format);
          break;
          
        case 'lookup':
          transformed[rule.field] = await this.lookupValue(
            value,
            rule.params.lookupList,
            rule.params.lookupField
          );
          break;
          
        case 'ai_transform':
          transformed[rule.field] = await this.aiTransform(value, rule.params.prompt);
          break;
      }
    }
    
    return transformed;
  }
  
  /**
   * Formata valor conforme padrão especificado
   */
  private formatValue(value: any, format: string): any {
    if (!value) return value;
    
    switch (format) {
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'capitalize':
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR');
      case 'datetime':
        return new Date(value).toLocaleString('pt-BR');
      default:
        return value;
    }
  }
  
  /**
   * Busca valor em lista relacionada
   */
  private async lookupValue(
    id: any,
    listName: string,
    fieldName: string
  ): Promise<any> {
    try {
      // Busca em listas customizadas
      const lists = JSON.parse(localStorage.getItem('cms_custom_lists') || '[]');
      const list = lists.find((l: any) => l.name === listName);
      
      if (list) {
        const item = list.items?.find((i: any) => i.id === id);
        return item?.[fieldName];
      }
    } catch (error) {
      console.error('Lookup error:', error);
    }
    
    return null;
  }
  
  /**
   * Transforma valor usando IA
   */
  private async aiTransform(value: any, prompt: string): Promise<any> {
    try {
      const aiConfig = JSON.parse(localStorage.getItem('cms_ai_config') || '{}');
      
      if (!aiConfig.enabled || !aiConfig.apiKey) {
        return value;
      }
      
      // Aqui seria a integração real com a IA
      // Por enquanto retorna o valor original
      console.log('AI Transform:', { value, prompt });
      return value;
    } catch (error) {
      console.error('AI Transform error:', error);
      return value;
    }
  }
  
  /**
   * Executa sincronização
   */
  async sync(configId: string, triggeredBy: 'manual' | 'auto' | 'schedule' = 'manual'): Promise<SyncResult> {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Config ${configId} not found`);
    }
    
    const result: SyncResult = {
      success: false,
      syncedAt: new Date().toISOString(),
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
      changes: []
    };
    
    try {
      // 1. Obter dados da fonte
      let sourceData: Record<string, any>;
      
      if (config.sourceType === 'json' && config.sourceData) {
        sourceData = config.sourceData;
      } else if (config.sourceType === 'api' && config.sourceUrl) {
        const response = await fetch(config.sourceUrl);
        sourceData = await response.json();
      } else if (config.sourceType === 'file') {
        throw new Error('File source not yet implemented');
      } else {
        throw new Error('Invalid source configuration');
      }
      
      result.recordsProcessed++;
      
      // 2. Mapear campos
      const mappedData = await this.mapJsonData(sourceData);
      
      // 3. Aplicar transformações
      const transformedData = await this.applyTransformRules(
        mappedData.values,
        config.transformRules
      );
      
      // 4. Aplicar mapeamentos de campos
      const finalData: Record<string, any> = {};
      for (const [sourceField, targetField] of Object.entries(config.fieldMappings)) {
        if (transformedData[sourceField] !== undefined) {
          finalData[targetField] = transformedData[sourceField];
        }
      }
      
      // 5. Validar dados
      const validationErrors: Array<{ field: string; error: string }> = [];
      for (const field of mappedData.fields) {
        const value = finalData[field.internalName];
        const validation = validateFieldValue(value, field);
        
        if (!validation.valid && validation.error) {
          validationErrors.push({
            field: field.name,
            error: validation.error
          });
        }
      }
      
      if (validationErrors.length > 0) {
        result.errors = validationErrors;
        result.recordsFailed++;
        throw new Error(`Validation failed: ${validationErrors.length} errors`);
      }
      
      // 6. Sanitizar dados
      const sanitized = sanitizeData(finalData, mappedData.fields);
      
      // 7. Salvar no destino
      await this.saveToTarget(config.targetType, config.targetId, sanitized, result);
      
      result.recordsSuccess++;
      result.success = true;
      
      // Atualiza lastSync
      config.lastSync = result.syncedAt;
      this.configs.set(configId, config);
      this.saveConfigs();
      
    } catch (error) {
      result.success = false;
      result.recordsFailed++;
      result.errors.push({
        field: 'general',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Salva no histórico
    this.addToHistory(configId, result, triggeredBy);
    
    return result;
  }
  
  /**
   * Salva dados no destino
   */
  private async saveToTarget(
    targetType: string,
    targetId: string | undefined,
    data: Record<string, any>,
    result: SyncResult
  ): Promise<void> {
    switch (targetType) {
      case 'page': {
        const pages = JSON.parse(localStorage.getItem('cms_pages') || '[]');
        
        if (targetId) {
          // Atualiza página existente
          const pageIndex = pages.findIndex((p: any) => p.id === targetId);
          if (pageIndex >= 0) {
            const oldPage = pages[pageIndex];
            pages[pageIndex] = { ...oldPage, ...data, customFields: data };
            
            // Registra mudanças
            for (const [key, value] of Object.entries(data)) {
              if (oldPage[key] !== value) {
                result.changes.push({
                  field: key,
                  oldValue: oldPage[key],
                  newValue: value
                });
              }
            }
          }
        } else {
          // Cria nova página
          const newPage = {
            id: `page_${Date.now()}`,
            ...data,
            customFields: data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          pages.push(newPage);
        }
        
        localStorage.setItem('cms_pages', JSON.stringify(pages));
        break;
      }
      
      case 'article': {
        const articles = JSON.parse(localStorage.getItem('cms_articles') || '[]');
        
        if (targetId) {
          const articleIndex = articles.findIndex((a: any) => a.id === targetId);
          if (articleIndex >= 0) {
            const oldArticle = articles[articleIndex];
            articles[articleIndex] = { ...oldArticle, ...data, customFields: data };
            
            for (const [key, value] of Object.entries(data)) {
              if (oldArticle[key] !== value) {
                result.changes.push({
                  field: key,
                  oldValue: oldArticle[key],
                  newValue: value
                });
              }
            }
          }
        } else {
          const newArticle = {
            id: `article_${Date.now()}`,
            ...data,
            customFields: data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          articles.push(newArticle);
        }
        
        localStorage.setItem('cms_articles', JSON.stringify(articles));
        break;
      }
      
      case 'custom_list': {
        const lists = JSON.parse(localStorage.getItem('cms_custom_lists') || '[]');
        const list = lists.find((l: any) => l.id === targetId);
        
        if (list) {
          const item = {
            id: `item_${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString()
          };
          list.items = list.items || [];
          list.items.push(item);
          localStorage.setItem('cms_custom_lists', JSON.stringify(lists));
        }
        break;
      }
    }
  }
  
  /**
   * Adiciona entrada ao histórico
   */
  private addToHistory(
    configId: string,
    result: SyncResult,
    triggeredBy: 'manual' | 'auto' | 'schedule'
  ): void {
    const entry: SyncHistory = {
      id: `history_${Date.now()}`,
      configId,
      timestamp: result.syncedAt,
      result,
      triggeredBy
    };
    
    this.history.push(entry);
    this.saveHistory();
  }
  
  /**
   * Obtém histórico de sincronizações
   */
  getHistory(configId?: string): SyncHistory[] {
    if (configId) {
      return this.history.filter(h => h.configId === configId);
    }
    return this.history;
  }
  
  /**
   * Agenda sincronização automática
   */
  private scheduleSync(configId: string): void {
    const config = this.configs.get(configId);
    if (!config || !config.autoSync || !config.syncInterval) {
      return;
    }
    
    // Cancela timer existente
    this.cancelScheduledSync(configId);
    
    // Cria novo timer
    const intervalMs = config.syncInterval * 60 * 1000; // minutos para ms
    const timer = setInterval(() => {
      if (config.enabled) {
        this.sync(configId, 'auto').catch(error => {
          console.error(`Auto sync failed for ${configId}:`, error);
        });
      }
    }, intervalMs);
    
    this.syncTimers.set(configId, timer);
  }
  
  /**
   * Cancela sincronização agendada
   */
  private cancelScheduledSync(configId: string): void {
    const timer = this.syncTimers.get(configId);
    if (timer) {
      clearInterval(timer);
      this.syncTimers.delete(configId);
    }
  }
  
  /**
   * Inicia todos os syncs automáticos
   */
  private startAutoSync(): void {
    for (const config of this.configs.values()) {
      if (config.enabled && config.autoSync && config.syncInterval) {
        this.scheduleSync(config.id);
      }
    }
  }
  
  /**
   * Para todos os syncs automáticos
   */
  stopAllAutoSync(): void {
    for (const configId of this.syncTimers.keys()) {
      this.cancelScheduledSync(configId);
    }
  }
}

// Singleton instance
export const dataSyncService = new DataSyncService();
