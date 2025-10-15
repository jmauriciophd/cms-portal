import { useBuilderStore } from '../../../store/useBuilderStore';
import { getPropertiesBySection } from '../../../utils/componentSchemas';
import { PropertyField } from './PropertyField';

export function ContentTab() {
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

  const contentProperties = getPropertiesBySection(selectedNode.type, 'content');
  const hasProperties = Object.keys(contentProperties).length > 0;

  if (!hasProperties) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Este componente não possui propriedades de conteúdo
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
        Conteúdo
      </h3>
      
      {Object.entries(contentProperties).map(([key, field]) => (
        <PropertyField
          key={key}
          propertyKey={key}
          field={field}
          nodeId={selectedNodeId}
          currentValue={selectedNode.props?.[key]}
        />
      ))}
    </div>
  );
}
