import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { 
  Image as ImageIcon, 
  Video, 
  Music, 
  File as FileIcon,
  Folder,
  FolderOpen,
  Search,
  Upload,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  parent: string;
  size?: number;
  url?: string;
  mimeType?: string;
  createdAt: string;
  modifiedAt?: string;
}

interface MediaLibrarySelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (file: FileItem) => void;
  allowedTypes?: string[]; // ex: ['image/*', 'video/*', 'audio/*']
  multiple?: boolean;
}

export function MediaLibrarySelector({ 
  open, 
  onClose, 
  onSelect,
  allowedTypes = ['image/*', 'video/*', 'audio/*'],
  multiple = false
}: MediaLibrarySelectorProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open]);

  const loadFiles = () => {
    const stored = localStorage.getItem('fileSystem');
    if (stored) {
      try {
        const allFiles = JSON.parse(stored);
        setFiles(allFiles);
      } catch (error) {
        console.error('Erro ao carregar arquivos:', error);
        setFiles([]);
      }
    } else {
      setFiles([]);
    }
  };

  const isFileTypeAllowed = (file: FileItem): boolean => {
    if (!file.mimeType) return false;
    
    return allowedTypes.some(allowedType => {
      if (allowedType.endsWith('/*')) {
        const typePrefix = allowedType.replace('/*', '');
        return file.mimeType?.startsWith(typePrefix);
      }
      return file.mimeType === allowedType;
    });
  };

  const getCurrentFiles = (): FileItem[] => {
    return files.filter(f => {
      const matchesPath = f.parent === currentPath;
      const matchesSearch = searchTerm === '' || 
        f.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (f.type === 'folder') {
        return matchesPath && matchesSearch;
      }
      
      // Para arquivos, verificar tipo permitido
      return matchesPath && matchesSearch && isFileTypeAllowed(f);
    });
  };

  const currentFiles = getCurrentFiles();
  const folders = currentFiles.filter(f => f.type === 'folder');
  const mediaFiles = currentFiles.filter(f => f.type === 'file');

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }

    if (file.mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-green-500" />;
    }
    
    if (file.mimeType?.startsWith('video/')) {
      return <Video className="w-8 h-8 text-purple-500" />;
    }
    
    if (file.mimeType?.startsWith('audio/')) {
      return <Music className="w-8 h-8 text-pink-500" />;
    }
    
    return <FileIcon className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFolderClick = (folder: FileItem) => {
    setCurrentPath(folder.path);
  };

  const handleBackClick = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    setCurrentPath(parentPath);
  };

  const handleFileClick = (file: FileItem) => {
    if (multiple) {
      const isSelected = selectedFiles.some(f => f.id === file.id);
      if (isSelected) {
        setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
      } else {
        setSelectedFiles([...selectedFiles, file]);
      }
    } else {
      setSelectedFile(file);
    }
  };

  const handleInsert = () => {
    if (multiple && selectedFiles.length > 0) {
      selectedFiles.forEach(file => onSelect(file));
      toast.success(`${selectedFiles.length} arquivo(s) inserido(s)`);
    } else if (selectedFile) {
      onSelect(selectedFile);
      toast.success('Arquivo inserido com sucesso!');
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setSelectedFiles([]);
    setSearchTerm('');
    setCurrentPath('/');
    onClose();
  };

  const getBreadcrumb = () => {
    if (currentPath === '/') return ['Início'];
    return ['Início', ...currentPath.split('/').filter(p => p)];
  };

  const getFileTypeLabel = (mimeType?: string): string => {
    if (!mimeType) return 'Arquivo';
    if (mimeType.startsWith('image/')) return 'Imagem';
    if (mimeType.startsWith('video/')) return 'Vídeo';
    if (mimeType.startsWith('audio/')) return 'Áudio';
    return 'Arquivo';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Biblioteca de Mídia</DialogTitle>
          <DialogDescription>
            Selecione um arquivo para inserir no editor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Breadcrumb e Search */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              {currentPath !== '/' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackClick}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                {getBreadcrumb().map((part, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {index > 0 && <span>/</span>}
                    <span className={index === getBreadcrumb().length - 1 ? 'font-semibold text-gray-900' : ''}>
                      {part}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* File Grid */}
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Folders */}
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleFolderClick(folder)}
                >
                  <FolderOpen className="w-12 h-12 text-blue-500 mb-2" />
                  <p className="text-sm text-center truncate w-full" title={folder.name}>
                    {folder.name}
                  </p>
                  <p className="text-xs text-gray-500">Pasta</p>
                </div>
              ))}

              {/* Media Files */}
              {mediaFiles.map((file) => {
                const isSelected = multiple 
                  ? selectedFiles.some(f => f.id === file.id)
                  : selectedFile?.id === file.id;

                return (
                  <div
                    key={file.id}
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500' 
                        : 'hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => handleFileClick(file)}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    
                    {file.mimeType?.startsWith('image/') && file.url ? (
                      <div className="w-full h-24 mb-2 flex items-center justify-center overflow-hidden rounded">
                        <img 
                          src={file.url} 
                          alt={file.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="mb-2">
                        {getFileIcon(file)}
                      </div>
                    )}
                    
                    <p className="text-sm text-center truncate w-full mb-1" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {getFileTypeLabel(file.mimeType)}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {folders.length === 0 && mediaFiles.length === 0 && (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchTerm ? 'Nenhum arquivo encontrado' : 'Esta pasta está vazia'}
                </p>
                <p className="text-sm text-gray-400">
                  {searchTerm 
                    ? 'Tente outro termo de busca' 
                    : 'Vá em "Arquivos" no menu para fazer upload de mídias'}
                </p>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {multiple && selectedFiles.length > 0 ? (
                <span>{selectedFiles.length} arquivo(s) selecionado(s)</span>
              ) : selectedFile ? (
                <span className="flex items-center gap-2">
                  <Badge>{getFileTypeLabel(selectedFile.mimeType)}</Badge>
                  {selectedFile.name}
                </span>
              ) : (
                <span>Nenhum arquivo selecionado</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={handleInsert}
                disabled={multiple ? selectedFiles.length === 0 : !selectedFile}
              >
                <Check className="w-4 h-4 mr-2" />
                Inserir {multiple && selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
