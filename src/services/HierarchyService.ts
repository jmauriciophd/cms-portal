/**
 * Serviço de Gerenciamento de Hierarquia de Componentes
 * 
 * Gerencia a estrutura hierárquica dos componentes, validando
 * quais componentes podem conter outros e mantendo a integridade
 * da árvore de componentes.
 */

export interface ComponentHierarchyConfig {
  type: string;
  acceptsChildren: boolean;
  acceptedChildTypes?: string[]; // Se undefined, aceita todos
  maxChildren?: number;
  minChildren?: number;
  slots?: {
    [slotName: string]: {
      acceptedTypes?: string[];
      maxChildren?: number;
      required?: boolean;
    };
  };
  defaultChildren?: string[]; // Tipos de filhos padrão ao criar
}

/**
 * Configurações de hierarquia para cada tipo de componente
 */
export const COMPONENT_HIERARCHY_CONFIG: Record<string, ComponentHierarchyConfig> = {
  // ========================================
  // CONTAINERS PRINCIPAIS
  // ========================================
  section: {
    type: 'section',
    acceptsChildren: true,
    acceptedChildTypes: undefined, // Aceita todos
    minChildren: 0,
    defaultChildren: ['container']
  },
  
  container: {
    type: 'container',
    acceptsChildren: true,
    acceptedChildTypes: undefined, // Aceita todos
    minChildren: 0
  },
  
  div: {
    type: 'div',
    acceptsChildren: true,
    acceptedChildTypes: undefined,
    minChildren: 0
  },
  
  // ========================================
  // ESTRUTURAS SEMÂNTICAS
  // ========================================
  header: {
    type: 'header',
    acceptsChildren: true,
    acceptedChildTypes: ['heading', 'paragraph', 'button', 'image', 'link', 'nav', 'div'],
    minChildren: 0
  },
  
  footer: {
    type: 'footer',
    acceptsChildren: true,
    acceptedChildTypes: ['heading', 'paragraph', 'button', 'image', 'link', 'div', 'grid'],
    minChildren: 0
  },
  
  nav: {
    type: 'nav',
    acceptsChildren: true,
    acceptedChildTypes: ['link', 'button', 'div'],
    minChildren: 0
  },
  
  article: {
    type: 'article',
    acceptsChildren: true,
    acceptedChildTypes: ['heading', 'paragraph', 'image', 'video', 'blockquote', 'list', 'div'],
    minChildren: 0
  },
  
  aside: {
    type: 'aside',
    acceptsChildren: true,
    acceptedChildTypes: ['heading', 'paragraph', 'image', 'link', 'div'],
    minChildren: 0
  },
  
  // ========================================
  // LAYOUTS
  // ========================================
  grid: {
    type: 'grid',
    acceptsChildren: true,
    acceptedChildTypes: ['gridItem', 'card', 'div'],
    minChildren: 0,
    defaultChildren: ['gridItem', 'gridItem']
  },
  
  gridItem: {
    type: 'gridItem',
    acceptsChildren: true,
    acceptedChildTypes: undefined,
    minChildren: 0
  },
  
  flexbox: {
    type: 'flexbox',
    acceptsChildren: true,
    acceptedChildTypes: undefined,
    minChildren: 0
  },
  
  columns: {
    type: 'columns',
    acceptsChildren: true,
    acceptedChildTypes: ['column'],
    minChildren: 1,
    maxChildren: 12,
    defaultChildren: ['column', 'column']
  },
  
  column: {
    type: 'column',
    acceptsChildren: true,
    acceptedChildTypes: undefined,
    minChildren: 0
  },
  
  // ========================================
  // COMPONENTES INTERATIVOS
  // ========================================
  accordion: {
    type: 'accordion',
    acceptsChildren: true,
    acceptedChildTypes: ['accordionItem'],
    minChildren: 1,
    defaultChildren: ['accordionItem', 'accordionItem']
  },
  
  accordionItem: {
    type: 'accordionItem',
    acceptsChildren: false, // Usa slots ao invés de children direto
    slots: {
      header: {
        acceptedTypes: ['heading', 'text'],
        maxChildren: 1,
        required: true
      },
      content: {
        acceptedTypes: undefined,
        maxChildren: undefined,
        required: false
      }
    }
  },
  
  tabs: {
    type: 'tabs',
    acceptsChildren: true,
    acceptedChildTypes: ['tab'],
    minChildren: 1,
    defaultChildren: ['tab', 'tab']
  },
  
  tab: {
    type: 'tab',
    acceptsChildren: false,
    slots: {
      label: {
        acceptedTypes: ['text'],
        maxChildren: 1,
        required: true
      },
      content: {
        acceptedTypes: undefined,
        maxChildren: undefined,
        required: false
      }
    }
  },
  
  carousel: {
    type: 'carousel',
    acceptsChildren: true,
    acceptedChildTypes: ['carouselSlide'],
    minChildren: 1,
    defaultChildren: ['carouselSlide', 'carouselSlide', 'carouselSlide']
  },
  
  carouselSlide: {
    type: 'carouselSlide',
    acceptsChildren: true,
    acceptedChildTypes: undefined,
    minChildren: 0
  },
  
  modal: {
    type: 'modal',
    acceptsChildren: false,
    slots: {
      header: {
        acceptedTypes: ['heading', 'text'],
        maxChildren: 1
      },
      body: {
        acceptedTypes: undefined,
        required: true
      },
      footer: {
        acceptedTypes: ['button', 'link']
      }
    }
  },
  
  // ========================================
  // CARDS E GRUPOS
  // ========================================
  card: {
    type: 'card',
    acceptsChildren: true,
    acceptedChildTypes: ['heading', 'paragraph', 'image', 'button', 'link', 'div'],
    minChildren: 0
  },
  
  cardHeader: {
    type: 'cardHeader',
    acceptsChildren: true,
    acceptedChildTypes: ['heading', 'text', 'image'],
    minChildren: 0
  },
  
  cardBody: {
    type: 'cardBody',
    acceptsChildren: true,
    acceptedChildTypes: undefined,
    minChildren: 0
  },
  
  cardFooter: {
    type: 'cardFooter',
    acceptsChildren: true,
    acceptedChildTypes: ['button', 'link', 'text'],
    minChildren: 0
  },
  
  // ========================================
  // FORMULÁRIOS
  // ========================================
  form: {
    type: 'form',
    acceptsChildren: true,
    acceptedChildTypes: ['formGroup', 'input', 'textarea', 'select', 'checkbox', 'radio', 'button'],
    minChildren: 0
  },
  
  formGroup: {
    type: 'formGroup',
    acceptsChildren: true,
    acceptedChildTypes: ['label', 'input', 'textarea', 'select', 'checkbox', 'radio'],
    minChildren: 0
  },
  
  // ========================================
  // ELEMENTOS LEAF (SEM FILHOS)
  // ========================================
  heading: {
    type: 'heading',
    acceptsChildren: false
  },
  
  paragraph: {
    type: 'paragraph',
    acceptsChildren: false
  },
  
  text: {
    type: 'text',
    acceptsChildren: false
  },
  
  button: {
    type: 'button',
    acceptsChildren: false
  },
  
  image: {
    type: 'image',
    acceptsChildren: false
  },
  
  video: {
    type: 'video',
    acceptsChildren: false
  },
  
  icon: {
    type: 'icon',
    acceptsChildren: false
  },
  
  input: {
    type: 'input',
    acceptsChildren: false
  },
  
  textarea: {
    type: 'textarea',
    acceptsChildren: false
  },
  
  select: {
    type: 'select',
    acceptsChildren: false
  },
  
  checkbox: {
    type: 'checkbox',
    acceptsChildren: false
  },
  
  radio: {
    type: 'radio',
    acceptsChildren: false
  },
  
  label: {
    type: 'label',
    acceptsChildren: false
  },
  
  link: {
    type: 'link',
    acceptsChildren: false
  },
  
  spacer: {
    type: 'spacer',
    acceptsChildren: false
  },
  
  divider: {
    type: 'divider',
    acceptsChildren: false
  },
  
  hr: {
    type: 'hr',
    acceptsChildren: false
  },
  
  br: {
    type: 'br',
    acceptsChildren: false
  },
  
  // ========================================
  // LISTAS
  // ========================================
  list: {
    type: 'list',
    acceptsChildren: true,
    acceptedChildTypes: ['listItem'],
    minChildren: 1,
    defaultChildren: ['listItem', 'listItem', 'listItem']
  },
  
  listItem: {
    type: 'listItem',
    acceptsChildren: true,
    acceptedChildTypes: ['text', 'link', 'icon'],
    minChildren: 0
  },
  
  // ========================================
  // BLOCOS DE CONTEÚDO
  // ========================================
  blockquote: {
    type: 'blockquote',
    acceptsChildren: true,
    acceptedChildTypes: ['paragraph', 'text'],
    minChildren: 0
  },
  
  code: {
    type: 'code',
    acceptsChildren: false
  },
  
  pre: {
    type: 'pre',
    acceptsChildren: true,
    acceptedChildTypes: ['code'],
    minChildren: 0,
    maxChildren: 1
  }
};

