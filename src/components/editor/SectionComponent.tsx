import React, { useState } from 'react';
import { Plus, GripVertical, Copy, Trash2, Settings, ChevronUp, ChevronDown, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { WidgetLibrary } from './WidgetLibrary';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

interface Column {
  id: string;
  width: number;
  widgets: any[];
}

interface SectionProps {
  id: string;
  columns: Column[];
  isSelected: boolean;
  onSelect: () => void;
  onAddWidget: (columnId: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function SectionComponent({
  id,
  columns,
  isSelected,
  onSelect,
  onAddWidget,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SectionProps) {
  const [showAddOptions, setShowAddOptions] = useState<string | null>(null);

  return (
    <div
      className={`
        relative group border-2 transition-all min-h-[100px]
        ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:border-gray-300'}
      `}
      onClick={onSelect}
    >
      {/* Toolbar da Seção (aparece no hover ou quando selecionada) */}
      {(isSelected || true) && (
        <div className="absolute -top-10 left-0 right-0 flex items-center justify-between bg-gray-900 text-white px-3 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            <button
              className="p-1 hover:bg-gray-700 rounded cursor-move"
              title="Arrastar seção"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <span className="text-xs px-2">Seção</span>
          </div>

          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                title="Mover para cima"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
            )}
            {onMoveDown && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                title="Mover para baixo"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              title="Duplicar seção"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Deseja excluir esta seção?')) {
                  onDelete();
                }
              }}
              title="Excluir seção"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-gray-700"
                  title="Mais opções"
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Seção
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ocultar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Salvar como Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Grid de Colunas */}
      <div className="flex gap-4 p-6">
        {columns.map((column, index) => (
          <div
            key={column.id}
            className="flex-1 min-h-[80px] border-2 border-dashed border-gray-300 rounded-lg relative group/column"
            style={{ width: `${column.width}%` }}
          >
            {/* Conteúdo da Coluna */}
            {column.widgets.length === 0 ? (
              // Placeholder quando vazio
              <div className="flex flex-col items-center justify-center h-full p-6 gap-3">
                <div className="flex items-center gap-2 opacity-0 group-hover/column:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddWidget(column.id);
                    }}
                    title="Adicionar widget"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-gray-600 hover:bg-gray-700 text-white"
                    title="Biblioteca de widgets"
                  >
                    <GripVertical className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-pink-500 hover:bg-pink-600 text-white"
                    title="Templates"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Arraste o widget aqui
                </p>
              </div>
            ) : (
              // Widgets da coluna
              <div className="p-4 space-y-3">
                {column.widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="p-4 bg-white border border-gray-200 rounded hover:border-blue-400 cursor-pointer"
                  >
                    <p className="text-sm text-gray-700">{widget.name || widget.type}</p>
                  </div>
                ))}

                {/* Botão + entre widgets */}
                <div className="flex justify-center opacity-0 group-hover/column:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddWidget(column.id);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Barra verde de adicionar nova seção (aparece entre seções) */}
      <div className="absolute -bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-green-500 h-1 w-full cursor-pointer hover:h-2 transition-all" />
        <Button
          size="sm"
          className="absolute -top-3 bg-green-500 hover:bg-green-600 text-white h-7 px-3 rounded-full shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            // Adicionar nova seção abaixo
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          <span className="text-xs">Adicionar Seção</span>
        </Button>
      </div>
    </div>
  );
}
