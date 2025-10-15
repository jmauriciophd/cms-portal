import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Tipos base
export interface BaseNode {
  id: string;
  type: string;
  content?: string;
  styles?: Record<string, string>;
  className?: string;
}

export interface ContainerNode extends BaseNode {
  type: 'container' | 'section' | 'div' | 'header' | 'footer' | 'article' | 'nav';
  children: BuilderNode[];
}

export interface ComponentNode extends BaseNode {
  type: 'text' | 'heading' | 'button' | 'image' | 'link' | 'paragraph';
}

export type BuilderNode = ContainerNode | ComponentNode;

interface BuilderState {
  // Estado
  nodes: BuilderNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  clipboard: BuilderNode | null;
  history: BuilderNode[][];
  historyIndex: number;
  
  // Actions - CRUD
  addNode: (type: string, parentId?: string | null, index?: number) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<BuilderNode>) => void;
  moveNode: (nodeId: string, targetParentId: string | null, index?: number) => void;
  duplicateNode: (id: string) => void;
  
  // Actions - Seleção
  selectNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  
  // Actions - Clipboard
  copyNode: (id: string) => void;
  pasteNode: (targetParentId?: string | null) => void;
  
  // Actions - Histórico
  undo: () => void;
  redo: () => void;
  addToHistory: () => void;
  
  // Actions - Persistência
  saveLayout: (name?: string) => void;
  loadLayout: (name?: string) => void;
  clearLayout: () => void;
  
  // Actions - Export
  exportJSON: () => string;
  exportHTML: () => string;
  importJSON: (json: string) => void;
}

// Helpers
const findNodeById = (nodes: BuilderNode[], id: string): BuilderNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if ('children' in node && node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findParentNode = (nodes: BuilderNode[], targetId: string, parent: ContainerNode | null = null): ContainerNode | null => {
  for (const node of nodes) {
    if (node.id === targetId) return parent;
    if ('children' in node && node.children) {
      const found = findParentNode(node.children, targetId, node as ContainerNode);
      if (found) return found;
    }
  }
  return null;
};

const removeNodeById = (nodes: BuilderNode[], id: string): BuilderNode[] => {
  return nodes.filter(node => {
    if (node.id === id) return false;
    if ('children' in node && node.children) {
      node.children = removeNodeById(node.children, id);
    }
    return true;
  });
};

const cloneNode = (node: BuilderNode): BuilderNode => {
  const cloned = { ...node, id: uuidv4() };
  if ('children' in cloned && cloned.children) {
    cloned.children = cloned.children.map(cloneNode);
  }
  return cloned;
};

const updateNodeById = (nodes: BuilderNode[], id: string, updates: Partial<BuilderNode>): BuilderNode[] => {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if ('children' in node && node.children) {
      return {
        ...node,
        children: updateNodeById(node.children, id, updates)
      };
    }
    return node;
  });
};

const insertNode = (
  nodes: BuilderNode[], 
  newNode: BuilderNode, 
  parentId: string | null, 
  index?: number
): BuilderNode[] => {
  if (!parentId) {
    // Adicionar na raiz
    if (index !== undefined && index >= 0) {
      const newNodes = [...nodes];
      newNodes.splice(index, 0, newNode);
      return newNodes;
    }
    return [...nodes, newNode];
  }

  return nodes.map(node => {
    if (node.id === parentId && 'children' in node) {
      const newChildren = [...(node.children || [])];
      if (index !== undefined && index >= 0) {
        newChildren.splice(index, 0, newNode);
      } else {
        newChildren.push(newNode);
      }
      return { ...node, children: newChildren };
    }
    if ('children' in node && node.children) {
      return {
        ...node,
        children: insertNode(node.children, newNode, parentId, index)
      };
    }
    return node;
  });
};

