/**
 * Page Builder Design System Integration Service
 * 
 * Serviço responsável por integrar o Page Builder com o Design System,
 * gerenciando sincronização, mapeamento e validação de componentes.
 */

import { designSystemService, DSComponent, DesignSystemTokens, DSMapping } from './DesignSystemService';
import { designSystemSyncService } from './DesignSystemSyncService';
import { auditService } from './AuditService';
import { HierarchicalNode } from '../components/editor/HierarchicalRenderNode';

export interface DSComponentBinding {
  cmsComponentType: string;
  dsComponentId: string;
  variantMapping: Record<string, string>;
  propMapping: Record<string, string>;
  tokenBindings: TokenBinding[];
  enabled: boolean;
  version: string;
}

export interface TokenBinding {
  cmsProp: string; // ex: 'backgroundColor'
  tokenPath: string; // ex: 'color.brand.primary.500'
  cssProperty?: string; // ex: 'background-color'
  transform?: string; // função de transformação (opcional)
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  nodeId: string;
  componentType: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  nodeId: string;
  componentType: string;
  message: string;
  autoFixable: boolean;
  suggestion?: string;
}

export interface DSComponentPreview {
  dsComponent: DSComponent;
  renderProps: Record<string, any>;
  tokenValues: Record<string, any>;
  styles: React.CSSProperties;
}

export interface SyncPipeline {
  stage: 'tokens' | 'themes' | 'components' | 'layouts' | 'content';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  errors: string[];
}

class PageBuilderDSIntegrationService {
  private readonly BINDINGS_KEY = 'pb_ds_bindings';
  private readonly CONFIG_KEY = 'pb_ds_config';
  private readonly VALIDATION_CACHE_KEY = 'pb_ds_validation_cache';

  /**
   * Configuração da integração
   */
  private config = {
    autoApplyTokens: true,
    validateOnChange: true,
    blockNonDSStyles: false, // Se true, bloqueia estilos fora do DS
    autoMigration: true,
    enableStaging: true
  };

  /**
   * Carrega configuração
   */
  getConfig() {
    const stored = localStorage.getItem(this.CONFIG_KEY);
    if (stored) {
      this.config = { ...this.config, ...JSON.parse(stored) };
    }
    return this.config;
  }

