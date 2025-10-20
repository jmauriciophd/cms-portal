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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, VisuallyHidden } from '../ui/dialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
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
import { FilePropertiesSheet } from './FilePropertiesSheet';
import { Breadcrumb, BreadcrumbItem } from '../navigation/Breadcrumb';
import { FolderNavigator } from '../navigation/FolderNavigator';
import { NewItemMenu } from './NewItemMenu';
import { TextEditor } from './TextEditor';
import { FileListView } from './FileListView';
import { Grid3x3, List, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LinkManagementService } from '../../services/LinkManagementService';
import { UploadConfirmDialog, UploadConfirmMultipleDialog } from '../common/UploadConfirmDialog';
import { downloadFile, downloadFolder, prepareFolderStructure } from '../../utils/download';
import { StorageQuotaService } from '../../services/StorageQuotaService';

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
  protected?: boolean;
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
  const [propertiesFile, setPropertiesFile] = useState<FileItem | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [showFolderNavigator, setShowFolderNavigator] = useState(false);
  
  // New states for enhanced features
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingTextFile, setEditingTextFile] = useState<FileItem | null>(null);
  
  // Upload confirmation states
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
  const [showUploadConfirmMultiple, setShowUploadConfirmMultiple] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<Array<{ file: globalThis.File; data: FileItem }>>([]);
  const [conflictingItems, setConflictingItems] = useState<Array<{ name: string; type: string }>>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    // Listener para recarregar quando arquivos mudarem (detecta uploads do MediaLibrarySelector)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'files') {
        loadFiles();
      }
    };

    // Listener customizado para mudanças na mesma aba
    const handleFilesUpdate = () => {
      loadFiles();
    };

    // Listener para abrir arquivo da pesquisa global
    const handleOpenFile = (e: CustomEvent) => {
      const { fileId, filePath } = e.detail;
      
      // Encontrar o arquivo no localStorage diretamente
      const storedFiles = localStorage.getItem('files');
      const allFiles: FileItem[] = storedFiles ? JSON.parse(storedFiles) : [];
      const fileToOpen = allFiles.find(f => f.id === fileId || f.path === filePath);
      
      if (fileToOpen) {
        // Navegar para a pasta do arquivo
        if (fileToOpen.parent) {
          setCurrentPath(fileToOpen.parent);
        }
        
        // Abrir preview do arquivo
        if (fileToOpen.mimeType?.startsWith('image/')) {
          setSelectedImage(fileToOpen);
          setShowImageViewer(true);
        } else if (fileToOpen.mimeType === 'text/plain' || fileToOpen.mimeType === 'text/html') {
          setEditingTextFile(fileToOpen);
          setShowTextEditor(true);
        } else {
          // Para outros tipos, mostrar propriedades
          setPropertiesFile(fileToOpen);
          setShowProperties(true);
        }
        
        toast.success(`Arquivo aberto: ${fileToOpen.name}`);
      }
    };

    // Listener para selecionar item da pesquisa global
    const handleSelectItem = (e: CustomEvent) => {
      const { itemId, viewId } = e.detail;
      if (viewId === 'files') {
        handleOpenFile(new CustomEvent('openFile', { detail: { fileId: itemId } }) as any);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('filesUpdated', handleFilesUpdate);
    window.addEventListener('openFile', handleOpenFile as EventListener);
    window.addEventListener('selectItem', handleSelectItem as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('filesUpdated', handleFilesUpdate);
      window.removeEventListener('openFile', handleOpenFile as EventListener);
      window.removeEventListener('selectItem', handleSelectItem as EventListener);
    };
  }, []);

  const loadFiles = () => {
    const stored = localStorage.getItem('files');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validação robusta: garantir que é um array
        const existingFiles = Array.isArray(parsed) ? parsed : [];
        
        // Ensure default protected folders exist
        const protectedFolders = [
          { name: 'Arquivos', path: '/Arquivos' },
          { name: 'imagens', path: '/Arquivos/imagens' },
          { name: 'paginas', path: '/Arquivos/paginas' },
          { name: 'estaticos', path: '/Arquivos/estaticos' }
        ];

        let updated = false;
        protectedFolders.forEach(folder => {
          if (!existingFiles.some((f: FileItem) => f.path === folder.path)) {
          existingFiles.push({
            id: `protected-${Date.now()}-${Math.random()}`,
            name: folder.name,
            type: 'folder' as const,
            path: folder.path,
            parent: folder.path === '/Arquivos' ? '/' : '/Arquivos',
            createdAt: new Date().toISOString(),
            protected: true
          });
          updated = true;
        }
      });

      // Ensure "Inicio.html" homepage file exists
      const homepagePath = '/Arquivos/Inicio.html';
      if (!existingFiles.some((f: FileItem) => f.path === homepagePath)) {
        const defaultHomepageContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Início - Portal CMS</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 3rem 0; text-align: center; }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; }
        .hero { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 2rem; margin: 2rem 0; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin: 2rem 0; }
        .feature { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .feature h3 { color: #667eea; margin-bottom: 0.5rem; }
        footer { text-align: center; padding: 2rem; color: #666; margin-top: 3rem; border-top: 1px solid #e0e0e0; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Bem-vindo ao Portal CMS</h1>
            <p class="subtitle">Sistema completo de gerenciamento de conteúdo</p>
        </div>
    </header>
    
    <div class="container">
        <div class="hero">
            <h2>Página Inicial do Site</h2>
            <p>Esta é a página inicial vinculada ao site público. Edite este arquivo para personalizar o conteúdo da homepage.</p>
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>📝 Editor Inteligente</h3>
                <p>Crie e edite conteúdo com nosso editor visual avançado.</p>
            </div>
            <div class="feature">
                <h3>🎨 Page Builder</h3>
                <p>Construa páginas complexas com arrastar e soltar.</p>
            </div>
            <div class="feature">
                <h3>📁 Gerenciamento de Arquivos</h3>
                <p>Organize todos os seus arquivos e imagens.</p>
            </div>
            <div class="feature">
                <h3>🔒 Segurança</h3>
                <p>Sistema completo de autenticação e permissões.</p>
            </div>
        </div>
    </div>
    
    <footer>
        <p>&copy; 2025 Portal CMS. Todos os direitos reservados.</p>
    </footer>
</body>
</html>`;
        
        existingFiles.push({
          id: `homepage-${Date.now()}`,
          name: 'Inicio.html',
          type: 'file',
          path: homepagePath,
          parent: '/Arquivos',
          size: defaultHomepageContent.length,
          mimeType: 'text/html',
          url: `data:text/html;base64,${btoa(unescape(encodeURIComponent(defaultHomepageContent)))}`,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          protected: false
        });
        updated = true;
      }

      if (updated) {
        StorageQuotaService.setItem('files', JSON.stringify(existingFiles));
      }
      setFiles(existingFiles);
      } catch (error) {
        console.error('Erro ao carregar arquivos do localStorage:', error);
        // Em caso de erro, limpar e criar estrutura padrão
        localStorage.removeItem('files');
        loadFiles(); // Recarregar para criar estrutura padrão
        return;
      }
    } else {
      // Create default folder structure
      const defaultFiles: FileItem[] = [
        {
          id: 'root-arquivos',
          name: 'Arquivos',
          type: 'folder',
          path: '/Arquivos',
          parent: '/',
          createdAt: new Date().toISOString(),
          protected: true
        },
        {
          id: 'default-imagens',
          name: 'imagens',
          type: 'folder',
          path: '/Arquivos/imagens',
          parent: '/Arquivos',
          createdAt: new Date().toISOString(),
          protected: true
        },
        {
          id: 'default-paginas',
          name: 'paginas',
          type: 'folder',
          path: '/Arquivos/paginas',
          parent: '/Arquivos',
          createdAt: new Date().toISOString(),
          protected: true
        },
        {
          id: 'default-estaticos',
          name: 'estaticos',
          type: 'folder',
          path: '/Arquivos/estaticos',
          parent: '/Arquivos',
          createdAt: new Date().toISOString(),
          protected: true
        }
      ];
      localStorage.setItem('files', JSON.stringify(defaultFiles));
      setFiles(defaultFiles);
    }
  };

  const saveFiles = async (updatedFiles: FileItem[]) => {
    const success = await StorageQuotaService.setItem('files', updatedFiles);
    if (success) {
      setFiles(updatedFiles);
      // Notificar outros componentes sobre a mudança
      window.dispatchEvent(new Event('filesUpdated'));
    } else {
      toast.error('Não foi possível salvar. Armazenamento cheio.');
    }
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

  const handleNewTextFile = () => {
    setEditingTextFile(null);
    setShowTextEditor(true);
  };

  const handleSaveTextFile = (fileName: string, content: string) => {
    const filePath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;
    
    // Check if file already exists
    const existingFile = files.find(f => f.path === filePath);
    
    if (existingFile && !editingTextFile) {
      toast.error('Já existe um arquivo com este nome');
      return;
    }

    if (editingTextFile) {
      // Update existing file
      const updatedFiles = files.map(f => 
        f.id === editingTextFile.id 
          ? { ...f, name: fileName, modifiedAt: new Date().toISOString(), url: content }
          : f
      );
      saveFiles(updatedFiles);
      toast.success('Arquivo atualizado com sucesso!');
    } else {
      // Create new file
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: fileName,
        type: 'file',
        path: filePath,
        parent: currentPath,
        size: new Blob([content]).size,
        url: content, // Store text content in URL field
        mimeType: 'text/plain',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      };
      saveFiles([...files, newFile]);
      toast.success('Arquivo criado com sucesso!');

      // Gera link para arquivo de texto
      LinkManagementService.createLinkForResource({
        title: newFile.name,
        slug: newFile.name.toLowerCase().replace(/\s+/g, '-'),
        resourceType: 'file',
        resourceId: newFile.id,
        folder: currentPath,
        description: `Arquivo: ${newFile.name}`,
        metadata: {
          mimeType: newFile.mimeType,
          fileSize: newFile.size
        }
      });
    }

    setShowTextEditor(false);
    setEditingTextFile(null);
  };

  const handleNewPage = () => {
    // Navigate to PageManager to create a new page
    // This will be handled by the Dashboard component
    toast.info('Redirecionando para criação de página...');
    // Emit event or callback to parent
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-to-pages'));
    }, 500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const newFiles: Array<{ file: globalThis.File; data: FileItem }> = [];
    const errors: string[] = [];
    const conflicts: Array<{ name: string; type: string }> = [];

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

        const filePath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
        
        // Check if file already exists
        const existingFile = files.find(f => f.path === filePath);
        
        const newFile: FileItem = {
          id: existingFile?.id || (Date.now().toString() + Math.random()),
          name: file.name,
          type: 'file',
          path: filePath,
          parent: currentPath,
          size: file.size,
          url: fileData,
          mimeType: file.type,
          createdAt: existingFile?.createdAt || new Date().toISOString(),
          modifiedAt: new Date().toISOString()
        };

        if (existingFile) {
          // File exists - add to conflicts
          const fileType = file.type.startsWith('image/') ? 'imagem' : 'arquivo';
          conflicts.push({ name: file.name, type: fileType });
          newFiles.push({ file, data: newFile });
        } else {
          // New file - add directly
          newFiles.push({ file, data: newFile });
        }
      } catch (error) {
        errors.push(`${file.name}: Erro ao processar arquivo`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);

    if (errors.length > 0) {
      toast.error(`Alguns arquivos não puderam ser processados:\n${errors.join('\n')}`);
    }

    // If there are conflicts, show confirmation dialog
    if (conflicts.length > 0) {
      setPendingUploads(newFiles);
      setConflictingItems(conflicts);
      
      if (conflicts.length === 1 && newFiles.length === 1) {
        setShowUploadConfirm(true);
      } else {
        setShowUploadConfirmMultiple(true);
      }
    } else if (newFiles.length > 0) {
      // No conflicts - save directly
      processUploadedFilesDirectly(newFiles);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processUploadedFilesDirectly = (filesToAdd: Array<{ file: globalThis.File; data: FileItem }>) => {
    if (filesToAdd.length === 0) {
      toast.info('Nenhum arquivo foi adicionado');
      return;
    }

    // Separate new files and files to replace
    const newFilesList: FileItem[] = [];
    const filesToReplace: string[] = [];

    filesToAdd.forEach(({ file, data }) => {
      const existingFile = files.find(f => f.path === data.path);
      if (existingFile) {
        filesToReplace.push(existingFile.id);
      }
      newFilesList.push(data);
    });

    // Remove files that will be replaced
    const updatedFiles = files.filter(f => !filesToReplace.includes(f.id));
    
    // Add new files
    saveFiles([...updatedFiles, ...newFilesList]);

    // Generate links for new files
    filesToAdd.forEach(({ file, data }) => {
      const resourceType = file.type.startsWith('image/') ? 'image' : 
                         file.type === 'application/pdf' ? 'pdf' : 'file';
      LinkManagementService.createLinkForResource({
        title: file.name,
        slug: file.name.toLowerCase().replace(/\s+/g, '-').replace(/\.[^/.]+$/, ''),
        resourceType: resourceType as any,
        resourceId: data.id,
        folder: currentPath,
        description: `${resourceType === 'image' ? 'Imagem' : resourceType === 'pdf' ? 'PDF' : 'Arquivo'}: ${file.name}`,
        metadata: {
          mimeType: file.type,
          fileSize: file.size
        }
      });
    });

    const replacedCount = filesToReplace.length;
    const addedCount = filesToAdd.length - replacedCount;

    if (replacedCount > 0 && addedCount > 0) {
      toast.success(`${addedCount} arquivo(s) adicionado(s) e ${replacedCount} substituído(s)!`);
    } else if (replacedCount > 0) {
      toast.success(`${replacedCount} arquivo(s) substituído(s) com sucesso!`);
    } else {
      toast.success(`${addedCount} arquivo(s) enviado(s) com sucesso!`);
    }
  };

  const processUploadedFiles = (filesToProcess: string[]) => {
    const filesToAdd = pendingUploads.filter(pu => filesToProcess.includes(pu.file.name));
    
    if (filesToAdd.length === 0) {
      toast.info('Nenhum arquivo foi adicionado');
      setPendingUploads([]);
      setConflictingItems([]);
      return;
    }

    // Use a função direta
    processUploadedFilesDirectly(filesToAdd);
    
    // Limpar estados
    setPendingUploads([]);
    setConflictingItems([]);
  };

  const handleDelete = (item: FileItem) => {
    // Check if folder is protected
    if (item.protected) {
      toast.error(`A pasta "${item.name}" é protegida e não pode ser excluída`);
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir "${item.name}"?`)) return;

    // If deleting a folder, also delete all its contents
    if (item.type === 'folder') {
      const itemsToDelete = files.filter(f => f.path.startsWith(item.path));
      const updatedFiles = files.filter(f => !f.path.startsWith(item.path) && f.id !== item.id);
      saveFiles(updatedFiles);
      
      // Deleta links de todos os arquivos da pasta
      itemsToDelete.forEach(f => {
        if (f.type === 'file') {
          LinkManagementService.deleteLinksForResource(f.id);
        }
      });
      
      toast.success(`Pasta e ${itemsToDelete.length} item(s) excluídos`);
    } else {
      const updatedFiles = files.filter(f => f.id !== item.id);
      saveFiles(updatedFiles);
      toast.success('Arquivo excluído com sucesso!');
    }
  };

  const handleCopyUrl = async (url: string) => {
    const { copyToClipboard } = await import('../../utils/clipboard');
    const success = await copyToClipboard(url);
    
    if (success) {
      toast.success('URL copiada para a área de transferência!');
    } else {
      toast.error('Não foi possível copiar. URL: ' + url);
    }
  };

  const handleCopyPath = async (path: string) => {
    const { copyToClipboard } = await import('../../utils/clipboard');
    const success = await copyToClipboard(path);
    
    if (success) {
      toast.success('Caminho copiado para a área de transferência!');
    } else {
      toast.error('Não foi possível copiar. Caminho: ' + path);
    }
  };

  const handleShowProperties = (item: FileItem) => {
    setPropertiesFile(item);
    setShowProperties(true);
  };

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];
    const parts = currentPath.split('/').filter(p => p);

    // Home
    items.push({
      label: 'Início',
      onClick: () => setCurrentPath('/')
    });

    // Build path progressively
    let buildPath = '';
    parts.forEach((part, index) => {
      buildPath += '/' + part;
      const pathToNavigate = buildPath;
      items.push({
        label: part,
        onClick: () => setCurrentPath(pathToNavigate)
      });
    });

    return items;
  };

  const handleDownload = (item: FileItem) => {
    if (item.type === 'folder') {
      handleDownloadFolder(item);
    } else {
      if (!item.url) {
        toast.error('Arquivo sem URL de download');
        return;
      }
      downloadFile({
        name: item.name,
        url: item.url,
        mimeType: item.mimeType
      });
    }
  };

  const handleDownloadFolder = (folder: FileItem) => {
    // Get all files and subfolders in this folder
    const allFolderItems = files.filter(f => f.path.startsWith(folder.path));
    
    if (allFolderItems.length === 0) {
      toast.info('Pasta vazia - nada para baixar');
      return;
    }

    // Prepare folder structure for download
    const folderStructure = prepareFolderStructure(
      folder.name,
      allFolderItems.map(f => ({
        name: f.name,
        path: f.path,
        url: f.url || '',
        mimeType: f.mimeType,
        type: f.type
      })),
      folder.path
    );

    // Download as ZIP
    downloadFolder(folderStructure);
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

  const handleOpenTextFile = (item: FileItem) => {
    setEditingTextFile({
      ...item,
      content: item.url || '' // URL field stores text content
    });
    setShowTextEditor(true);
  };

  const handleFileClick = (item: FileItem) => {
    if (item.type === 'folder') {
      handleOpenFolder(item);
    } else if (isImage(item)) {
      handleViewImage(item);
    } else if (item.mimeType === 'text/plain' || item.name.endsWith('.txt')) {
      handleOpenTextFile(item);
    } else {
      // Other file types - just show a message
      toast.info(`Arquivo: ${item.name} (${item.mimeType || 'tipo desconhecido'})`);
    }
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
        <div className="flex-1">
          <h1 className="text-gray-900 mb-2">Gerenciamento de Arquivos</h1>
          <p className="text-gray-600">Organize suas imagens e documentos com segurança</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFolderNavigator(!showFolderNavigator)}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            {showFolderNavigator ? 'Ocultar' : 'Mostrar'} Navegador
          </Button>
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <NewItemMenu
            onNewFolder={() => setShowNewFolder(true)}
            onNewTextFile={handleNewTextFile}
            onNewPage={handleNewPage}
          />
          
          <div>
            <Button 
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
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
          </div>
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
      <div className="mb-4">
        <Breadcrumb items={getBreadcrumbItems()} />
      </div>

      {/* Folder Navigator (collapsible) */}
      {showFolderNavigator && (
        <div className="mb-4">
          <FolderNavigator
            files={files}
            currentPath={currentPath}
            onNavigate={setCurrentPath}
            selectedPath={currentPath}
          />
        </div>
      )}

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

      {/* Files Display - Grid or List */}
      {viewMode === 'list' ? (
        <FileListView
          files={currentFiles}
          onFolderClick={handleOpenFolder}
          onFileClick={handleFileClick}
          onContextMenu={(file, action) => {
            if (action === 'download') handleDownload(file);
            else if (action === 'edit-image') handleEditImage(file);
            else if (action === 'rename') {
              setOperationFile(file);
              setOperationType('rename');
            }
            else if (action === 'move') {
              setOperationFile(file);
              setOperationType('move');
            }
            else if (action === 'copy') {
              setOperationFile(file);
              setOperationType('copy');
            }
            else if (action === 'delete') {
              setOperationFile(file);
              setOperationType('delete');
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {currentFiles.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div 
                  className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden cursor-pointer"
                  onClick={() => handleFileClick(item)}
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
                          {item.url && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Abrir em Nova Aba
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(item); }}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {item.url && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.url!); }}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar URL
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {item.type === 'folder' && (
                        <>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownloadFolder(item); }}>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar Pasta (ZIP)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setOperationFile(item); setOperationType('copy'); }}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setOperationFile(item); setOperationType('move'); }}>
                        <Move className="w-4 h-4 mr-2" />
                        Mover
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setOperationFile(item); setOperationType('rename'); }}>
                        <FileEdit className="w-4 h-4 mr-2" />
                        Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setOperationFile(item); setOperationType('history'); }}>
                        <History className="w-4 h-4 mr-2" />
                        Histórico
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyPath(item.path); }}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Caminho
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShowProperties(item); }}>
                        <FileText className="w-4 h-4 mr-2" />
                        Propriedades
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => { 
                          e.stopPropagation();
                          setOperationFile(item); 
                          setOperationType('delete'); 
                        }}
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
                {item.type === 'file' && item.url ? (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm truncate mb-1 text-indigo-600 hover:underline block"
                    title={`Abrir ${item.name} em nova aba`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.name}
                  </a>
                ) : (
                  <p className="text-sm truncate mb-1" title={item.name}>
                    {item.name}
                  </p>
                )}
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
      )}

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
        <DialogContent className="max-w-md">
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
            <DialogDescription>
              Visualize a imagem em tamanho completo. Use os botões acima para editar ou fazer download.
            </DialogDescription>
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
        <DialogContent className="max-w-[99vw] max-h-[98vh] w-[99vw] h-[98vh] p-0" hideCloseButton>
          <VisuallyHidden>
            <DialogTitle>Editor de Imagem</DialogTitle>
            <DialogDescription>
              Edite sua imagem usando ferramentas de ajuste, filtros, transformação e redimensionamento.
            </DialogDescription>
          </VisuallyHidden>
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
            <VisuallyHidden>
              <DialogTitle>Histórico de Versões</DialogTitle>
              <DialogDescription>
                Visualize e restaure versões anteriores de {operationFile.name}.
              </DialogDescription>
            </VisuallyHidden>
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

      {/* File Properties Sheet */}
      <FilePropertiesSheet
        file={propertiesFile}
        open={showProperties}
        onOpenChange={setShowProperties}
      />

      {/* Text Editor */}
      {showTextEditor && (
        <TextEditor
          file={editingTextFile ? {
            id: editingTextFile.id,
            name: editingTextFile.name,
            content: editingTextFile.url || ''
          } : undefined}
          currentPath={currentPath}
          onSave={handleSaveTextFile}
          onClose={() => {
            setShowTextEditor(false);
            setEditingTextFile(null);
          }}
        />
      )}

      {/* Upload Confirmation Dialogs */}
      {showUploadConfirm && conflictingItems.length === 1 && (
        <UploadConfirmDialog
          open={showUploadConfirm}
          onOpenChange={setShowUploadConfirm}
          itemName={conflictingItems[0].name}
          itemType={conflictingItems[0].type as any}
          onConfirm={() => {
            processUploadedFiles(pendingUploads.map(pu => pu.file.name));
          }}
          onCancel={() => {
            setPendingUploads([]);
            setConflictingItems([]);
          }}
        />
      )}

      {showUploadConfirmMultiple && conflictingItems.length > 0 && (
        <UploadConfirmMultipleDialog
          open={showUploadConfirmMultiple}
          onOpenChange={setShowUploadConfirmMultiple}
          items={conflictingItems}
          onConfirm={(itemsToReplace) => {
            if (itemsToReplace.length === 0) {
              // Skip all conflicts - only add non-conflicting files
              const nonConflictingFiles = pendingUploads.filter(
                pu => !conflictingItems.some(ci => ci.name === pu.file.name)
              );
              processUploadedFiles(nonConflictingFiles.map(pu => pu.file.name));
            } else {
              // Replace specified items
              processUploadedFiles(itemsToReplace);
            }
          }}
          onCancel={() => {
            setPendingUploads([]);
            setConflictingItems([]);
          }}
        />
      )}
    </div>
  );
}
