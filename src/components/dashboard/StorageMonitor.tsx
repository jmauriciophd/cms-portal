import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  HardDrive, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Database
} from 'lucide-react';
import { StorageQuotaService } from '../../services/StorageQuotaService';
import { TrashService } from '../../services/TrashService';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

export function StorageMonitor() {
  const [stats, setStats] = useState(StorageQuotaService.getStorageStats());
  const [health, setHealth] = useState(StorageQuotaService.checkHealth());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const loadStats = () => {
    setStats(StorageQuotaService.getStorageStats());
    setHealth(StorageQuotaService.checkHealth());
  };

  useEffect(() => {
    loadStats();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await StorageQuotaService.performMaintenance();
    loadStats();
    setIsRefreshing(false);
    toast.success('Manutenção de armazenamento concluída');
  };

  const handleEmptyTrash = async () => {
    const success = await TrashService.emptyTrash();
    if (success) {
      loadStats();
    }
  };

  const handleCleanOldItems = async () => {
    const removed = await TrashService.cleanOldItems(30);
    if (removed > 0) {
      loadStats();
    } else {
      toast.info('Nenhum item antigo para remover');
    }
  };

  const getStatusColor = () => {
    switch (health.status) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const getStatusIcon = () => {
    switch (health.status) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getProgressColor = () => {
    if (health.percentage >= 90) return 'bg-red-500';
    if (health.percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            <CardTitle>Armazenamento Local</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription>{health.message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={getStatusColor()}>
              {health.percentage.toFixed(1)}% usado
            </span>
            <span className="text-sm text-muted-foreground">
              {StorageQuotaService.formatBytes(stats.used)} / {StorageQuotaService.formatBytes(stats.total)}
            </span>
          </div>
          <div className="relative">
            <Progress value={health.percentage} className="h-2" />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${health.percentage}%` }}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {StorageQuotaService.formatBytes(stats.available)} disponível
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmptyTrash}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Esvaziar Lixeira
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCleanOldItems}
            className="gap-2"
          >
            <Database className="w-4 h-4" />
            Limpar Itens Antigos
          </Button>
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalhes de Armazenamento</DialogTitle>
                <DialogDescription>
                  Visualize o uso detalhado do armazenamento local
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {/* Resumo */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Usado</div>
                      <div>{StorageQuotaService.formatBytes(stats.used)}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Disponível</div>
                      <div>{StorageQuotaService.formatBytes(stats.available)}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Total</div>
                      <div>{StorageQuotaService.formatBytes(stats.total)}</div>
                    </div>
                  </div>

                  {/* Maiores Itens */}
                  <div>
                    <h4 className="mb-3">Maiores Itens</h4>
                    <div className="space-y-2">
                      {stats.items.slice(0, 10).map((item, index) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <span className="text-sm truncate" title={item.key}>
                              {item.key}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-sm text-muted-foreground">
                              {item.percentage.toFixed(1)}%
                            </span>
                            <span className="text-sm">
                              {StorageQuotaService.formatBytes(item.size)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estatísticas Adicionais */}
                  <div className="pt-4 border-t">
                    <h4 className="mb-3">Estatísticas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total de Chaves:</span>
                        <span>{stats.items.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Itens na Lixeira:</span>
                        <span>{TrashService.getTrashCount()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tamanho da Lixeira:</span>
                        <span>{StorageQuotaService.formatBytes(TrashService.getTrashSize())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alertas */}
        {health.status === 'critical' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-red-900">Armazenamento Crítico</div>
                <div className="text-sm text-red-700 mt-1">
                  O armazenamento está quase cheio. Esvazie a lixeira ou remova arquivos 
                  antigos para evitar perda de dados.
                </div>
              </div>
            </div>
          </div>
        )}
        
        {health.status === 'warning' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-yellow-900">Armazenamento em Alerta</div>
                <div className="text-sm text-yellow-700 mt-1">
                  Considere limpar dados antigos para manter o sistema funcionando 
                  adequadamente.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
