/**
 * SERVIÇO DE AUDITORIA
 * 
 * Sistema completo de registro e rastreamento de ações
 * para fins de auditoria, segurança e compliance
 */

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  resourceType: 'page' | 'article' | 'file' | 'user' | 'permission' | 'settings' | 'link' | 'menu' | 'template';
  details: any;
  ip?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'warning';
  errorMessage?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    oldValue?: any;
    newValue?: any;
    diff?: any;
  };
}

export type AuditAction =
  // Autenticação
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'auth.password_change'
  | 'auth.password_reset'
  | 'auth.2fa_enabled'
  | 'auth.2fa_disabled'
  
  // Usuários
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.role_change'
  | 'user.activate'
  | 'user.deactivate'
  
  // Permissões
  | 'permission.grant'
  | 'permission.revoke'
  | 'permission.update'
  | 'role.create'
  | 'role.update'
  | 'role.delete'
  
  // Conteúdo
  | 'page.create'
  | 'page.update'
  | 'page.delete'
  | 'page.publish'
  | 'page.unpublish'
  | 'article.create'
  | 'article.update'
  | 'article.delete'
  | 'article.publish'
  | 'article.unpublish'
  
  // Arquivos
  | 'file.upload'
  | 'file.delete'
  | 'file.update'
  | 'file.download'
  
  // Links
  | 'link.create'
  | 'link.update'
  | 'link.delete'
  | 'link.verify'
  
  // Configurações
  | 'settings.update'
  | 'settings.export'
  | 'settings.import'
  
  // Segurança
  | 'security.access_denied'
  | 'security.rate_limit_exceeded'
  | 'security.suspicious_activity'
  | 'security.data_export'
  | 'security.data_import';

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: AuditAction | AuditAction[];
  resourceType?: string;
  status?: 'success' | 'failure' | 'warning';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
}

export interface AuditStats {
  total: number;
  byAction: Record<string, number>;
  byUser: Record<string, number>;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byResourceType: Record<string, number>;
  recentActivity: AuditLog[];
  criticalEvents: AuditLog[];
  failedAttempts: AuditLog[];
}

export class AuditService {
  private static STORAGE_KEY = 'audit-logs';
  private static MAX_LOGS = 10000; // Máximo de logs armazenados
  private static RETENTION_DAYS = 90; // Retenção de 90 dias

  /**
   * Registra uma ação no log de auditoria
   */
  static log(params: {
    userId: string;
    userName: string;
    userRole: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    resourceType: AuditLog['resourceType'];
    details?: any;
    status?: 'success' | 'failure' | 'warning';
    errorMessage?: string;
    metadata?: {
      oldValue?: any;
      newValue?: any;
      diff?: any;
    };
  }): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      resourceType: params.resourceType,
      details: params.details || {},
      status: params.status || 'success',
      errorMessage: params.errorMessage,
      severity: this.calculateSeverity(params.action, params.status),
      metadata: params.metadata,
      ip: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    this.saveLog(log);
    this.checkAlerts(log);

