import { FolderPlus, FileText, Layout, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface NewItemMenuProps {
  onNewFolder: () => void;
  onNewTextFile: () => void;
  onNewPage: () => void;
}

export function NewItemMenu({ onNewFolder, onNewTextFile, onNewPage }: NewItemMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onNewFolder}>
          <FolderPlus className="w-4 h-4 mr-2" />
          Nova Pasta
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onNewTextFile}>
          <FileText className="w-4 h-4 mr-2" />
          Novo Arquivo de Texto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNewPage}>
          <Layout className="w-4 h-4 mr-2" />
          Nova Página
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
