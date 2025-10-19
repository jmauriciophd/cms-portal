/**
 * Design System Service
 * Gerencia tokens, componentes e temas do Design System
 */

// W3C Design Tokens Schema
export interface DesignToken {
  $type?: string;
  $value?: any;
  value?: any;
  $description?: string;
  $extensions?: Record<string, any>;
}

export interface TokenCollection {
  [key: string]: DesignToken | TokenCollection;
}

export interface DesignSystemTokens {
  $schema?: string;
  color?: TokenCollection;
  typography?: TokenCollection;
  spacing?: TokenCollection;
  radius?: TokenCollection;
  shadow?: TokenCollection;
  breakpoint?: TokenCollection;
  grid?: TokenCollection;
  theme?: TokenCollection;
}

export interface ComponentVariant {
  id: string;
  name: string;
  props: Record<string, any>;
  tokens: Record<string, string>; // token references
  preview?: string;
}

export interface DSComponent {
  id: string;
  name: string;
  category: string;
  description: string;
  variants: ComponentVariant[];
  props: ComponentProp[];
  states?: string[];
  version: string;
  deprecated?: boolean;
  replacedBy?: string;
}

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'token';
  required?: boolean;
  default?: any;
  options?: string[];
  tokenType?: string; // ex: 'color', 'spacing'
}

export interface DesignSystemVersion {
  version: string;
  timestamp: number;
  tokens: DesignSystemTokens;
  components: DSComponent[];
  changelog: ChangelogEntry[];
  breaking?: boolean;
}

export interface ChangelogEntry {
  type: 'add' | 'update' | 'deprecate' | 'remove' | 'rename';
  category: 'token' | 'component' | 'theme' | 'layout';
  id: string;
  oldValue?: any;
  newValue?: any;
  migration?: MigrationRule;
  impact?: 'low' | 'medium' | 'high' | 'breaking';
}

export interface MigrationRule {
  from: string;
  to: string;
  automatic?: boolean;
  transform?: string; // JS function as string
  notes?: string;
}

export interface DSMapping {
  cmsComponentId: string;
  dsComponentId: string;
  variantMapping: Record<string, string>;
  propMapping: Record<string, string>;
  version: string;
}

class DesignSystemService {
  private readonly STORAGE_KEY = 'design_system_data';
  private readonly VERSIONS_KEY = 'design_system_versions';
  private readonly MAPPINGS_KEY = 'design_system_mappings';
  private readonly CURRENT_VERSION_KEY = 'design_system_current_version';

  /**
   * Carrega o Design System atual
   */
  getCurrentDesignSystem(): DesignSystemVersion | null {
    const versionId = localStorage.getItem(this.CURRENT_VERSION_KEY);
    if (!versionId) return null;

    const versions = this.getVersions();
    return versions.find(v => v.version === versionId) || null;
  }

  /**
   * Obtém todas as versões do Design System
   */
  getVersions(): DesignSystemVersion[] {
    const stored = localStorage.getItem(this.VERSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Salva uma nova versão do Design System
   */
  saveVersion(version: DesignSystemVersion): void {
    const versions = this.getVersions();
    const existing = versions.findIndex(v => v.version === version.version);
    
    if (existing >= 0) {
      versions[existing] = version;
    } else {
      versions.push(version);
    }

    localStorage.setItem(this.VERSIONS_KEY, JSON.stringify(versions));
    
    // Atualiza CSS vars
    this.applyCSSVariables(version.tokens);
  }

  /**
   * Define a versão atual
   */
  setCurrentVersion(versionId: string): void {
    localStorage.setItem(this.CURRENT_VERSION_KEY, versionId);
    const version = this.getVersions().find(v => v.version === versionId);
    if (version) {
      this.applyCSSVariables(version.tokens);
    }
  }

  /**
   * Importa tokens de um objeto JSON (W3C Design Tokens)
   */
  importTokens(tokens: DesignSystemTokens): void {
    const current = this.getCurrentDesignSystem();
    const version: DesignSystemVersion = {
      version: `imported-${Date.now()}`,
      timestamp: Date.now(),
      tokens,
      components: current?.components || [],
      changelog: [
        {
          type: 'add',
          category: 'token',
          id: 'all',
          newValue: tokens,
          impact: 'medium'
        }
      ]
    };

    this.saveVersion(version);
    this.setCurrentVersion(version.version);
  }

  /**
   * Normaliza tokens para flat structure
   */
  flattenTokens(tokens: TokenCollection, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(tokens)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object') {
        if ('$value' in value || 'value' in value) {
          // É um token
          result[path] = value.$value || value.value;
        } else {
          // É uma coleção, continue recursivamente
          Object.assign(result, this.flattenTokens(value as TokenCollection, path));
        }
      }
    }

    return result;
  }

