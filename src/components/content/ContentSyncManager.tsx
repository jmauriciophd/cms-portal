/**
 * Gerenciador de Sincronização de Conteúdo
 * Interface para importar, mapear e sincronizar dados do JSON
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { 
  Upload, Download, Play, Pause, Trash2, Edit, FileJson, 
  RefreshCw, Check, X, Clock, AlertCircle, Zap, Database,
  Settings, History, Link as LinkIcon, Bot
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { dataSyncService, type SyncConfiguration, type SyncResult, type TransformRule } from '../../services/DataSyncService';
import { mapJsonToFields, getFriendlyName, type FieldDefinition } from '../../utils/fieldTypeMapper';

const EXAMPLE_JSON = {
  "ID": 23,
  "Created": "2019-06-04T17:02:00Z",
  "AuthorId": 6,
  "Modified": "2024-01-05T20:28:47Z",
  "EditorId": 82,
  "Title": "Exemplo de Conteúdo",
  "CampoCategoria2Id": 5,
  "CampoDataConteudo2": "2024-01-15T10:00:00Z",
  "CampoTituloChamada": "Título da Chamada",
  "CampoResumo2": "Este é um resumo de exemplo",
  "CampoTelaCheia1": false,
  "CampoExibirNaHome": true,
  "PublishingPageContent": "<p>Conteúdo HTML da página</p>",
  "Resumo": "Resumo do conteúdo",
  "CategoriasId": 3,
  "ListaUnidadesSTJId": {
    "__metadata": {
      "type": "Collection(Edm.Int32)"
    },
    "results": [1, 2, 3]
  }
};

export function ContentSyncManager() {
  const [configs, setConfigs] = useState<SyncConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SyncConfiguration | null>(null);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  
  // JSON import
  const [jsonInput, setJsonInput] = useState('');
  const [mappedFields, setMappedFields] = useState<FieldDefinition[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  
  // Config form
  const [configForm, setConfigForm] = useState({
    name: '',
    sourceType: 'json' as 'json' | 'api' | 'file',
    sourceUrl: '',
    sourceData: null as any,
    targetType: 'page' as 'page' | 'article' | 'custom_list',
    targetId: '',
    fieldMappings: {} as Record<string, string>,
    autoSync: false,
    syncInterval: 60,
    enabled: true,
    transformRules: [] as TransformRule[]
  });
  
  useEffect(() => {
    loadConfigs();
  }, []);
  
  useEffect(() => {
    if (selectedConfig) {
      loadHistory(selectedConfig.id);
    }
  }, [selectedConfig]);
  
  const loadConfigs = () => {
    const allConfigs = dataSyncService.getConfigs();
    setConfigs(allConfigs);
  };
  
  const loadHistory = (configId: string) => {
    const history = dataSyncService.getHistory(configId);
    setSyncHistory(history.reverse().slice(0, 20)); // Últimas 20 entradas
  };
  
  const handleLoadExample = () => {
    setJsonInput(JSON.stringify(EXAMPLE_JSON, null, 2));
    toast.success('JSON de exemplo carregado');
  };
  
  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        setJsonInput(text);
        toast.success('Arquivo JSON importado');
      } catch (error) {
        toast.error('Erro ao ler arquivo');
        console.error(error);
      }
    };
    
    input.click();
  };
  
  const handleParseJson = async () => {
    try {
      const json = JSON.parse(jsonInput);
      const mapped = await mapJsonToFields(json);
      
      setMappedFields(mapped.fields);
      setPreviewData(mapped.values);
      setConfigForm(prev => ({
        ...prev,
        sourceData: json
      }));
      
      toast.success(`${mapped.fields.length} campos identificados`);
    } catch (error) {
      toast.error('JSON inválido');
      console.error(error);
    }
  };
  
  const handleCreateConfig = async () => {
    if (!configForm.name.trim()) {
      toast.error('Nome da configuração é obrigatório');
      return;
    }
    
    if (Object.keys(configForm.fieldMappings).length === 0) {
      toast.error('Mapeie pelo menos um campo');
      return;
    }
    
    try {
      const id = dataSyncService.createConfig(configForm);
      loadConfigs();
      setIsEditingConfig(false);
      setSelectedConfig(dataSyncService.getConfig(id) || null);
      toast.success('Configuração criada com sucesso');
    } catch (error) {
      toast.error('Erro ao criar configuração');
      console.error(error);
    }
  };
  
  const handleUpdateConfig = () => {
    if (!selectedConfig) return;
    
    try {
      dataSyncService.updateConfig(selectedConfig.id, configForm);
      loadConfigs();
      setSelectedConfig(dataSyncService.getConfig(selectedConfig.id) || null);
      setIsEditingConfig(false);
      toast.success('Configuração atualizada');
    } catch (error) {
      toast.error('Erro ao atualizar');
      console.error(error);
    }
  };
  
  const handleDeleteConfig = (id: string) => {
    if (!confirm('Deseja realmente excluir esta configuração?')) return;
    
    dataSyncService.deleteConfig(id);
    loadConfigs();
    if (selectedConfig?.id === id) {
      setSelectedConfig(null);
    }
    toast.success('Configuração excluída');
  };
  
  const handleSync = async (configId: string) => {
    setIsSyncing(true);
    
    try {
      const result = await dataSyncService.sync(configId, 'manual');
      setLastResult(result);
      
      if (result.success) {
        toast.success(`Sincronização concluída: ${result.recordsSuccess} registro(s)`);
      } else {
        toast.error(`Erro na sincronização: ${result.errors.length} erro(s)`);
      }
      
      loadConfigs();
      if (selectedConfig) {
        loadHistory(selectedConfig.id);
      }
    } catch (error) {
      toast.error('Erro ao sincronizar');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleToggleAutoSync = (config: SyncConfiguration) => {
    dataSyncService.updateConfig(config.id, {
      autoSync: !config.autoSync
    });
    loadConfigs();
    toast.success(config.autoSync ? 'Sync automático desativado' : 'Sync automático ativado');
  };
  
  const handleToggleEnabled = (config: SyncConfiguration) => {
    dataSyncService.updateConfig(config.id, {
      enabled: !config.enabled
    });
    loadConfigs();
    toast.success(config.enabled ? 'Configuração desativada' : 'Configuração ativada');
  };
  
  const handleAddFieldMapping = (sourceField: string, targetField: string) => {
    setConfigForm(prev => ({
      ...prev,
      fieldMappings: {
        ...prev.fieldMappings,
        [sourceField]: targetField
      }
    }));
  };
  
  const handleRemoveFieldMapping = (sourceField: string) => {
    const { [sourceField]: removed, ...rest } = configForm.fieldMappings;
    setConfigForm(prev => ({
      ...prev,
      fieldMappings: rest
    }));
  };
  
  const handleAutoMapFields = () => {
    const autoMapped: Record<string, string> = {};
    
    mappedFields.forEach(field => {
      // Mapeia campos comuns automaticamente
      const internalName = field.internalName;
      
      if (internalName === 'Title') {
        autoMapped[internalName] = 'title';
      } else if (internalName === 'Created') {
        autoMapped[internalName] = 'createdAt';
      } else if (internalName === 'Modified') {
        autoMapped[internalName] = 'updatedAt';
      } else if (internalName.includes('Content') || internalName.includes('Conteudo')) {
        autoMapped[internalName] = 'content';
      } else if (internalName.includes('Resumo') || internalName.includes('Summary')) {
        autoMapped[internalName] = 'excerpt';
      } else if (internalName.includes('Categoria')) {
        autoMapped[internalName] = 'category';
      } else {
        // Usa o nome interno como está
        autoMapped[internalName] = internalName;
      }
    });
    
    setConfigForm(prev => ({
      ...prev,
      fieldMappings: autoMapped
    }));
    
    toast.success('Mapeamento automático aplicado');
  };
  
  const handleUseAI = async () => {
    toast.info('Recurso de IA em desenvolvimento');
    // TODO: Integrar com AIService para sugestões inteligentes de mapeamento
  };
  
  const handleEditConfig = (config: SyncConfiguration) => {
    setSelectedConfig(config);
    setConfigForm({
      name: config.name,
      sourceType: config.sourceType,
      sourceUrl: config.sourceUrl || '',
      sourceData: config.sourceData || null,
      targetType: config.targetType,
      targetId: config.targetId || '',
      fieldMappings: config.fieldMappings,
      autoSync: config.autoSync,
      syncInterval: config.syncInterval || 60,
      enabled: config.enabled,
      transformRules: config.transformRules || []
    });
    
    if (config.sourceData) {
      setJsonInput(JSON.stringify(config.sourceData, null, 2));
      mapJsonToFields(config.sourceData).then(mapped => {
        setMappedFields(mapped.fields);
        setPreviewData(mapped.values);
      });
    }
    
    setIsEditingConfig(true);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Sincronização de Conteúdo</h1>
          <p className="text-muted-foreground">
            Importe e sincronize dados do JSON com páginas, matérias e listas personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLoadExample}>
            <FileJson className="w-4 h-4 mr-2" />
            Carregar Exemplo
          </Button>
          <Dialog open={isEditingConfig} onOpenChange={setIsEditingConfig}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setSelectedConfig(null);
                setConfigForm({
                  name: '',
                  sourceType: 'json',
                  sourceUrl: '',
                  sourceData: null,
                  targetType: 'page',
                  targetId: '',
                  fieldMappings: {},
                  autoSync: false,
                  syncInterval: 60,
                  enabled: true,
                  transformRules: []
                });
                setJsonInput('');
                setMappedFields([]);
                setPreviewData(null);
              }}>
                <Upload className="w-4 h-4 mr-2" />
                Nova Sincronização
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>
                  {selectedConfig ? 'Editar Sincronização' : 'Nova Sincronização'}
                </DialogTitle>
                <DialogDescription>
                  Configure a importação e mapeamento de dados do JSON
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="source" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="source">1. Fonte de Dados</TabsTrigger>
                  <TabsTrigger value="mapping">2. Mapeamento</TabsTrigger>
                  <TabsTrigger value="target">3. Destino</TabsTrigger>
                  <TabsTrigger value="schedule">4. Agendamento</TabsTrigger>
                </TabsList>
                
                <TabsContent value="source" className="space-y-4">
                  <div>
                    <Label htmlFor="config-name">Nome da Configuração</Label>
                    <Input
                      id="config-name"
                      value={configForm.name}
                      onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                      placeholder="Ex: Importar Notícias do SharePoint"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="source-type">Tipo de Fonte</Label>
                    <Select
                      value={configForm.sourceType}
                      onValueChange={(value: any) => setConfigForm({ ...configForm, sourceType: value })}
                    >
                      <SelectTrigger id="source-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON Direto</SelectItem>
                        <SelectItem value="api">API REST</SelectItem>
                        <SelectItem value="file">Arquivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {configForm.sourceType === 'api' && (
                    <div>
                      <Label htmlFor="source-url">URL da API</Label>
                      <Input
                        id="source-url"
                        value={configForm.sourceUrl}
                        onChange={(e) => setConfigForm({ ...configForm, sourceUrl: e.target.value })}
                        placeholder="https://api.exemplo.com/data"
                      />
                    </div>
                  )}
                  
                  {configForm.sourceType === 'json' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="json-input">JSON</Label>
                        <Button size="sm" variant="outline" onClick={handleImportFile}>
                          <Upload className="w-4 h-4 mr-2" />
                          Importar Arquivo
                        </Button>
                      </div>
                      <Textarea
                        id="json-input"
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="Cole seu JSON aqui..."
                        className="font-mono text-sm h-64"
                      />
                      <Button onClick={handleParseJson} className="mt-2 w-full">
                        <Database className="w-4 h-4 mr-2" />
                        Analisar JSON
                      </Button>
                    </div>
                  )}
                  
                  {mappedFields.length > 0 && (
                    <Card className="p-4">
                      <h4 className="mb-2">Campos Identificados</h4>
                      <div className="flex flex-wrap gap-2">
                        {mappedFields.map((field) => (
                          <Badge key={field.internalName} variant="secondary">
                            {field.name} ({field.type})
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="mapping" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4>Mapeamento de Campos</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleAutoMapFields}>
                        <Zap className="w-4 h-4 mr-2" />
                        Auto-mapear
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleUseAI}>
                        <Bot className="w-4 h-4 mr-2" />
                        Usar IA
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-96">
                    <div className="space-y-3 pr-4">
                      {mappedFields.map((field) => (
                        <div key={field.internalName} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span>{field.name}</span>
                              <Badge variant="outline" className="text-xs">{field.type}</Badge>
                            </div>
                            <code className="text-xs text-muted-foreground">{field.internalName}</code>
                          </div>
                          <LinkIcon className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <Input
                              value={configForm.fieldMappings[field.internalName] || ''}
                              onChange={(e) => handleAddFieldMapping(field.internalName, e.target.value)}
                              placeholder="Campo de destino"
                            />
                          </div>
                          {configForm.fieldMappings[field.internalName] && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveFieldMapping(field.internalName)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {Object.keys(configForm.fieldMappings).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum campo mapeado</p>
                      <p className="text-sm">Use o botão "Auto-mapear" para começar</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="target" className="space-y-4">
                  <div>
                    <Label htmlFor="target-type">Tipo de Destino</Label>
                    <Select
                      value={configForm.targetType}
                      onValueChange={(value: any) => setConfigForm({ ...configForm, targetType: value })}
                    >
                      <SelectTrigger id="target-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page">Páginas</SelectItem>
                        <SelectItem value="article">Matérias/Artigos</SelectItem>
                        <SelectItem value="custom_list">Lista Personalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="target-id">ID do Destino (opcional)</Label>
                    <Input
                      id="target-id"
                      value={configForm.targetId}
                      onChange={(e) => setConfigForm({ ...configForm, targetId: e.target.value })}
                      placeholder="Deixe vazio para criar novo"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Se especificado, atualiza o item existente. Caso contrário, cria um novo.
                    </p>
                  </div>
                  
                  {previewData && (
                    <Card className="p-4">
                      <h4 className="mb-2">Preview dos Dados</h4>
                      <ScrollArea className="h-48">
                        <pre className="text-xs">
                          {JSON.stringify(
                            Object.fromEntries(
                              Object.entries(configForm.fieldMappings).map(([source, target]) => [
                                target,
                                previewData[source]
                              ])
                            ),
                            null,
                            2
                          )}
                        </pre>
                      </ScrollArea>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="schedule" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-sync">Sincronização Automática</Label>
                      <p className="text-xs text-muted-foreground">
                        Executa a sincronização automaticamente em intervalos definidos
                      </p>
                    </div>
                    <Switch
                      id="auto-sync"
                      checked={configForm.autoSync}
                      onCheckedChange={(checked) => setConfigForm({ ...configForm, autoSync: checked })}
                    />
                  </div>
                  
                  {configForm.autoSync && (
                    <div>
                      <Label htmlFor="sync-interval">Intervalo (minutos)</Label>
                      <Input
                        id="sync-interval"
                        type="number"
                        min="1"
                        value={configForm.syncInterval}
                        onChange={(e) => setConfigForm({ ...configForm, syncInterval: Number(e.target.value) })}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enabled">Habilitado</Label>
                      <p className="text-xs text-muted-foreground">
                        Permite que esta configuração seja executada
                      </p>
                    </div>
                    <Switch
                      id="enabled"
                      checked={configForm.enabled}
                      onCheckedChange={(checked) => setConfigForm({ ...configForm, enabled: checked })}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditingConfig(false)}>
                  Cancelar
                </Button>
                <Button onClick={selectedConfig ? handleUpdateConfig : handleCreateConfig}>
                  {selectedConfig ? 'Atualizar' : 'Criar Configuração'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Lista de configurações */}
        <Card className="col-span-4 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3>Configurações de Sync</h3>
            <Badge variant="secondary">{configs.length}</Badge>
          </div>
          
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedConfig?.id === config.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedConfig(config)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{config.name}</span>
                        {!config.enabled && (
                          <Badge variant="secondary" className="text-xs">Desativado</Badge>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {config.sourceType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          → {config.targetType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {config.lastSync && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(config.lastSync).toLocaleString('pt-BR')}
                    </p>
                  )}
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSync(config.id);
                      }}
                      disabled={isSyncing}
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAutoSync(config);
                      }}
                    >
                      {config.autoSync ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditConfig(config);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConfig(config.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {configs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma configuração</p>
                  <p className="text-sm">Crie sua primeira sincronização</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
        
        {/* Detalhes e histórico */}
        <Card className="col-span-8 p-4">
          {selectedConfig ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="result">Último Resultado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3>{selectedConfig.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSync(selectedConfig.id)}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Sincronizar Agora
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fonte</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedConfig.sourceType}
                      {selectedConfig.sourceUrl && ` - ${selectedConfig.sourceUrl}`}
                    </p>
                  </div>
                  <div>
                    <Label>Destino</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedConfig.targetType}
                      {selectedConfig.targetId && ` (ID: ${selectedConfig.targetId})`}
                    </p>
                  </div>
                  <div>
                    <Label>Sync Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedConfig.autoSync ? `Sim (${selectedConfig.syncInterval} min)` : 'Não'}
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedConfig.enabled ? 'Habilitado' : 'Desabilitado'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label>Mapeamento de Campos</Label>
                  <ScrollArea className="h-64 mt-2">
                    <div className="space-y-1">
                      {Object.entries(selectedConfig.fieldMappings).map(([source, target]) => (
                        <div key={source} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                          <code className="flex-1">{source}</code>
                          <LinkIcon className="w-3 h-3 text-muted-foreground" />
                          <code className="flex-1">{target}</code>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {syncHistory.map((entry) => (
                      <div key={entry.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {entry.result.success ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm">
                              {new Date(entry.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <Badge variant={entry.triggeredBy === 'manual' ? 'default' : 'secondary'}>
                            {entry.triggeredBy}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Processados:</span>{' '}
                            {entry.result.recordsProcessed}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sucesso:</span>{' '}
                            <span className="text-green-600">{entry.result.recordsSuccess}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Falhas:</span>{' '}
                            <span className="text-red-600">{entry.result.recordsFailed}</span>
                          </div>
                        </div>
                        
                        {entry.result.errors.length > 0 && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs">
                            {entry.result.errors.map((error: any, i: number) => (
                              <div key={i}>
                                <strong>{error.field}:</strong> {error.error}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {syncHistory.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma sincronização realizada</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="result">
                {lastResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {lastResult.success ? (
                        <Check className="w-6 h-6 text-green-600" />
                      ) : (
                        <X className="w-6 h-6 text-red-600" />
                      )}
                      <h3>
                        {lastResult.success ? 'Sincronização Bem-Sucedida' : 'Sincronização com Erros'}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground">Processados</div>
                        <div className="text-2xl">{lastResult.recordsProcessed}</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground">Sucesso</div>
                        <div className="text-2xl text-green-600">{lastResult.recordsSuccess}</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground">Falhas</div>
                        <div className="text-2xl text-red-600">{lastResult.recordsFailed}</div>
                      </Card>
                    </div>
                    
                    {lastResult.changes.length > 0 && (
                      <div>
                        <h4 className="mb-2">Mudanças Aplicadas</h4>
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {lastResult.changes.map((change, i) => (
                              <div key={i} className="p-2 border rounded text-sm">
                                <strong>{change.field}</strong>
                                <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Antes:</span>{' '}
                                    <code>{JSON.stringify(change.oldValue)}</code>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Depois:</span>{' '}
                                    <code>{JSON.stringify(change.newValue)}</code>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                    
                    {lastResult.errors.length > 0 && (
                      <div>
                        <h4 className="mb-2">Erros</h4>
                        <div className="space-y-2">
                          {lastResult.errors.map((error, i) => (
                            <div key={i} className="p-3 bg-red-50 dark:bg-red-950/20 rounded text-sm">
                              <strong>{error.field}:</strong> {error.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Execute uma sincronização para ver os resultados</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma configuração para ver os detalhes</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
