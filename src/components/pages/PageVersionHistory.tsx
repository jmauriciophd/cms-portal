import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
  History,
  RotateCcw,
  Clock,
  User,
  Calendar,
  Eye,
  Download,
  Trash2,
  GitCompare,
  AlertCircle,
  CheckCircle2,
  FileText,
  Info
} from 'lucide-react';
import { PageVersionService, type PageData, type VersionHistoryEntry } from '../../services/PageVersionService';
import { toast } from 'sonner@2.0.3';

interface PageVersionHistoryProps {
  open: boolean;
  onClose: () => void;
  pageId: string;
  onRestore: (page: PageData) => void;
}

export function PageVersionHistory({ open, onClose, pageId, onRestore }: PageVersionHistoryProps) {
  const [versionHistory, setVersionHistory] = useState<VersionHistoryEntry[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionHistoryEntry | null>(null);
  const [compareVersion, setCompareVersion] = useState<VersionHistoryEntry | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadVersionHistory();
    }
  }, [open, pageId]);

  const loadVersionHistory = () => {
    try {
      const history = PageVersionService.getVersionHistory(pageId);
      setVersionHistory(history);
    } catch (error: any) {
      toast.error('Erro ao carregar histórico', {
        description: error.message
      });
    }
  };

  const handleRestore = async (entry: VersionHistoryEntry) => {
    if (!confirm(`Tem certeza que deseja restaurar para a versão ${entry.version.versionNumber}?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = PageVersionService.restoreVersion(pageId, entry.version.id);
      toast.success('Versão restaurada com sucesso!', {
        description: `Restaurado para v${entry.version.versionNumber}`
      });
      onRestore(result.page);
      loadVersionHistory();
      onClose();
    } catch (error: any) {
      toast.error('Erro ao restaurar versão', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entry: VersionHistoryEntry) => {
    if (!entry.canDelete) {
      toast.error('Não é possível deletar esta versão');
      return;
    }

    if (!confirm(`Tem certeza que deseja deletar a versão ${entry.version.versionNumber}?`)) {
      return;
    }

    try {
      PageVersionService.deleteVersion(entry.version.id);
      toast.success('Versão deletada');
      loadVersionHistory();
    } catch (error: any) {
      toast.error('Erro ao deletar versão', {
        description: error.message
      });
    }
  };

  const handleExport = (entry: VersionHistoryEntry) => {
    const dataStr = JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      page: entry.version.data,
      metadata: {
        originalId: entry.version.pageId,
        versionNumber: entry.version.versionNumber,
        checksum: entry.version.checksum
      }
    }, null, 2);

    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `page-v${entry.version.versionNumber}-${entry.version.data.slug}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Versão exportada');
  };

  const handleCompare = () => {
    if (!selectedVersion || !compareVersion) {
      toast.error('Selecione duas versões para comparar');
      return;
    }
    setShowCompare(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    return formatDate(dateString);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const renderChanges = (entry: VersionHistoryEntry) => {
    if (!entry.version.changes || entry.version.changes.length === 0) {
      return <p className="text-sm text-gray-500">Nenhuma alteração detectada</p>;
    }

    return (
      <div className="space-y-2">
        {entry.version.changes.map((change, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded border text-sm">
            <p className="font-medium text-gray-900 mb-2">{change.field}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-red-50 border border-red-200 p-2 rounded">
                <p className="text-red-600 font-medium text-xs mb-1">Anterior:</p>
                <p className="text-gray-700 text-xs break-all line-clamp-3">
                  {typeof change.oldValue === 'object' 
                    ? JSON.stringify(change.oldValue, null, 2)
                    : String(change.oldValue || 'vazio')}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 p-2 rounded">
                <p className="text-green-600 font-medium text-xs mb-1">Novo:</p>
                <p className="text-gray-700 text-xs break-all line-clamp-3">
                  {typeof change.newValue === 'object'
                    ? JSON.stringify(change.newValue, null, 2)
                    : String(change.newValue || 'vazio')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open && !showCompare} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-purple-600" />
              Histórico de Versões
            </DialogTitle>
            <DialogDescription>
              {versionHistory.length} versão{versionHistory.length !== 1 ? 'ões' : ''} disponível{versionHistory.length !== 1 ? 'is' : ''}
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Cada versão representa um snapshot completo da página. Você pode restaurar, comparar ou exportar qualquer versão.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="list" className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="list">
                <History className="h-4 w-4 mr-2" />
                Lista de Versões
              </TabsTrigger>
              <TabsTrigger value="compare">
                <GitCompare className="h-4 w-4 mr-2" />
                Comparar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="flex-1">
              <ScrollArea className="h-[500px] pr-4">
                {versionHistory.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhuma versão encontrada</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {versionHistory.map((entry) => (
                      <Card 
                        key={entry.version.id}
                        className={entry.isCurrent ? 'border-purple-200 bg-purple-50' : ''}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={entry.isCurrent ? 'default' : 'secondary'}>
                                  v{entry.version.versionNumber}
                                </Badge>
                                {entry.isCurrent && (
                                  <Badge className="bg-green-600">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Atual
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium text-gray-900 mb-1">
                                {entry.version.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {entry.version.author}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getRelativeTime(entry.version.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(entry.version.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {formatFileSize(entry.version.fileSize)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Mudanças */}
                          {entry.version.changes && entry.version.changes.length > 0 && (
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm font-medium text-blue-900 mb-2">
                                {entry.version.changes.length} campo{entry.version.changes.length > 1 ? 's' : ''} alterado{entry.version.changes.length > 1 ? 's' : ''}:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {entry.version.changes.map((change, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {change.field}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Ações */}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedVersion(entry)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                            {entry.canRestore && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(entry)}
                                disabled={loading}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restaurar
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(entry)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Exportar
                            </Button>
                            {entry.canDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(entry)}
                              >
                                <Trash2 className="h-3 w-3 mr-1 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="compare" className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>Comparar Versões</CardTitle>
                  <CardDescription>Selecione duas versões para comparar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Versão 1</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={selectedVersion?.version.id || ''}
                        onChange={(e) => {
                          const entry = versionHistory.find(v => v.version.id === e.target.value);
                          setSelectedVersion(entry || null);
                        }}
                      >
                        <option value="">Selecione...</option>
                        {versionHistory.map(entry => (
                          <option key={entry.version.id} value={entry.version.id}>
                            v{entry.version.versionNumber} - {entry.version.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Versão 2</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={compareVersion?.version.id || ''}
                        onChange={(e) => {
                          const entry = versionHistory.find(v => v.version.id === e.target.value);
                          setCompareVersion(entry || null);
                        }}
                      >
                        <option value="">Selecione...</option>
                        {versionHistory.map(entry => (
                          <option key={entry.version.id} value={entry.version.id}>
                            v{entry.version.versionNumber} - {entry.version.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedVersion && compareVersion && (
                    <Button onClick={handleCompare} className="w-full">
                      <GitCompare className="h-4 w-4 mr-2" />
                      Comparar v{selectedVersion.version.versionNumber} com v{compareVersion.version.versionNumber}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedVersion && !showCompare} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Versão {selectedVersion?.version.versionNumber} - Detalhes
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1">
            {selectedVersion && (
              <div className="space-y-4 pr-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Versão:</p>
                        <p className="font-medium">v{selectedVersion.version.versionNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Autor:</p>
                        <p className="font-medium">{selectedVersion.version.author}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Data/Hora:</p>
                        <p className="font-medium">{formatDate(selectedVersion.version.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tamanho:</p>
                        <p className="font-medium">{formatFileSize(selectedVersion.version.fileSize)}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-gray-600 text-sm mb-1">Descrição:</p>
                      <p className="font-medium">{selectedVersion.version.description}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Alterações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderChanges(selectedVersion)}
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2 pt-4 border-t">
            {selectedVersion?.canRestore && (
              <Button onClick={() => selectedVersion && handleRestore(selectedVersion)} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Esta Versão
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedVersion(null)} className="flex-1">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Comparação */}
      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Comparação: v{selectedVersion?.version.versionNumber} vs v{compareVersion?.version.versionNumber}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1">
            {selectedVersion && compareVersion && (
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">v{selectedVersion.version.versionNumber}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1">
                      <p><strong>Autor:</strong> {selectedVersion.version.author}</p>
                      <p><strong>Data:</strong> {formatDate(selectedVersion.version.createdAt)}</p>
                      <p><strong>Descrição:</strong> {selectedVersion.version.description}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">v{compareVersion.version.versionNumber}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1">
                      <p><strong>Autor:</strong> {compareVersion.version.author}</p>
                      <p><strong>Data:</strong> {formatDate(compareVersion.version.createdAt)}</p>
                      <p><strong>Descrição:</strong> {compareVersion.version.description}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Diferenças</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      try {
                        const changes = PageVersionService.compareVersions(
                          selectedVersion.version.id,
                          compareVersion.version.id
                        );
                        
                        if (changes.length === 0) {
                          return <p className="text-sm text-gray-500">Nenhuma diferença encontrada</p>;
                        }

                        return (
                          <div className="space-y-2">
                            {changes.map((change, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded border text-sm">
                                <p className="font-medium text-gray-900 mb-2">{change.field}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-red-50 border border-red-200 p-2 rounded">
                                    <p className="text-red-600 font-medium text-xs mb-1">v{compareVersion.version.versionNumber}:</p>
                                    <p className="text-gray-700 text-xs break-all line-clamp-3">
                                      {typeof change.oldValue === 'object' 
                                        ? JSON.stringify(change.oldValue, null, 2)
                                        : String(change.oldValue || 'vazio')}
                                    </p>
                                  </div>
                                  <div className="bg-green-50 border border-green-200 p-2 rounded">
                                    <p className="text-green-600 font-medium text-xs mb-1">v{selectedVersion.version.versionNumber}:</p>
                                    <p className="text-gray-700 text-xs break-all line-clamp-3">
                                      {typeof change.newValue === 'object'
                                        ? JSON.stringify(change.newValue, null, 2)
                                        : String(change.newValue || 'vazio')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      } catch (error: any) {
                        return (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Erro ao comparar versões: {error.message}
                            </AlertDescription>
                          </Alert>
                        );
                      }
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCompare(false)} className="flex-1">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
