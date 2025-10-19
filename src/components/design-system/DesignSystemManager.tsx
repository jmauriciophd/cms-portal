import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Palette, 
  Download, 
  Upload, 
  RefreshCw, 
  Check, 
  X, 
  AlertTriangle,
  Link as LinkIcon,
  Package,
  Settings,
  History,
  GitBranch,
  Eye
} from 'lucide-react';
import { designSystemService, DesignSystemVersion, DSComponent } from '../../services/DesignSystemService';
import { designSystemSyncService, SyncSource, SyncResult } from '../../services/DesignSystemSyncService';
import { toast } from 'sonner@2.0.3';
import { TokenEditor } from './TokenEditor';
import { ComponentMapper } from './ComponentMapper';
import { SyncSourceManager } from './SyncSourceManager';
import { DSComponentBindingPanel } from './DSComponentBindingPanel';

export function DesignSystemManager() {
  const [currentDS, setCurrentDS] = useState<DesignSystemVersion | null>(null);
  const [versions, setVersions] = useState<DesignSystemVersion[]>([]);
  const [syncSources, setSyncSources] = useState<SyncSource[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncResult[]>([]);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);

  useEffect(() => {
    loadData();
    designSystemService.initialize();
  }, []);

  const loadData = () => {
    setCurrentDS(designSystemService.getCurrentDesignSystem());
    setVersions(designSystemService.getVersions());
    setSyncSources(designSystemSyncService.getSources());
    setSyncHistory(designSystemSyncService.getSyncHistory());
  };

  const handleExport = () => {
    try {
      const data = designSystemService.export();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `design-system-${currentDS?.version || 'export'}.json`;
      link.click();
      toast.success('Design System exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar Design System');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event: any) => {
        try {
          designSystemService.import(event.target.result);
          loadData();
          toast.success('Design System importado com sucesso!');
        } catch (error) {
          toast.error('Erro ao importar Design System');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleSync = async (sourceId: string) => {
    toast.info('Iniciando sincronização...');
    const result = await designSystemSyncService.sync(sourceId);
    
    if (result.success) {
      toast.success(`Sincronizado com sucesso! Versão: ${result.newVersion}`);
      loadData();
    } else {
      toast.error(`Erro na sincronização: ${result.errors?.join(', ')}`);
    }
  };

  const handleValidate = () => {
    const result = designSystemSyncService.validate();
    setValidation(result);
    
    if (result.valid) {
      toast.success('Design System válido!');
    } else {
      toast.error(`${result.errors.length} erro(s) encontrado(s)`);
    }
  };

  const handleVersionChange = (versionId: string) => {
    designSystemService.setCurrentVersion(versionId);
    loadData();
    toast.success('Versão alterada com sucesso!');
  };

  const handleCreateDefaultDS = () => {
    const defaultDS = designSystemService.createDefaultDesignSystem();
    designSystemService.saveVersion(defaultDS);
    designSystemService.setCurrentVersion(defaultDS.version);
    loadData();
    toast.success('Design System padrão criado!');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Design System</h1>
          <p className="text-gray-600">
            Gerencie tokens, componentes e sincronização com fontes externas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleValidate}>
            <Check className="w-4 h-4 mr-2" />
            Validar
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>

      {!currentDS ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Design System Configurado</CardTitle>
            <CardDescription>
              Comece criando um Design System padrão ou importe um existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={handleCreateDefaultDS}>
                <Package className="w-4 h-4 mr-2" />
                Criar Design System Padrão
              </Button>
              <Button variant="outline" onClick={handleImport}>
                <Upload className="w-4 h-4 mr-2" />
                Importar Design System
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Status e Versão */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Versão Atual: {currentDS.version}</CardTitle>
                  <CardDescription>
                    Última atualização: {new Date(currentDS.timestamp).toLocaleString('pt-BR')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {currentDS.breaking && (
                    <Badge variant="destructive">Breaking Changes</Badge>
                  )}
                  <Badge variant="outline">
                    {currentDS.components.length} componentes
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <select
                  className="flex-1 p-2 border rounded-md"
                  value={currentDS.version}
                  onChange={(e) => handleVersionChange(e.target.value)}
                >
                  {versions.map(v => (
                    <option key={v.version} value={v.version}>
                      v{v.version} - {new Date(v.timestamp).toLocaleDateString('pt-BR')}
                      {v.breaking ? ' (Breaking)' : ''}
                    </option>
                  ))}
                </select>
                <Button variant="outline" onClick={() => loadData()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validação */}
          {validation && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {validation.valid ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <CardTitle>
                    {validation.valid ? 'Design System Válido' : 'Problemas Encontrados'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {validation.errors.length > 0 && (
                  <div className="mb-4">
                    <h3 className="flex items-center gap-2 mb-2 text-red-600">
                      <X className="w-4 h-4" />
                      Erros ({validation.errors.length})
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.errors.map((error, i) => (
                        <li key={i} className="text-sm text-red-600">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validation.warnings.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 mb-2 text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      Avisos ({validation.warnings.length})
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.warnings.map((warning, i) => (
                        <li key={i} className="text-sm text-amber-600">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validation.valid && validation.errors.length === 0 && validation.warnings.length === 0 && (
                  <p className="text-green-600">
                    Todos os checks passaram! Seu Design System está consistente.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tabs principais */}
          <Tabs defaultValue="tokens" className="space-y-6">
            <TabsList>
              <TabsTrigger value="tokens">
                <Palette className="w-4 h-4 mr-2" />
                Tokens
              </TabsTrigger>
              <TabsTrigger value="components">
                <Package className="w-4 h-4 mr-2" />
                Componentes
              </TabsTrigger>
              <TabsTrigger value="bindings">
                <LinkIcon className="w-4 h-4 mr-2" />
                Bindings CMS
              </TabsTrigger>
              <TabsTrigger value="mapping">
                <LinkIcon className="w-4 h-4 mr-2" />
                Mapeamento
              </TabsTrigger>
              <TabsTrigger value="sync">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronização
              </TabsTrigger>
              <TabsTrigger value="changelog">
                <History className="w-4 h-4 mr-2" />
                Changelog
              </TabsTrigger>
            </TabsList>

            {/* Bindings CMS */}
            <TabsContent value="bindings">
              <DSComponentBindingPanel />
            </TabsContent>

            {/* Tokens */}
            <TabsContent value="tokens">
              <TokenEditor 
                tokens={currentDS.tokens}
                onUpdate={(tokens) => {
                  const updated = { ...currentDS, tokens };
                  designSystemService.saveVersion(updated);
                  loadData();
                  toast.success('Tokens atualizados!');
                }}
              />
            </TabsContent>

            {/* Componentes */}
            <TabsContent value="components">
              <Card>
                <CardHeader>
                  <CardTitle>Componentes do Design System</CardTitle>
                  <CardDescription>
                    {currentDS.components.length} componente(s) disponível(is)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentDS.components.map(component => (
                      <Card key={component.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium">{component.name}</h3>
                              <p className="text-sm text-gray-600">{component.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">{component.category}</Badge>
                              <Badge variant="outline">v{component.version}</Badge>
                              {component.deprecated && (
                                <Badge variant="destructive">Deprecated</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            {component.variants.map(variant => (
                              <Badge key={variant.id} variant="secondary">
                                {variant.name}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mapeamento */}
            <TabsContent value="mapping">
              <ComponentMapper 
                dsComponents={currentDS.components}
                onUpdate={() => {
                  loadData();
                  toast.success('Mapeamento atualizado!');
                }}
              />
            </TabsContent>

            {/* Sincronização */}
            <TabsContent value="sync">
              <SyncSourceManager
                sources={syncSources}
                history={syncHistory}
                onSync={handleSync}
                onUpdate={() => loadData()}
              />
            </TabsContent>

            {/* Changelog */}
            <TabsContent value="changelog">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Mudanças</CardTitle>
                  <CardDescription>
                    {currentDS.changelog.length} mudança(s) nesta versão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentDS.changelog.map((entry, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={
                                  entry.type === 'add' ? 'default' :
                                  entry.type === 'remove' ? 'destructive' :
                                  entry.type === 'deprecate' ? 'secondary' :
                                  'outline'
                                }>
                                  {entry.type}
                                </Badge>
                                <Badge variant="outline">{entry.category}</Badge>
                                <span className="text-sm text-gray-600">{entry.id}</span>
                              </div>
                              {entry.migration && (
                                <p className="text-sm text-gray-600">
                                  {entry.migration.from} → {entry.migration.to}
                                  {entry.migration.notes && (
                                    <span className="text-gray-500"> ({entry.migration.notes})</span>
                                  )}
                                </p>
                              )}
                            </div>
                            {entry.impact && (
                              <Badge variant={
                                entry.impact === 'breaking' ? 'destructive' :
                                entry.impact === 'high' ? 'secondary' :
                                'outline'
                              }>
                                {entry.impact}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
