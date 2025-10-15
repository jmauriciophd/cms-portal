import { useState, useCallback } from 'react';
import { useBuilderStore } from '../../../store/useBuilderStore';
import { PropertyField as PropertyFieldType } from '../../../utils/componentSchemas';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import { Checkbox } from '../../ui/checkbox';
import { RichTextEditor } from '../RichTextEditor';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { Upload } from 'lucide-react';

interface PropertyFieldProps {
  propertyKey: string;
  field: PropertyFieldType;
  nodeId: string;
  currentValue: any;
}

export function PropertyField({ propertyKey, field, nodeId, currentValue }: PropertyFieldProps) {
  const updateNodeProperty = useBuilderStore(state => state.updateNodeProperty);
  
  // Estado local para evitar lag ao digitar
  const [localValue, setLocalValue] = useState(currentValue ?? field.defaultValue ?? '');

  // Sincronizar quando currentValue mudar externamente
  useState(() => {
    setLocalValue(currentValue ?? field.defaultValue ?? '');
  });

  const handleChange = useCallback((value: any) => {
    setLocalValue(value);
    updateNodeProperty(nodeId, propertyKey, value);
  }, [nodeId, propertyKey, updateNodeProperty]);

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'url':
        return (
          <Input
            type={field.type === 'url' ? 'url' : 'text'}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full text-sm"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full text-sm min-h-[80px]"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={localValue}
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className="w-full text-sm"
          />
        );

      case 'select':
        return (
          <Select value={localValue} onValueChange={handleChange}>
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              className="h-8 w-16 rounded border border-gray-300 cursor-pointer"
            />
            <Input
              type="text"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 text-sm"
            />
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Slider
                value={[Number(localValue) || field.defaultValue || 0]}
                onValueChange={([value]) => handleChange(value)}
                min={field.min}
                max={field.max}
                step={field.step || 1}
                className="flex-1"
              />
              <div className="flex items-center gap-1 min-w-[60px]">
                <Input
                  type="number"
                  value={localValue}
                  onChange={(e) => handleChange(Number(e.target.value))}
                  className="w-full text-sm h-7 px-2"
                  min={field.min}
                  max={field.max}
                />
                {field.unit && (
                  <span className="text-xs text-gray-500">{field.unit}</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={localValue}
              onCheckedChange={handleChange}
              id={`${nodeId}-${propertyKey}`}
            />
            <label
              htmlFor={`${nodeId}-${propertyKey}`}
              className="text-sm text-gray-700 cursor-pointer"
            >
              {field.label}
            </label>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <Input
              type="url"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder || "URL da imagem"}
              className="w-full text-sm"
            />
            {localValue && (
              <div className="relative rounded border border-gray-200 overflow-hidden">
                <ImageWithFallback
                  src={localValue}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
            {!localValue && (
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded bg-gray-50">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Cole a URL acima</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'richtext':
        return (
          <RichTextEditor
            value={localValue}
            onChange={handleChange}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full text-sm"
          />
        );
    }
  };

  // Para checkbox, não renderizar label separado
  if (field.type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderField()}
        {field.description && (
          <p className="text-xs text-gray-500 mt-1">{field.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label htmlFor={`${nodeId}-${propertyKey}`} className="text-xs uppercase tracking-wide text-gray-600">
        {field.label}
      </Label>
      {renderField()}
      {field.description && (
        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
      )}
    </div>
  );
}