  /**
   * Aplica tokens como CSS Variables
   */
  applyCSSVariables(tokens: DesignSystemTokens): void {
    const flat = this.flattenTokens(tokens);
    const root = document.documentElement;

    for (const [key, value] of Object.entries(flat)) {
      const cssVar = `--${key.replace(/\./g, '-')}`;
      
      if (typeof value === 'string' || typeof value === 'number') {
        root.style.setProperty(cssVar, String(value));
      }
    }
  }

  /**
   * Resolve referências de tokens (ex: {color.primary.500})
   */
  resolveTokenReference(ref: string, tokens: DesignSystemTokens): any {
    if (!ref.startsWith('{') || !ref.endsWith('}')) {
      return ref;
    }

    const path = ref.slice(1, -1).split('.');
    let current: any = tokens;

    for (const key of path) {
      if (!current || typeof current !== 'object') return ref;
      current = current[key];
    }

    if (current && typeof current === 'object') {
      return current.$value || current.value || ref;
    }

    return current || ref;
  }

  /**
   * Obtém um componente do DS
   */
  getComponent(id: string): DSComponent | null {
    const ds = this.getCurrentDesignSystem();
    if (!ds) return null;
    return ds.components.find(c => c.id === id) || null;
  }

  /**
   * Obtém todos os componentes do DS
   */
  getComponents(): DSComponent[] {
    const ds = this.getCurrentDesignSystem();
    return ds?.components || [];
  }

  /**
   * Obtém componentes por categoria
   */
  getComponentsByCategory(category: string): DSComponent[] {
    return this.getComponents().filter(c => c.category === category);
  }

  /**
   * Adiciona ou atualiza um componente
   */
  saveComponent(component: DSComponent): void {
    const ds = this.getCurrentDesignSystem();
    if (!ds) return;

    const index = ds.components.findIndex(c => c.id === component.id);
    if (index >= 0) {
      ds.components[index] = component;
    } else {
      ds.components.push(component);
    }

    this.saveVersion(ds);
  }

