import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReactNode } from 'react';

/**
 * Wrapper para DndProvider que garante apenas uma instância
 * Use este componente ao invés de DndProvider diretamente
 * 
 * IMPORTANTE: Use apenas UMA vez no topo da árvore de componentes
 */
export function DndWrapper({ children }: { children: ReactNode }) {
  return (
    <DndProvider backend={HTML5Backend} context={window}>
      {children}
    </DndProvider>
  );
}