  /**
   * Atualiza configuração
   */
  updateConfig(updates: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...updates };
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
  }

  /**
   * Obtém todos os bindings
   */
  getBindings(): DSComponentBinding[] {
    const stored = localStorage.getItem(this.BINDINGS_KEY);
    return stored ? JSON.parse(stored) : this.createDefaultBindings();
  }

  /**
   * Salva um binding
   */
  saveBinding(binding: DSComponentBinding): void {
    const bindings = this.getBindings();
    const index = bindings.findIndex(b => b.cmsComponentType === binding.cmsComponentType);
    
    if (index >= 0) {
      bindings[index] = binding;
    } else {
      bindings.push(binding);
    }

    localStorage.setItem(this.BINDINGS_KEY, JSON.stringify(bindings));

    auditService.log('ds_binding_updated', null, {
      componentType: binding.cmsComponentType,
      dsComponent: binding.dsComponentId
    });
  }

  /**
   * Obtém binding para um tipo de componente
   */
  getBinding(cmsComponentType: string): DSComponentBinding | null {
    const bindings = this.getBindings();
    return bindings.find(b => b.cmsComponentType === cmsComponentType) || null;
  }

  /**
   * Remove um binding
   */
  removeBinding(cmsComponentType: string): void {
    const bindings = this.getBindings().filter(b => b.cmsComponentType !== cmsComponentType);
    localStorage.setItem(this.BINDINGS_KEY, JSON.stringify(bindings));
  }

  /**
   * Cria bindings padrão
   */
  private createDefaultBindings(): DSComponentBinding[] {
    return [
      {
        cmsComponentType: 'button',
        dsComponentId: 'ds.button',
        variantMapping: {
          primary: 'primary',
          secondary: 'secondary',
          outline: 'outline'
        },
        propMapping: {
          variant: 'variant',
          size: 'size',
          disabled: 'disabled'
        },
        tokenBindings: [
          {
            cmsProp: 'backgroundColor',
            tokenPath: 'color.brand.primary.500',
            cssProperty: 'background-color'
          },
          {
            cmsProp: 'color',
            tokenPath: 'color.neutral.0',
            cssProperty: 'color'
          },
          {
            cmsProp: 'borderRadius',
            tokenPath: 'radius.sm',
            cssProperty: 'border-radius'
          },
          {
            cmsProp: 'padding',
            tokenPath: 'spacing.sm',
            cssProperty: 'padding'
          }
        ],
        enabled: true,
        version: '1.0.0'
      }
    ];
  }

  /**
   * Aplica tokens do DS a um nó
   */
  applyDSTokensToNode(node: HierarchicalNode): HierarchicalNode {
    const binding = this.getBinding(node.type);
    if (!binding || !binding.enabled) return node;

    const ds = designSystemService.getCurrentDesignSystem();
    if (!ds) return node;

    const updatedNode = { ...node };
    const styles = { ...node.styles };

    // Aplica token bindings
    binding.tokenBindings.forEach(tokenBinding => {
      const tokenValue = designSystemService.getToken(tokenBinding.tokenPath);
      if (tokenValue && tokenBinding.cssProperty) {
        // Converte de camelCase para kebab-case para CSS
        const cssKey = tokenBinding.cssProperty;
        styles[cssKey as any] = tokenValue;
      }
    });

    updatedNode.styles = styles;

    // Marca que os tokens do DS foram aplicados
    updatedNode.props = {
      ...updatedNode.props,
      __dsTokensApplied: true,
      __dsVersion: ds.version
    };

    return updatedNode;
  }

  /**
   * Aplica tokens do DS a uma árvore de nós
   */
  applyDSTokensToTree(nodes: HierarchicalNode[]): HierarchicalNode[] {
    return nodes.map(node => {
      const updatedNode = this.applyDSTokensToNode(node);

      if (updatedNode.children) {
        updatedNode.children = this.applyDSTokensToTree(updatedNode.children);
      }

      if (updatedNode.slots) {
        const updatedSlots: Record<string, HierarchicalNode[]> = {};
        for (const [key, slotNodes] of Object.entries(updatedNode.slots)) {
          updatedSlots[key] = this.applyDSTokensToTree(slotNodes);
        }
        updatedNode.slots = updatedSlots;
      }

      return updatedNode;
    });
  }

  /**
   * Valida um nó contra o Design System
   */
  validateNode(node: HierarchicalNode): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    const binding = this.getBinding(node.type);
    const ds = designSystemService.getCurrentDesignSystem();

    // Se não há binding e blockNonDSStyles está ativo
    if (!binding && this.config.blockNonDSStyles) {
      warnings.push({
        nodeId: node.id,
        componentType: node.type,
        message: `Componente "${node.type}" não está vinculado ao Design System`,
        autoFixable: false,
        suggestion: 'Crie um binding para este componente ou desative o modo de bloqueio'
      });
    }

    // Se há binding, valida
    if (binding && ds) {
      const dsComponent = designSystemService.getComponent(binding.dsComponentId);
      
      if (!dsComponent) {
        errors.push({
          nodeId: node.id,
          componentType: node.type,
          message: `Componente do DS "${binding.dsComponentId}" não encontrado`,
          severity: 'error'
        });
      } else {
        // Valida propriedades
        dsComponent.props.forEach(prop => {
          if (prop.required && !(prop.name in node.props)) {
            errors.push({
              nodeId: node.id,
              componentType: node.type,
              message: `Propriedade obrigatória "${prop.name}" não definida`,
              severity: 'error'
            });
          }
        });

        // Valida tokens
        binding.tokenBindings.forEach(tokenBinding => {
          const tokenValue = designSystemService.getToken(tokenBinding.tokenPath);
          if (!tokenValue) {
            errors.push({
              nodeId: node.id,
              componentType: node.type,
              message: `Token "${tokenBinding.tokenPath}" não encontrado no Design System`,
              severity: 'error'
            });
          }
        });

        // Verifica se tokens foram aplicados
        if (!node.props.__dsTokensApplied) {
          warnings.push({
            nodeId: node.id,
            componentType: node.type,
            message: 'Tokens do Design System não aplicados',
            autoFixable: true,
            suggestion: 'Clique para aplicar tokens automaticamente'
          });
        } else if (node.props.__dsVersion !== ds.version) {
          warnings.push({
            nodeId: node.id,
            componentType: node.type,
            message: `Design System desatualizado (atual: ${node.props.__dsVersion}, disponível: ${ds.version})`,
            autoFixable: true,
            suggestion: 'Atualizar para a versão mais recente'
          });
        }

        // Valida contraste de cores (se aplicável)
        if (node.styles.backgroundColor && node.styles.color) {
          const contrast = designSystemService.validateContrast(
            String(node.styles.color),
            String(node.styles.backgroundColor)
          );
          
          if (!contrast.valid) {
            warnings.push({
              nodeId: node.id,
              componentType: node.type,
              message: `Contraste insuficiente (${contrast.ratio}:1). Mínimo recomendado: 4.5:1`,
              autoFixable: false,
              suggestion: 'Ajuste as cores para melhorar a acessibilidade'
            });
          }
        }

        // Sugestões de variantes
        if (dsComponent.variants.length > 1) {
          suggestions.push(
            `Este componente possui ${dsComponent.variants.length} variantes disponíveis: ${
              dsComponent.variants.map(v => v.name).join(', ')
            }`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Valida uma árvore completa
   */
  validateTree(nodes: HierarchicalNode[]): ValidationResult {
    const allResults: ValidationResult[] = nodes.flatMap(node => {
      const nodeResult = this.validateNode(node);
      const childResults: ValidationResult[] = [];

      if (node.children) {
        childResults.push(this.validateTree(node.children));
      }

      if (node.slots) {
        for (const slotNodes of Object.values(node.slots)) {
          childResults.push(this.validateTree(slotNodes));
        }
      }

      return [nodeResult, ...childResults];
    });

    // Combina todos os resultados
    return {
      valid: allResults.every(r => r.valid),
      errors: allResults.flatMap(r => r.errors),
      warnings: allResults.flatMap(r => r.warnings),
      suggestions: allResults.flatMap(r => r.suggestions)
    };
  }

  /**
   * Obtém preview de um componente do DS
   */
  getDSComponentPreview(dsComponentId: string, variant?: string): DSComponentPreview | null {
    const dsComponent = designSystemService.getComponent(dsComponentId);
    if (!dsComponent) return null;

    const ds = designSystemService.getCurrentDesignSystem();
    if (!ds) return null;

    const selectedVariant = dsComponent.variants.find(v => v.id === variant) || dsComponent.variants[0];
    if (!selectedVariant) return null;

    // Resolve tokens para valores
    const tokenValues: Record<string, any> = {};
    const styles: React.CSSProperties = {};

    Object.entries(selectedVariant.tokens).forEach(([key, tokenRef]) => {
      const value = designSystemService.resolveTokenReference(tokenRef, ds.tokens);
      tokenValues[key] = value;
      
      // Converte para styles CSS
      if (key === 'bg') styles.backgroundColor = value;
      else if (key === 'color') styles.color = value;
      else if (key === 'padding') styles.padding = value;
      else if (key === 'borderRadius') styles.borderRadius = value;
      // ... outros mapeamentos
    });

    return {
      dsComponent,
      renderProps: selectedVariant.props,
      tokenValues,
      styles
    };
  }

  /**
   * Executa pipeline de sincronização
   */
  async executeSyncPipeline(sourceId: string): Promise<SyncPipeline[]> {
    const stages: SyncPipeline[] = [
      { stage: 'tokens', status: 'pending', progress: 0, errors: [] },
      { stage: 'themes', status: 'pending', progress: 0, errors: [] },
      { stage: 'components', status: 'pending', progress: 0, errors: [] },
      { stage: 'layouts', status: 'pending', progress: 0, errors: [] },
      { stage: 'content', status: 'pending', progress: 0, errors: [] }
    ];

    try {
      // Stage 1: Sincronizar tokens
      stages[0].status = 'running';
      const syncResult = await designSystemSyncService.sync(sourceId);
      
      if (syncResult.success) {
        stages[0].status = 'completed';
        stages[0].progress = 100;
      } else {
        stages[0].status = 'failed';
        stages[0].errors = syncResult.errors || [];
        return stages; // Para no primeiro erro
      }

      // Stage 2: Aplicar temas
      stages[1].status = 'running';
      const ds = designSystemService.getCurrentDesignSystem();
      if (ds) {
        designSystemService.applyCSSVariables(ds.tokens);
        stages[1].status = 'completed';
        stages[1].progress = 100;
      }

      // Stage 3: Atualizar componentes
      stages[2].status = 'running';
      const bindings = this.getBindings();
      let updated = 0;
      
      for (const binding of bindings) {
        if (binding.enabled) {
          // Verifica se há migrações necessárias
          const dsComponent = designSystemService.getComponent(binding.dsComponentId);
          if (dsComponent && dsComponent.version !== binding.version) {
            // Auto-migração se habilitada
            if (this.config.autoMigration) {
              binding.version = dsComponent.version;
              this.saveBinding(binding);
            }
          }
          updated++;
        }
      }
      
      stages[2].status = 'completed';
      stages[2].progress = 100;

      // Stage 4: Validar layouts (placeholder)
      stages[3].status = 'completed';
      stages[3].progress = 100;

      // Stage 5: Atualizar conteúdo (placeholder)
      stages[4].status = 'completed';
      stages[4].progress = 100;

      auditService.log('ds_sync_pipeline_completed', null, {
        sourceId,
        stages: stages.map(s => s.stage)
      });

    } catch (error: any) {
      const currentStage = stages.find(s => s.status === 'running');
      if (currentStage) {
        currentStage.status = 'failed';
        currentStage.errors.push(error.message);
      }
    }

    return stages;
  }

  /**
   * Gera CSS a partir dos tokens do DS
   */
  generateCSSFromTokens(): string {
    const ds = designSystemService.getCurrentDesignSystem();
    if (!ds) return '';

    const flat = designSystemService.flattenTokens(ds.tokens);
    let css = ':root {\n';

    Object.entries(flat).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/\./g, '-')}`;
      css += `  ${cssVar}: ${value};\n`;
    });

    css += '}\n';
    return css;
  }

  /**
   * Obtém componentes do DS por categoria
   */
  getDSComponentsByCategory(): Record<string, DSComponent[]> {
    const components = designSystemService.getComponents();
    const byCategory: Record<string, DSComponent[]> = {};

    components.forEach(comp => {
      if (!byCategory[comp.category]) {
        byCategory[comp.category] = [];
      }
      byCategory[comp.category].push(comp);
    });

    return byCategory;
  }

  /**
   * Aplica correções automáticas
   */
  autoFixWarning(warning: ValidationWarning, node: HierarchicalNode): HierarchicalNode {
    if (!warning.autoFixable) return node;

    if (warning.message.includes('Tokens do Design System não aplicados')) {
      return this.applyDSTokensToNode(node);
    }

    if (warning.message.includes('Design System desatualizado')) {
      return this.applyDSTokensToNode(node);
    }

    return node;
  }

  /**
   * Exporta configuração completa
   */
  exportConfig(): string {
    return JSON.stringify({
      config: this.config,
      bindings: this.getBindings(),
      version: '1.0.0',
      timestamp: Date.now()
    }, null, 2);
  }

  /**
   * Importa configuração
   */
  importConfig(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.config) {
        this.updateConfig(parsed.config);
      }

      if (parsed.bindings) {
        localStorage.setItem(this.BINDINGS_KEY, JSON.stringify(parsed.bindings));
      }

      auditService.log('ds_config_imported', null, {
        version: parsed.version
      });
    } catch (error) {
      console.error('Failed to import DS config:', error);
      throw new Error('Invalid configuration format');
    }
  }
}

export const pbDSIntegration = new PageBuilderDSIntegrationService();
