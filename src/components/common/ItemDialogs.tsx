import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  History, 
  FolderIcon, 
  FileText, 
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import { BaseItem, HistoryEntry } from './ItemOperations';

// DIALOG: MOVER
interface MoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BaseItem | null;
  availablePaths: string[];
  onConfirm: (newPath: string) => void;
}

export function MoveDialog({ open, onOpenChange, item, availablePaths, onConfirm }: MoveDialogProps) {
  const [selectedPath, setSelectedPath] = useState('');

  const handleConfirm = () => {
    onConfirm(selectedPath);
    onOpenChange(false);
    setSelectedPath('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mover Item</DialogTitle>
          <DialogDescription>
            Selecione o destino para "{item?.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Localização Atual</Label>
            <div className="flex items-center gap-2 mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <FolderIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {item?.path || 'Raiz'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>

          <div>
            <Label htmlFor="destination">Nova Localização</Label>
            <Select value={selectedPath} onValueChange={setSelectedPath}>
              <SelectTrigger id="destination" className="mt-2">
                <SelectValue placeholder="Selecione um destino..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">📁 Raiz</SelectItem>
                {(availablePaths || []).map(path => (
                  <SelectItem key={path} value={path}>
                    📁 {path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Mover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// DIALOG: RENOMEAR
interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BaseItem | null;
  onConfirm: (newName: string) => void;
}

export function RenameDialog({ open, onOpenChange, item, onConfirm }: RenameDialogProps) {
  const [newName, setNewName] = useState('');

  useState(() => {
    if (item) {
      setNewName(item.name);
    }
  });

  const handleConfirm = () => {
    if (newName.trim()) {
      onConfirm(newName.trim());
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Renomear Item</DialogTitle>
          <DialogDescription>
            Digite o novo nome para o item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="currentName">Nome Atual</Label>
            <Input
              id="currentName"
              value={item?.name || ''}
              disabled
              className="mt-2 bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="newName">Novo Nome</Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite o novo nome..."
              className="mt-2"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!newName.trim()}>
            Renomear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// DIALOG: HISTÓRICO
interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BaseItem | null;
  history: HistoryEntry[];
  onRestore?: (entry: HistoryEntry) => void;
}

export function HistoryDialog({ open, onOpenChange, item, history, onRestore }: HistoryDialogProps) {
  const actionLabels: Record<string, string> = {
    create: 'Criado',
    update: 'Atualizado',
    delete: 'Excluído',
    move: 'Movido',
    rename: 'Renomeado',
    copy: 'Copiado'
  };

  const actionColors: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    move: 'bg-purple-100 text-purple-800',
    rename: 'bg-yellow-100 text-yellow-800',
    copy: 'bg-cyan-100 text-cyan-800'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico: {item?.name}
          </DialogTitle>
          <DialogDescription>
            Visualize todas as alterações feitas neste item
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {!history || history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum histórico disponível</p>
              </div>
            ) : (
              history.map((entry, index) => (
                <div key={entry.id} className="relative">
                  {index < history.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-gray-200" />
                  )}
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative z-10">
                      <History className="w-5 h-5 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 pb-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={actionColors[entry.action] || 'bg-gray-100 text-gray-800'}>
                              {actionLabels[entry.action] || entry.action}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {new Date(entry.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          
                          {onRestore && entry.before && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRestore(entry)}
                              className="h-7 text-xs"
                            >
                              Restaurar
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">
                          {entry.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span>{entry.user}</span>
                        </div>

                        {/* Detalhes da mudança */}
                        {(entry.before || entry.after) && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs space-y-1">
                            {entry.before && (
                              <div className="flex items-start gap-2">
                                <span className="text-red-600 font-medium">Antes:</span>
                                <pre className="text-gray-700">{JSON.stringify(entry.before, null, 2)}</pre>
                              </div>
                            )}
                            {entry.after && (
                              <div className="flex items-start gap-2">
                                <span className="text-green-600 font-medium">Depois:</span>
                                <pre className="text-gray-700">{JSON.stringify(entry.after, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// DIALOG: PROPRIEDADES
interface PropertiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BaseItem | null;
  additionalInfo?: Record<string, any>;
}

export function PropertiesDialog({ open, onOpenChange, item, additionalInfo }: PropertiesDialogProps) {
  if (!item) return null;

  const properties = [
    { label: 'Nome', value: item.name },
    { label: 'ID', value: item.id },
    { label: 'Tipo', value: item.type || 'Não especificado' },
    { label: 'Caminho', value: item.path || 'Raiz' },
    { 
      label: 'Criado em', 
      value: new Date(item.createdAt).toLocaleString('pt-BR') 
    },
    { 
      label: 'Atualizado em', 
      value: new Date(item.updatedAt).toLocaleString('pt-BR') 
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Propriedades
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas do item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Propriedades básicas */}
          <div className="space-y-3">
            {properties.map((prop, index) => (
              <div key={index}>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {prop.label}:
                  </span>
                  <span className="text-sm text-gray-900 text-right max-w-[60%]">
                    {prop.value}
                  </span>
                </div>
                {index < properties.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>

          {/* Informações adicionais */}
          {additionalInfo && Object.keys(additionalInfo).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Informações Adicionais
                </h4>
                {Object.entries(additionalInfo).map(([key, value], index) => (
                  <div key={index}>
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        {key}:
                      </span>
                      <span className="text-sm text-gray-900 text-right max-w-[60%]">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                    {index < Object.keys(additionalInfo).length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
