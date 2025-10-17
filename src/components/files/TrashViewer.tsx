import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Trash2,
  RotateCcw,
  XCircle,
  Search,
  FileText,
  Folder,
  Layout,
  File,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { TrashService, DeletedItem } from '../../services/TrashService';
import { toast } from 'sonner@2.0.3';

interface TrashViewerProps {
  onRestore?: (item: DeletedItem) => void;
  onClose?: () => void;
}

export function TrashViewer({ onRestore, onClose }: TrashViewerProps) {
  const [trashItems, setTrashItems] = useState<DeletedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'page' | 'template' | 'file' | 'folder'>('all');

  useEffect(() => {
    loadTrash();
  }, []);

  const loadTrash = () => {
    const items = TrashService.getTrashItems();
    setTrashItems(items);
  };

  const handleRestore = (item: DeletedItem) => {
    const restored = TrashService.restoreFromTrash(item.id);
    if (restored) {
      // Restaurar o item de volta ao localStorage apropriado
      if (item.type === 'file' || item.type === 'folder') {
        // Restaurar arquivo/pasta
        const currentFiles = JSON.parse(localStorage.getItem('files') || '[]');
        const restoredItem = {
          ...item.data,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('files', JSON.stringify([...currentFiles, restoredItem]));
      } else if (item.type === 'page') {
        // Restaurar página
        const currentPages = JSON.parse(localStorage.getItem('pages') || '[]');
        const restoredPage = {
          ...item.data,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('pages', JSON.stringify([...currentPages, restoredPage]));
      } else if (item.type === 'template') {
        // Restaurar template
        const currentTemplates = JSON.parse(localStorage.getItem('templates') || '[]');
        const restoredTemplate = {
          ...item.data,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('templates', JSON.stringify([...currentTemplates, restoredTemplate]));
      }
      
      loadTrash();
      if (onRestore) {
        onRestore(restored);
      }
    }
  };

  const handleDeletePermanently = (item: DeletedItem) => {
    const deleted = TrashService.deletePermanently(item.id);
    if (deleted) {
      loadTrash();
    }
  };

  const handleEmptyTrash = () => {
    const emptied = TrashService.emptyTrash();
    if (emptied) {
      loadTrash();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <Layout className="w-5 h-5 text-purple-500" />;
      case 'template':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'folder':
        return <Folder className="w-5 h-5 text-yellow-500" />;
      case 'file':
        return <File className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      page: 'Página',
      template: 'Template',
      folder: 'Pasta',
      file: 'Arquivo'
    };
    return labels[type] || type;
  };

  const filteredItems = trashItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-red-500" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Lixeira</h1>
              <p className="text-sm text-gray-500">
                {trashItems.length} {trashItems.length === 1 ? 'item' : 'itens'} na lixeira
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {trashItems.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEmptyTrash}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Esvaziar Lixeira
              </Button>
            )}
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar na lixeira..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              Todos
            </Button>
            <Button
              variant={filterType === 'page' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('page')}
            >
              Páginas
            </Button>
            <Button
              variant={filterType === 'template' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('template')}
            >
              Templates
            </Button>
            <Button
              variant={filterType === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('file')}
            >
              Arquivos
            </Button>
            <Button
              variant={filterType === 'folder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('folder')}
            >
              Pastas
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterType !== 'all' ? 'Nenhum item encontrado' : 'Lixeira vazia'}
              </h3>
              <p className="text-sm text-gray-500">
                {searchTerm || filterType !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Itens deletados aparecerão aqui'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getIcon(item.type)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(item.type)}
                              </Badge>
                              {item.originalPath && (
                                <span className="text-xs text-gray-500">
                                  📁 {item.originalPath || 'Raiz'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            {item.canRestore && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(item)}
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restaurar
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePermanently(item)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Deletar
                            </Button>
                          </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <span>Deletado em:</span>
                            <span className="font-medium">
                              {new Date(item.deletedAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          {item.deletedBy && (
                            <div className="flex items-center gap-1">
                              <span>Por:</span>
                              <span className="font-medium">{item.deletedBy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Warning */}
          {trashItems.length > 0 && (
            <Card className="mt-6 bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Atenção</p>
                    <p>
                      Os itens na lixeira podem ser restaurados a qualquer momento.
                      Para liberar espaço permanentemente, use "Deletar" ou "Esvaziar Lixeira".
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
