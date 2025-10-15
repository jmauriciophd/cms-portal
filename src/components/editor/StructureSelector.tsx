import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface StructureOption {
  id: string;
  name: string;
  columns: number[];
  preview: React.ReactNode;
  description?: string;
}

interface StructureSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (structure: StructureOption) => void;
}

const structures: StructureOption[] = [
  {
    id: '1-col',
    name: '1 Coluna',
    columns: [100],
    preview: (
      <div className="w-full h-20 bg-gray-400 rounded" />
    ),
    description: 'Layout de coluna única'
  },
  {
    id: '2-col-equal',
    name: '2 Colunas Iguais',
    columns: [50, 50],
    preview: (
      <div className="flex gap-2 w-full">
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: '50% - 50%'
  },
  {
    id: '3-col-equal',
    name: '3 Colunas Iguais',
    columns: [33.33, 33.33, 33.33],
    preview: (
      <div className="flex gap-2 w-full">
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: '33% - 33% - 33%'
  },
  {
    id: '4-col-equal',
    name: '4 Colunas Iguais',
    columns: [25, 25, 25, 25],
    preview: (
      <div className="flex gap-2 w-full">
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: '25% - 25% - 25% - 25%'
  },
  {
    id: '2-col-30-70',
    name: '2 Colunas 30/70',
    columns: [30, 70],
    preview: (
      <div className="flex gap-2 w-full">
        <div className="w-[30%] h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: '30% - 70%'
  },
  {
    id: '2-col-70-30',
    name: '2 Colunas 70/30',
    columns: [70, 30],
    preview: (
      <div className="flex gap-2 w-full">
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="w-[30%] h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: '70% - 30%'
  },
  {
    id: '2-col-25-75',
    name: '2 Colunas 25/75',
    columns: [25, 75],
    preview: (
      <div className="flex gap-2 w-full">
        <div className="w-[25%] h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: '25% - 75%'
  },
  {
    id: '2-col-75-25',
    name: '2 Colunas 75/25',
    columns: [75, 25],
    preview: (
      <div className="flex gap-2 w-full">
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="w-[25%] h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: '75% - 25%'
  },
  {
    id: '3-col-25-50-25',
    name: '3 Colunas 25/50/25',
    columns: [25, 50, 25],
    preview: (
      <div className="flex gap-2 w-full">
        <div className="w-[25%] h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="w-[25%] h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: '25% - 50% - 25%'
  },
  {
    id: '3-col-20-60-20',
    name: '3 Colunas 20/60/20',
    columns: [20, 60, 20],
    preview: (
      <div className="flex gap-2 w-full">
        <div className="w-[20%] h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="w-[20%] h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: '20% - 60% - 20%'
  },
  {
    id: '5-col-equal',
    name: '5 Colunas Iguais',
    columns: [20, 20, 20, 20, 20],
    preview: (
      <div className="flex gap-1 w-full">
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: '20% - 20% - 20% - 20% - 20%'
  },
  {
    id: '6-col-equal',
    name: '6 Colunas Iguais',
    columns: [16.66, 16.66, 16.66, 16.66, 16.66, 16.66],
    preview: (
      <div className="flex gap-1 w-full">
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
        <div className="flex-1 h-20 bg-gray-400 rounded" />
      </div>
    ),
    description: 'Grid de 6 colunas'
  },
];

export function StructureSelector({ open, onClose, onSelect }: StructureSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (structure: StructureOption) => {
    setSelectedId(structure.id);
    onSelect(structure);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            SELECIONE SUA ESTRUTURA
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="grid grid-cols-6 gap-4 p-6">
            {structures.map((structure) => (
              <button
                key={structure.id}
                onClick={() => handleSelect(structure)}
                className={`
                  relative p-4 border-2 rounded-lg transition-all
                  hover:border-blue-500 hover:shadow-lg
                  ${selectedId === structure.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
                title={structure.description}
              >
                <div className="aspect-square flex items-center justify-center">
                  {structure.preview}
                </div>
                <div className="mt-2 text-xs text-center text-gray-600 font-medium">
                  {structure.description}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { structures };
export type { StructureOption };
