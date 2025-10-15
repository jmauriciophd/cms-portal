/**
 * MONITOR DE SEGURANÇA
 * 
 * Interface para visualizar e gerenciar aspectos de segurança do sistema
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  AlertTriangle,
  Shield,
  Activity,
  Lock,
  Unlock,
  Download,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { SecurityService } from '../../services/SecurityService';
import { AuditService, AuditLog } from '../../services/AuditService';
import { CSRFService } from '../../services/CSRFService';
import { toast } from 'sonner@2.0.3';

export function SecurityMonitor() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const logs = AuditService.getRecentLogs(100);
    setAuditLogs(logs);

    const auditStats = AuditService.getStats();
    const securityStats = SecurityService.getSecurityStats();
    const csrfStats = CSRFService.getStats();

    setStats({
      audit: auditStats,
      security: securityStats,
      csrf: csrfStats
    });
  };

  const handleCleanupRateLimits = () => {
    SecurityService.cleanupRateLimits();
    toast.success('Rate limits limpos!');
    loadData();
  };

  const handleCleanupAuditLogs = () => {
    const removed = AuditService.cleanupOldLogs();
    toast.success(`${removed} logs antigos removidos!`);
    loadData();
  };

  const handleCleanupCSRF = () => {
    CSRFService.cleanupExpiredTokens();
    toast.success('Tokens CSRF expirados removidos!');
    loadData();
  };

  const handleExportAudit = () => {
    const json = AuditService.exportLogs();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exportados!');
  };

  const handleUnblock = (identifier: string) => {
    SecurityService.unblockIdentifier(identifier);
    toast.success(`${identifier} desbloqueado!`);
    loadData();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failure': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const filteredLogs = searchTerm
    ? auditLogs.filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : auditLogs;

  if (!stats) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Monitor de Segurança</h1>
        <p className="text-gray-600">Monitore atividades, auditoria e segurança do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.audit.total}</div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <Badge variant="secondary">{stats.audit.criticalEvents.length} críticos</Badge>
              <Badge variant="destructive">{stats.audit.failedAttempts.length} falhas</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.security.rateLimitRecords}</div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <Badge variant="secondary">{stats.security.blockedIdentifiers} bloqueados</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Tokens CSRF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.csrf.total}</div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <Badge variant="default">{stats.csrf.active} ativos</Badge>
              <Badge variant="outline">{stats.csrf.expired} expirados</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Crítica:</span>
                <Badge variant="destructive">{stats.audit.bySeverity.critical || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Alta:</span>
                <Badge variant="default">{stats.audit.bySeverity.high || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Média:</span>
                <Badge variant="secondary">{stats.audit.bySeverity.medium || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Baixa:</span>
                <Badge variant="outline">{stats.audit.bySeverity.low || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="blocked">Bloqueados</TabsTrigger>
          <TabsTrigger value="critical">Críticos</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Atividade Recente</CardTitle>
                  <Button variant="ghost" size="sm" onClick={loadData}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.audit.recentActivity.slice(0, 10).map((log: AuditLog) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getStatusIcon(log.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{log.userName}</span>
                          <Badge variant={getSeverityColor(log.severity) as any} className="text-xs">
                            {log.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {log.action}: {log.resource}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ações por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Mais Comuns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.audit.byAction)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .slice(0, 10)
                    .map(([action, count]: any) => (
                      <div key={action} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm truncate">{action}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manutenção */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Manutenção</CardTitle>
              <CardDescription>Limpar dados antigos e expirados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleCleanupRateLimits}>
                  <Activity className="w-4 h-4 mr-2" />
                  Limpar Rate Limits
                </Button>
                <Button variant="outline" onClick={handleCleanupAuditLogs}>
                  <FileText className="w-4 h-4 mr-2" />
                  Limpar Logs Antigos
                </Button>
                <Button variant="outline" onClick={handleCleanupCSRF}>
                  <Shield className="w-4 h-4 mr-2" />
                  Limpar Tokens CSRF
                </Button>
                <Button variant="outline" onClick={handleExportAudit}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Auditoria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Logs de Auditoria</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportAudit}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Usuário
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Recurso
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Severidade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <div className="font-medium">{log.userName}</div>
                            <div className="text-xs text-gray-500">{log.userRole}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {log.action}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="max-w-xs truncate" title={log.resource}>
                            {log.resource}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="capitalize">{log.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={getSeverityColor(log.severity) as any}>
                            {log.severity}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bloqueados */}
        <TabsContent value="blocked">
          <Card>
            <CardHeader>
              <CardTitle>Identifiers Bloqueados</CardTitle>
              <CardDescription>
                Usuários e IPs bloqueados por excesso de tentativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(SecurityService.getBlockedIdentifiers()).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum identifier bloqueado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(SecurityService.getBlockedIdentifiers()).map(([id, until]) => (
                    <div key={id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{id}</div>
                        <div className="text-sm text-gray-500">
                          Bloqueado até: {new Date(until).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblock(id)}
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Desbloquear
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Críticos */}
        <TabsContent value="critical">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Críticos</CardTitle>
              <CardDescription>
                Eventos de alta e crítica severidade que requerem atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.audit.criticalEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-300" />
                  <p>Nenhum evento crítico registrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.audit.criticalEvents.map((log: AuditLog) => (
                    <div key={log.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{log.userName}</span>
                            <Badge variant="destructive">{log.severity}</Badge>
                            {getStatusIcon(log.status)}
                          </div>
                          <p className="text-sm mb-1">
                            <code className="bg-red-100 px-2 py-1 rounded text-xs">
                              {log.action}
                            </code>
                          </p>
                          <p className="text-sm text-gray-700">{log.resource}</p>
                          {log.errorMessage && (
                            <p className="text-sm text-red-600 mt-2">
                              Erro: {log.errorMessage}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
