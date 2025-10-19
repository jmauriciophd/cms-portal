/**
 * DS Component Binding Panel
 * 
 * Painel para criar e gerenciar bindings entre componentes do CMS
 * e componentes do Design System
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Link as LinkIcon, Plus, Trash2, Save, RefreshCw, 
  AlertCircle, CheckCircle, Code, Palette
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  pbDSIntegration, 
  DSComponentBinding, 
  TokenBinding 
} from '../../services/PageBuilderDSIntegration';
import { designSystemService, DSComponent } from '../../services/DesignSystemService';

export function DSComponentBindingPanel() {
  const [bindings, setBindings] = useState<DSComponentBinding[]>([]);
  const [selectedBinding, setSelectedBinding] = useState<DSComponentBinding | null>(null);
  const [dsComponents, setDSComponents] = useState<DSComponent[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Componentes CMS disponíveis (tipos conhecidos)
  const cmsComponentTypes = [
    'button', 'heading', 'paragraph', 'container', 'section',
    'card', 'image', 'video', 'link', 'list', 'grid',
    'flex', 'nav', 'header', 'footer', 'form', 'input',
    'textarea', 'select', 'checkbox', 'radio', 'table'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBindings(pbDSIntegration.getBindings());
    setDSComponents(designSystemService.getComponents());
  };

  const handleCreateBinding = () => {
    const newBinding: DSComponentBinding = {
      cmsComponentType: '',
      dsComponentId: '',
      variantMapping: {},
      propMapping: {},
      tokenBindings: [],
      enabled: true,
      version: '1.0.0'
    };
    setSelectedBinding(newBinding);
    setIsEditing(true);
  };

  const handleSaveBinding = () => {
    if (!selectedBinding) return;

    if (!selectedBinding.cmsComponentType || !selectedBinding.dsComponentId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    pbDSIntegration.saveBinding(selectedBinding);
    loadData();
    setIsEditing(false);
    setSelectedBinding(null);
    toast.success('Binding salvo com sucesso!');
  };

  const handleDeleteBinding = (cmsType: string) => {
    if (confirm(`Deseja remover o binding para "${cmsType}"?`)) {
      pbDSIntegration.removeBinding(cmsType);
      loadData();
      toast.success('Binding removido');
    }
  };

  const handleAddTokenBinding = () => {
    if (!selectedBinding) return;

    const newTokenBinding: TokenBinding = {
      cmsProp: '',
      tokenPath: '',
      cssProperty: ''
    };

    setSelectedBinding({
      ...selectedBinding,
      tokenBindings: [...selectedBinding.tokenBindings, newTokenBinding]
    });
  };

  const handleRemoveTokenBinding = (index: number) => {
    if (!selectedBinding) return;

    const updated = { ...selectedBinding };
    updated.tokenBindings.splice(index, 1);
    setSelectedBinding(updated);
  };

  const handleUpdateTokenBinding = (index: number, field: keyof TokenBinding, value: string) => {
    if (!selectedBinding) return;

    const updated = { ...selectedBinding };
    updated.tokenBindings[index] = {
      ...updated.tokenBindings[index],
      [field]: value
    };
    setSelectedBinding(updated);
  };

  const getAvailableTokens = (): string[] => {
    const ds = designSystemService.getCurrentDesignSystem();
    if (!ds) return [];

    const flat = designSystemService.flattenTokens(ds.tokens);
    return Object.keys(flat);
  };

  const renderBindingEditor = () => {
    if (!selectedBinding) return null;

    const selectedDSComponent = dsComponents.find(c => c.id === selectedBinding.dsComponentId);

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Criar Binding' : 'Editar Binding'}
          </CardTitle>
          <CardDescription>
            Vincule um componente do CMS com um componente do Design System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Componentes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Componente CMS</Label>
              <Select
                value={selectedBinding.cmsComponentType}
                onValueChange={(value) => setSelectedBinding({
                  ...selectedBinding,
                  cmsComponentType: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {cmsComponentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Componente Design System</Label>
              <Select
                value={selectedBinding.dsComponentId}
                onValueChange={(value) => setSelectedBinding({
                  ...selectedBinding,
                  dsComponentId: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {dsComponents.map(comp => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name} ({comp.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <Label>Ativo</Label>
            <Switch
              checked={selectedBinding.enabled}
              onCheckedChange={(checked) => setSelectedBinding({
                ...selectedBinding,
                enabled: checked
              })}
            />
          </div>

          <Separator />

          {/* Token Bindings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Token Bindings</Label>
                <p className="text-sm text-gray-500">
                  Vincule propriedades CSS aos tokens do Design System
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddTokenBinding}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-4">
                {selectedBinding.tokenBindings.map((binding, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Propriedade CMS</Label>
                          <Input
                            placeholder="backgroundColor"
                            value={binding.cmsProp}
                            onChange={(e) => handleUpdateTokenBinding(index, 'cmsProp', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Token Path</Label>
                          <Input
                            placeholder="color.brand.primary.500"
                            value={binding.tokenPath}
                            onChange={(e) => handleUpdateTokenBinding(index, 'tokenPath', e.target.value)}
                            list={`tokens-${index}`}
                          />
                          <datalist id={`tokens-${index}`}>
                            {getAvailableTokens().map(token => (
                              <option key={token} value={token} />
                            ))}
                          </datalist>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Propriedade CSS</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="background-color"
                              value={binding.cssProperty || ''}
                              onChange={(e) => handleUpdateTokenBinding(index, 'cssProperty', e.target.value)}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveTokenBinding(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {selectedBinding.tokenBindings.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Nenhum token binding configurado
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Preview do Componente DS */}
          {selectedDSComponent && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Informações do Componente DS</Label>
                <div className="text-sm space-y-1">
                  <p><strong>Nome:</strong> {selectedDSComponent.name}</p>
                  <p><strong>Categoria:</strong> {selectedDSComponent.category}</p>
                  <p><strong>Versão:</strong> {selectedDSComponent.version}</p>
                  <p><strong>Variantes:</strong> {selectedDSComponent.variants.length}</p>
                  {selectedDSComponent.deprecated && (
                    <Badge variant="destructive">Deprecated</Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setSelectedBinding(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveBinding}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBindingsList = () => (
    <div className="space-y-4">
      {bindings.map(binding => {
        const dsComponent = dsComponents.find(c => c.id === binding.dsComponentId);
        const hasWarnings = !dsComponent || dsComponent.deprecated;

        return (
          <Card key={binding.cmsComponentType}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-5 h-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-base">
                      {binding.cmsComponentType}
                    </CardTitle>
                    <CardDescription>
                      → {dsComponent?.name || binding.dsComponentId}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {binding.enabled ? (
                    <Badge variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                  
                  {hasWarnings && (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Atenção
                    </Badge>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedBinding(binding);
                      setIsEditing(false);
                    }}
                  >
                    Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteBinding(binding.cmsComponentType)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  <span>{binding.tokenBindings.length} tokens</span>
                </div>
                <div className="flex items-center gap-1">
                  <Code className="w-4 h-4" />
                  <span>v{binding.version}</span>
                </div>
              </div>

              {!dsComponent && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Componente do DS não encontrado
                </div>
              )}

              {dsComponent?.deprecated && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Componente marcado como deprecated
                  {dsComponent.replacedBy && ` - Use: ${dsComponent.replacedBy}`}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {bindings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum binding configurado</p>
            <Button className="mt-4" onClick={handleCreateBinding}>
              Criar Primeiro Binding
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Component Bindings</h2>
          <p className="text-gray-600">
            Gerencie as conexões entre componentes do CMS e Design System
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          {!isEditing && !selectedBinding && (
            <Button onClick={handleCreateBinding}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Binding
            </Button>
          )}
        </div>
      </div>

      {isEditing || selectedBinding ? renderBindingEditor() : renderBindingsList()}
    </div>
  );
}
