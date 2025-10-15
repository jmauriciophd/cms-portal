import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  File, 
  Folder, 
  Calendar, 
  HardDrive, 
  Link as LinkIcon,
  Copy,
  Check,
  Image as ImageIcon,
  FileText,
  Film
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

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

interface FilePropertiesSheetProps {
  file: FileItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilePropertiesSheet({ file, open, onOpenChange }: FilePropertiesSheetProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!file) return null;

  const formatSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = () => {
    if (file.type === 'folder') {
      return <Folder className="w-12 h-12 text-blue-500" />;
    }
    
    if (file.mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-12 h-12 text-green-500" />;
    }
    
    if (file.mimeType?.startsWith('video/')) {
      return <Film className="w-12 h-12 text-purple-500" />;
    }
    
    return <FileText className="w-12 h-12 text-gray-500" />;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <p className="truncate">{file.name}</p>
              <p className="text-sm font-normal text-gray-500">
                {file.type === 'folder' ? 'Pasta' : 'Arquivo'}
              </p>
            </div>
          </SheetTitle>
          <SheetDescription>
            Propriedades e informações detalhadas
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Preview (se for imagem) */}
          {file.type === 'file' && file.mimeType?.startsWith('image/') && file.url && (
            <div className="border rounded-lg overflow-hidden">
              <img 
                src={file.url} 
                alt={file.name}
                className="w-full h-auto max-h-[300px] object-contain bg-gray-50"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Informações Básicas</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Nome</span>
                <span className="text-sm font-medium text-gray-900">{file.name}</span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Tipo</span>
                <Badge variant={file.type === 'folder' ? 'default' : 'secondary'}>
                  {file.type === 'folder' ? 'Pasta' : file.mimeType || 'Arquivo'}
                </Badge>
              </div>

              {file.type === 'file' && file.size && (
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Tamanho
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatSize(file.size)}
                  </span>
                </div>
              )}

              {file.protected && (
                <div className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-sm text-amber-700">Status</span>
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    🔒 Protegido
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Path Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Localização</h3>
            
            <div className="space-y-2">
              <div className="py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Caminho Completo</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(file.path, 'Caminho')}
                  >
                    {copied === 'Caminho' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <code className="text-xs bg-white px-2 py-1 rounded border block">
                  {file.path}
                </code>
              </div>

              {file.parent && (
                <div className="py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Pasta Pai</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(file.parent || '', 'Pasta pai')}
                    >
                      {copied === 'Pasta pai' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <code className="text-xs bg-white px-2 py-1 rounded border block">
                    {file.parent}
                  </code>
                </div>
              )}

              {file.type === 'file' && file.url && (
                <div className="py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      URL do Arquivo
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(file.url || '', 'URL')}
                    >
                      {copied === 'URL' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <code className="text-xs bg-white px-2 py-1 rounded border block truncate">
                    {file.url}
                  </code>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Datas</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Criado em
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(file.createdAt)}
                </span>
              </div>

              {file.modifiedAt && (
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Modificado em
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(file.modifiedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ID (for debugging) */}
          <div className="pt-4 border-t">
            <details className="cursor-pointer">
              <summary className="text-xs text-gray-500 mb-2">Informações Técnicas</summary>
              <div className="mt-2 space-y-2">
                <div className="py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">ID do Arquivo</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(file.id, 'ID')}
                    >
                      {copied === 'ID' ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <code className="text-xs bg-white px-2 py-1 rounded border block truncate">
                    {file.id}
                  </code>
                </div>
              </div>
            </details>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