  /**
   * Obtém mapeamentos CMS <-> DS
   */
  getMappings(): DSMapping[] {
    const stored = localStorage.getItem(this.MAPPINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Salva um mapeamento
   */
  saveMapping(mapping: DSMapping): void {
    const mappings = this.getMappings();
    const index = mappings.findIndex(m => m.cmsComponentId === mapping.cmsComponentId);
    
    if (index >= 0) {
      mappings[index] = mapping;
    } else {
      mappings.push(mapping);
    }

    localStorage.setItem(this.MAPPINGS_KEY, JSON.stringify(mappings));
  }

  /**
   * Obtém mapeamento para um componente do CMS
   */
  getMapping(cmsComponentId: string): DSMapping | null {
    const mappings = this.getMappings();
    return mappings.find(m => m.cmsComponentId === cmsComponentId) || null;
  }

  /**
   * Cria um Design System padrão
   */
  createDefaultDesignSystem(): DesignSystemVersion {
    const defaultDS: DesignSystemVersion = {
      version: '1.0.0',
      timestamp: Date.now(),
      tokens: {
        $schema: 'https://design-tokens.org',
        color: {
          brand: {
            primary: {
              100: { value: '#E6F2FF' },
              200: { value: '#BAE0FF' },
              300: { value: '#7CC4FF' },
              400: { value: '#47A3F3' },
              500: { value: '#2B6CB0' },
              600: { value: '#2C5282' },
              700: { value: '#2A4365' },
              800: { value: '#1A365D' },
              900: { value: '#153E75' }
            },
            secondary: {
              500: { value: '#805AD5' },
              600: { value: '#6B46C1' }
            }
          },
          neutral: {
            0: { value: '#FFFFFF' },
            50: { value: '#F7FAFC' },
            100: { value: '#EDF2F7' },
            200: { value: '#E2E8F0' },
            300: { value: '#CBD5E0' },
            400: { value: '#A0AEC0' },
            500: { value: '#718096' },
            600: { value: '#4A5568' },
            700: { value: '#2D3748' },
            800: { value: '#1A202C' },
            900: { value: '#171923' }
          },
          semantic: {
            success: { value: '#38A169' },
            warning: { value: '#D69E2E' },
            error: { value: '#E53E3E' },
            info: { value: '#3182CE' }
          }
        },
        typography: {
          fontFamily: {
            body: { value: 'Inter, system-ui, -apple-system, sans-serif' },
            heading: { value: 'Inter, system-ui, -apple-system, sans-serif' },
            mono: { value: 'Monaco, Courier, monospace' }
          },
          fontSize: {
            xs: { value: '12px' },
            sm: { value: '14px' },
            base: { value: '16px' },
            lg: { value: '18px' },
            xl: { value: '20px' },
            '2xl': { value: '24px' },
            '3xl': { value: '30px' },
            '4xl': { value: '36px' }
          },
          fontWeight: {
            normal: { value: '400' },
            medium: { value: '500' },
            semibold: { value: '600' },
            bold: { value: '700' }
          },
          lineHeight: {
            tight: { value: '1.25' },
            normal: { value: '1.5' },
            relaxed: { value: '1.75' }
          }
        },
        spacing: {
          xs: { value: '4px' },
          sm: { value: '8px' },
          md: { value: '16px' },
          lg: { value: '24px' },
          xl: { value: '32px' },
          '2xl': { value: '48px' },
          '3xl': { value: '64px' }
        },
        radius: {
          none: { value: '0' },
          sm: { value: '4px' },
          md: { value: '8px' },
          lg: { value: '12px' },
          xl: { value: '16px' },
          full: { value: '9999px' }
        },
        shadow: {
          sm: { value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
          md: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
          lg: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
          xl: { value: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
        },
        breakpoint: {
          sm: { value: '640px' },
          md: { value: '768px' },
          lg: { value: '1024px' },
          xl: { value: '1280px' },
          '2xl': { value: '1536px' }
        },
        grid: {
          columns: { value: '12' },
          gutter: { value: '24px' },
          margin: { value: '16px' }
        }
      },
      components: [
        {
          id: 'ds.button',
          name: 'Button',
          category: 'Actions',
          description: 'Botão do Design System',
          version: '1.0.0',
          variants: [
            {
              id: 'primary',
              name: 'Primary',
              props: { variant: 'primary' },
              tokens: {
                bg: '{color.brand.primary.500}',
                color: '{color.neutral.0}',
                padding: '{spacing.sm} {spacing.md}'
              }
            },
            {
              id: 'secondary',
              name: 'Secondary',
              props: { variant: 'secondary' },
              tokens: {
                bg: '{color.brand.secondary.500}',
                color: '{color.neutral.0}',
                padding: '{spacing.sm} {spacing.md}'
              }
            }
          ],
          props: [
            { name: 'variant', type: 'enum', options: ['primary', 'secondary', 'outline'], default: 'primary' },
            { name: 'size', type: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
            { name: 'disabled', type: 'boolean', default: false }
          ],
          states: ['default', 'hover', 'active', 'disabled']
        }
      ],
      changelog: [
        {
          type: 'add',
          category: 'token',
          id: 'initial',
          newValue: 'Initial Design System',
          impact: 'low'
        }
      ]
    };

    return defaultDS;
  }

  /**
   * Inicializa o Design System com valores padrão
   */
  initialize(): void {
    const current = this.getCurrentDesignSystem();
    if (!current) {
      const defaultDS = this.createDefaultDesignSystem();
      this.saveVersion(defaultDS);
      this.setCurrentVersion(defaultDS.version);
    }
  }

  /**
   * Exporta o Design System atual
   */
  export(): string {
    const ds = this.getCurrentDesignSystem();
    return JSON.stringify(ds, null, 2);
  }

  /**
   * Importa um Design System completo
   */
  import(data: string): void {
    try {
      const ds = JSON.parse(data) as DesignSystemVersion;
      this.saveVersion(ds);
      this.setCurrentVersion(ds.version);
    } catch (error) {
      console.error('Failed to import Design System:', error);
      throw new Error('Invalid Design System format');
    }
  }

  /**
   * Obtém um token por caminho
   */
  getToken(path: string): any {
    const ds = this.getCurrentDesignSystem();
    if (!ds) return null;

    const parts = path.split('.');
    let current: any = ds.tokens;

    for (const part of parts) {
      if (!current || typeof current !== 'object') return null;
      current = current[part];
    }

    if (current && typeof current === 'object') {
      return current.$value || current.value || null;
    }

    return current;
  }

  /**
   * Define um token
   */
  setToken(path: string, value: any): void {
    const ds = this.getCurrentDesignSystem();
    if (!ds) return;

    const parts = path.split('.');
    let current: any = ds.tokens;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = { value };

    this.saveVersion(ds);
  }

  /**
   * Valida contraste de cores (WCAG AA)
   */
  validateContrast(fg: string, bg: string): { valid: boolean; ratio: number } {
    // Implementação simplificada - em produção usar biblioteca como 'color-contrast-checker'
    const getLuminance = (color: string): number => {
      // Converte hex para RGB e calcula luminância relativa
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      const [rs, gs, bs] = [r, g, b].map(c =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(fg);
    const l2 = getLuminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      valid: ratio >= 4.5, // WCAG AA normal text
      ratio: Math.round(ratio * 100) / 100
    };
  }
}

export const designSystemService = new DesignSystemService();
