import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  History, 
  RotateCcw, 
  Clock, 
  User, 
  FileText,
  GitBranch,
  Calendar,
  Eye,
  Copy,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  GitCompare,
  Download
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from '../ui/alert';

interface Version {
  id: string;
  entityId: string;
  entityType: 'file' | 'page' | 'article' | 'menu' | 'list' | 'snippet';
  versionNumber: number;
  data: any;
  description: string;
  author: string;
  authorId: string;
  createdAt: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

interface EditLock {
  entityId: string;
  entityType: string;
  userId: string;
  userName: string;
  lockedAt: string;
}

interface VersionManagerProps {
  entityId: string;
  entityType: Version['entityType'];
  currentData: any;
  currentUser: any;
  onRestore?: (version: Version) => void;
  onClose?: () => void;
}

export function VersionManager({ 
  entityId, 
  entityType, 
  currentData, 
  currentUser,
  onRestore,
  onClose 
}: VersionManagerProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadVersions();
  }, [entityId, entityType]);

  const loadVersions = () => {
    const allVersions = JSON.parse(localStorage.getItem('versions') || '[]');
    const entityVersions = allVersions
      .filter((v: Version) => v.entityId === entityId && v.entityType === entityType)
      .sort((a: Version, b: Version) => b.versionNumber - a.versionNumber);
    setVersions(entityVersions);
  };

  const saveVersions = (updatedVersions: Version[]) => {
    const allVersions = JSON.parse(localStorage.getItem('versions') || '[]');
    const otherVersions = allVersions.filter(
      (v: Version) => !(v.entityId === entityId && v.entityType === entityType)
    );
    localStorage.setItem('versions', JSON.stringify([...otherVersions, ...updatedVersions]));
    setVersions(updatedVersions);
  };

  const createVersion = (data: any, desc: string) => {
    const latestVersion = versions.length > 0 ? versions[0].versionNumber : 0;
    
    const newVersion: Version = {
      id: `version-${Date.now()}`,
      entityId,
      entityType,
      versionNumber: latestVersion + 1,
      data: JSON.parse(JSON.stringify(data)),
      description: desc || 'Alteração sem descrição',
      author: currentUser.name,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      changes: calculateChanges(versions[0]?.data, data)
    };

    const updatedVersions = [newVersion, ...versions];
    saveVersions(updatedVersions);
    toast.success('Nova versão criada com sucesso!');
    return newVersion;
  };

  const calculateChanges = (oldData: any, newData: any): Version['changes'] => {
    if (!oldData) return [];
    
    const changes: Version['changes'] = [];
    const keys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    
    keys.forEach(key => {
      const oldValue = oldData?.[key];
      const newValue = newData?.[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue
        });
      }
    });
    
    return changes;
  };

  const restoreVersion = (version: Version) => {
    if (confirm(`Tem certeza que deseja restaurar para a versão ${version.versionNumber}?`)) {
      // Criar uma nova versão antes de restaurar
      createVersion(currentData, `Backup antes de restaurar para v${version.versionNumber}`);
      
      // Restaurar
      if (onRestore) {
        onRestore(version);
      }
      
      toast.success(`Restaurado para versão ${version.versionNumber}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  const exportVersion = (version: Version) => {
    const dataStr = JSON.stringify(version, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `version-${version.versionNumber}-${entityType}-${entityId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Versão exportada com sucesso!');
  };

  const compareVersions = (v1: Version, v2: Version) => {
    setSelectedVersion(v1);
    setCompareVersion(v2);
    setShowCompare(true);
  };

  const renderChanges = (changes?: Version['changes']) => {
    if (!changes || changes.length === 0) {
      return <p className="text-sm text-gray-500">Nenhuma alteração detectada</p>;
    }

    return (
      <div className="space-y-2">
        {changes.map((change, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded border">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{change.field}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="bg-red-50 border border-red-200 p-2 rounded">
                    <p className="text-red-600 font-medium mb-1">Anterior:</p>
                    <p className="text-gray-700 break-all">
                      {typeof change.oldValue === 'object' 
                        ? JSON.stringify(change.oldValue, null, 2)
                        : String(change.oldValue || 'vazio')}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-2 rounded">
                    <p className="text-green-600 font-medium mb-1">Novo:</p>
                    <p className="text-gray-700 break-all">
                      {typeof change.newValue === 'object'
                        ? JSON.stringify(change.newValue, null, 2)
                        : String(change.newValue || 'vazio')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-gray-900 mb-2">
            <History className="w-5 h-5" />
            Histórico de Versões
          </h2>
          <p className="text-gray-600">
            {versions.length} versão{versions.length !== 1 ? 'ões' : ''} encontrada{versions.length !== 1 ? 's' : ''}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}
      </div>

      {/* Alert de informações */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Cada versão salva um snapshot completo dos dados. Você pode restaurar qualquer versão anterior com um clique.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">
            <History className="w-4 h-4 mr-2" />
            Lista de Versões
          </TabsTrigger>
          <TabsTrigger value="compare">
            <GitCompare className="w-4 h-4 mr-2" />
            Comparar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <ScrollArea className="h-[600px] pr-4">
            {versions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma versão encontrada</p>
                  <p className="text-sm mt-1">As versões serão criadas automaticamente ao salvar alterações</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <Card key={version.id} className={index === 0 ? 'border-indigo-200 bg-indigo-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={index === 0 ? 'default' : 'secondary'}>
                              v{version.versionNumber}
                            </Badge>
                            {index === 0 && (
                              <Badge className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Atual
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 mb-1">
                            {version.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {version.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getRelativeTime(version.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(version.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mudanças */}
                      {version.changes && version.changes.length > 0 && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            {version.changes.length} campo{version.changes.length > 1 ? 's' : ''} alterado{version.changes.length > 1 ? 's' : ''}:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {version.changes.map((change, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {change.field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVersion(version)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Detalhes
                        </Button>
                        {index > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreVersion(version)}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restaurar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportVersion(version)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Exportar
                        </Button>
                        {index > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => compareVersions(versions[0], version)}
                          >
                            <GitCompare className="w-3 h-3 mr-1" />
                            Comparar
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

        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparar Versões</CardTitle>
              <CardDescription>Selecione duas versões para comparar as diferenças</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Versão 1</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded"
                    value={selectedVersion?.id || ''}
                    onChange={(e) => {
                      const v = versions.find(v => v.id === e.target.value);
                      setSelectedVersion(v || null);
                    }}
                  >
                    <option value="">Selecione uma versão</option>
                    {versions.map(v => (
                      <option key={v.id} value={v.id}>
                        v{v.versionNumber} - {v.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Versão 2</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded"
                    value={compareVersion?.id || ''}
                    onChange={(e) => {
                      const v = versions.find(v => v.id === e.target.value);
                      setCompareVersion(v || null);
                    }}
                  >
                    <option value="">Selecione uma versão</option>
                    {versions.map(v => (
                      <option key={v.id} value={v.id}>
                        v{v.versionNumber} - {v.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedVersion && compareVersion && (
                <div className="mt-6">
                  <Button 
                    onClick={() => setShowCompare(true)}
                    className="w-full"
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    Comparar v{selectedVersion.versionNumber} com v{compareVersion.versionNumber}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes da Versão */}
      <Dialog open={!!selectedVersion && !showCompare} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Versão {selectedVersion?.versionNumber} - Detalhes
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre esta versão
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {selectedVersion && (
              <>
                {/* Metadados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Versão:</p>
                        <p className="font-medium">v{selectedVersion.versionNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Autor:</p>
                        <p className="font-medium">{selectedVersion.author}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Data/Hora:</p>
                        <p className="font-medium">{formatDate(selectedVersion.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tipo:</p>
                        <p className="font-medium capitalize">{selectedVersion.entityType}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-gray-600 text-sm mb-1">Descrição:</p>
                      <p className="font-medium">{selectedVersion.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Alterações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Alterações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderChanges(selectedVersion.changes)}
                  </CardContent>
                </Card>

                {/* Dados Completos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados Completos (JSON)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-[300px]">
                      {JSON.stringify(selectedVersion.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t mt-4">
            {selectedVersion && versions.findIndex(v => v.id === selectedVersion.id) > 0 && (
              <Button 
                onClick={() => {
                  restoreVersion(selectedVersion);
                  setSelectedVersion(null);
                }}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar Esta Versão
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setSelectedVersion(null)}
              className="flex-1"
            >
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
              Comparação: v{selectedVersion?.versionNumber} vs v{compareVersion?.versionNumber}
            </DialogTitle>
            <DialogDescription>
              Diferenças entre as versões selecionadas
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {selectedVersion && compareVersion && (
              <div className="space-y-4">
                {/* Informações das Versões */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        v{selectedVersion.versionNumber}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1">
                      <p><strong>Autor:</strong> {selectedVersion.author}</p>
                      <p><strong>Data:</strong> {formatDate(selectedVersion.createdAt)}</p>
                      <p><strong>Descrição:</strong> {selectedVersion.description}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        v{compareVersion.versionNumber}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1">
                      <p><strong>Autor:</strong> {compareVersion.author}</p>
                      <p><strong>Data:</strong> {formatDate(compareVersion.createdAt)}</p>
                      <p><strong>Descrição:</strong> {compareVersion.description}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Diferenças */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Diferenças Detectadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderChanges(calculateChanges(compareVersion.data, selectedVersion.data))}
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setShowCompare(false)} className="flex-1">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Hook para criar versões facilmente
export function useVersionControl(entityId: string, entityType: Version['entityType'], currentUser: any) {
  const createVersion = (data: any, description: string) => {
    const allVersions = JSON.parse(localStorage.getItem('versions') || '[]');
    const entityVersions = allVersions.filter(
      (v: Version) => v.entityId === entityId && v.entityType === entityType
    );
    
    const latestVersion = entityVersions.length > 0 
      ? Math.max(...entityVersions.map((v: Version) => v.versionNumber))
      : 0;

    const newVersion: Version = {
      id: `version-${Date.now()}`,
      entityId,
      entityType,
      versionNumber: latestVersion + 1,
      data: JSON.parse(JSON.stringify(data)),
      description,
      author: currentUser.name,
      authorId: currentUser.id,
      createdAt: new Date().toISOString()
    };

    allVersions.push(newVersion);
    localStorage.setItem('versions', JSON.stringify(allVersions));
    return newVersion;
  };

  return { createVersion };
}

// Sistema de Lock de Edição
export function useEditLock(entityId: string, entityType: string, currentUser: any) {
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<EditLock | null>(null);

  useEffect(() => {
    checkLock();
    const interval = setInterval(checkLock, 5000); // Verificar a cada 5s
    return () => clearInterval(interval);
  }, [entityId, entityType]);

  const checkLock = () => {
    const locks: EditLock[] = JSON.parse(localStorage.getItem('editLocks') || '[]');
    const lock = locks.find(l => l.entityId === entityId && l.entityType === entityType);
    
    if (lock) {
      // Verificar se o lock está ativo (menos de 5 minutos)
      const lockDate = new Date(lock.lockedAt);
      const now = new Date();
      const diffMinutes = (now.getTime() - lockDate.getTime()) / 1000 / 60;
      
      if (diffMinutes > 5) {
        // Lock expirado, remover
        releaseLock();
      } else if (lock.userId !== currentUser.id) {
        setIsLocked(true);
        setLockedBy(lock);
      } else {
        setIsLocked(false);
        setLockedBy(null);
      }
    } else {
      setIsLocked(false);
      setLockedBy(null);
    }
  };

  const acquireLock = () => {
    const locks: EditLock[] = JSON.parse(localStorage.getItem('editLocks') || '[]');
    const otherLocks = locks.filter(l => !(l.entityId === entityId && l.entityType === entityType));
    
    const newLock: EditLock = {
      entityId,
      entityType,
      userId: currentUser.id,
      userName: currentUser.name,
      lockedAt: new Date().toISOString()
    };
    
    otherLocks.push(newLock);
    localStorage.setItem('editLocks', JSON.stringify(otherLocks));
    setIsLocked(false);
    setLockedBy(null);
  };

  const releaseLock = () => {
    const locks: EditLock[] = JSON.parse(localStorage.getItem('editLocks') || '[]');
    const otherLocks = locks.filter(l => !(l.entityId === entityId && l.entityType === entityType));
    localStorage.setItem('editLocks', JSON.stringify(otherLocks));
    setIsLocked(false);
    setLockedBy(null);
  };

  const updateLock = () => {
    acquireLock(); // Atualizar timestamp
  };

  return { isLocked, lockedBy, acquireLock, releaseLock, updateLock };
}
