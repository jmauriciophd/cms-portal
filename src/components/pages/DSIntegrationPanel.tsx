/**
 * DS Integration Panel
 * 
 * Painel lateral no Page Builder para aplicar, validar e gerenciar
 * a integração com o Design System
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Palette, CheckCircle, AlertCircle, AlertTriangle,
  RefreshCw, Settings, Code, Eye, Zap, Shield,
  Link as LinkIcon, Package, GitBranch
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  pbDSIntegration, 
  ValidationResult,
  DSComponentBinding 
} from '../../services/PageBuilderDSIntegration';
import { designSystemService, DesignSystemVersion } from '../../services/DesignSystemService';
import { HierarchicalNode } from '../editor/HierarchicalRenderNode';
import { copyToClipboard } from '../../utils/clipboard';

interface DSIntegrationPanelProps {
  nodes: HierarchicalNode[];
  selectedNode: HierarchicalNode | null;
  onNodesUpdate: (nodes: HierarchicalNode[]) => void;
  onNodeUpdate: (node: HierarchicalNode) => void;
}

export function DSIntegrationPanel({
  nodes,
  selectedNode,
  onNodesUpdate,
  onNodeUpdate
}: DSIntegrationPanelProps) {
  const [currentDS, setCurrentDS] = useState<DesignSystemVersion | null>(null);
  const [config, setConfig] = useState(pbDSIntegration.getConfig());
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [bindings, setBindings] = useState<DSComponentBinding[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (config.validateOnChange) {
      validateTree();
    }
  }, [nodes, config.validateOnChange]);

  const loadData = () => {
    setCurrentDS(designSystemService.getCurrentDesignSystem());
    setBindings(pbDSIntegration.getBindings());
    setConfig(pbDSIntegration.getConfig());
  };

  const validateTree = () => {
    setIsValidating(true);
    try {
      const result = pbDSIntegration.validateTree(nodes);
      setValidation(result);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyTokensToAll = () => {
    const updated = pbDSIntegration.applyDSTokensToTree(nodes);
    onNodesUpdate(updated);
    toast.success('Tokens do Design System aplicados!');
    validateTree();
  };

  const handleApplyTokensToSelected = () => {
    if (!selectedNode) {
      toast.error('Selecione um componente primeiro');
      return;
    }

    const updated = pbDSIntegration.applyDSTokensToNode(selectedNode);
    onNodeUpdate(updated);
    toast.success('Tokens aplicados ao componente selecionado!');
  };

  const handleAutoFix = (nodeId: string, warningIndex: number) => {
    if (!validation) return;

    const warning = validation.warnings[warningIndex];
    if (!warning.autoFixable) return;

    // Encontra o nó
    const findAndUpdate = (nodesList: HierarchicalNode[]): HierarchicalNode[] => {
      return nodesList.map(node => {
        if (node.id === nodeId) {
          return pbDSIntegration.autoFixWarning(warning, node);
        }

        if (node.children) {
          return { ...node, children: findAndUpdate(node.children) };
        }

        if (node.slots) {
          const updatedSlots: Record<string, HierarchicalNode[]> = {};
          for (const [key, slotNodes] of Object.entries(node.slots)) {
            updatedSlots[key] = findAndUpdate(slotNodes);
          }
          return { ...node, slots: updatedSlots };
        }

        return node;
      });
    };

    const updated = findAndUpdate(nodes);
    onNodesUpdate(updated);
    toast.success('Correção aplicada!');
    validateTree();
  };

  const handleConfigUpdate = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    pbDSIntegration.updateConfig(newConfig);
  };

  const renderValidationStatus = () => {
    if (!validation) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Execute a validação para ver o status</p>
          <Button className="mt-3" onClick={validateTree}>
            Validar Agora
          </Button>
        </div>
      );
    }

    const { valid, errors, warnings, suggestions } = validation;

    return (
      <div className="space-y-4">
        {/* Status Geral */}
        <Card className={valid ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              {valid ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">
                      Validação Bem-Sucedida
                    </p>
                    <p className="text-sm text-green-700">
                      Todos os componentes estão em conformidade
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">
                      {errors.length} Erro(s), {warnings.length} Aviso(s)
                    </p>
                    <p className="text-sm text-yellow-700">
                      Algumas correções são necessárias
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Erros */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <Label className="text-red-700">Erros</Label>
            {errors.map((error, index) => (
              <Card key={index} className="border-red-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{error.componentType}</p>
                      <p className="text-sm text-gray-600">{error.message}</p>
                      <Badge variant="destructive" className="mt-2">
                        {error.severity}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Avisos */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            <Label className="text-yellow-700">Avisos</Label>
            {warnings.map((warning, index) => (
              <Card key={index} className="border-yellow-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{warning.componentType}</p>
                      <p className="text-sm text-gray-600">{warning.message}</p>
                      {warning.suggestion && (
                        <p className="text-xs text-gray-500 mt-1">
                          💡 {warning.suggestion}
                        </p>
                      )}
                      {warning.autoFixable && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => handleAutoFix(warning.nodeId, index)}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Corrigir Automaticamente
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sugestões */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <Label>Sugestões</Label>
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600">{suggestion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Botão de Revalidar */}
        <Button
          variant="outline"
          className="w-full"
          onClick={validateTree}
          disabled={isValidating}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
          Revalidar
        </Button>
      </div>
    );
  };

  const renderDSInfo = () => {
    if (!currentDS) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Nenhum Design System carregado</p>
        </div>
      );
    }

    const tokenCount = Object.keys(
      designSystemService.flattenTokens(currentDS.tokens)
    ).length;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Design System Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-gray-500">Versão</Label>
                <p className="font-medium">{currentDS.version}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Tokens</Label>
                <p className="font-medium">{tokenCount}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Componentes</Label>
                <p className="font-medium">{currentDS.components.length}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Breaking</Label>
                <Badge variant={currentDS.breaking ? 'destructive' : 'default'}>
                  {currentDS.breaking ? 'Sim' : 'Não'}
                </Badge>
              </div>
            </div>

            {currentDS.changelog && currentDS.changelog.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-gray-500">Mudanças Recentes</Label>
                  <ul className="mt-2 space-y-1 text-sm">
                    {currentDS.changelog.slice(0, 3).map((change, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {change.type}
                        </Badge>
                        <span className="text-gray-600 truncate">{change.id}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bindings Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Bindings Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bindings.filter(b => b.enabled).map(binding => (
                <div
                  key={binding.cmsComponentType}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                >
                  <span>{binding.cmsComponentType}</span>
                  <Badge variant="secondary" className="text-xs">
                    {binding.tokenBindings.length} tokens
                  </Badge>
                </div>
              ))}
              {bindings.filter(b => b.enabled).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum binding ativo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderActions = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aplicar Tokens</CardTitle>
          <CardDescription>
            Aplique os tokens do Design System aos componentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full"
            onClick={handleApplyTokensToAll}
            disabled={!currentDS}
          >
            <Palette className="w-4 h-4 mr-2" />
            Aplicar a Todos
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleApplyTokensToSelected}
            disabled={!selectedNode || !currentDS}
          >
            <Palette className="w-4 h-4 mr-2" />
            Aplicar ao Selecionado
          </Button>

          <Separator />

          <Button
            variant="outline"
            className="w-full"
            onClick={validateTree}
            disabled={isValidating}
          >
            <Shield className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
            Validar Página
          </Button>
        </CardContent>
      </Card>

      {/* Preview CSS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSS Gerado</CardTitle>
          <CardDescription>
            Variáveis CSS do Design System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              const css = pbDSIntegration.generateCSSFromTokens();
              const success = await copyToClipboard(css);
              if (success) {
                toast.success('CSS copiado!');
              } else {
                toast.error('Erro ao copiar CSS');
              }
            }}
          >
            <Code className="w-4 h-4 mr-2" />
            Copiar CSS
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aplicar Tokens Automaticamente</Label>
              <p className="text-xs text-gray-500">
                Aplica tokens ao inserir componentes
              </p>
            </div>
            <Switch
              checked={config.autoApplyTokens}
              onCheckedChange={(checked) => handleConfigUpdate('autoApplyTokens', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Validar Automaticamente</Label>
              <p className="text-xs text-gray-500">
                Valida ao modificar componentes
              </p>
            </div>
            <Switch
              checked={config.validateOnChange}
              onCheckedChange={(checked) => handleConfigUpdate('validateOnChange', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bloquear Estilos Fora do DS</Label>
              <p className="text-xs text-gray-500">
                Impede estilos não mapeados
              </p>
            </div>
            <Switch
              checked={config.blockNonDSStyles}
              onCheckedChange={(checked) => handleConfigUpdate('blockNonDSStyles', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Migração Automática</Label>
              <p className="text-xs text-gray-500">
                Atualiza componentes automaticamente
              </p>
            </div>
            <Switch
              checked={config.autoMigration}
              onCheckedChange={(checked) => handleConfigUpdate('autoMigration', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Design System
        </CardTitle>
        <CardDescription>
          Integração com Design System
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="validation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="validation" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Validar
            </TabsTrigger>
            <TabsTrigger value="info" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Info
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Ações
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Config
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-300px)] mt-4">
            <TabsContent value="validation" className="mt-0">
              {renderValidationStatus()}
            </TabsContent>

            <TabsContent value="info" className="mt-0">
              {renderDSInfo()}
            </TabsContent>

            <TabsContent value="actions" className="mt-0">
              {renderActions()}
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              {renderSettings()}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
