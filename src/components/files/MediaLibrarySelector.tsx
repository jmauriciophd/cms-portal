import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
  X,
  UploadCloud,
  ImagePlus
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
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  
  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadFolder, setUploadFolder] = useState<string>('/');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open]);

  const loadFiles = () => {
    const stored = localStorage.getItem('files'); // Mesma chave do FileManager
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

  // Get all folders for upload destination selector
  const getAllFolders = (): FileItem[] => {
    return files.filter(f => f.type === 'folder').sort((a, b) => a.path.localeCompare(b.path));
  };

  // Handle file selection from computer
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Filter by allowed types
    const validFiles = selectedFiles.filter(file => {
      return allowedTypes.some(allowedType => {
        if (allowedType.endsWith('/*')) {
          const typePrefix = allowedType.replace('/*', '');
          return file.type.startsWith(typePrefix);
        }
        return file.type === allowedType;
      });
    });

    if (validFiles.length < selectedFiles.length) {
      toast.warning(`${selectedFiles.length - validFiles.length} arquivo(s) não permitido(s) foram ignorados`);
    }

    setUploadFiles(validFiles);
  };

  // Upload files to FileManager
  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('Selecione ao menos um arquivo');
      return;
    }

    setUploading(true);

    try {
      const allFiles = [...files];
      const uploadedFileItems: FileItem[] = [];

      for (const file of uploadFiles) {
        // Create a data URL from the file
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Create file item
        const newFile: FileItem = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: 'file',
          path: uploadFolder === '/' ? `/${file.name}` : `${uploadFolder}/${file.name}`,
          parent: uploadFolder,
          size: file.size,
          url: fileData,
          mimeType: file.type,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString()
        };

        allFiles.push(newFile);
        uploadedFileItems.push(newFile);
      }

      // Save to localStorage (mesma chave do FileManager)
      localStorage.setItem('files', JSON.stringify(allFiles));
      setFiles(allFiles);

      // Disparar evento para notificar FileManager
      window.dispatchEvent(new Event('filesUpdated'));

      toast.success(`${uploadFiles.length} arquivo(s) enviado(s) com sucesso!`);

      // Auto-insert if single file
      if (uploadedFileItems.length === 1) {
        onSelect(uploadedFileItems[0]);
        handleClose();
      } else if (uploadedFileItems.length > 1) {
        // Select all uploaded files
        setSelectedFiles(uploadedFileItems);
        setActiveTab('library');
        setCurrentPath(uploadFolder);
        setUploadFiles([]);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload dos arquivos');
    } finally {
      setUploading(false);
    }
  };

  // Remove file from upload queue
  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Inserir Mídia no Editor</DialogTitle>
          <DialogDescription>
            Faça upload de novos arquivos ou selecione da biblioteca existente
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'library')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Upload do Computador
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              Biblioteca de Mídia
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Folder Selector */}
              <div className="space-y-2">
                <Label>Salvar na Pasta</Label>
                <Select value={uploadFolder} onValueChange={setUploadFolder}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/">/ (Raiz)</SelectItem>
                    {getAllFolders().map(folder => (
                      <SelectItem key={folder.id} value={folder.path}>
                        {folder.path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  O arquivo será salvo nesta pasta e ficará disponível na Biblioteca de Mídia
                </p>
              </div>

              {/* File Input */}
              <div className="space-y-2">
                <Label>Selecionar Arquivos</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={handleFileInputChange}
                    multiple={multiple}
                    accept={allowedTypes.join(',')}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Tipos permitidos: {allowedTypes.map(t => {
                    if (t === 'image/*') return 'Imagens';
                    if (t === 'video/*') return 'Vídeos';
                    if (t === 'audio/*') return 'Áudios';
                    return t;
                  }).join(', ')}
                </p>
              </div>

              {/* Upload Queue */}
              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Arquivos Selecionados ({uploadFiles.length})</Label>
                  <ScrollArea className="h-[200px] border rounded-lg p-3">
                    <div className="space-y-2">
                      {uploadFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                          {file.type.startsWith('image/') && <ImageIcon className="w-5 h-5 text-green-500" />}
                          {file.type.startsWith('video/') && <Video className="w-5 h-5 text-purple-500" />}
                          {file.type.startsWith('audio/') && <Music className="w-5 h-5 text-pink-500" />}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-600">
                  {uploadFiles.length === 0 ? (
                    'Nenhum arquivo selecionado'
                  ) : (
                    `${uploadFiles.length} arquivo(s) pronto(s) para upload`
                  )}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose} disabled={uploading}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploadFiles.length === 0 || uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Enviando...' : 'Fazer Upload e Inserir'}
                  </Button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">Como funciona:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Selecione a pasta de destino onde o arquivo será salvo</li>
                  <li>Escolha o(s) arquivo(s) do seu computador</li>
                  <li>Clique em "Fazer Upload e Inserir"</li>
                  <li>O arquivo será salvo na biblioteca e inserido automaticamente no editor</li>
                </ol>
              </div>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Info Box */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <ImagePlus className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 text-sm mb-1">
                      Selecione da Biblioteca de Arquivos
                    </h4>
                    <p className="text-xs text-green-800">
                      Navegue pelas pastas e selecione arquivos já existentes no gerenciamento de arquivos. 
                      Os arquivos aqui são os mesmos do menu "Arquivos" e ficam organizados nas pastas que você criou.
                    </p>
                  </div>
                </div>
              </div>

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
                        className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all relative ${
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
                    <p className="text-sm text-gray-400 mb-3">
                      {searchTerm 
                        ? 'Tente outro termo de busca' 
                        : 'Use a aba "Upload do Computador" para enviar arquivos'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('upload')}
                    >
                      <UploadCloud className="w-4 h-4 mr-2" />
                      Ir para Upload
                    </Button>
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
                      <span className="truncate max-w-[200px]">{selectedFile.name}</span>
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
