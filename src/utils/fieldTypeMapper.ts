/**
 * Utilitário para mapeamento automático de tipos de dados do JSON
 */

export type FieldType = 
  | 'text'
  | 'number'
  | 'boolean'
  | 'datetime'
  | 'date'
  | 'email'
  | 'url'
  | 'richtext'
  | 'collection'
  | 'taxonomy'
  | 'lookup'
  | 'choice'
  | 'user'
  | 'guid';

export interface FieldDefinition {
  name: string;
  internalName: string;
  type: FieldType;
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowNull?: boolean;
  };
  metadata?: {
    edm_type?: string;
    lookup_list?: string;
    choice_options?: string[];
  };
}

export interface MappedData {
  fields: FieldDefinition[];
  values: Record<string, any>;
  collections: Record<string, any[]>;
  relationships: Record<string, string>;
}

/**
 * Detecta o tipo de campo baseado no nome e valor
 */
export function detectFieldType(fieldName: string, value: any, metadata?: any): FieldType {
  // Campos de sistema conhecidos
  if (fieldName === 'ID' || fieldName.endsWith('Id')) {
    if (metadata?.type?.includes('Collection')) {
      return 'collection';
    }
    return 'lookup';
  }
  
  if (fieldName === 'GUID' || fieldName === 'ComplianceAssetId') {
    return 'guid';
  }
  
  if (fieldName.includes('Email')) {
    return 'email';
  }
  
  if (fieldName.includes('Url') || fieldName.includes('Link')) {
    return 'url';
  }
  
  // Campos com prefixo Campo
  if (fieldName.startsWith('Campo')) {
    if (fieldName.includes('Data')) {
      return fieldName.includes('Evento') ? 'datetime' : 'date';
    }
    if (fieldName.includes('TelaCheia') || fieldName.includes('Exibir')) {
      return 'boolean';
    }
    if (fieldName.includes('Resumo') || fieldName.includes('Conteudo')) {
      return 'richtext';
    }
  }
  
  // Campos específicos de publicação
  if (fieldName.startsWith('Publishing')) {
    if (fieldName.includes('Content')) {
      return 'richtext';
    }
    if (fieldName.includes('IsFurlPage')) {
      return 'boolean';
    }
    if (fieldName.includes('Contact')) {
      return 'user';
    }
  }
  
  // Detecção baseada em metadata
  if (metadata) {
    if (metadata.type?.includes('Collection')) {
      return metadata.type.includes('Taxonomy') ? 'taxonomy' : 'collection';
    }
  }
  
  // Detecção baseada em valor
  if (value !== null && value !== undefined) {
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'string') {
      // ISO Date format
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return 'datetime';
      }
      // GUID format
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        return 'guid';
      }
      // Email format
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'email';
      }
      // URL format
      if (/^https?:\/\//i.test(value)) {
        return 'url';
      }
      // HTML content
      if (/<[a-z][\s\S]*>/i.test(value)) {
        return 'richtext';
      }
    }
    if (typeof value === 'object' && value.__metadata) {
      if (value.__metadata.type?.includes('Collection')) {
        return value.__metadata.type.includes('Taxonomy') ? 'taxonomy' : 'collection';
      }
    }
  }
  
  return 'text';
}

/**
 * Converte nome interno para nome amigável
 */
