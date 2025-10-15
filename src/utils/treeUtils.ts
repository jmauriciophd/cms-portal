import { BuilderNode, ContainerNode } from '../store/useBuilderStore';

/**
 * Utilitários para manipulação de árvore de componentes
 */

// Encontrar um nó por ID recursivamente
export function findNodeById(nodes: BuilderNode[], id: string): BuilderNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if ('children' in node && node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Encontrar o pai de um nó
export function findParentNode(
  nodes: BuilderNode[], 
  targetId: string, 
  parent: ContainerNode | null = null
): ContainerNode | null {
  for (const node of nodes) {
    if (node.id === targetId) return parent;
    if ('children' in node && node.children) {
      const found = findParentNode(node.children, targetId, node as ContainerNode);
      if (found) return found;
    }
  }
  return null;
}

// Remover um nó recursivamente
export function removeNodeById(nodes: BuilderNode[], id: string): BuilderNode[] {
  return nodes.filter(node => {
    if (node.id === id) return false;
    if ('children' in node && node.children) {
      node.children = removeNodeById(node.children, id);
    }
    return true;
  });
}

// Atualizar um nó recursivamente
export function updateNodeById(
  nodes: BuilderNode[], 
  id: string, 
  updates: Partial<BuilderNode>
): BuilderNode[] {
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
}

// Inserir um nó em uma posição específica
export function insertNode(
  nodes: BuilderNode[], 
  newNode: BuilderNode, 
  parentId: string | null, 
  index?: number
): BuilderNode[] {
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
}

// Clonar um nó (com novo ID)
export function cloneNode(node: BuilderNode, generateId: () => string): BuilderNode {
  const cloned = { ...node, id: generateId() };
  if ('children' in cloned && cloned.children) {
    cloned.children = cloned.children.map(child => cloneNode(child, generateId));
  }
  return cloned;
}

// Mover um nó para outro container
export function moveNode(
  nodes: BuilderNode[],
  nodeId: string,
  targetParentId: string | null,
  index?: number
): BuilderNode[] {
  const node = findNodeById(nodes, nodeId);
  if (!node) return nodes;

  // Remover do local atual
  let newNodes = removeNodeById(nodes, nodeId);
  
  // Inserir no novo local
  newNodes = insertNode(newNodes, node, targetParentId, index);

  return newNodes;
}

// Contar total de nós
export function countNodes(nodes: BuilderNode[]): number {
  let count = nodes.length;
  nodes.forEach(node => {
    if ('children' in node && node.children) {
      count += countNodes(node.children);
    }
  });
  return count;
}

// Obter todos os IDs recursivamente
export function getAllNodeIds(nodes: BuilderNode[]): string[] {
  const ids: string[] = [];
  nodes.forEach(node => {
    ids.push(node.id);
    if ('children' in node && node.children) {
      ids.push(...getAllNodeIds(node.children));
    }
  });
  return ids;
}

// Verificar se um nó é ancestral de outro
export function isAncestor(nodes: BuilderNode[], ancestorId: string, descendantId: string): boolean {
  const ancestor = findNodeById(nodes, ancestorId);
  if (!ancestor || !('children' in ancestor)) return false;
  
  const descendant = findNodeById(ancestor.children, descendantId);
  return descendant !== null;
}

// Obter profundidade máxima da árvore
export function getMaxDepth(nodes: BuilderNode[], currentDepth: number = 0): number {
  if (nodes.length === 0) return currentDepth;
  
  let maxDepth = currentDepth;
  nodes.forEach(node => {
    if ('children' in node && node.children) {
      const depth = getMaxDepth(node.children, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  });
  
  return maxDepth;
}

// Validar estrutura da árvore
export function validateTree(nodes: BuilderNode[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const ids = new Set<string>();
  
  function validate(nodes: BuilderNode[], path: string = 'root') {
    nodes.forEach((node, index) => {
      // Verificar ID único
      if (ids.has(node.id)) {
        errors.push(`ID duplicado encontrado: ${node.id} em ${path}[${index}]`);
      }
      ids.add(node.id);
      
      // Verificar tipo válido
      if (!node.type) {
        errors.push(`Nó sem tipo em ${path}[${index}]`);
      }
      
      // Validar children recursivamente
      if ('children' in node) {
        if (!Array.isArray(node.children)) {
          errors.push(`Children inválido em ${path}[${index}]`);
        } else {
          validate(node.children, `${path}[${index}].children`);
        }
      }
    });
  }
  
  validate(nodes);
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Serializar para JSON
export function serializeTree(nodes: BuilderNode[]): string {
  return JSON.stringify(nodes, null, 2);
}

// Deserializar de JSON
export function deserializeTree(json: string): BuilderNode[] | null {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      throw new Error('JSON deve ser um array de nós');
    }
    return parsed;
  } catch (error) {
    console.error('Erro ao deserializar:', error);
    return null;
  }
}

// Renderizar árvore como HTML string
export function renderTreeToHTML(nodes: BuilderNode[]): string {
  return nodes.map(node => renderNodeToHTML(node)).join('\n');
}

function renderNodeToHTML(node: BuilderNode): string {
  const styles = node.styles 
    ? Object.entries(node.styles).map(([key, value]) => `${key}: ${value}`).join('; ')
    : '';
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
}

// Buscar nós por tipo
export function findNodesByType(nodes: BuilderNode[], type: string): BuilderNode[] {
  const results: BuilderNode[] = [];
  
  function search(nodes: BuilderNode[]) {
    nodes.forEach(node => {
      if (node.type === type) {
        results.push(node);
      }
      if ('children' in node && node.children) {
        search(node.children);
      }
    });
  }
  
  search(nodes);
  return results;
}

// Buscar nós por conteúdo
export function findNodesByContent(nodes: BuilderNode[], query: string): BuilderNode[] {
  const results: BuilderNode[] = [];
  const lowerQuery = query.toLowerCase();
  
  function search(nodes: BuilderNode[]) {
    nodes.forEach(node => {
      if (node.content && node.content.toLowerCase().includes(lowerQuery)) {
        results.push(node);
      }
      if ('children' in node && node.children) {
        search(node.children);
      }
    });
  }
  
  search(nodes);
  return results;
}
