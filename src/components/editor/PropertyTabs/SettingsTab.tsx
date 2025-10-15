import { useBuilderStore } from '../../../store/useBuilderStore';
import { getPropertiesBySection } from '../../../utils/componentSchemas';
import { PropertyField } from './PropertyField';

export function SettingsTab() {
  const { selectedNodeId, nodes } = useBuilderStore();

  if (!selectedNodeId) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Selecione um componente para editar
      </div>
    );
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  if (!selectedNode) return null;

  const settingsProperties = getPropertiesBySection(selectedNode.type, 'settings');
  const hasProperties = Object.keys(settingsProperties).length > 0;

  if (!hasProperties) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Este componente não possui configurações avançadas
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-2">
          Identificação
        </h4>
        
        {Object.entries(settingsProperties)
          .filter(([key]) => ['id', 'className'].includes(key))
          .map(([key, field]) => (
            <PropertyField
              key={key}
              propertyKey={key}
              field={field}
              nodeId={selectedNodeId}
              currentValue={selectedNode.props?.[key]}
            />
          ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-2">
          Acessibilidade
        </h4>
        
        {Object.entries(settingsProperties)
          .filter(([key]) => ['ariaLabel', 'role', 'alt'].includes(key))
          .map(([key, field]) => (
            <PropertyField
              key={key}
              propertyKey={key}
              field={field}
              nodeId={selectedNodeId}
              currentValue={selectedNode.props?.[key]}
            />
          ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-2">
          Avançado
        </h4>
        
        {Object.entries(settingsProperties)
          .filter(([key]) => !['id', 'className', 'ariaLabel', 'role', 'alt'].includes(key))
          .map(([key, field]) => (
            <PropertyField
              key={key}
              propertyKey={key}
              field={field}
              nodeId={selectedNodeId}
              currentValue={selectedNode.props?.[key]}
            />
          ))}
      </div>
    </div>
  );
}
