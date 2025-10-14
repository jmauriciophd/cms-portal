import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { 
  Upload, 
  Folder, 
  Image as ImageIcon, 
  File, 
  Trash, 
  FolderPlus,
  Search,
  Download,
  Copy,
  ChevronRight,
  Home,
  Edit,
  Eye,
  MoreVertical,
  FileText,
  X,
  FolderOpen,
  Move,
  FileEdit,
  History,
  Lock
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Progress } from '../ui/progress';
import { ImageEditor } from './ImageEditor';
import { CopyFileDialog, MoveFileDialog, RenameFileDialog, DeleteFileDialog } from './FileOperations';
import { VersionManager, useEditLock, useVersionControl } from '../version/VersionManager';
import { toast } from 'sonner@2.0.3';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  url?: string;
  mimeType?: string;
  createdAt: string;
  modifiedAt?: string;
  parent?: string;
}

// Allowed file types for security
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [selectedImage, setSelectedImage] = useState<FileItem | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New states for advanced operations
  const [operationFile, setOperationFile] = useState<FileItem | null>(null);
  const [operationType, setOperationType] = useState<'copy' | 'move' | 'rename' | 'delete' | 'history' | null>(null);
  const [currentUser] = useState({ id: '1', name: 'Admin' }); // Mock user

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    const stored = localStorage.getItem('files');
    if (stored) {
      setFiles(JSON.parse(stored));
    } else {
      const sampleFiles: FileItem[] = [
        {
          id: '1',
          name: 'Imagens',
          type: 'folder',
          path: '/Imagens',
          parent: '/',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Documentos',
          type: 'folder',
          path: '/Documentos',
          parent: '/',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Uploads',
          type: 'folder',
          path: '/Uploads',
          parent: '/',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('files', JSON.stringify(sampleFiles));
      setFiles(sampleFiles);
    }
  };

  const saveFiles = (updatedFiles: FileItem[]) => {
    localStorage.setItem('files', JSON.stringify(updatedFiles));
    setFiles(updatedFiles);
  };

  const validateFile = (file: globalThis.File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'Arquivo muito grande. Máximo: 10MB' };
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo não permitido' };
    }

    // Check file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    const dangerousExtensions = ['exe', 'bat', 'cmd', 'sh', 'php', 'asp', 'aspx', 'jsp'];
    if (ext && dangerousExtensions.includes(ext)) {
      return { valid: false, error: 'Extensão de arquivo não permitida por segurança' };
    }

    return { valid: true };
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Digite um nome para a pasta');
      return;
    }

    // Check if folder already exists
    const folderExists = files.some(
      f => f.type === 'folder' && f.parent === currentPath && f.name === newFolderName
    );

    if (folderExists) {
      toast.error('Já existe uma pasta com este nome');
      return;
    }

    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: newFolderName,
      type: 'folder',
      path: currentPath === '/' ? `/${newFolderName}` : `${currentPath}/${newFolderName}`,
      parent: currentPath,
      createdAt: new Date().toISOString()
    };

    saveFiles([...files, newFolder]);
    setNewFolderName('');
    setShowNewFolder(false);
    toast.success('Pasta criada com sucesso!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const newFiles: FileItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        // Simulate upload progress
        setUploadProgress(((i + 1) / uploadedFiles.length) * 100);

        const fileReader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          fileReader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          fileReader.onerror = reject;
          fileReader.readAsDataURL(file);
        });

        const newFile: FileItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: 'file',
          path: currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`,
          parent: currentPath,
          size: file.size,
          url: fileData,
          mimeType: file.type,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString()
        };

        newFiles.push(newFile);
      } catch (error) {
        errors.push(`${file.name}: Erro ao processar arquivo`);
      }
    }

    if (newFiles.length > 0) {
      saveFiles([...files, ...newFiles]);
      toast.success(`${newFiles.length} arquivo(s) enviado(s) com sucesso!`);
    }

    if (errors.length > 0) {
      toast.error(`Alguns arquivos não foram enviados:\n${errors.join('\n')}`);
    }

    setIsUploading(false);
    setUploadProgress(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (item: FileItem) => {
    if (!confirm(`Tem certeza que deseja excluir "${item.name}"?`)) return;

    // If deleting a folder, also delete all its contents
    if (item.type === 'folder') {
      const itemsToDelete = files.filter(f => f.path.startsWith(item.path));
      const updatedFiles = files.filter(f => !f.path.startsWith(item.path) && f.id !== item.id);
      saveFiles(updatedFiles);
      toast.success(`Pasta e ${itemsToDelete.length} item(s) excluídos`);
    } else {
      const updatedFiles = files.filter(f => f.id !== item.id);
      saveFiles(updatedFiles);
      toast.success('Arquivo excluído com sucesso!');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('URL copiada para a área de transferência!');
      })
      .catch(() => {
        toast.error('Não foi possível copiar. URL: ' + url);
      });
  };

  const handleDownload = (item: FileItem) => {
    if (!item.url) return;
    
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.name;
    link.click();
    toast.success('Download iniciado');
  };

  const handleOpenFolder = (folder: FileItem) => {
    setCurrentPath(folder.path);
    toast.info(`Navegando para: ${folder.path}`);
  };

  const handleViewImage = (item: FileItem) => {
    setSelectedImage(item);
    setShowImageViewer(true);
  };

  const handleEditImage = (item: FileItem) => {
    setSelectedImage(item);
    setShowImageEditor(true);
  };

  const handleSaveEditedImage = (editedImageUrl: string, editedImageName: string) => {
    if (!selectedImage) return;

    const editedFile: FileItem = {
      id: Date.now().toString(),
      name: editedImageName,
      type: 'file',
      path: currentPath === '/' ? `/${editedImageName}` : `${currentPath}/${editedImageName}`,
      parent: currentPath,
      size: undefined, // Size will be calculated from data URL
      url: editedImageUrl,
      mimeType: 'image/png',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    saveFiles([...files, editedFile]);
    setShowImageEditor(false);
    setSelectedImage(null);
    toast.success('Imagem editada salva com sucesso!');
  };

  const getCurrentFiles = () => {
    return files.filter(f => {
      const matchesPath = f.parent === currentPath;
      const matchesSearch = searchTerm === '' || 
        f.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPath && matchesSearch;
    });
  };

  const getPathSegments = () => {
    if (currentPath === '/') return [];
    return currentPath.split('/').filter(Boolean);
  };

  const navigateToPath = (index: number) => {
    const segments = getPathSegments();
    if (index === -1) {
      setCurrentPath('/');
    } else {
      const newPath = '/' + segments.slice(0, index + 1).join('/');
      setCurrentPath(newPath);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-12 h-12 text-indigo-500" />;
    }

    if (item.mimeType?.startsWith('image/')) {
      return item.url ? (
        <img 
          src={item.url} 
          alt={item.name} 
          className="w-full h-full object-cover"
        />
      ) : (
        <ImageIcon className="w-12 h-12 text-gray-400" />
      );
    }

    if (item.mimeType === 'application/pdf') {
      return <FileText className="w-12 h-12 text-red-500" />;
    }

    return <File className="w-12 h-12 text-gray-400" />;
  };

  const isImage = (item: FileItem) => {
    return item.type === 'file' && item.mimeType?.startsWith('image/');
  };

  const currentFiles = getCurrentFiles();
  const pathSegments = getPathSegments();
  const totalFiles = files.filter(f => f.type === 'file').length;
  const totalFolders = files.filter(f => f.type === 'folder').length;
  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Gerenciamento de Arquivos</h1>
          <p className="text-gray-600">Organize suas imagens e documentos com segurança</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewFolder(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Nova Pasta
          </Button>
          <label className="cursor-pointer">
            <Button disabled={isUploading}>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Enviando...' : 'Upload'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept={ALLOWED_FILE_TYPES.join(',')}
            />
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-indigo-600 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Enviando arquivos...</p>
                <Progress value={uploadProgress} />
              </div>
              <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => navigateToPath(-1)}
                className="cursor-pointer flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                Root
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.map((segment, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {index === pathSegments.length - 1 ? (
                    <BreadcrumbPage>{segment}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      onClick={() => navigateToPath(index)}
                      className="cursor-pointer"
                    >
                      {segment}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar arquivos e pastas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        {currentFiles.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div 
                className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden cursor-pointer"
                onClick={() => item.type === 'folder' ? handleOpenFolder(item) : isImage(item) ? handleViewImage(item) : null}
              >
                {getFileIcon(item)}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {item.type === 'folder' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFolder(item);
                      }}
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      {isImage(item) && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewImage(item);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditImage(item);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {item.type === 'file' && (
                        <>
                          <DropdownMenuItem onClick={() => handleDownload(item)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {item.url && (
                            <DropdownMenuItem onClick={() => handleCopyUrl(item.url!)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar URL
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => { setOperationFile(item); setOperationType('copy'); }}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setOperationFile(item); setOperationType('move'); }}>
                        <Move className="w-4 h-4 mr-2" />
                        Mover
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setOperationFile(item); setOperationType('rename'); }}>
                        <FileEdit className="w-4 h-4 mr-2" />
                        Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setOperationFile(item); setOperationType('history'); }}>
                        <History className="w-4 h-4 mr-2" />
                        Histórico
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => { setOperationFile(item); setOperationType('delete'); }}
                        className="text-red-600"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div>
                <p className="text-sm truncate mb-1" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {item.type === 'folder' ? 'Pasta' : formatFileSize(item.size)}
                  </p>
                  {isImage(item) && (
                    <Badge variant="secondary" className="text-xs">IMG</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentFiles.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {searchTerm ? 'Nenhum arquivo encontrado' : 'Esta pasta está vazia'}
          </p>
          <p className="text-sm text-gray-400">
            {searchTerm ? 'Tente outro termo de busca' : 'Faça upload de arquivos ou crie uma pasta'}
          </p>
        </div>
      )}

      {/* Storage Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-600">{totalFiles}</p>
              <p className="text-sm text-gray-600">Arquivos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{totalFolders}</p>
              <p className="text-sm text-gray-600">Pastas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{formatFileSize(totalSize)}</p>
              <p className="text-sm text-gray-600">Armazenado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Pasta</DialogTitle>
            <DialogDescription>
              Digite o nome da nova pasta em {currentPath}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folderName">Nome da Pasta</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="minha-pasta"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateFolder} className="flex-1">
                <FolderPlus className="w-4 h-4 mr-2" />
                Criar
              </Button>
              <Button variant="outline" onClick={() => setShowNewFolder(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedImage?.name}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowImageViewer(false);
                    if (selectedImage) handleEditImage(selectedImage);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                {selectedImage?.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(selectedImage)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-gray-100 rounded-lg p-4">
            {selectedImage?.url && (
              <img 
                src={selectedImage.url} 
                alt={selectedImage.name}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Tamanho: {formatFileSize(selectedImage?.size)}</p>
            <p>Tipo: {selectedImage?.mimeType}</p>
            <p>Criado em: {selectedImage?.createdAt ? new Date(selectedImage.createdAt).toLocaleString('pt-BR') : '-'}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Editor Dialog */}
      <Dialog open={showImageEditor} onOpenChange={setShowImageEditor}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          {selectedImage?.url && (
            <ImageEditor
              imageUrl={selectedImage.url}
              imageName={selectedImage.name}
              onSave={handleSaveEditedImage}
              onClose={() => {
                setShowImageEditor(false);
                setSelectedImage(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* File Operations Dialogs */}
      {operationFile && operationType === 'copy' && (
        <CopyFileDialog
          file={operationFile}
          allFiles={files}
          onComplete={() => {
            setOperationType(null);
            setOperationFile(null);
            loadFiles();
          }}
          onCancel={() => {
            setOperationType(null);
            setOperationFile(null);
          }}
        />
      )}

      {operationFile && operationType === 'move' && (
        <MoveFileDialog
          file={operationFile}
          allFiles={files}
          onComplete={() => {
            setOperationType(null);
            setOperationFile(null);
            loadFiles();
          }}
          onCancel={() => {
            setOperationType(null);
            setOperationFile(null);
          }}
        />
      )}

      {operationFile && operationType === 'rename' && (
        <RenameFileDialog
          file={operationFile}
          allFiles={files}
          onComplete={() => {
            setOperationType(null);
            setOperationFile(null);
            loadFiles();
          }}
          onCancel={() => {
            setOperationType(null);
            setOperationFile(null);
          }}
        />
      )}

      {operationFile && operationType === 'delete' && (
        <DeleteFileDialog
          file={operationFile}
          allFiles={files}
          onComplete={() => {
            setOperationType(null);
            setOperationFile(null);
            loadFiles();
          }}
          onCancel={() => {
            setOperationType(null);
            setOperationFile(null);
          }}
        />
      )}

      {/* Version History Dialog */}
      {operationFile && operationType === 'history' && (
        <Dialog open={true} onOpenChange={() => { setOperationType(null); setOperationFile(null); }}>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <VersionManager
              entityId={operationFile.id}
              entityType="file"
              currentData={operationFile}
              currentUser={currentUser}
              onRestore={(version) => {
                const restoredFile = { ...version.data, id: operationFile.id };
                const updatedFiles = files.map(f => f.id === operationFile.id ? restoredFile : f);
                saveFiles(updatedFiles);
                setOperationType(null);
                setOperationFile(null);
              }}
              onClose={() => {
                setOperationType(null);
                setOperationFile(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
