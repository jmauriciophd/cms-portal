import { useState } from 'react';
import { AIService, type AIProviderConfig, type AIProviderType, type AuthMethod } from '../../services/AIService';
import { PROVIDER_ICONS, PROVIDER_COLORS, validateProviderConfig } from './AIProviders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Trash2, TestTube, CheckCircle2, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function AIProviderConfig() {
  const [providers, setProviders] = useState<AIProviderConfig[]>(AIService.getAllProviders());
  const [editingProvider, setEditingProvider] = useState<Partial<AIProviderConfig> | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const providerTemplates = AIService.getProviderTemplates();

  const handleSaveProvider = () => {
    if (!editingProvider) return;

    const validation = validateProviderConfig(editingProvider);
    if (!validation.valid) {
      toast.error('Configuração inválida', {
        description: validation.errors.join(', ')
      });
      return;
    }

    try {
      const saved = AIService.saveProvider(editingProvider as any);
      setProviders(AIService.getAllProviders());
      setEditingProvider(null);
      toast.success('Provedor salvo com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao salvar provedor', {
        description: error.message
      });
    }
  };

  const handleDeleteProvider = (id: string) => {
    if (confirm('Tem certeza que deseja remover este provedor?')) {
      AIService.deleteProvider(id);
      setProviders(AIService.getAllProviders());
      toast.success('Provedor removido');
    }
  };

  const handleTestProvider = async (id: string) => {
    setTesting(id);
    try {
      const result = await AIService.testProvider(id);
      if (result.success) {
        toast.success('Teste bem-sucedido!', {
          description: result.message
        });
      } else {
        toast.error('Teste falhou', {
          description: result.message
        });
      }
    } catch (error: any) {
      toast.error('Erro ao testar provedor', {
        description: error.message
      });
    } finally {
      setTesting(null);
    }
  };

  const handleCreateFromTemplate = (type: AIProviderType) => {
    const template = providerTemplates.find(t => t.type === type);
    if (!template) return;

    setEditingProvider({
      type,
      name: template.name,
      enabled: false,
      authMethod: 'api-key',
      credentials: {}
    });
  };

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Provedores de IA</h2>
        <p className="text-gray-600 mt-1">
          Configure APIs de Inteligência Artificial para usar em seus conteúdos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(() => {
          const stats = AIService.getUsageStats();
          return (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl">{stats.totalProviders}</div>
                  <p className="text-sm text-gray-600">Provedores Configurados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl text-green-600">{stats.activeProviders}</div>
                  <p className="text-sm text-gray-600">Ativos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl">{stats.totalModels}</div>
                  <p className="text-sm text-gray-600">Modelos Disponíveis</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl">{stats.cacheSize}</div>
                  <p className="text-sm text-gray-600">Respostas em Cache</p>
                </CardContent>
              </Card>
            </>
          );
        })()}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="providers">
        <TabsList>
          <TabsTrigger value="providers">Provedores Configurados</TabsTrigger>
          <TabsTrigger value="add">Adicionar Provedor</TabsTrigger>
        </TabsList>

        {/* Lista de Provedores */}
        <TabsContent value="providers" className="space-y-4">
          {providers.length === 0 ? (
            <Alert>
              <AlertDescription>
                Nenhum provedor configurado. Adicione um provedor para começar a usar IA nos seus conteúdos.
              </AlertDescription>
            </Alert>
          ) : (
            providers.map(provider => {
              const colors = PROVIDER_COLORS[provider.type];
              const icon = PROVIDER_ICONS[provider.type];

              return (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {provider.name}
                            {provider.enabled ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline">Inativo</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {provider.models.length} modelo(s) disponível(is)
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestProvider(provider.id)}
                          disabled={testing === provider.id || !provider.enabled}
                        >
                          {testing === provider.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProvider(provider)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProvider(provider.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Modelos */}
                      <div>
                        <Label className="text-xs text-gray-500">Modelos:</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {provider.models.map(model => (
                            <Badge key={model.id} variant="outline">
                              {model.displayName}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Rate Limits */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-gray-500">Limite por minuto:</Label>
                          <p>{provider.rateLimits.requestsPerMinute} requisições</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Limite por dia:</Label>
                          <p>{provider.rateLimits.requestsPerDay} requisições</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Adicionar/Editar Provedor */}
        <TabsContent value="add">
          {!editingProvider ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Selecione um provedor de IA para configurar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providerTemplates.map(template => {
                  const icon = PROVIDER_ICONS[template.type];
                  const colors = PROVIDER_COLORS[template.type];

                  return (
                    <Card
                      key={template.type}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${colors.border}`}
                      onClick={() => handleCreateFromTemplate(template.type)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{icon}</span>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingProvider.id ? 'Editar Provedor' : 'Novo Provedor'}
                </CardTitle>
                <CardDescription>
                  Configure as credenciais e parâmetros do provedor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nome */}
                <div className="space-y-2">
                  <Label>Nome do Provedor</Label>
                  <Input
                    value={editingProvider.name || ''}
                    onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                    placeholder="Ex: OpenAI Principal"
                  />
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={editingProvider.type}
                    onValueChange={(value) => setEditingProvider({ ...editingProvider, type: value as AIProviderType })}
                    disabled={!!editingProvider.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providerTemplates.map(t => (
                        <SelectItem key={t.type} value={t.type}>
                          {PROVIDER_ICONS[t.type]} {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Método de Autenticação */}
                <div className="space-y-2">
                  <Label>Método de Autenticação</Label>
                  <Select
                    value={editingProvider.authMethod || 'api-key'}
                    onValueChange={(value) => setEditingProvider({ ...editingProvider, authMethod: value as AuthMethod })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api-key">API Key</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      <SelectItem value="client-credentials">Client Credentials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Credenciais */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h4 className="text-sm">Credenciais</h4>

                  {(editingProvider.authMethod === 'api-key' || !editingProvider.authMethod) && (
                    <div className="space-y-2">
                      <Label>API Key *</Label>
                      <div className="relative">
                        <Input
                          type={showSecrets['apiKey'] ? 'text' : 'password'}
                          value={editingProvider.credentials?.apiKey || ''}
                          onChange={(e) => setEditingProvider({
                            ...editingProvider,
                            credentials: { ...editingProvider.credentials, apiKey: e.target.value }
                          })}
                          placeholder="sk-..."
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret('apiKey')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showSecrets['apiKey'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {(editingProvider.authMethod === 'oauth' || editingProvider.authMethod === 'client-credentials') && (
                    <>
                      <div className="space-y-2">
                        <Label>Client ID *</Label>
                        <Input
                          value={editingProvider.credentials?.clientId || ''}
                          onChange={(e) => setEditingProvider({
                            ...editingProvider,
                            credentials: { ...editingProvider.credentials, clientId: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Client Secret *</Label>
                        <div className="relative">
                          <Input
                            type={showSecrets['clientSecret'] ? 'text' : 'password'}
                            value={editingProvider.credentials?.clientSecret || ''}
                            onChange={(e) => setEditingProvider({
                              ...editingProvider,
                              credentials: { ...editingProvider.credentials, clientSecret: e.target.value }
                            })}
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecret('clientSecret')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showSecrets['clientSecret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {(editingProvider.type === 'azure-openai' || editingProvider.type === 'custom') && (
                    <div className="space-y-2">
                      <Label>Endpoint *</Label>
                      <Input
                        value={editingProvider.credentials?.endpoint || ''}
                        onChange={(e) => setEditingProvider({
                          ...editingProvider,
                          credentials: { ...editingProvider.credentials, endpoint: e.target.value }
                        })}
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  {editingProvider.type === 'azure-openai' && (
                    <div className="space-y-2">
                      <Label>Região</Label>
                      <Input
                        value={editingProvider.credentials?.region || ''}
                        onChange={(e) => setEditingProvider({
                          ...editingProvider,
                          credentials: { ...editingProvider.credentials, region: e.target.value }
                        })}
                        placeholder="eastus"
                      />
                    </div>
                  )}

                  {editingProvider.type === 'openai' && (
                    <div className="space-y-2">
                      <Label>Organization ID (opcional)</Label>
                      <Input
                        value={editingProvider.credentials?.organizationId || ''}
                        onChange={(e) => setEditingProvider({
                          ...editingProvider,
                          credentials: { ...editingProvider.credentials, organizationId: e.target.value }
                        })}
                        placeholder="org-..."
                      />
                    </div>
                  )}
                </div>

                {/* Modelos */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Modelos Configurados</Label>
                      <p className="text-sm text-gray-600">
                        Configure os modelos de IA disponíveis para este provedor
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newModel = {
                          id: `model_${Date.now()}`,
                          name: '',
                          displayName: '',
                          provider: editingProvider.type!,
                          capabilities: ['text-completion', 'chat'] as any[],
                          maxTokens: 4096
                        };
                        setEditingProvider({
                          ...editingProvider,
                          models: [...(editingProvider.models || []), newModel]
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Modelo
                    </Button>
                  </div>

                  {(!editingProvider.models || editingProvider.models.length === 0) && (
                    <Alert>
                      <AlertDescription className="text-sm">
                        Pelo menos um modelo deve ser configurado
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    {editingProvider.models?.map((model, index) => (
                      <div key={model.id} className="p-3 border rounded-lg bg-gray-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Modelo #{index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newModels = editingProvider.models!.filter((_, i) => i !== index);
                              setEditingProvider({ ...editingProvider, models: newModels });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Nome do Modelo *</Label>
                            <Input
                              value={model.name}
                              onChange={(e) => {
                                const newModels = [...editingProvider.models!];
                                newModels[index] = { ...model, name: e.target.value };
                                setEditingProvider({ ...editingProvider, models: newModels });
                              }}
                              placeholder="gpt-4, claude-3-opus, etc"
                              className="text-sm"
                            />
                            <p className="text-xs text-gray-500">
                              Nome técnico do modelo (ex: gpt-4, gemini-pro)
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs">Nome de Exibição</Label>
                            <Input
                              value={model.displayName}
                              onChange={(e) => {
                                const newModels = [...editingProvider.models!];
                                newModels[index] = { ...model, displayName: e.target.value };
                                setEditingProvider({ ...editingProvider, models: newModels });
                              }}
                              placeholder="GPT-4, Claude 3 Opus, etc"
                              className="text-sm"
                            />
                            <p className="text-xs text-gray-500">
                              Nome amigável para exibição
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Máximo de Tokens</Label>
                          <Input
                            type="number"
                            value={model.maxTokens}
                            onChange={(e) => {
                              const newModels = [...editingProvider.models!];
                              newModels[index] = { ...model, maxTokens: parseInt(e.target.value) || 4096 };
                              setEditingProvider({ ...editingProvider, models: newModels });
                            }}
                            placeholder="4096"
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Descrição (opcional)</Label>
                          <Input
                            value={model.description || ''}
                            onChange={(e) => {
                              const newModels = [...editingProvider.models!];
                              newModels[index] = { ...model, description: e.target.value };
                              setEditingProvider({ ...editingProvider, models: newModels });
                            }}
                            placeholder="Descrição breve do modelo"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ativar/Desativar */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Ativar Provedor</Label>
                    <p className="text-sm text-gray-600">
                      Permitir uso deste provedor no sistema
                    </p>
                  </div>
                  <Switch
                    checked={editingProvider.enabled || false}
                    onCheckedChange={(checked) => setEditingProvider({ ...editingProvider, enabled: checked })}
                  />
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProvider}>
                    Salvar Provedor
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingProvider(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Documentação */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">📚 Documentação e Segurança</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Segurança:</strong> Todas as credenciais são armazenadas localmente no seu navegador e nunca são enviadas para servidores externos, exceto para as APIs configuradas.
          </p>
          <p>
            <strong>Rate Limiting:</strong> O sistema rastreia automaticamente o uso e respeita os limites de cada provedor.
          </p>
          <p>
            <strong>Cache:</strong> Respostas similares são armazenadas em cache por 5 minutos para melhorar a performance.
          </p>
          <p>
            <strong>Auditoria:</strong> Todas as requisições de IA são registradas no log de auditoria do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
