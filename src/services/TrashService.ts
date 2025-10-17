// Sistema de Lixeira/Arquivos Deletados
import { toast } from 'sonner@2.0.3';

export interface DeletedItem {
  id: string;
  type: 'page' | 'template' | 'file' | 'folder';
  originalId: string;
  name: string;
  data: any;
  deletedAt: string;
  deletedBy: string;
  originalPath: string;
  canRestore: boolean;
}

export class TrashService {
  private static STORAGE_KEY = 'cms-trash';
  private static MAX_ITEMS = 100; // Máximo de itens na lixeira

  // Obter todos os itens da lixeira
  static getTrashItems(): DeletedItem[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Erro ao carregar lixeira:', error);
      return [];
    }
  }

  // Mover item para lixeira
  static moveToTrash(
    item: any,
    type: 'page' | 'template' | 'file' | 'folder',
    currentUser?: string
  ): DeletedItem {
    const deletedItem: DeletedItem = {
      id: Date.now().toString(),
      type,
      originalId: item.id,
      name: item.name || item.title || item.fileName || 'Item sem nome',
      data: item,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser || 'unknown',
      originalPath: item.folder || item.path || '',
      canRestore: true
    };

    const currentTrash = this.getTrashItems();
    currentTrash.unshift(deletedItem);

    // Limitar quantidade de itens
    const limitedTrash = currentTrash.slice(0, this.MAX_ITEMS);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedTrash));
    
    toast.success(`"${deletedItem.name}" movido para a lixeira`);
    
    return deletedItem;
  }

  // Restaurar item da lixeira
  static restoreFromTrash(deletedItemId: string): DeletedItem | null {
    const trash = this.getTrashItems();
    const itemIndex = trash.findIndex(item => item.id === deletedItemId);
    
    if (itemIndex === -1) {
      toast.error('Item não encontrado na lixeira');
      return null;
    }

    const item = trash[itemIndex];
    
    if (!item.canRestore) {
      toast.error('Este item não pode ser restaurado');
      return null;
    }

    // Remover da lixeira
    trash.splice(itemIndex, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trash));
    
    toast.success(`"${item.name}" restaurado com sucesso`);
    
    return item;
  }

  // Deletar permanentemente da lixeira
  static deletePermanently(deletedItemId: string): boolean {
    const trash = this.getTrashItems();
    const itemIndex = trash.findIndex(item => item.id === deletedItemId);
    
    if (itemIndex === -1) {
      toast.error('Item não encontrado na lixeira');
      return false;
    }

    const item = trash[itemIndex];
    
    if (!confirm(`Deseja deletar permanentemente "${item.name}"? Esta ação não pode ser desfeita.`)) {
      return false;
    }

    trash.splice(itemIndex, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trash));
    
    toast.success(`"${item.name}" deletado permanentemente`);
    
    return true;
  }

  // Esvaziar lixeira
  static emptyTrash(): boolean {
    const trash = this.getTrashItems();
    
    if (trash.length === 0) {
      toast.info('A lixeira já está vazia');
      return false;
    }

    if (!confirm(`Deseja esvaziar a lixeira? Todos os ${trash.length} itens serão deletados permanentemente. Esta ação não pode ser desfeita.`)) {
      return false;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    
    toast.success(`Lixeira esvaziada! ${trash.length} itens deletados permanentemente`);
    
    return true;
  }

  // Obter itens por tipo
  static getItemsByType(type: 'page' | 'template' | 'file' | 'folder'): DeletedItem[] {
    return this.getTrashItems().filter(item => item.type === type);
  }

  // Obter itens deletados nos últimos N dias
  static getRecentlyDeleted(days: number = 7): DeletedItem[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.getTrashItems().filter(item => {
      const deletedDate = new Date(item.deletedAt);
      return deletedDate >= cutoffDate;
    });
  }

  // Contar itens na lixeira
  static getTrashCount(): number {
    return this.getTrashItems().length;
  }

  // Verificar se item pode ser restaurado
  static canRestore(deletedItemId: string): boolean {
    const item = this.getTrashItems().find(item => item.id === deletedItemId);
    return item ? item.canRestore : false;
  }

  // Buscar na lixeira
  static searchTrash(query: string): DeletedItem[] {
    const lowerQuery = query.toLowerCase();
    return this.getTrashItems().filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
    );
  }
}