/**
 * Serviço de Hierarquia
 */
class HierarchyService {
  /**
   * Verifica se um componente aceita filhos
   */
  canHaveChildren(componentType: string): boolean {
    const config = COMPONENT_HIERARCHY_CONFIG[componentType];
    return config ? config.acceptsChildren : false;
  }
  
  /**
   * Verifica se um componente pode ser adicionado como filho de outro
   */
  canAddChild(parentType: string, childType: string): boolean {
    const parentConfig = COMPONENT_HIERARCHY_CONFIG[parentType];
    
    if (!parentConfig || !parentConfig.acceptsChildren) {
      return false;
    }
    
    // Se não há restrição de tipos, aceita qualquer filho
    if (!parentConfig.acceptedChildTypes) {
      return true;
    }
    
    // Verifica se o tipo do filho está na lista de aceitos
    return parentConfig.acceptedChildTypes.includes(childType);
  }
  
  /**
   * Verifica se um componente pode adicionar mais filhos
   */
  canAddMoreChildren(parentType: string, currentChildrenCount: number): boolean {
    const config = COMPONENT_HIERARCHY_CONFIG[parentType];
    
    if (!config || !config.acceptsChildren) {
      return false;
    }
    
    if (config.maxChildren !== undefined) {
      return currentChildrenCount < config.maxChildren;
    }
    
    return true;
  }
  
