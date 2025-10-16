// Serviço de operações para páginas, templates e arquivos
import { toast } from 'sonner@2.0.3';

export interface BaseItem {
  id: string;
  name: string;
  path?: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  itemId: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'rename' | 'copy';
  timestamp: string;
  user: string;
  before?: any;
  after?: any;
  description: string;
}

export class ItemOperationsService {
  private storageKey: string;
  private historyKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
    this.historyKey = `${storageKey}-history`;
  }

  // COPIAR
  copyItem(item: BaseItem): void {
    const clipboard = {
      item,
      timestamp: new Date().toISOString(),
      operation: 'copy'
    };
    
    localStorage.setItem('clipboard-item', JSON.stringify(clipboard));
    toast.success(`"${item.name}" copiado para a área de transferência`);
  }

  // COLAR
  pasteItem(targetPath?: string): BaseItem | null {
    const clipboardData = localStorage.getItem('clipboard-item');
    if (!clipboardData) {
      toast.error('Área de transferência vazia');
      return null;
    }

    const clipboard = JSON.parse(clipboardData);
    const originalItem = clipboard.item;

    // Criar cópia com novo ID
    const newItem: BaseItem = {
      ...originalItem,
      id: Date.now().toString(),
      name: `${originalItem.name} (Cópia)`,
      path: targetPath || originalItem.path,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Adicionar ao histórico
    this.addToHistory({
      id: Date.now().toString(),
      itemId: newItem.id,
      action: 'copy',
      timestamp: new Date().toISOString(),
      user: 'current-user',
      before: null,
      after: newItem,
      description: `Item "${newItem.name}" copiado de "${originalItem.name}"`
    });

    toast.success(`"${newItem.name}" colado com sucesso`);
    return newItem;
  }

  // MOVER
  moveItem(item: BaseItem, newPath: string): BaseItem {
    const oldPath = item.path || '';
    const updatedItem: BaseItem = {
      ...item,
      path: newPath,
      updatedAt: new Date().toISOString()
    };

    // Adicionar ao histórico
    this.addToHistory({
      id: Date.now().toString(),
      itemId: item.id,
      action: 'move',
      timestamp: new Date().toISOString(),
      user: 'current-user',
      before: { path: oldPath },
      after: { path: newPath },
      description: `Item "${item.name}" movido de "${oldPath}" para "${newPath}"`
    });

    toast.success(`"${item.name}" movido para "${newPath || 'raiz'}"`);
    return updatedItem;
  }

  // RENOMEAR
  renameItem(item: BaseItem, newName: string): BaseItem {
    if (!newName.trim()) {
      toast.error('O nome não pode estar vazio');
      throw new Error('Nome vazio');
    }

    const oldName = item.name;
    const updatedItem: BaseItem = {
      ...item,
      name: newName,
      updatedAt: new Date().toISOString()
    };

    // Adicionar ao histórico
    this.addToHistory({
      id: Date.now().toString(),
      itemId: item.id,
      action: 'rename',
      timestamp: new Date().toISOString(),
      user: 'current-user',
      before: { name: oldName },
      after: { name: newName },
      description: `Item renomeado de "${oldName}" para "${newName}"`
    });

    toast.success(`Renomeado de "${oldName}" para "${newName}"`);
    return updatedItem;
  }

  // EXCLUIR
  deleteItem(item: BaseItem): void {
    // Adicionar ao histórico
    this.addToHistory({
      id: Date.now().toString(),
      itemId: item.id,
      action: 'delete',
      timestamp: new Date().toISOString(),
      user: 'current-user',
      before: item,
      after: null,
      description: `Item "${item.name}" excluído`
    });

    toast.success(`"${item.name}" excluído com sucesso`);
  }

  // COPIAR CAMINHO
  copyPath(item: BaseItem): void {
    const fullPath = item.path ? `${item.path}/${item.name}` : item.name;
    
    // Copiar para clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullPath);
      toast.success('Caminho copiado para a área de transferência');
    } else {
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea');
      textArea.value = fullPath;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Caminho copiado');
    }
  }

  // HISTÓRICO
  getHistory(itemId?: string): HistoryEntry[] {
    const historyData = localStorage.getItem(this.historyKey);
    if (!historyData) return [];

    const history: HistoryEntry[] = JSON.parse(historyData);
    
    if (itemId) {
      return history.filter(entry => entry.itemId === itemId);
    }
    
    return history;
  }

  addToHistory(entry: HistoryEntry): void {
    const history = this.getHistory();
    history.unshift(entry); // Adicionar no início
    
    // Manter apenas os últimos 100 registros
    const limitedHistory = history.slice(0, 100);
    
    localStorage.setItem(this.historyKey, JSON.stringify(limitedHistory));
  }

  clearHistory(): void {
    localStorage.removeItem(this.historyKey);
    toast.success('Histórico limpo');
  }

  // RESTAURAR DO HISTÓRICO
  restoreFromHistory(historyEntry: HistoryEntry): BaseItem | null {
    if (!historyEntry.before) {
      toast.error('Não é possível restaurar este item');
      return null;
    }

    const restoredItem: BaseItem = {
      ...historyEntry.before,
      updatedAt: new Date().toISOString()
    };

    // Adicionar ao histórico a restauração
    this.addToHistory({
      id: Date.now().toString(),
      itemId: restoredItem.id,
      action: 'update',
      timestamp: new Date().toISOString(),
      user: 'current-user',
      before: historyEntry.after,
      after: restoredItem,
      description: `Item "${restoredItem.name}" restaurado do histórico`
    });

    toast.success(`"${restoredItem.name}" restaurado com sucesso`);
    return restoredItem;
  }
}

// Instâncias para cada tipo de item
export const pageOperations = new ItemOperationsService('pages');
export const templateOperations = new ItemOperationsService('templates');
export const fileOperations = new ItemOperationsService('files');
