import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertTriangle, FileWarning } from 'lucide-react';

interface UploadConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: 'arquivo' | 'pasta' | 'página' | 'template' | 'imagem';
  onConfirm: () => void;
  onCancel?: () => void;
}

export function UploadConfirmDialog({
  open,
  onOpenChange,
  itemName,
  itemType,
  onConfirm,
  onCancel
}: UploadConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <FileWarning className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <AlertDialogTitle>Substituir {itemType} existente?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Já existe {itemType === 'arquivo' || itemType === 'imagem' ? 'um' : 'uma'} <strong>{itemType}</strong> com o nome{' '}
            <strong className="text-foreground">"{itemName}"</strong>.
            <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/10">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="text-sm text-amber-900 dark:text-amber-200">
                <strong className="block">Atenção:</strong>
                Se você continuar, {itemType === 'arquivo' || itemType === 'imagem' ? 'o' : 'a'} {itemType} atual será{' '}
                <strong>substituído{itemType === 'arquivo' || itemType === 'imagem' ? '' : 'a'}</strong> e{' '}
                <strong>não poderá ser recuperado{itemType === 'arquivo' || itemType === 'imagem' ? '' : 'a'}</strong>.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
          >
            Sim, substituir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface UploadConfirmMultipleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Array<{ name: string; type: string }>;
  onConfirm: (itemsToReplace: string[]) => void;
  onCancel?: () => void;
}

export function UploadConfirmMultipleDialog({
  open,
  onOpenChange,
  items,
  onConfirm,
  onCancel
}: UploadConfirmMultipleDialogProps) {
  const handleConfirmAll = () => {
    onConfirm(items.map(item => item.name));
    onOpenChange(false);
  };

  const handleSkipAll = () => {
    onConfirm([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <FileWarning className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <AlertDialogTitle>Substituir itens existentes?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            <strong>{items.length}</strong> {items.length === 1 ? 'item' : 'itens'} já{' '}
            {items.length === 1 ? 'existe' : 'existem'} com {items.length === 1 ? 'esse nome' : 'esses nomes'}:
            <div className="mt-3 max-h-32 space-y-1 overflow-y-auto rounded-md border bg-muted/50 p-2">
              {items.map((item, index) => (
                <div key={index} className="text-sm text-foreground">
                  • <strong>{item.name}</strong> ({item.type})
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/10">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="text-sm text-amber-900 dark:text-amber-200">
                Se você substituir, os itens atuais serão <strong>sobrescritos permanentemente</strong>.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel onClick={handleCancel}>
            Cancelar tudo
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSkipAll}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Pular existentes
          </AlertDialogAction>
          <AlertDialogAction
            onClick={handleConfirmAll}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Substituir todos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
