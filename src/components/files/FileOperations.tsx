import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Copy, 
  Move, 
  FileEdit, 
  Trash2,
  Folder,
  File,
  ChevronRight,
  Home,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from '../ui/alert';
import { TrashService } from '../../services/TrashService';

interface FileData {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  parentId: string | null;
  size?: number;
  mimeType?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
  protected?: boolean;
}

interface FileOperationsProps {
  file: FileData;
  allFiles: FileData[];
  onComplete: () => void;
  onCancel: () => void;
}

export function CopyFileDialog({ file, allFiles, onComplete, onCancel }: FileOperationsProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newName, setNewName] = useState(file.name);
  const [copying, setCopying] = useState(false);

  const folders = allFiles.filter(f => f.type === 'folder');

  const copyFile = () => {
    if (!selectedFolderId && selectedFolderId !== '') {
      toast.error('Selecione uma pasta de destino');
      return;
    }

    setCopying(true);
    
    setTimeout(() => {
      const destinationFolder = folders.find(f => f.id === selectedFolderId);
      const destinationPath = selectedFolderId === '' ? '/' : (destinationFolder?.path || '/');
      
      const copiedFile: FileData = {
        ...file,
        id: `file-${Date.now()}`,
        name: newName,
        path: `${destinationPath}/${newName}`,
        parentId: selectedFolderId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedFiles = [...allFiles, copiedFile];
      localStorage.setItem('files', JSON.stringify(updatedFiles));
      
      toast.success(`${file.type === 'folder' ? 'Pasta' : 'Arquivo'} copiado com sucesso!`);
      setCopying(false);
      onComplete();
    }, 500);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Copiar {file.type === 'folder' ? 'Pasta' : 'Arquivo'}
          </DialogTitle>
          <DialogDescription>
            Escolha o destino e o novo nome para a cópia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Arquivo Original */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Original:</strong> {file.path}
            </AlertDescription>
          </Alert>

          {/* Novo Nome */}
          <div>
            <Label htmlFor="copy-name">Novo Nome</Label>
            <Input
              id="copy-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Digite o novo nome"
            />
          </div>

          {/* Seleção de Pasta */}
          <div>
            <Label>Pasta de Destino</Label>
            <ScrollArea className="h-[200px] border rounded mt-2">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => setSelectedFolderId('')}
                  className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${
                    selectedFolderId === '' ? 'bg-indigo-50 border border-indigo-200' : ''
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>/ (Raiz)</span>
                  {selectedFolderId === '' && <CheckCircle className="w-4 h-4 ml-auto text-indigo-600" />}
                </button>
                
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${
                      selectedFolderId === folder.id ? 'bg-indigo-50 border border-indigo-200' : ''
                    }`}
                    disabled={folder.id === file.id}
                  >
                    <Folder className="w-4 h-4 text-blue-600" />
                    <span className="flex-1 text-left">{folder.path}</span>
                    {selectedFolderId === folder.id && (
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                    )}
                    {folder.id === file.id && (
                      <Badge variant="secondary" className="text-xs">Original</Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview do Caminho */}
          <div className="bg-gray-50 p-3 rounded border">
            <Label className="text-sm text-gray-600 mb-1 block">Caminho de Destino:</Label>
            <p className="font-mono text-sm">
              {selectedFolderId === '' 
                ? `/${newName}`
                : `${folders.find(f => f.id === selectedFolderId)?.path || '/'}/${newName}`}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={copyFile} disabled={copying || !newName.trim()} className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              {copying ? 'Copiando...' : 'Copiar'}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={copying} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MoveFileDialog({ file, allFiles, onComplete, onCancel }: FileOperationsProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const folders = allFiles.filter(f => f.type === 'folder' && f.id !== file.id);

  const moveFile = () => {
    if (selectedFolderId === null) {
      toast.error('Selecione uma pasta de destino');
      return;
    }

    setMoving(true);

    setTimeout(() => {
      const destinationFolder = folders.find(f => f.id === selectedFolderId);
      const destinationPath = selectedFolderId === '' ? '/' : (destinationFolder?.path || '/');
      
      const movedFile: FileData = {
        ...file,
        path: `${destinationPath}/${file.name}`,
        parentId: selectedFolderId || null,
        updatedAt: new Date().toISOString()
      };

      const updatedFiles = allFiles.map(f => f.id === file.id ? movedFile : f);
      localStorage.setItem('files', JSON.stringify(updatedFiles));
      
      toast.success(`${file.type === 'folder' ? 'Pasta' : 'Arquivo'} movido com sucesso!`);
      setMoving(false);
      onComplete();
    }, 500);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="w-5 h-5" />
            Mover {file.type === 'folder' ? 'Pasta' : 'Arquivo'}
          </DialogTitle>
          <DialogDescription>
            Escolha a nova localização
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Localização Atual */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Localização Atual:</strong> {file.path}
            </AlertDescription>
          </Alert>

          {/* Seleção de Pasta */}
          <div>
            <Label>Nova Localização</Label>
            <ScrollArea className="h-[250px] border rounded mt-2">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => setSelectedFolderId('')}
                  className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${
                    selectedFolderId === '' ? 'bg-indigo-50 border border-indigo-200' : ''
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>/ (Raiz)</span>
                  {selectedFolderId === '' && <CheckCircle className="w-4 h-4 ml-auto text-indigo-600" />}
                </button>
                
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${
                      selectedFolderId === folder.id ? 'bg-indigo-50 border border-indigo-200' : ''
                    }`}
                  >
                    <Folder className="w-4 h-4 text-blue-600" />
                    <span className="flex-1 text-left">{folder.path}</span>
                    {selectedFolderId === folder.id && (
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview do Novo Caminho */}
          {selectedFolderId !== null && (
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <Label className="text-sm text-green-800 mb-1 block">Novo Caminho:</Label>
              <p className="font-mono text-sm text-green-900">
                {selectedFolderId === '' 
                  ? `/${file.name}`
                  : `${folders.find(f => f.id === selectedFolderId)?.path || '/'}/${file.name}`}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={moveFile} disabled={moving || selectedFolderId === null} className="flex-1">
              <Move className="w-4 h-4 mr-2" />
              {moving ? 'Movendo...' : 'Mover'}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={moving} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RenameFileDialog({ file, allFiles, onComplete, onCancel }: FileOperationsProps) {
  const [newName, setNewName] = useState(file.name);
  const [renaming, setRenaming] = useState(false);

  const renameFile = () => {
    if (!newName.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    if (newName === file.name) {
      toast.info('O nome não foi alterado');
      onCancel();
      return;
    }

    setRenaming(true);

    setTimeout(() => {
      const parentPath = file.path.substring(0, file.path.lastIndexOf('/')) || '/';
      const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;

      const renamedFile: FileData = {
        ...file,
        name: newName,
        path: newPath,
        updatedAt: new Date().toISOString()
      };

      const updatedFiles = allFiles.map(f => f.id === file.id ? renamedFile : f);
      localStorage.setItem('files', JSON.stringify(updatedFiles));
      
      toast.success(`${file.type === 'folder' ? 'Pasta' : 'Arquivo'} renomeado com sucesso!`);
      setRenaming(false);
      onComplete();
    }, 300);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="w-5 h-5" />
            Renomear {file.type === 'folder' ? 'Pasta' : 'Arquivo'}
          </DialogTitle>
          <DialogDescription>
            Digite o novo nome
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome Atual */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Nome Atual:</strong> {file.name}
            </AlertDescription>
          </Alert>

          {/* Novo Nome */}
          <div>
            <Label htmlFor="rename-input">Novo Nome</Label>
            <Input
              id="rename-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Digite o novo nome"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  renameFile();
                }
              }}
            />
          </div>

          {/* Preview */}
          {newName.trim() && newName !== file.name && (
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <Label className="text-sm text-green-800 mb-1 block">Novo Caminho:</Label>
              <p className="font-mono text-sm text-green-900">
                {file.path.substring(0, file.path.lastIndexOf('/')) || '/'}/{newName}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={renameFile} disabled={renaming || !newName.trim()} className="flex-1">
              <FileEdit className="w-4 h-4 mr-2" />
              {renaming ? 'Renomeando...' : 'Renomear'}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={renaming} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteFileDialog({ file, allFiles, onComplete, onCancel }: FileOperationsProps) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isFolder = file.type === 'folder';
  const childrenCount = isFolder 
    ? allFiles.filter(f => f.path.startsWith(file.path + '/')).length
    : 0;

  const deleteFile = () => {
    // Check if file/folder is protected
    if ((file as any).protected) {
      toast.error(`${isFolder ? 'A pasta' : 'O arquivo'} "${file.name}" é protegido e não pode ser excluído`);
      return;
    }

    if (isFolder && childrenCount > 0) {
      toast.error(`A pasta contém ${childrenCount} ${childrenCount === 1 ? 'item' : 'itens'}. Esvazie a pasta antes de excluí-la.`);
      return;
    }

    setDeleting(true);

    setTimeout(() => {
      // Mover para lixeira ao invés de deletar permanentemente
      TrashService.moveToTrash(
        { ...file, name: file.name },
        isFolder ? 'folder' : 'file',
        'current-user' // Você pode passar o usuário atual aqui
      );

      // Remover do localStorage
      let updatedFiles: FileData[];
      
      if (isFolder) {
        // Excluir pasta e todos os filhos
        updatedFiles = allFiles.filter(f => 
          f.id !== file.id && !f.path.startsWith(file.path + '/')
        );
      } else {
        // Excluir apenas o arquivo
        updatedFiles = allFiles.filter(f => f.id !== file.id);
      }

      localStorage.setItem('files', JSON.stringify(updatedFiles));
      
      setDeleting(false);
      onComplete();
    }, 300);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Trash2 className="w-5 h-5" />
            Mover para Lixeira
          </DialogTitle>
          <DialogDescription>
            O item será movido para a lixeira e poderá ser restaurado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aviso */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Mover para lixeira:</strong>
              <p className="mt-2 font-mono text-sm">{file.path}</p>
              {isFolder && childrenCount > 0 && (
                <p className="mt-2 text-red-600">
                  ⚠️ Atenção: Esta pasta contém <strong>{childrenCount}</strong> item
                  {childrenCount > 1 ? 's' : ''}. Você precisa esvaziar a pasta antes de excluí-la.
                </p>
              )}
              {(!isFolder || childrenCount === 0) && (
                <p className="mt-2 text-gray-600">
                  ✓ Você poderá restaurar este item na Lixeira
                </p>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="destructive"
              onClick={deleteFile} 
              disabled={deleting || (isFolder && childrenCount > 0)} 
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Movendo...' : 'Mover para Lixeira'}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={deleting} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
