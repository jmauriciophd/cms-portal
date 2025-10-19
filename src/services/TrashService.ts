// Sistema de Lixeira/Arquivos Deletados
import { toast } from 'sonner@2.0.3';
import { StorageQuotaService } from './StorageQuotaService';

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
  private static MAX_ITEMS = 50; // Reduzido de 100 para 50
  private static MAX_AGE_DAYS = 30; // Itens mais antigos que isso serão auto-removidos

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

  // Limpar itens antigos automaticamente
  private static autoCleanup(): number {
    const trash = this.getTrashItems();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.MAX_AGE_DAYS);

    const filteredTrash = trash.filter(item => {
      const deletedDate = new Date(item.deletedAt);
      return deletedDate >= cutoffDate;
    });

    const removedCount = trash.length - filteredTrash.length;
    
    if (removedCount > 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTrash));
      console.log(`${removedCount} itens antigos removidos automaticamente da lixeira`);
    }

    return removedCount;
  }

  // Mover item para lixeira
  static async moveToTrash(
    item: any,
    type: 'page' | 'template' | 'file' | 'folder',
    currentUser?: string
  ): Promise<DeletedItem | null> {
    // Auto-limpeza antes de adicionar
    this.autoCleanup();

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

    // Limitar quantidade de itens (mais agressivo)
    const limitedTrash = currentTrash.slice(0, this.MAX_ITEMS);
    
    // Usar StorageQuotaService para salvar com verificação
    const success = await StorageQuotaService.setItem(this.STORAGE_KEY, limitedTrash);
    
    if (!success) {
      toast.error('Não foi possível mover para a lixeira. Armazenamento cheio.');
      
      // Tentar com limpeza mais agressiva
      const veryLimitedTrash = currentTrash.slice(0, 20); // Apenas 20 itens
      const retrySuccess = await StorageQuotaService.setItem(this.STORAGE_KEY, veryLimitedTrash);
      
      if (!retrySuccess) {
        toast.error('Por favor, esvazie a lixeira manualmente');
        return null;
      }
      
      toast.warning('Lixeira reduzida automaticamente para liberar espaço');
    }
    
    toast.success(`"${deletedItem.name}" movido para a lixeira`);
    
    return deletedItem;
  }

  // Restaurar item da lixeira
  static async restoreFromTrash(deletedItemId: string): Promise<DeletedItem | null> {
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
    await StorageQuotaService.setItem(this.STORAGE_KEY, trash);
    
    toast.success(`"${item.name}" restaurado com sucesso`);
    
    return item;
  }

  // Deletar permanentemente da lixeira
  static async deletePermanently(deletedItemId: string): Promise<boolean> {
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
    await StorageQuotaService.setItem(this.STORAGE_KEY, trash);
    
    toast.success(`"${item.name}" deletado permanentemente`);
    
    return true;
  }

  // Esvaziar lixeira
  static async emptyTrash(): Promise<boolean> {
    const trash = this.getTrashItems();
    
    if (trash.length === 0) {
      toast.info('A lixeira já está vazia');
      return false;
    }

    if (!confirm(`Deseja esvaziar a lixeira? Todos os ${trash.length} itens serão deletados permanentemente. Esta ação não pode ser desfeita.`)) {
      return false;
    }

    await StorageQuotaService.setItem(this.STORAGE_KEY, []);
    
    const stats = StorageQuotaService.getStorageStats();
    toast.success(
      `Lixeira esvaziada! ${trash.length} itens deletados. ` +
      `Armazenamento: ${stats.percentage.toFixed(1)}% usado`
    );
    
    return true;
  }

  // Esvaziar lixeira automaticamente (sem confirmação) - para uso interno
  static async emptyTrashAuto(): Promise<number> {
    const trash = this.getTrashItems();
    const count = trash.length;
    
    if (count > 0) {
      await StorageQuotaService.setItem(this.STORAGE_KEY, []);
      console.log(`Lixeira esvaziada automaticamente: ${count} itens removidos`);
    }
    
    return count;
  }

  // Obter tamanho da lixeira em bytes
  static getTrashSize(): number {
    const trash = this.getTrashItems();
    const jsonString = JSON.stringify(trash);
    return new Blob([jsonString]).size;
  }

  // Limpar itens mais antigos que X dias
  static async cleanOldItems(maxAgeDays: number = 30): Promise<number> {
    const trash = this.getTrashItems();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    const filteredTrash = trash.filter(item => {
      const deletedDate = new Date(item.deletedAt);
      return deletedDate >= cutoffDate;
    });

    const removedCount = trash.length - filteredTrash.length;
    
    if (removedCount > 0) {
      await StorageQuotaService.setItem(this.STORAGE_KEY, filteredTrash);
      toast.success(`${removedCount} itens antigos removidos da lixeira`);
    }

    return removedCount;
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