export function getFriendlyName(internalName: string): string {
  // Remove prefixos comuns
  let name = internalName
    .replace(/^OData__/, '')
    .replace(/^Campo/, '')
    .replace(/^Publishing/, '');
  
  // Separa CamelCase
  name = name.replace(/([A-Z])/g, ' $1').trim();
  
  // Remove caracteres especiais de encoding
  name = name.replace(/_x00([0-9a-f]{2})_/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Capitaliza primeira letra
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Valida valor baseado no tipo de campo
 */
export function validateFieldValue(value: any, field: FieldDefinition): { valid: boolean; error?: string } {
  // Permite null se especificado
  if (value === null || value === undefined) {
    if (field.validation?.allowNull !== false && !field.required) {
      return { valid: true };
    }
    if (field.required) {
      return { valid: false, error: `${field.name} é obrigatório` };
    }
  }
  
  switch (field.type) {
    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { valid: false, error: 'Email inválido' };
      }
      break;
      
    case 'url':
      if (value && !/^https?:\/\/.+/.test(value)) {
        return { valid: false, error: 'URL inválida' };
      }
      break;
      
    case 'datetime':
    case 'date':
      if (value && isNaN(Date.parse(value))) {
        return { valid: false, error: 'Data inválida' };
      }
      break;
      
    case 'number':
      if (value !== null && isNaN(Number(value))) {
        return { valid: false, error: 'Número inválido' };
      }
      if (field.validation?.min !== undefined && Number(value) < field.validation.min) {
        return { valid: false, error: `Valor mínimo: ${field.validation.min}` };
      }
      if (field.validation?.max !== undefined && Number(value) > field.validation.max) {
        return { valid: false, error: `Valor máximo: ${field.validation.max}` };
      }
      break;
      
    case 'guid':
      if (value && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        return { valid: false, error: 'GUID inválido' };
      }
      break;
      
    case 'collection':
      if (value && !Array.isArray(value) && !value.results) {
        return { valid: false, error: 'Coleção deve ser um array' };
      }
      break;
  }
  
  return { valid: true };
}

/**
 * Transforma valor do JSON para o formato do sistema
 */
export function transformValue(value: any, field: FieldDefinition): any {
  if (value === null || value === undefined) {
    return field.defaultValue ?? null;
  }
  
  switch (field.type) {
    case 'datetime':
    case 'date':
      return new Date(value).toISOString();
      
    case 'number':
      return Number(value);
      
    case 'boolean':
      return Boolean(value);
      
    case 'collection':
      if (value.__metadata && value.results) {
        return value.results;
      }
      return Array.isArray(value) ? value : [];
      
    case 'taxonomy':
      if (value.__metadata && value.results) {
        return value.results.map((item: any) => ({
          label: item.Label,
          termGuid: item.TermGuid,
          wssId: item.WssId
        }));
      }
      return [];
      
    case 'richtext':
      // Sanitiza HTML básico
      if (typeof value === 'string') {
        return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
      return value;
      
    default:
      return value;
  }
}

/**
 * Mapeia JSON completo para estrutura de campos
 */
export function mapJsonToFields(json: Record<string, any>): MappedData {
  const fields: FieldDefinition[] = [];
  const values: Record<string, any> = {};
  const collections: Record<string, any[]> = {};
  const relationships: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(json)) {
    // Pula metadados
    if (key === '__metadata') continue;
    
    const metadata = typeof value === 'object' && value?.__metadata ? value.__metadata : undefined;
    const type = detectFieldType(key, value, metadata);
    
    const field: FieldDefinition = {
      name: getFriendlyName(key),
      internalName: key,
      type,
      required: ['ID', 'Created', 'Modified'].includes(key),
      validation: {
        allowNull: !['ID', 'Created', 'Modified'].includes(key)
      },
      metadata: metadata ? {
        edm_type: metadata.type
      } : undefined
    };
    
    fields.push(field);
    
    // Transforma e armazena valor
    const transformedValue = transformValue(value, field);
    values[key] = transformedValue;
    
    // Armazena coleções separadamente
    if (type === 'collection' || type === 'taxonomy') {
      collections[key] = transformedValue;
    }
    
    // Mapeia relacionamentos (campos que terminam com Id)
    if (key.endsWith('Id') && !key.endsWith('sId') && type === 'lookup') {
      const listName = key.replace(/Id$/, '');
      relationships[key] = listName;
    }
  }
  
  return { fields, values, collections, relationships };
}

/**
 * Gera schema de validação para campos
 */
export function generateValidationSchema(fields: FieldDefinition[]): Record<string, any> {
  const schema: Record<string, any> = {};
  
  for (const field of fields) {
    schema[field.internalName] = {
      type: field.type,
      required: field.required,
      validation: field.validation
    };
  }
  
  return schema;
}

/**
 * Sanitiza dados antes de salvar
 */
export function sanitizeData(data: Record<string, any>, fields: FieldDefinition[]): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const field of fields) {
    const value = data[field.internalName];
    
    // Valida
    const validation = validateFieldValue(value, field);
    if (!validation.valid) {
      console.warn(`Validation failed for ${field.internalName}: ${validation.error}`);
      continue;
    }
    
    // Sanitiza e transforma
    sanitized[field.internalName] = transformValue(value, field);
  }
  
  return sanitized;
}