// Template nodes
const createNode = (type: string): BuilderNode => {
  const baseNode = {
    id: uuidv4(),
    type,
    className: '',
    styles: {}
  };

  switch (type) {
    case 'container':
      return {
        ...baseNode,
        type: 'container',
        children: [],
        className: 'border border-gray-300 rounded-md p-4 min-h-[80px]'
      } as ContainerNode;
    
    case 'section':
      return {
        ...baseNode,
        type: 'section',
        children: [],
        className: 'py-8 px-4'
      } as ContainerNode;
    
    case 'header':
      return {
        ...baseNode,
        type: 'header',
        children: [],
        className: 'bg-gray-100 p-4 border-b'
      } as ContainerNode;
    
    case 'footer':
      return {
        ...baseNode,
        type: 'footer',
        children: [],
        className: 'bg-gray-100 p-4 border-t mt-auto'
      } as ContainerNode;
    
    case 'text':
      return {
        ...baseNode,
        type: 'text',
        content: 'Texto editável',
        className: 'cursor-text hover:bg-gray-50 p-2 rounded'
      } as ComponentNode;
    
    case 'heading':
      return {
        ...baseNode,
        type: 'heading',
        content: 'Título',
        className: 'cursor-text hover:bg-gray-50 p-2 rounded'
      } as ComponentNode;
    
    case 'paragraph':
      return {
        ...baseNode,
        type: 'paragraph',
        content: 'Parágrafo de texto. Clique para editar.',
        className: 'cursor-text hover:bg-gray-50 p-2 rounded'
      } as ComponentNode;
    
    case 'button':
      return {
        ...baseNode,
        type: 'button',
        content: 'Clique aqui',
        className: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer inline-block'
      } as ComponentNode;
    
    case 'image':
      return {
        ...baseNode,
        type: 'image',
        content: 'https://via.placeholder.com/400x300',
        className: 'max-w-full h-auto rounded'
      } as ComponentNode;
    
    case 'link':
      return {
        ...baseNode,
        type: 'link',
        content: 'Link',
        className: 'text-blue-600 hover:underline cursor-pointer'
      } as ComponentNode;
    
    default:
      return {
        ...baseNode,
        type: 'text',
        content: 'Componente',
        className: ''
      } as ComponentNode;
  }
};

// Renderizar HTML recursivamente
const renderNodeToHTML = (node: BuilderNode): string => {
  const styles = node.styles ? Object.entries(node.styles).map(([key, value]) => `${key}: ${value}`).join('; ') : '';
  const styleAttr = styles ? ` style="${styles}"` : '';
  const classAttr = node.className ? ` class="${node.className}"` : '';
  
  if ('children' in node && node.children) {
    const childrenHTML = node.children.map(renderNodeToHTML).join('\n');
    const tag = node.type === 'container' ? 'div' : node.type;
    return `<${tag}${classAttr}${styleAttr}>\n${childrenHTML}\n</${tag}>`;
  }

  switch (node.type) {
    case 'heading':
      return `<h2${classAttr}${styleAttr}>${node.content || ''}</h2>`;
    case 'paragraph':
      return `<p${classAttr}${styleAttr}>${node.content || ''}</p>`;
    case 'button':
      return `<button${classAttr}${styleAttr}>${node.content || ''}</button>`;
    case 'image':
      return `<img src="${node.content || ''}"${classAttr}${styleAttr} alt="" />`;
    case 'link':
      return `<a href="#"${classAttr}${styleAttr}>${node.content || ''}</a>`;
    case 'text':
    default:
      return `<span${classAttr}${styleAttr}>${node.content || ''}</span>`;
  }
};

