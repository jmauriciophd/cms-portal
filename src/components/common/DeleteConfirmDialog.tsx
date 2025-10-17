import { AlertTriangle, Trash2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: 'página' | 'template' | 'arquivo' | 'pasta';
  onConfirm: () => void;
  hasChildren?: boolean;
  childrenCount?: number;
  currentPath?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  itemType,
  onConfirm,
  hasChildren = false,
  childrenCount = 0,
  currentPath = '/Arquivos'
}: DeleteConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Trash2 className="w-5 h-5" />
            Mover para Lixeira
          </DialogTitle>
          <DialogDescription>
            O item será movido para a lixeira e poderá ser restaurado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info sobre o destino */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <div className="space-y-1">
                <p className="font-medium">Mover para lixeira:</p>
                <p className="text-sm font-mono">{currentPath}</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Aviso se tem conteúdo */}
          {hasChildren && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                <p className="font-medium">
                  Atenção: Esta {itemType} contém <span className="font-bold">{childrenCount}</span> {childrenCount === 1 ? 'item' : 'itens'}.
                </p>
                <p className="text-sm mt-1">
                  Você precisa esvaziar a {itemType} antes de excluí-la.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Item a ser deletado */}
          {!hasChildren && (
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Item a ser movido:</p>
              <p className="font-medium text-gray-900">
                {itemName} <span className="text-gray-500 text-sm">({itemType})</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          {!hasChildren && (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Mover para Lixeira
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
