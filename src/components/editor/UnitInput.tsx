import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronDown } from 'lucide-react';

interface UnitInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  units?: string[];
  allowAuto?: boolean;
  allowNone?: boolean;
}

export function UnitInput({ 
  value = '', 
  onChange, 
  placeholder = '0', 
  className = '',
  units = ['px', '%', 'rem', 'em', 'vh', 'vw'],
  allowAuto = false,
  allowNone = false
}: UnitInputProps) {
  const [numericValue, setNumericValue] = useState('');
  const [unit, setUnit] = useState('px');

  // Parse o valor inicial
  useEffect(() => {
    if (!value || value === 'auto' || value === 'none' || value === '') {
      setNumericValue('');
      setUnit('px');
      return;
    }

    // Extrair número e unidade do valor
    const match = value.match(/^(-?[\d.]+)(.*)$/);
    if (match) {
      setNumericValue(match[1]);
      setUnit(match[2] || 'px');
    }
  }, [value]);

  // Atualizar o valor quando número ou unidade mudar
  const handleNumericChange = (newValue: string) => {
    setNumericValue(newValue);
    
    if (!newValue || newValue === '') {
      onChange('');
      return;
    }

    // Verificar se é um número válido
    if (newValue && !isNaN(parseFloat(newValue))) {
      onChange(`${newValue}${unit}`);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    
    if (numericValue && numericValue !== '') {
      onChange(`${numericValue}${newUnit}`);
    }
  };

  // Opções especiais
  const specialOptions = [];
  if (allowAuto) specialOptions.push('auto');
  if (allowNone) specialOptions.push('none');

  return (
    <div className={`flex gap-1 ${className}`}>
      <Input
        type="text"
        value={numericValue}
        onChange={(e) => handleNumericChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 h-8 text-xs"
      />
      <Select value={unit} onValueChange={handleUnitChange}>
        <SelectTrigger className="w-[70px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {specialOptions.map(option => (
            <SelectItem key={option} value={option} className="text-xs">
              {option}
            </SelectItem>
          ))}
          {units.map(u => (
            <SelectItem key={u} value={u} className="text-xs">
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