// Store
export const useBuilderStore = create<BuilderState>((set, get) => ({
  // Estado inicial
  nodes: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  clipboard: null,
  history: [[]],
  historyIndex: 0,

  // Adicionar nó
  addNode: (type: string, parentId: string | null = null, index?: number) => {
    const newNode = createNode(type);
    set(state => {
      const newNodes = insertNode(state.nodes, newNode, parentId, index);
      return { 
        nodes: newNodes,
        selectedNodeId: newNode.id
      };
    });
    get().addToHistory();
  },

  // Remover nó
  removeNode: (id: string) => {
    set(state => ({
      nodes: removeNodeById(state.nodes, id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
    }));
    get().addToHistory();
  },

  // Atualizar nó
  updateNode: (id: string, updates: Partial<BuilderNode>) => {
    set(state => ({
      nodes: updateNodeById(state.nodes, id, updates)
    }));
    get().addToHistory();
  },

  // Mover nó
  moveNode: (nodeId: string, targetParentId: string | null, index?: number) => {
    set(state => {
      const node = findNodeById(state.nodes, nodeId);
      if (!node) return state;

      // Remover do local atual
      let newNodes = removeNodeById(state.nodes, nodeId);
      
      // Inserir no novo local
      newNodes = insertNode(newNodes, node, targetParentId, index);

      return { nodes: newNodes };
    });
    get().addToHistory();
  },

  // Duplicar nó
  duplicateNode: (id: string) => {
    set(state => {
      const node = findNodeById(state.nodes, id);
      if (!node) return state;

      const cloned = cloneNode(node);
      const parent = findParentNode(state.nodes, id);
      
      return {
        nodes: insertNode(state.nodes, cloned, parent?.id || null),
        selectedNodeId: cloned.id
      };
    });
    get().addToHistory();
  },

  // Selecionar nó
  selectNode: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  // Hover
  setHoveredNode: (id: string | null) => {
    set({ hoveredNodeId: id });
  },

  // Copiar
  copyNode: (id: string) => {
    const node = findNodeById(get().nodes, id);
    if (node) {
      set({ clipboard: cloneNode(node) });
    }
  },

  // Colar
  pasteNode: (targetParentId: string | null = null) => {
    const { clipboard } = get();
    if (!clipboard) return;

    const cloned = cloneNode(clipboard);
    set(state => ({
      nodes: insertNode(state.nodes, cloned, targetParentId),
      selectedNodeId: cloned.id
    }));
    get().addToHistory();
  },

  // Histórico
  addToHistory: () => {
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(state.nodes)));
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  undo: () => {
    set(state => {
      if (state.historyIndex > 0) {
        return {
          historyIndex: state.historyIndex - 1,
          nodes: JSON.parse(JSON.stringify(state.history[state.historyIndex - 1]))
        };
      }
      return state;
    });
  },

  redo: () => {
    set(state => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          historyIndex: state.historyIndex + 1,
          nodes: JSON.parse(JSON.stringify(state.history[state.historyIndex + 1]))
        };
      }
      return state;
    });
  },

  // Persistência
  saveLayout: (name: string = 'pageBuilderLayout') => {
    const { nodes } = get();
    localStorage.setItem(name, JSON.stringify(nodes));
    localStorage.setItem(`${name}_timestamp`, new Date().toISOString());
  },

  loadLayout: (name: string = 'pageBuilderLayout') => {
    try {
      const saved = localStorage.getItem(name);
      if (saved) {
        const nodes = JSON.parse(saved);
        set({ 
          nodes,
          selectedNodeId: null,
          history: [nodes],
          historyIndex: 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar layout:', error);
    }
  },

  clearLayout: () => {
    set({ 
      nodes: [],
      selectedNodeId: null,
      clipboard: null,
      history: [[]],
      historyIndex: 0
    });
    get().addToHistory();
  },

  // Export
  exportJSON: () => {
    return JSON.stringify(get().nodes, null, 2);
  },

  exportHTML: () => {
    const { nodes } = get();
    const bodyContent = nodes.map(renderNodeToHTML).join('\n');
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página Exportada</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${bodyContent}
</body>
</html>`;
  },

  importJSON: (json: string) => {
    try {
      const nodes = JSON.parse(json);
      set({ 
        nodes,
        selectedNodeId: null,
        history: [nodes],
        historyIndex: 0
      });
    } catch (error) {
      console.error('Erro ao importar JSON:', error);
    }
  },
}));
