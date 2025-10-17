import { 
  Copy, 
  FolderInput, 
  Edit3, 
  History, 
  Link2, 
  FileText, 
  Trash2,
  Download
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ui/context-menu';

export interface ContextMenuAction {
  onCopy?: () => void;
  onMove?: () => void;
  onRename?: () => void;
  onHistory?: () => void;
  onCopyPath?: () => void;
  onProperties?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

interface ItemContextMenuProps {
  children: React.ReactNode;
  actions: ContextMenuAction;
  disabled?: boolean;
}

export function ItemContextMenu({ children, actions, disabled = false }: ItemContextMenuProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {actions.onCopy && (
          <ContextMenuItem onClick={actions.onCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar
          </ContextMenuItem>
        )}

        {actions.onMove && (
          <ContextMenuItem onClick={actions.onMove}>
            <FolderInput className="w-4 h-4 mr-2" />
            Mover
          </ContextMenuItem>
        )}

        {actions.onRename && (
          <ContextMenuItem onClick={actions.onRename}>
            <Edit3 className="w-4 h-4 mr-2" />
            Renomear
          </ContextMenuItem>
        )}

        {actions.onHistory && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={actions.onHistory}>
              <History className="w-4 h-4 mr-2" />
              Histórico
            </ContextMenuItem>
          </>
        )}

        {actions.onCopyPath && (
          <ContextMenuItem onClick={actions.onCopyPath}>
            <Link2 className="w-4 h-4 mr-2" />
            Copiar Caminho
          </ContextMenuItem>
        )}

        {actions.onDownload && (
          <ContextMenuItem onClick={actions.onDownload}>
            <Download className="w-4 h-4 mr-2" />
            Baixar
          </ContextMenuItem>
        )}

        {actions.onProperties && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={actions.onProperties}>
              <FileText className="w-4 h-4 mr-2" />
              Propriedades
            </ContextMenuItem>
          </>
        )}

        {actions.onDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem 
              onClick={actions.onDelete}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
