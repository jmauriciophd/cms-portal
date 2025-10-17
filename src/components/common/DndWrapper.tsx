import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReactNode, useRef } from 'react';

/**
 * Wrapper para DndProvider que garante apenas uma instância
 * Use este componente ao invés de DndProvider diretamente
 */
export function DndWrapper({ children }: { children: ReactNode }) {
  // Usar useRef para garantir que o backend seja criado apenas uma vez
  const backendRef = useRef(HTML5Backend);
  
  return (
    <DndProvider backend={backendRef.current}>
      {children}
    </DndProvider>
  );
}
