import { useBuilderStore } from '../../../store/useBuilderStore';
import { getPropertiesBySection } from '../../../utils/componentSchemas';
import { PropertyField } from './PropertyField';

export function StyleTab() {
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

  const styleProperties = getPropertiesBySection(selectedNode.type, 'style');
  const hasProperties = Object.keys(styleProperties).length > 0;

  if (!hasProperties) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Este componente não possui propriedades de estilo
      </div>
    );
  }

  // Agrupar propriedades por categoria
  const groups = {
    typography: ['fontSize', 'fontWeight', 'color', 'lineHeight', 'textAlign'],
    spacing: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'padding', 'margin', 'gap', 'paddingX', 'paddingY'],
    background: ['backgroundColor', 'backgroundImage'],
    border: ['borderRadius', 'borderWidth', 'borderColor'],
    layout: ['width', 'height', 'minHeight', 'objectFit', 'direction', 'justifyContent', 'alignItems'],
  };

  const categorizedProps: { [category: string]: [string, any][] } = {
    typography: [],
    spacing: [],
    background: [],
    border: [],
    layout: [],
    other: [],
  };

  Object.entries(styleProperties).forEach(([key, field]) => {
    let categorized = false;
    for (const [category, keys] of Object.entries(groups)) {
      if (keys.includes(key)) {
        categorizedProps[category].push([key, field]);
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      categorizedProps.other.push([key, field]);
    }
  });

  const categoryLabels: { [key: string]: string } = {
    typography: 'Tipografia',
    spacing: 'Espaçamento',
    background: 'Fundo',
    border: 'Borda',
    layout: 'Layout',
    other: 'Outros',
  };

  return (
    <div className="p-4 space-y-6">
      {Object.entries(categorizedProps).map(([category, props]) => {
        if (props.length === 0) return null;
        
        return (
          <div key={category} className="space-y-3">
            <h4 className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200 pb-2">
              {categoryLabels[category]}
            </h4>
            
            <div className="space-y-3">
              {props.map(([key, field]) => (
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
      })}
    </div>
  );
}
