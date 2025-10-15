import { 
  Folder, 
  File, 
  Image as ImageIcon, 
  FileText,
  Layout,
  MoreVertical,
  Calendar,
  HardDrive
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
  modifiedAt?: string;
  protected?: boolean;
}

interface FileListViewProps {
  files: FileItem[];
  onFolderClick: (folder: FileItem) => void;
  onFileClick: (file: FileItem) => void;
  onContextMenu: (file: FileItem, action: string) => void;
}

export function FileListView({ 
  files, 
  onFolderClick, 
  onFileClick, 
  onContextMenu 
}: FileListViewProps) {
  
  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-5 h-5 text-blue-500" />;
    }
    
    if (item.mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-green-500" />;
    }
    
    if (item.mimeType?.includes('text') || item.name.endsWith('.txt')) {
      return <FileText className="w-5 h-5 text-gray-500" />;
    }
    
    if (item.name.endsWith('.html') || item.name.endsWith('.htm')) {
      return <Layout className="w-5 h-5 text-purple-500" />;
    }
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b text-xs font-medium text-gray-600">
        <div className="col-span-5">Nome</div>
        <div className="col-span-2">Tipo</div>
        <div className="col-span-2">Tamanho</div>
        <div className="col-span-2">Modificado</div>
        <div className="col-span-1 text-right">Ações</div>
      </div>

      {/* Files List */}
      <div className="divide-y">
        {files.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum arquivo ou pasta</p>
          </div>
        ) : (
          files.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 transition-colors items-center group"
            >
              {/* Nome */}
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                {getFileIcon(item)}
                <button
                  onClick={() => {
                    if (item.type === 'folder') {
                      onFolderClick(item);
                    } else {
                      onFileClick(item);
                    }
                  }}
                  className="text-left truncate hover:text-indigo-600 transition-colors"
                >
                  {item.name}
                </button>
                {item.protected && (
                  <Badge variant="secondary" className="text-xs">
                    Protegido
                  </Badge>
                )}
              </div>

              {/* Tipo */}
              <div className="col-span-2 text-sm text-gray-600">
                {item.type === 'folder' ? 'Pasta' : (
                  item.mimeType?.startsWith('image/') ? 'Imagem' :
                  item.name.endsWith('.txt') ? 'Texto' :
                  item.name.endsWith('.html') ? 'Página' :
                  'Arquivo'
                )}
              </div>

              {/* Tamanho */}
              <div className="col-span-2 text-sm text-gray-600">
                {item.type === 'folder' ? '-' : formatSize(item.size)}
              </div>

              {/* Modificado */}
              <div className="col-span-2 text-sm text-gray-600">
                {formatDate(item.modifiedAt || item.createdAt)}
              </div>

              {/* Ações */}
              <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {item.type === 'folder' ? (
                      <DropdownMenuItem onClick={() => onFolderClick(item)}>
                        Abrir
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => onFileClick(item)}>
                          {item.mimeType?.startsWith('image/') ? 'Visualizar' : 
                           item.name.endsWith('.txt') ? 'Editar' : 'Abrir'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onContextMenu(item, 'download')}>
                          Download
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onContextMenu(item, 'rename')}>
                      Renomear
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onContextMenu(item, 'move')}>
                      Mover
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onContextMenu(item, 'copy')}>
                      Copiar
                    </DropdownMenuItem>
                    {!item.protected && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onContextMenu(item, 'delete')}
                          className="text-red-600"
                        >
                          Excluir
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