  /**
   * Verifica se um componente tem o número mínimo de filhos
   */
  hasMinimumChildren(parentType: string, currentChildrenCount: number): boolean {
    const config = COMPONENT_HIERARCHY_CONFIG[parentType];
    
    if (!config || config.minChildren === undefined) {
      return true;
    }
    
    return currentChildrenCount >= config.minChildren;
  }
  
  /**
   * Obtém os tipos de filhos padrão para um componente
   */
  getDefaultChildren(parentType: string): string[] {
    const config = COMPONENT_HIERARCHY_CONFIG[parentType];
    return config?.defaultChildren || [];
  }
  
  /**
   * Obtém tipos aceitos como filhos
   */
  getAcceptedChildTypes(parentType: string): string[] | undefined {
    const config = COMPONENT_HIERARCHY_CONFIG[parentType];
    return config?.acceptedChildTypes;
  }
  
  /**
   * Verifica se um componente usa slots
   */
  hasSlots(componentType: string): boolean {
    const config = COMPONENT_HIERARCHY_CONFIG[componentType];
    return config?.slots !== undefined;
  }
  
  /**
   * Obtém configuração de slots
   */
  getSlots(componentType: string): Record<string, any> | undefined {
    const config = COMPONENT_HIERARCHY_CONFIG[componentType];
    return config?.slots;
  }
  