    return log;
  }

  /**
   * Calcula severidade baseado na ação e status
   */
  private static calculateSeverity(
    action: AuditAction,
    status?: 'success' | 'failure' | 'warning'
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Ações críticas
    const criticalActions: AuditAction[] = [
      'user.delete',
      'user.role_change',
      'permission.grant',
      'permission.revoke',
      'settings.update',
      'security.suspicious_activity',
      'security.data_export'
    ];

    // Ações de alta severidade
    const highActions: AuditAction[] = [
      'auth.password_change',
      'auth.2fa_disabled',
      'user.create',
      'user.deactivate',
      'role.delete',
      'page.delete',
      'article.delete',
      'file.delete'
    ];

    // Ações de média severidade
    const mediumActions: AuditAction[] = [
      'user.update',
      'permission.update',
      'page.update',
      'article.update',
      'file.update',
      'link.delete'
    ];

    // Falhas aumentam severidade
    if (status === 'failure') {
      if (criticalActions.includes(action) || highActions.includes(action)) {
        return 'critical';
      }
      if (mediumActions.includes(action)) {
        return 'high';
      }
      return 'medium';
    }

    // Severidade normal
    if (criticalActions.includes(action)) return 'critical';
    if (highActions.includes(action)) return 'high';
    if (mediumActions.includes(action)) return 'medium';
    return 'low';
  }

  /**
   * Salva log no localStorage
   */
  private static saveLog(log: AuditLog): void {
    const logs = this.getAllLogs();
    logs.unshift(log); // Adiciona no início (mais recente primeiro)

    // Limita quantidade de logs
    if (logs.length > this.MAX_LOGS) {
      logs.splice(this.MAX_LOGS);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
  }

  /**
   * Obtém todos os logs
   */
  static getAllLogs(): AuditLog[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing audit logs:', error);
      return [];
    }
  }

  /**
   * Filtra logs
   */
  static filterLogs(filter: AuditFilter): AuditLog[] {
    let logs = this.getAllLogs();

    // Data início
    if (filter.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= filter.startDate!);
    }

    // Data fim
    if (filter.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= filter.endDate!);
    }

    // Usuário
    if (filter.userId) {
      logs = logs.filter(log => log.userId === filter.userId);
    }

    // Ação
    if (filter.action) {
      const actions = Array.isArray(filter.action) ? filter.action : [filter.action];
      logs = logs.filter(log => actions.includes(log.action));
    }

    // Tipo de recurso
    if (filter.resourceType) {
      logs = logs.filter(log => log.resourceType === filter.resourceType);
    }

    // Status
    if (filter.status) {
      logs = logs.filter(log => log.status === filter.status);
    }

    // Severidade
    if (filter.severity) {
      logs = logs.filter(log => log.severity === filter.severity);
    }

    // Busca textual
    if (filter.search) {
      const search = filter.search.toLowerCase();
      logs = logs.filter(log =>
        log.userName.toLowerCase().includes(search) ||
        log.resource.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search) ||
        JSON.stringify(log.details).toLowerCase().includes(search)
      );
    }

    return logs;
  }

  /**
   * Obtém logs de um usuário específico
   */
  static getUserLogs(userId: string, limit?: number): AuditLog[] {
    const logs = this.getAllLogs().filter(log => log.userId === userId);
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Obtém logs de um recurso específico
   */
  static getResourceLogs(resourceId: string, limit?: number): AuditLog[] {
    const logs = this.getAllLogs().filter(log => log.resourceId === resourceId);
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Obtém logs recentes
   */
  static getRecentLogs(limit: number = 50): AuditLog[] {
    return this.getAllLogs().slice(0, limit);
  }

  /**
   * Obtém logs críticos
   */
  static getCriticalLogs(limit: number = 100): AuditLog[] {
    return this.getAllLogs()
      .filter(log => log.severity === 'critical' || log.severity === 'high')
      .slice(0, limit);
  }

  /**
   * Obtém tentativas falhadas
   */
  static getFailedAttempts(limit: number = 100): AuditLog[] {
    return this.getAllLogs()
      .filter(log => log.status === 'failure')
      .slice(0, limit);
  }

  /**
   * Obtém estatísticas de auditoria
   */
  static getStats(filter?: AuditFilter): AuditStats {
    const logs = filter ? this.filterLogs(filter) : this.getAllLogs();

    const stats: AuditStats = {
      total: logs.length,
      byAction: {},
      byUser: {},
      byStatus: {},
      bySeverity: {},
      byResourceType: {},
      recentActivity: logs.slice(0, 20),
      criticalEvents: logs.filter(l => l.severity === 'critical').slice(0, 10),
      failedAttempts: logs.filter(l => l.status === 'failure').slice(0, 10)
    };

    logs.forEach(log => {
      // Por ação
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

      // Por usuário
      stats.byUser[log.userName] = (stats.byUser[log.userName] || 0) + 1;

      // Por status
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;

      // Por severidade
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;

      // Por tipo de recurso
      stats.byResourceType[log.resourceType] = (stats.byResourceType[log.resourceType] || 0) + 1;
    });

    return stats;
  }

  /**
   * Exporta logs para JSON
   */
  static exportLogs(filter?: AuditFilter): string {
    const logs = filter ? this.filterLogs(filter) : this.getAllLogs();
    
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      totalLogs: logs.length,
      filter: filter || null,
      logs: logs
    }, null, 2);
  }

  /**
   * Limpa logs antigos (baseado em retenção)
   */
  static cleanupOldLogs(): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_DAYS);

    const logs = this.getAllLogs();
    const filteredLogs = logs.filter(log => new Date(log.timestamp) >= cutoffDate);
    const removedCount = logs.length - filteredLogs.length;

    if (removedCount > 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredLogs));
    }

    return removedCount;
  }

  /**
   * Verifica alertas (atividade suspeita)
   */
  private static checkAlerts(log: AuditLog): void {
    // Múltiplas falhas de login
    if (log.action === 'auth.login_failed') {
      const recentFailedLogins = this.getAllLogs()
        .filter(l => 
          l.userId === log.userId &&
          l.action === 'auth.login_failed' &&
          new Date(l.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // 5 minutos
        );

      if (recentFailedLogins.length >= 3) {
        this.log({
          userId: 'system',
          userName: 'System',
          userRole: 'system',
          action: 'security.suspicious_activity',
          resource: `Múltiplas tentativas de login falhadas: ${log.userId}`,
          resourceType: 'user',
          details: {
            failedAttempts: recentFailedLogins.length,
            targetUserId: log.userId
          },
          status: 'warning'
        });
      }
    }

    // Ações críticas fora do horário comercial
    const hour = new Date(log.timestamp).getHours();
    const isOutsideBusinessHours = hour < 6 || hour > 22;
    const isCritical = log.severity === 'critical';

    if (isOutsideBusinessHours && isCritical && log.status === 'success') {
      this.log({
        userId: 'system',
        userName: 'System',
        userRole: 'system',
        action: 'security.suspicious_activity',
        resource: `Ação crítica fora do horário: ${log.action}`,
        resourceType: 'settings',
        details: {
          originalLog: log,
          hour: hour
        },
        status: 'warning'
      });
    }
  }

  /**
   * Obtém IP do cliente (simulado)
   */
  private static getClientIP(): string {
    // Em produção real, obter do servidor
    return 'localhost';
  }

  /**
   * Obtém User Agent
   */
  private static getUserAgent(): string {
    if (typeof window !== 'undefined') {
      return window.navigator.userAgent;
    }
    return 'Unknown';
  }

  /**
   * Gera relatório de auditoria
   */
  static generateReport(filter?: AuditFilter): {
    summary: AuditStats;
    timeline: Array<{ date: string; count: number }>;
    topUsers: Array<{ user: string; count: number }>;
    topActions: Array<{ action: string; count: number }>;
    securityIncidents: AuditLog[];
  } {
    const stats = this.getStats(filter);
    const logs = filter ? this.filterLogs(filter) : this.getAllLogs();

    // Timeline (por dia)
    const timelineMap = new Map<string, number>();
    logs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      timelineMap.set(date, (timelineMap.get(date) || 0) + 1);
    });
    const timeline = Array.from(timelineMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top usuários
    const topUsers = Object.entries(stats.byUser)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top ações
    const topActions = Object.entries(stats.byAction)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Incidentes de segurança
    const securityIncidents = logs.filter(log =>
      log.action.startsWith('security.') ||
      log.severity === 'critical' ||
      log.status === 'failure'
    ).slice(0, 50);

    return {
      summary: stats,
      timeline,
      topUsers,
      topActions,
      securityIncidents
    };
  }

  /**
   * Compara dois valores e gera diff
   */
  static generateDiff(oldValue: any, newValue: any): any {
    const diff: any = {};

    const compare = (old: any, updated: any, path: string = ''): void => {
      if (typeof old === 'object' && typeof updated === 'object') {
        const allKeys = new Set([...Object.keys(old || {}), ...Object.keys(updated || {})]);
        
        allKeys.forEach(key => {
          const fullPath = path ? `${path}.${key}` : key;
          const oldVal = old?.[key];
          const newVal = updated?.[key];

          if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            diff[fullPath] = {
              old: oldVal,
              new: newVal
            };
          }
        });
      } else if (old !== updated) {
        diff[path || 'value'] = {
          old: old,
          new: updated
        };
      }
    };

    compare(oldValue, newValue);
    return diff;
  }
}
