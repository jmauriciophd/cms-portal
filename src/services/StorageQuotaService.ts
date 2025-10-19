// Sistema de Gerenciamento de Quota do LocalStorage
import { toast } from 'sonner@2.0.3';

export interface StorageStats {
  used: number;
  available: number;
  total: number;
  percentage: number;
  items: Array<{
    key: string;
    size: number;
    percentage: number;
  }>;
}

export interface QuotaOptions {
  autoCleanup: boolean;
  maxAge?: number; // em dias
  warningThreshold: number; // percentual (0-100)
  criticalThreshold: number; // percentual (0-100)
}

export class StorageQuotaService {
  private static DEFAULT_OPTIONS: QuotaOptions = {
    autoCleanup: true,
    maxAge: 30, // 30 dias
    warningThreshold: 75, // 75%
    criticalThreshold: 90, // 90%
  };

  // Calcular tamanho de um objeto em bytes
  private static getObjectSize(obj: any): number {
    const str = JSON.stringify(obj);
    return new Blob([str]).size;
  }

  // Calcular tamanho de uma string em bytes
  private static getStringSize(str: string): number {
    return new Blob([str]).size;
  }

  // Obter estatísticas de uso do localStorage
  static getStorageStats(): StorageStats {
    const items: Array<{ key: string; size: number; percentage: number }> = [];
    let totalSize = 0;

    // Calcular tamanho de cada item
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = this.getStringSize(value);
        items.push({ key, size, percentage: 0 });
        totalSize += size;
      }
    }

    // Calcular percentagem de cada item
    items.forEach(item => {
      item.percentage = totalSize > 0 ? (item.size / totalSize) * 100 : 0;
    });

    // Ordenar por tamanho (maior primeiro)
    items.sort((a, b) => b.size - a.size);

    // Estimar quota total (geralmente 5-10MB, vamos usar 5MB como padrão conservador)
    const estimatedTotal = 5 * 1024 * 1024; // 5MB
    const available = Math.max(0, estimatedTotal - totalSize);
    const percentage = (totalSize / estimatedTotal) * 100;

    return {
      used: totalSize,
      available,
      total: estimatedTotal,
      percentage,
      items,
    };
  }

  // Verificar se há espaço disponível
  static hasSpaceAvailable(requiredBytes: number): boolean {
    const stats = this.getStorageStats();
    return stats.available >= requiredBytes;
  }

  // Tentar liberar espaço
  static async freeSpace(requiredBytes: number): Promise<boolean> {
    const stats = this.getStorageStats();
    
    if (stats.available >= requiredBytes) {
      return true;
    }

    console.log(`Tentando liberar ${this.formatBytes(requiredBytes)} de espaço...`);

    // 1. Limpar lixeira antiga primeiro
    const freedFromTrash = this.cleanOldTrashItems();
    
    // 2. Verificar novamente
    const newStats = this.getStorageStats();
    if (newStats.available >= requiredBytes) {
      toast.success(`${this.formatBytes(freedFromTrash)} liberados da lixeira`);
      return true;
    }

    // 3. Limpar dados de auditoria antigos
    const freedFromAudit = this.cleanOldAuditLogs();
    
    // 4. Verificar novamente
    const finalStats = this.getStorageStats();
    if (finalStats.available >= requiredBytes) {
      const totalFreed = freedFromTrash + freedFromAudit;
      toast.success(`${this.formatBytes(totalFreed)} liberados automaticamente`);
      return true;
    }

    // 5. Se ainda não há espaço, alertar usuário
    toast.error('Espaço insuficiente no armazenamento local');
    return false;
  }

  // Limpar itens antigos da lixeira
  private static cleanOldTrashItems(maxAgeDays: number = 30): number {
    try {
      const trashKey = 'cms-trash';
      const trashData = localStorage.getItem(trashKey);
      
      if (!trashData) return 0;

      const oldSize = this.getStringSize(trashData);
      const trash = JSON.parse(trashData);
      
      if (!Array.isArray(trash)) return 0;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      // Filtrar apenas itens recentes
      const filteredTrash = trash.filter((item: any) => {
        const deletedDate = new Date(item.deletedAt);
        return deletedDate >= cutoffDate;
      });

      const removedCount = trash.length - filteredTrash.length;
      
      if (removedCount > 0) {
        localStorage.setItem(trashKey, JSON.stringify(filteredTrash));
        const newSize = this.getStringSize(JSON.stringify(filteredTrash));
        const freedBytes = oldSize - newSize;
        
        console.log(`${removedCount} itens antigos removidos da lixeira, ${this.formatBytes(freedBytes)} liberados`);
        return freedBytes;
      }

      return 0;
    } catch (error) {
      console.error('Erro ao limpar lixeira:', error);
      return 0;
    }
  }

  // Limpar logs de auditoria antigos
  private static cleanOldAuditLogs(maxAgeDays: number = 90): number {
    try {
      const auditKey = 'cms-audit-logs';
      const auditData = localStorage.getItem(auditKey);
      
      if (!auditData) return 0;

      const oldSize = this.getStringSize(auditData);
      const logs = JSON.parse(auditData);
      
      if (!Array.isArray(logs)) return 0;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      // Manter apenas logs recentes
      const filteredLogs = logs.filter((log: any) => {
        const logDate = new Date(log.timestamp);
        return logDate >= cutoffDate;
      });

      // Limitar a 1000 logs mais recentes
      const limitedLogs = filteredLogs.slice(0, 1000);

      const removedCount = logs.length - limitedLogs.length;
      
      if (removedCount > 0) {
        localStorage.setItem(auditKey, JSON.stringify(limitedLogs));
        const newSize = this.getStringSize(JSON.stringify(limitedLogs));
        const freedBytes = oldSize - newSize;
        
        console.log(`${removedCount} logs antigos removidos, ${this.formatBytes(freedBytes)} liberados`);
        return freedBytes;
      }

      return 0;
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      return 0;
    }
  }

  // Salvar item com verificação de quota
  static async setItem(key: string, value: any): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      const requiredSize = this.getStringSize(jsonString);

      // Verificar se há espaço
      if (!this.hasSpaceAvailable(requiredSize)) {
        // Tentar liberar espaço
        const hasSpace = await this.freeSpace(requiredSize);
        
        if (!hasSpace) {
          // Oferecer opção de esvaziar lixeira manualmente
          const stats = this.getStorageStats();
          toast.error(
            `Armazenamento cheio (${stats.percentage.toFixed(1)}% usado). ` +
            `Por favor, esvazie a lixeira ou remova arquivos antigos.`,
            { duration: 5000 }
          );
          return false;
        }
      }

      // Tentar salvar
      localStorage.setItem(key, jsonString);

      // Verificar nível de uso após salvar
      const stats = this.getStorageStats();
      
      if (stats.percentage >= this.DEFAULT_OPTIONS.criticalThreshold) {
        toast.warning(
          `Atenção: Armazenamento crítico (${stats.percentage.toFixed(1)}% usado). ` +
          `Recomenda-se limpar a lixeira.`,
          { duration: 5000 }
        );
      } else if (stats.percentage >= this.DEFAULT_OPTIONS.warningThreshold) {
        toast.info(
          `Armazenamento em ${stats.percentage.toFixed(1)}%. ` +
          `Considere limpar a lixeira em breve.`,
          { duration: 3000 }
        );
      }

      return true;
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        console.error('QuotaExceededError:', error);
        
        // Última tentativa: limpar agressivamente
        await this.emergencyCleanup();
        
        // Tentar novamente
        try {
          const jsonString = JSON.stringify(value);
          localStorage.setItem(key, jsonString);
          toast.warning('Limpeza de emergência realizada para liberar espaço');
          return true;
        } catch (retryError) {
          toast.error('Erro: Armazenamento completamente cheio. Esvazie a lixeira.');
          return false;
        }
      }
      
      console.error('Erro ao salvar no localStorage:', error);
      toast.error('Erro ao salvar dados');
      return false;
    }
  }

  // Limpeza de emergência
  private static async emergencyCleanup(): Promise<number> {
    console.warn('Executando limpeza de emergência...');
    
    let totalFreed = 0;
    
    // 1. Limpar toda a lixeira
    try {
      const trashData = localStorage.getItem('cms-trash');
      if (trashData) {
        const freedBytes = this.getStringSize(trashData);
        localStorage.setItem('cms-trash', JSON.stringify([]));
        totalFreed += freedBytes;
        console.log(`Lixeira esvaziada: ${this.formatBytes(freedBytes)} liberados`);
      }
    } catch (error) {
      console.error('Erro ao esvaziar lixeira:', error);
    }

    // 2. Limpar logs antigos (manter apenas 100 mais recentes)
    try {
      const auditData = localStorage.getItem('cms-audit-logs');
      if (auditData) {
        const logs = JSON.parse(auditData);
        if (Array.isArray(logs)) {
          const oldSize = this.getStringSize(auditData);
          const recentLogs = logs.slice(0, 100);
          localStorage.setItem('cms-audit-logs', JSON.stringify(recentLogs));
          const newSize = this.getStringSize(JSON.stringify(recentLogs));
          const freedBytes = oldSize - newSize;
          totalFreed += freedBytes;
          console.log(`Logs reduzidos: ${this.formatBytes(freedBytes)} liberados`);
        }
      }
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
    }

    // 3. Limpar cache de versões antigas
    try {
      const versionKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('cms-page-versions-') || 
        key.startsWith('cms-template-versions-')
      );
      
      for (const key of versionKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          const versions = JSON.parse(data);
          if (Array.isArray(versions) && versions.length > 5) {
            const oldSize = this.getStringSize(data);
            const recentVersions = versions.slice(0, 5);
            localStorage.setItem(key, JSON.stringify(recentVersions));
            const newSize = this.getStringSize(JSON.stringify(recentVersions));
            totalFreed += oldSize - newSize;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao limpar versões:', error);
    }

    console.log(`Limpeza de emergência concluída: ${this.formatBytes(totalFreed)} liberados`);
    return totalFreed;
  }

  // Formatar bytes para leitura humana
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Obter percentual de uso
  static getUsagePercentage(): number {
    return this.getStorageStats().percentage;
  }

  // Executar manutenção automática
  static async performMaintenance(): Promise<void> {
    console.log('Executando manutenção do armazenamento...');
    
    const statsBefore = this.getStorageStats();
    console.log(`Uso antes: ${this.formatBytes(statsBefore.used)} (${statsBefore.percentage.toFixed(1)}%)`);

    // Limpar itens antigos
    const freedFromTrash = this.cleanOldTrashItems(30);
    const freedFromAudit = this.cleanOldAuditLogs(90);
    
    const statsAfter = this.getStorageStats();
    console.log(`Uso depois: ${this.formatBytes(statsAfter.used)} (${statsAfter.percentage.toFixed(1)}%)`);
    
    const totalFreed = freedFromTrash + freedFromAudit;
    if (totalFreed > 0) {
      console.log(`Manutenção concluída: ${this.formatBytes(totalFreed)} liberados`);
    } else {
      console.log('Manutenção concluída: nenhuma limpeza necessária');
    }
  }

  // Limpar cache específico
  static clearCache(pattern: string): number {
    let totalFreed = 0;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(pattern)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalFreed += this.getStringSize(value);
      }
      localStorage.removeItem(key);
    });

    return totalFreed;
  }

  // Obter maiores itens do storage
  static getLargestItems(limit: number = 10): Array<{ key: string; size: number; percentage: number }> {
    const stats = this.getStorageStats();
    return stats.items.slice(0, limit);
  }

  // Verificar saúde do armazenamento
  static checkHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    percentage: number;
    message: string;
  } {
    const percentage = this.getUsagePercentage();

    if (percentage >= this.DEFAULT_OPTIONS.criticalThreshold) {
      return {
        status: 'critical',
        percentage,
        message: 'Armazenamento crítico! Esvazie a lixeira urgentemente.',
      };
    } else if (percentage >= this.DEFAULT_OPTIONS.warningThreshold) {
      return {
        status: 'warning',
        percentage,
        message: 'Armazenamento em nível de alerta. Considere limpar dados antigos.',
      };
    } else {
      return {
        status: 'healthy',
        percentage,
        message: 'Armazenamento em bom estado.',
      };
    }
  }
}