  /**
   * Valida se um slot pode aceitar um componente
   */
  canAddToSlot(parentType: string, slotName: string, childType: string, currentCount: number): boolean {
    const config = COMPONENT_HIERARCHY_CONFIG[parentType];
    
    if (!config?.slots || !config.slots[slotName]) {
      return false;
    }
    
    const slot = config.slots[slotName];
    
    // Verifica limite máximo
    if (slot.maxChildren !== undefined && currentCount >= slot.maxChildren) {
      return false;
    }
    
    // Verifica tipos aceitos
    if (slot.acceptedTypes && !slot.acceptedTypes.includes(childType)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Obtém todos os componentes que aceitam filhos
   */
  getContainerComponents(): string[] {
    return Object.keys(COMPONENT_HIERARCHY_CONFIG).filter(type =>
      COMPONENT_HIERARCHY_CONFIG[type].acceptsChildren
    );
  }
  
  /**
   * Obtém todos os componentes leaf (sem filhos)
   */
  getLeafComponents(): string[] {
    return Object.keys(COMPONENT_HIERARCHY_CONFIG).filter(type =>
      !COMPONENT_HIERARCHY_CONFIG[type].acceptsChildren
    );
  }
  
  /**
   * Valida toda a árvore de componentes
   */
  validateTree(node: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const validate = (currentNode: any, path: string = 'root') => {
      const config = COMPONENT_HIERARCHY_CONFIG[currentNode.type];
      
      if (!config) {
        errors.push(`${path}: Tipo de componente desconhecido '${currentNode.type}'`);
        return;
      }
      
      // Validar filhos (apenas se tiver children com length > 0)
      if (currentNode.children && currentNode.children.length > 0) {
        if (!config.acceptsChildren) {
          errors.push(`${path}: Componente '${currentNode.type}' não aceita filhos`);
        } else {
          // Validar número mínimo/máximo
          if (config.minChildren !== undefined && currentNode.children.length < config.minChildren) {
            errors.push(`${path}: Componente '${currentNode.type}' requer mínimo de ${config.minChildren} filhos`);
          }
          
          if (config.maxChildren !== undefined && currentNode.children.length > config.maxChildren) {
            errors.push(`${path}: Componente '${currentNode.type}' permite máximo de ${config.maxChildren} filhos`);
          }
          
          // Validar tipos de filhos
          currentNode.children.forEach((child: any, index: number) => {
            if (config.acceptedChildTypes && !config.acceptedChildTypes.includes(child.type)) {
              errors.push(`${path}[${index}]: Tipo '${child.type}' não é aceito como filho de '${currentNode.type}'`);
            }
            
            validate(child, `${path}.children[${index}]`);
          });
        }
      }
      
      // Validar slots
      if (currentNode.slots && config.slots) {
        Object.keys(currentNode.slots).forEach(slotName => {
          const slotConfig = config.slots![slotName];
          const slotChildren = currentNode.slots[slotName];
          
          if (slotConfig.required && (!slotChildren || slotChildren.length === 0)) {
            errors.push(`${path}: Slot '${slotName}' é obrigatório`);
          }
          
          if (slotChildren) {
            if (slotConfig.maxChildren !== undefined && slotChildren.length > slotConfig.maxChildren) {
              errors.push(`${path}: Slot '${slotName}' permite máximo de ${slotConfig.maxChildren} filhos`);
            }
            
            slotChildren.forEach((child: any, index: number) => {
              if (slotConfig.acceptedTypes && !slotConfig.acceptedTypes.includes(child.type)) {
                errors.push(`${path}.slots.${slotName}[${index}]: Tipo '${child.type}' não é aceito no slot '${slotName}'`);
              }
              
              validate(child, `${path}.slots.${slotName}[${index}]`);
            });
          }
        });
      }
    };
    
    validate(node);
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Obtém informações de configuração de um componente
   */
  getComponentConfig(componentType: string): ComponentHierarchyConfig | undefined {
    return COMPONENT_HIERARCHY_CONFIG[componentType];
  }
  
  /**
   * Obtém mensagem de erro amigável
   */
  getErrorMessage(parentType: string, childType: string): string {
    const config = COMPONENT_HIERARCHY_CONFIG[parentType];
    
    if (!config) {
      return `Tipo de componente '${parentType}' não encontrado`;
    }
    
    if (!config.acceptsChildren) {
      return `'${parentType}' não aceita filhos`;
    }
    
    if (config.acceptedChildTypes && !config.acceptedChildTypes.includes(childType)) {
      return `'${parentType}' não aceita '${childType}' como filho. Tipos aceitos: ${config.acceptedChildTypes.join(', ')}`;
    }
    
    return 'Operação não permitida';
  }
}

// Singleton instance
export const hierarchyService = new HierarchyService();
