import { useState, useEffect } from 'react';
import { AIService, type AIProviderConfig, type AIModelConfig, type AIRequest } from '../../services/AIService';
import { 
  PROVIDER_ICONS, 
  PROVIDER_COLORS, 
  CONTEXT_TEMPLATES, 
  QUICK_ACTIONS,
  DEFAULT_AI_OPTIONS,
  TEMPERATURE_PRESETS,
  formatTokenUsage,
  estimateCost
} from './AIProviders';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Sparkles, Loader2, CheckCircle2, XCircle, Zap, Settings2, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SecurityService } from '../../services/SecurityService';

interface AISelectorProps {
  open: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  selectedText?: string;
  context?: string;
}

export function AISelector({ open, onClose, onInsert, selectedText, context }: AISelectorProps) {
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderConfig | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelConfig | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [temperature, setTemperature] = useState(DEFAULT_AI_OPTIONS.temperature);
  const [maxTokens, setMaxTokens] = useState(DEFAULT_AI_OPTIONS.maxTokens);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [usage, setUsage] = useState<{ promptTokens: number; completionTokens: number; totalTokens: number } | null>(null);

  useEffect(() => {
    if (open) {
      loadProviders();
      if (selectedText) {
        setPrompt(selectedText);
      }
    } else {
      // Reset ao fechar
      setResponse('');
      setError('');
      setUsage(null);
    }
  }, [open, selectedText]);

  const loadProviders = () => {
    const activeProviders = AIService.getActiveProviders();
    setProviders(activeProviders);
    
    if (activeProviders.length > 0 && !selectedProvider) {
      setSelectedProvider(activeProviders[0]);
      setSelectedModel(activeProviders[0].models[0] || null);
    }
  };

  const handleQuickAction = (actionId: string) => {
    const action = QUICK_ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    if (selectedText) {
      setPrompt(`${action.prompt}\n\n${selectedText}`);
    } else {
      toast.error('Selecione um texto no editor primeiro');
    }
  };

  const handleGenerate = async () => {
    if (!selectedProvider || !selectedModel) {
      toast.error('Selecione um provedor e modelo');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Digite um prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');
    setUsage(null);

    try {
      const request: AIRequest = {
        providerId: selectedProvider.id,
        modelId: selectedModel.id,
        prompt: prompt.trim(),
        context: selectedContext || context,
        options: {
          temperature,
          maxTokens
        },
        userId: SecurityService.getCurrentUser()?.id || 'anonymous'
      };

      const result = await AIService.executeRequest(request);

      if (result.success) {
        setResponse(result.content);
        setUsage(result.usage || null);
        toast.success('Texto gerado com sucesso!');
      } else {
        setError(result.error?.message || 'Erro desconhecido');
        toast.error('Erro ao gerar texto', {
          description: result.error?.message
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar requisição');
      toast.error('Erro', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (response) {
      onInsert(response);
      onClose();
      toast.success('Texto inserido no editor');
    }
  };

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      setSelectedModel(provider.models[0] || null);
    }
  };

  if (!open) return null;

  // Sem provedores configurados
  if (providers.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Assistente de IA
            </DialogTitle>
            <DialogDescription>
              Configure um provedor de IA para começar
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertDescription className="space-y-3">
              <p>
                Nenhum provedor de IA configurado. Para usar o assistente de IA, você precisa:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Ir para <strong>Configurações → Inteligência Artificial</strong></li>
                <li>Adicionar e configurar um provedor (OpenAI, Anthropic, etc.)</li>
                <li>Inserir suas credenciais de API</li>
                <li>Ativar o provedor</li>
              </ol>
              <p className="text-sm text-gray-600">
                💡 Você precisará criar uma conta e obter credenciais de API do provedor escolhido.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Assistente de IA
          </DialogTitle>
          <DialogDescription>
            Use IA para gerar, melhorar e transformar conteúdo
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar
            </TabsTrigger>
            <TabsTrigger value="quick">
              <Zap className="h-4 w-4 mr-2" />
              Ações Rápidas
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings2 className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Gerar */}
          <TabsContent value="generate" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Provedor */}
              <div className="space-y-2">
                <Label>Provedor de IA</Label>
                <Select
                  value={selectedProvider?.id}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(provider => {
                      const icon = PROVIDER_ICONS[provider.type];
                      return (
                        <SelectItem key={provider.id} value={provider.id}>
                          {icon} {provider.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select
                  value={selectedModel?.id}
                  onValueChange={(modelId) => {
                    const model = selectedProvider?.models.find(m => m.id === modelId);
                    if (model) setSelectedModel(model);
                  }}
                  disabled={!selectedProvider}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProvider?.models.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.displayName}
                        {model.costPer1kTokens && (
                          <span className="text-xs text-gray-500 ml-2">
                            (${model.costPer1kTokens}/1k tokens)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contexto */}
            <div className="space-y-2">
              <Label>Tipo de Conteúdo (opcional)</Label>
              <Select value={selectedContext} onValueChange={setSelectedContext}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo de conteúdo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {Object.entries(CONTEXT_TEMPLATES).map(([key, template]) => (
                    <SelectItem key={key} value={template.context}>
                      {template.icon} {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label>O que você quer criar?</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Escreva uma introdução sobre os benefícios da inteligência artificial..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {prompt.length} caracteres
              </p>
            </div>

            {/* Botão Gerar */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Conteúdo
                </>
              )}
            </Button>

            {/* Resposta */}
            {response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Resultado
                  </Label>
                  {usage && (
                    <div className="text-xs text-gray-600 flex items-center gap-3">
                      <span>{formatTokenUsage(usage.totalTokens)}</span>
                      {selectedModel?.costPer1kTokens && (
                        <span>≈ {estimateCost(usage.totalTokens, selectedModel.costPer1kTokens)}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4 border rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{response}</p>
                </div>
                <Button onClick={handleInsert} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Inserir no Editor
                </Button>
              </div>
            )}

            {/* Erro */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Tab: Ações Rápidas */}
          <TabsContent value="quick" className="space-y-4">
            {!selectedText ? (
              <Alert>
                <AlertDescription>
                  Selecione um texto no editor para usar as ações rápidas.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div>
                  <Label>Texto Selecionado</Label>
                  <div className="p-3 border rounded-lg bg-gray-50 mt-2">
                    <p className="text-sm text-gray-700 line-clamp-3">{selectedText}</p>
                  </div>
                </div>

                <div>
                  <Label>Escolha uma ação:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {QUICK_ACTIONS.map(action => (
                      <Button
                        key={action.id}
                        variant="outline"
                        onClick={() => handleQuickAction(action.id)}
                        className="justify-start"
                      >
                        <span className="mr-2">{action.icon}</span>
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {prompt && (
                  <div className="space-y-2">
                    <Label>Prompt Gerado</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <Button onClick={handleGenerate} disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Executar Ação
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {response && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Resultado
                    </Label>
                    <div className="p-4 border rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
                      <p className="whitespace-pre-wrap">{response}</p>
                    </div>
                    <Button onClick={handleInsert} className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Inserir no Editor
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Temperatura: {temperature}</Label>
                  <div className="flex gap-2">
                    {TEMPERATURE_PRESETS.map(preset => (
                      <Button
                        key={preset.value}
                        variant={temperature === preset.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTemperature(preset.value)}
                        className="text-xs"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={([value]) => setTemperature(value)}
                  min={0}
                  max={1.5}
                  step={0.1}
                />
                <p className="text-xs text-gray-600">
                  {TEMPERATURE_PRESETS.find(p => Math.abs(p.value - temperature) < 0.15)?.description ||
                    'Controla a criatividade da resposta'}
                </p>
              </div>

              {/* Max Tokens */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Tamanho Máximo: {maxTokens} tokens</Label>
                  <div className="flex gap-2">
                    {[500, 1000, 2000, 4000].map(value => (
                      <Button
                        key={value}
                        variant={maxTokens === value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMaxTokens(value)}
                        className="text-xs"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
                <Slider
                  value={[maxTokens]}
                  onValueChange={([value]) => setMaxTokens(value)}
                  min={100}
                  max={selectedModel?.maxTokens || 4000}
                  step={100}
                />
                <p className="text-xs text-gray-600">
                  Controla o tamanho máximo da resposta gerada
                </p>
              </div>

              {/* Info do Modelo */}
              {selectedModel && (
                <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
                  <h4 className="text-sm">📊 Informações do Modelo</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Modelo:</span>
                      <p>{selectedModel.displayName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Provedor:</span>
                      <p>{PROVIDER_ICONS[selectedModel.provider]} {selectedProvider?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tokens máximos:</span>
                      <p>{formatTokenUsage(selectedModel.maxTokens)}</p>
                    </div>
                    {selectedModel.costPer1kTokens && (
                      <div>
                        <span className="text-gray-600">Custo estimado:</span>
                        <p>{estimateCost(maxTokens, selectedModel.costPer1kTokens)}</p>
                      </div>
                    )}
                  </div>
                  {selectedModel.description && (
                    <p className="text-xs text-gray-600 pt-2 border-t">
                      {selectedModel.description}
                    </p>
                  )}
                  <div className="pt-2 border-t">
                    <span className="text-gray-600">Capacidades:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedModel.capabilities.map(cap => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
