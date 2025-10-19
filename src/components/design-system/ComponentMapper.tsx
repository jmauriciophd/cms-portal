import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Link as LinkIcon, Plus, X, Check } from 'lucide-react';
import { DSComponent, designSystemService, DSMapping } from '../../services/DesignSystemService';
import { componentDefinitions } from '../editor/ComponentDefinitions';
import { toast } from 'sonner@2.0.3';

interface ComponentMapperProps {
  dsComponents: DSComponent[];
  onUpdate: () => void;
}

export function ComponentMapper({ dsComponents, onUpdate }: ComponentMapperProps) {
  const [mappings, setMappings] = useState<DSMapping[]>([]);
  const [selectedCMSComponent, setSelectedCMSComponent] = useState<string>('');
  const [selectedDSComponent, setSelectedDSComponent] = useState<string>('');

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = () => {
    setMappings(designSystemService.getMappings());
  };

  const handleCreateMapping = () => {
    if (!selectedCMSComponent || !selectedDSComponent) {
      toast.error('Selecione ambos os componentes');
      return;
    }

    const mapping: DSMapping = {
      cmsComponentId: selectedCMSComponent,
      dsComponentId: selectedDSComponent,
      variantMapping: {},
      propMapping: {},
      version: '1.0.0'
    };

    designSystemService.saveMapping(mapping);
    loadMappings();
    setSelectedCMSComponent('');
    setSelectedDSComponent('');
    toast.success('Mapeamento criado!');
    onUpdate();
  };

  const handleDeleteMapping = (cmsComponentId: string) => {
    const updated = mappings.filter(m => m.cmsComponentId !== cmsComponentId);
    localStorage.setItem('design_system_mappings', JSON.stringify(updated));
    loadMappings();
    toast.success('Mapeamento removido!');
    onUpdate();
  };

  const cmsComponents = Object.values(componentDefinitions);

  return (
    <div className="space-y-6">
      {/* Criar novo mapeamento */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Mapeamento</CardTitle>
          <CardDescription>
            Conecte componentes do CMS aos componentes do Design System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm">Componente do CMS</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedCMSComponent}
                onChange={(e) => setSelectedCMSComponent(e.target.value)}
              >
                <option value="">Selecione...</option>
                {cmsComponents.map(comp => (
                  <option key={comp.type} value={comp.type}>
                    {comp.label} ({comp.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Componente do Design System</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedDSComponent}
                onChange={(e) => setSelectedDSComponent(e.target.value)}
              >
                <option value="">Selecione...</option>
                {dsComponents.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} ({comp.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={handleCreateMapping} className="w-full">
            <LinkIcon className="w-4 h-4 mr-2" />
            Criar Mapeamento
          </Button>
        </CardContent>
      </Card>

      {/* Lista de mapeamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Mapeamentos Ativos</CardTitle>
          <CardDescription>
            {mappings.length} mapeamento(s) configurado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mappings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum mapeamento configurado
            </p>
          ) : (
            <div className="space-y-4">
              {mappings.map((mapping) => {
                const cmsComp = cmsComponents.find(c => c.type === mapping.cmsComponentId);
                const dsComp = dsComponents.find(c => c.id === mapping.dsComponentId);

                return (
                  <Card key={mapping.cmsComponentId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* CMS Component */}
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2">CMS</Badge>
                            <p className="font-medium">{cmsComp?.label || mapping.cmsComponentId}</p>
                            <p className="text-sm text-gray-600">{cmsComp?.category}</p>
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center justify-center">
                            <LinkIcon className="w-6 h-6 text-gray-400" />
                          </div>

                          {/* DS Component */}
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2">Design System</Badge>
                            <p className="font-medium">{dsComp?.name || mapping.dsComponentId}</p>
                            <p className="text-sm text-gray-600">
                              {dsComp?.category} • v{dsComp?.version}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMapping(mapping.cmsComponentId)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Variants */}
                      {dsComp && dsComp.variants.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600 mb-2">Variantes disponíveis:</p>
                          <div className="flex flex-wrap gap-2">
                            {dsComp.variants.map(variant => (
                              <Badge key={variant.id} variant="secondary">
                                {variant.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">Componentes CMS</p>
            <p className="text-2xl">{cmsComponents.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">Componentes DS</p>
            <p className="text-2xl">{dsComponents.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">Mapeados</p>
            <p className="text-2xl">{mappings.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
