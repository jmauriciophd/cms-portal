import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Palette,
  ChevronDown
} from 'lucide-react';
import { Label } from '../ui/label';

interface TextFormattingToolbarProps {
  position: { x: number; y: number };
  visible: boolean;
  currentStyle: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    color?: string;
    fontStyle?: string;
    textDecoration?: string;
  };
  onStyleChange: (property: string, value: string) => void;
  onClose: () => void;
}

export function TextFormattingToolbar({
  position,
  visible,
  currentStyle,
  onStyleChange,
  onClose
}: TextFormattingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const isBold = currentStyle.fontWeight === 'bold' || currentStyle.fontWeight === '700' || currentStyle.fontWeight === '600';
  const isItalic = currentStyle.fontStyle === 'italic';
  const isUnderline = currentStyle.textDecoration?.includes('underline');

  const toggleBold = () => {
    onStyleChange('fontWeight', isBold ? 'normal' : 'bold');
  };

  const toggleItalic = () => {
    onStyleChange('fontStyle', isItalic ? 'normal' : 'italic');
  };

  const toggleUnderline = () => {
    onStyleChange('textDecoration', isUnderline ? 'none' : 'underline');
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 p-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 60}px`, // 60px acima da seleção
        transform: 'translateX(-50%)'
      }}
    >
      <div className="flex items-center gap-1">
        {/* Família da Fonte */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
              <Type className="w-3 h-3" />
              <span className="max-w-[60px] truncate">
                {currentStyle.fontFamily?.split(',')[0] || 'Font'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="start">
            <div className="space-y-1">
              <Label className="text-xs">Font Family</Label>
              <Select
                value={currentStyle.fontFamily || 'inherit'}
                onValueChange={(value) => onStyleChange('fontFamily', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Inherit</SelectItem>
                  <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                  <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                  <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  <SelectItem value="'Helvetica Neue', sans-serif">Helvetica</SelectItem>
                  <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                  <SelectItem value="'Trebuchet MS', sans-serif">Trebuchet</SelectItem>
                  <SelectItem value="system-ui, sans-serif">System UI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {/* Tamanho da Fonte */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
              <span className="font-mono">
                {currentStyle.fontSize || '1rem'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-2" align="start">
            <div className="space-y-1">
              <Label className="text-xs">Font Size</Label>
              <Select
                value={currentStyle.fontSize || '1rem'}
                onValueChange={(value) => onStyleChange('fontSize', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.75rem">0.75rem (12px)</SelectItem>
                  <SelectItem value="0.875rem">0.875rem (14px)</SelectItem>
                  <SelectItem value="1rem">1rem (16px)</SelectItem>
                  <SelectItem value="1.125rem">1.125rem (18px)</SelectItem>
                  <SelectItem value="1.25rem">1.25rem (20px)</SelectItem>
                  <SelectItem value="1.5rem">1.5rem (24px)</SelectItem>
                  <SelectItem value="1.875rem">1.875rem (30px)</SelectItem>
                  <SelectItem value="2.25rem">2.25rem (36px)</SelectItem>
                  <SelectItem value="3rem">3rem (48px)</SelectItem>
                  <SelectItem value="4rem">4rem (64px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Negrito */}
        <Button
          variant={isBold ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={toggleBold}
        >
          <Bold className="w-4 h-4" />
        </Button>

        {/* Itálico */}
        <Button
          variant={isItalic ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={toggleItalic}
        >
          <Italic className="w-4 h-4" />
        </Button>

        {/* Sublinhado */}
        <Button
          variant={isUnderline ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={toggleUnderline}
        >
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Alinhamento à Esquerda */}
        <Button
          variant={currentStyle.textAlign === 'left' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onStyleChange('textAlign', 'left')}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>

        {/* Alinhamento ao Centro */}
        <Button
          variant={currentStyle.textAlign === 'center' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onStyleChange('textAlign', 'center')}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>

        {/* Alinhamento à Direita */}
        <Button
          variant={currentStyle.textAlign === 'right' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onStyleChange('textAlign', 'right')}
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        {/* Alinhamento Justificado */}
        <Button
          variant={currentStyle.textAlign === 'justify' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onStyleChange('textAlign', 'justify')}
        >
          <AlignJustify className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Cor do Texto */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <div className="relative">
                <Palette className="w-4 h-4" />
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded"
                  style={{ backgroundColor: currentStyle.color || '#000000' }}
                />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-3" align="start">
            <div className="space-y-2">
              <Label className="text-xs">Cor do Texto</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={currentStyle.color || '#000000'}
                  onChange={(e) => onStyleChange('color', e.target.value)}
                  className="h-8 w-14"
                />
                <Input
                  type="text"
                  value={currentStyle.color || '#000000'}
                  onChange={(e) => onStyleChange('color', e.target.value)}
                  placeholder="#000000"
                  className="h-8 flex-1 text-xs"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
