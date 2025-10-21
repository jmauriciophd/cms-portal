/**
 * FileOptimizationService
 * 
 * Sistema inteligente de identificação, otimização e validação de arquivos
 * 
 * Features:
 * - Identificação automática de tipo de arquivo
 * - Otimização específica por tipo
 * - Validação automatizada de integridade
 * - Geração de previews
 * - Análise de estrutura e conteúdo
 */

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type FileCategory = 
  | 'page'      // HTML, páginas web
  | 'image'     // Imagens (JPEG, PNG, GIF, WebP, SVG)
  | 'style'     // CSS, SCSS, LESS
  | 'script'    // JavaScript, TypeScript
  | 'document'  // PDF, DOCX, TXT
  | 'data'      // JSON, XML, CSV
  | 'markdown'  // MD, MDX
  | 'code'      // Outros códigos fonte
  | 'unknown';  // Tipo desconhecido

export type OptimizationLevel = 'none' | 'light' | 'medium' | 'aggressive';

export type ValidationStatus = 'valid' | 'warning' | 'error' | 'unknown';

export interface FileAnalysis {
  // Identificação
  fileName: string;
  originalSize: number;
  mimeType: string;
  extension: string;
  category: FileCategory;
  encoding?: string;
  
  // Detecção de conteúdo
  contentType: string;
  isTextBased: boolean;
  hasMetadata: boolean;
  
  // Características específicas
  characteristics: {
    // Para páginas HTML
    hasDoctype?: boolean;
    hasHead?: boolean;
    hasBody?: boolean;
    externalResources?: string[];
    scripts?: number;
    styles?: number;
    
    // Para imagens
    dimensions?: { width: number; height: number };
    colorDepth?: number;
    hasAlpha?: boolean;
    format?: string;
    
    // Para código
    language?: string;
    linesOfCode?: number;
    hasMinified?: boolean;
    hasSyntaxErrors?: boolean;
  };
  
  // Pasta de destino sugerida
  suggestedDestination: string;
  confidence: number; // 0-1
}

export interface OptimizationResult {
  // Status
  success: boolean;
  optimized: boolean;
  
  // Dados
  originalContent: string | ArrayBuffer;
  optimizedContent: string | ArrayBuffer;
  
  // Métricas
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  timeTaken: number;
  
  // Otimizações aplicadas
  appliedOptimizations: string[];
  
  // Logs
  logs: string[];
  warnings: string[];
  errors: string[];
}

export interface ValidationResult {
  // Status geral
  status: ValidationStatus;
  isValid: boolean;
  
  // Validações específicas
  checks: {
    name: string;
    status: ValidationStatus;
    message: string;
    details?: any;
  }[];
  
  // Problemas detectados
  errors: string[];
  warnings: string[];
  suggestions: string[];
  
  // Score de qualidade
  qualityScore: number; // 0-100
}

export interface PreviewData {
  type: 'html' | 'image' | 'text' | 'json' | 'none';
  content: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

export interface ProcessedFile {
  // Arquivo original
  file: File;
  analysis: FileAnalysis;
  
  // Resultados
  optimization: OptimizationResult;
  validation: ValidationResult;
  preview: PreviewData;
  
  // Destino
  suggestedPath: string;
  suggestedName: string;
  finalPath?: string;
  
  // Status
  status: 'analyzing' | 'optimizing' | 'validating' | 'ready' | 'error';
  progress: number;
  error?: string;
}

// ============================================================================
// SERVIÇO PRINCIPAL
// ============================================================================

class FileOptimizationServiceClass {
  
  // ==========================================================================
  // ANÁLISE E IDENTIFICAÇÃO
  // ==========================================================================
  
  async analyzeFile(file: File): Promise<FileAnalysis> {
    const startTime = Date.now();
    
    // Informações básicas
    const fileName = file.name;
    const originalSize = file.size;
    const mimeType = file.type || this.detectMimeType(fileName);
    const extension = this.getExtension(fileName);
    
    // Ler conteúdo para análise
    const content = await this.readFileContent(file);
    const isTextBased = this.isTextContent(content);
    
    // Determinar categoria
    const category = this.detectCategory(file, mimeType, extension, content);
    
    // Analisar características específicas
    const characteristics = await this.analyzeCharacteristics(file, category, content);
    
    // Sugerir destino
    const { destination, confidence } = this.suggestDestination(category, fileName, characteristics);
    
    return {
      fileName,
      originalSize,
      mimeType,
      extension,
      category,
      encoding: isTextBased ? 'utf-8' : undefined,
      contentType: this.getContentTypeDescription(category),
      isTextBased,
      hasMetadata: this.hasMetadata(file, content),
      characteristics,
      suggestedDestination: destination,
      confidence
    };
  }
  
  private detectCategory(
    file: File, 
    mimeType: string, 
    extension: string, 
    content: string | ArrayBuffer
  ): FileCategory {
    // Por MIME type
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'text/html') return 'page';
    if (mimeType === 'text/css') return 'style';
    if (mimeType === 'application/javascript' || mimeType === 'text/javascript') return 'script';
    if (mimeType === 'application/json') return 'data';
    if (mimeType === 'application/pdf') return 'document';
    
    // Por extensão
    if (['.html', '.htm'].includes(extension)) return 'page';
    if (['.css', '.scss', '.sass', '.less'].includes(extension)) return 'style';
    if (['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(extension)) return 'script';
    if (['.json', '.xml', '.csv', '.yaml', '.yml'].includes(extension)) return 'data';
    if (['.md', '.mdx', '.markdown'].includes(extension)) return 'markdown';
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(extension)) return 'image';
    if (['.txt', '.pdf', '.doc', '.docx'].includes(extension)) return 'document';
    
    // Por conteúdo (análise heurística)
    if (typeof content === 'string') {
      const lower = content.toLowerCase().trim();
      if (lower.startsWith('<!doctype html') || lower.startsWith('<html')) return 'page';
      if (lower.startsWith('{') || lower.startsWith('[')) {
        try {
          JSON.parse(content);
          return 'data';
        } catch {}
      }
      if (lower.includes('function') || lower.includes('const ') || lower.includes('import ')) return 'script';
    }
    
    return 'unknown';
  }
  
  private async analyzeCharacteristics(
    file: File,
    category: FileCategory,
    content: string | ArrayBuffer
  ): Promise<FileAnalysis['characteristics']> {
    const characteristics: FileAnalysis['characteristics'] = {};
    
    switch (category) {
      case 'page':
        if (typeof content === 'string') {
          characteristics.hasDoctype = content.toLowerCase().includes('<!doctype');
          characteristics.hasHead = content.toLowerCase().includes('<head');
          characteristics.hasBody = content.toLowerCase().includes('<body');
          characteristics.externalResources = this.extractExternalResources(content);
          characteristics.scripts = (content.match(/<script/g) || []).length;
          characteristics.styles = (content.match(/<style|<link[^>]*stylesheet/g) || []).length;
        }
        break;
        
      case 'image':
        if (file.type.startsWith('image/')) {
          try {
            const dimensions = await this.getImageDimensions(file);
            characteristics.dimensions = dimensions;
            characteristics.format = file.type.split('/')[1];
          } catch {}
        }
        break;
        
      case 'script':
      case 'style':
      case 'code':
        if (typeof content === 'string') {
          characteristics.language = this.detectLanguage(file.name);
          characteristics.linesOfCode = content.split('\n').length;
          characteristics.hasMinified = this.isMinified(content);
          characteristics.hasSyntaxErrors = this.hasSyntaxErrors(content, category);
        }
        break;
    }
    
    return characteristics;
  }
  
  private suggestDestination(
    category: FileCategory,
    fileName: string,
    characteristics: FileAnalysis['characteristics']
  ): { destination: string; confidence: number } {
    let destination = '/';
    let confidence = 0.5;
    
    switch (category) {
      case 'page':
        destination = '/pages';
        confidence = characteristics.hasDoctype && characteristics.hasBody ? 0.95 : 0.75;
        break;
        
      case 'image':
        destination = '/media/images';
        confidence = 0.9;
        break;
        
      case 'style':
        destination = '/assets/styles';
        confidence = 0.9;
        break;
        
      case 'script':
        destination = '/assets/scripts';
        confidence = 0.9;
        break;
        
      case 'document':
        destination = '/documents';
        confidence = 0.85;
        break;
        
      case 'data':
        destination = '/data';
        confidence = 0.8;
        break;
        
      case 'markdown':
        destination = '/content';
        confidence = 0.85;
        break;
        
      default:
        destination = '/uploads';
        confidence = 0.5;
    }
    
    return { destination, confidence };
  }
  
  // ==========================================================================
  // OTIMIZAÇÃO
  // ==========================================================================
  
  async optimizeFile(
    file: File,
    analysis: FileAnalysis,
    level: OptimizationLevel = 'medium'
  ): Promise<OptimizationResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    const appliedOptimizations: string[] = [];
    
    logs.push(`Iniciando otimização: ${file.name}`);
    logs.push(`Categoria: ${analysis.category}, Nível: ${level}`);
    
    if (level === 'none') {
      const content = await this.readFileContent(file);
      return {
        success: true,
        optimized: false,
        originalContent: content,
        optimizedContent: content,
        originalSize: file.size,
        optimizedSize: file.size,
        compressionRatio: 1,
        timeTaken: Date.now() - startTime,
        appliedOptimizations: [],
        logs,
        warnings,
        errors
      };
    }
    
    try {
      const content = await this.readFileContent(file);
      let optimizedContent = content;
      
      // Otimização específica por categoria
      switch (analysis.category) {
        case 'page':
          optimizedContent = await this.optimizeHTML(content as string, level, appliedOptimizations, logs);
          break;
          
        case 'style':
          optimizedContent = await this.optimizeCSS(content as string, level, appliedOptimizations, logs);
          break;
          
        case 'script':
          optimizedContent = await this.optimizeJavaScript(content as string, level, appliedOptimizations, logs);
          break;
          
        case 'image':
          // Imagens requerem processamento binário especial
          warnings.push('Otimização de imagens requer processamento no backend');
          optimizedContent = content;
          break;
          
        case 'data':
          optimizedContent = await this.optimizeJSON(content as string, level, appliedOptimizations, logs);
          break;
          
        case 'markdown':
          // Markdown geralmente não precisa otimização
          optimizedContent = content;
          logs.push('Markdown não requer otimização');
          break;
          
        default:
          warnings.push('Tipo de arquivo não suporta otimização automática');
          optimizedContent = content;
      }
      
      const originalSize = typeof content === 'string' 
        ? new Blob([content]).size 
        : content.byteLength;
      const optimizedSize = typeof optimizedContent === 'string'
        ? new Blob([optimizedContent]).size
        : optimizedContent.byteLength;
      
      logs.push(`Tamanho original: ${this.formatBytes(originalSize)}`);
      logs.push(`Tamanho otimizado: ${this.formatBytes(optimizedSize)}`);
      logs.push(`Redução: ${((1 - optimizedSize / originalSize) * 100).toFixed(2)}%`);
      
      return {
        success: true,
        optimized: appliedOptimizations.length > 0,
        originalContent: content,
        optimizedContent,
        originalSize,
        optimizedSize,
        compressionRatio: optimizedSize / originalSize,
        timeTaken: Date.now() - startTime,
        appliedOptimizations,
        logs,
        warnings,
        errors
      };
      
    } catch (error) {
      errors.push(`Erro na otimização: ${error}`);
      const content = await this.readFileContent(file);
      
      return {
        success: false,
        optimized: false,
        originalContent: content,
        optimizedContent: content,
        originalSize: file.size,
        optimizedSize: file.size,
        compressionRatio: 1,
        timeTaken: Date.now() - startTime,
        appliedOptimizations,
        logs,
        warnings,
        errors
      };
    }
  }
  
  private async optimizeHTML(
    content: string, 
    level: OptimizationLevel,
    optimizations: string[],
    logs: string[]
  ): Promise<string> {
    let optimized = content;
    
    // Remover comentários
    if (level !== 'light') {
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
      optimizations.push('Comentários HTML removidos');
    }
    
    // Remover espaços em branco desnecessários
    if (level === 'aggressive') {
      optimized = optimized
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
      optimizations.push('Espaços em branco minimizados');
    } else if (level === 'medium') {
      optimized = optimized
        .replace(/\n\s*\n/g, '\n')
        .trim();
      optimizations.push('Linhas vazias removidas');
    }
    
    // Minificar CSS inline
    optimized = optimized.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
      const minified = this.minifyCSS(css);
      if (minified !== css) {
        logs.push('CSS inline minificado');
      }
      return match.replace(css, minified);
    });
    
    // Minificar JS inline
    optimized = optimized.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
      // Não minifica scripts externos
      if (match.includes('src=')) return match;
      const minified = this.minifyJS(js);
      if (minified !== js) {
        logs.push('JavaScript inline minificado');
      }
      return match.replace(js, minified);
    });
    
    return optimized;
  }
  
  private async optimizeCSS(
    content: string,
    level: OptimizationLevel,
    optimizations: string[],
    logs: string[]
  ): Promise<string> {
    let optimized = this.minifyCSS(content);
    
    if (optimized !== content) {
      optimizations.push('CSS minificado');
    }
    
    return optimized;
  }
  
  private async optimizeJavaScript(
    content: string,
    level: OptimizationLevel,
    optimizations: string[],
    logs: string[]
  ): Promise<string> {
    // Verifica se já está minificado
    if (this.isMinified(content)) {
      logs.push('JavaScript já está minificado');
      return content;
    }
    
    let optimized = this.minifyJS(content);
    
    if (optimized !== content) {
      optimizations.push('JavaScript minificado');
    }
    
    return optimized;
  }
  
  private async optimizeJSON(
    content: string,
    level: OptimizationLevel,
    optimizations: string[],
    logs: string[]
  ): Promise<string> {
    try {
      const parsed = JSON.parse(content);
      
      if (level === 'aggressive') {
        // Minificar JSON
        const minified = JSON.stringify(parsed);
        optimizations.push('JSON minificado');
        return minified;
      } else {
        // Formatar JSON
        const formatted = JSON.stringify(parsed, null, 2);
        optimizations.push('JSON formatado');
        return formatted;
      }
    } catch {
      logs.push('JSON inválido, mantendo original');
      return content;
    }
  }
  
  // ==========================================================================
  // VALIDAÇÃO
  // ==========================================================================
  
  async validateFile(
    file: File,
    analysis: FileAnalysis,
    optimization: OptimizationResult
  ): Promise<ValidationResult> {
    const checks: ValidationResult['checks'] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Validação de tamanho
    const sizeCheck = this.validateSize(file, analysis);
    checks.push(sizeCheck);
    if (sizeCheck.status === 'error') errors.push(sizeCheck.message);
    if (sizeCheck.status === 'warning') warnings.push(sizeCheck.message);
    
    // Validação de tipo
    const typeCheck = this.validateType(file, analysis);
    checks.push(typeCheck);
    if (typeCheck.status === 'error') errors.push(typeCheck.message);
    if (typeCheck.status === 'warning') warnings.push(typeCheck.message);
    
    // Validações específicas por categoria
    const categoryChecks = await this.validateByCategory(file, analysis, optimization);
    checks.push(...categoryChecks);
    
    categoryChecks.forEach(check => {
      if (check.status === 'error') errors.push(check.message);
      if (check.status === 'warning') warnings.push(check.message);
    });
    
    // Validação de otimização
    if (optimization.errors.length > 0) {
      checks.push({
        name: 'Otimização',
        status: 'error',
        message: 'Erros durante otimização',
        details: optimization.errors
      });
      errors.push(...optimization.errors);
    } else if (optimization.warnings.length > 0) {
      checks.push({
        name: 'Otimização',
        status: 'warning',
        message: 'Avisos durante otimização',
        details: optimization.warnings
      });
      warnings.push(...optimization.warnings);
    } else {
      checks.push({
        name: 'Otimização',
        status: 'valid',
        message: 'Otimização concluída com sucesso'
      });
    }
    
    // Calcular score de qualidade
    const qualityScore = this.calculateQualityScore(checks, analysis, optimization);
    
    // Gerar sugestões
    this.generateSuggestions(analysis, optimization, suggestions);
    
    // Determinar status geral
    const hasErrors = errors.length > 0;
    const hasWarnings = warnings.length > 0;
    const status: ValidationStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'valid';
    
    return {
      status,
      isValid: !hasErrors,
      checks,
      errors,
      warnings,
      suggestions,
      qualityScore
    };
  }
  
  private validateSize(file: File, analysis: FileAnalysis): ValidationResult['checks'][0] {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const warnSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      return {
        name: 'Tamanho',
        status: 'error',
        message: `Arquivo muito grande (${this.formatBytes(file.size)}). Máximo: ${this.formatBytes(maxSize)}`
      };
    }
    
    if (file.size > warnSize) {
      return {
        name: 'Tamanho',
        status: 'warning',
        message: `Arquivo grande (${this.formatBytes(file.size)}). Considere otimizar.`
      };
    }
    
    return {
      name: 'Tamanho',
      status: 'valid',
      message: `Tamanho OK (${this.formatBytes(file.size)})`
    };
  }
  
  private validateType(file: File, analysis: FileAnalysis): ValidationResult['checks'][0] {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'text/html', 'text/css', 'text/javascript', 'application/javascript',
      'application/json', 'text/plain', 'text/markdown',
      'application/pdf'
    ];
    
    if (analysis.category === 'unknown') {
      return {
        name: 'Tipo',
        status: 'warning',
        message: 'Tipo de arquivo não reconhecido automaticamente'
      };
    }
    
    if (!allowedTypes.includes(file.type) && !this.isAllowedExtension(analysis.extension)) {
      return {
        name: 'Tipo',
        status: 'warning',
        message: `Tipo de arquivo incomum: ${file.type || analysis.extension}`
      };
    }
    
    return {
      name: 'Tipo',
      status: 'valid',
      message: `Tipo válido: ${analysis.contentType}`
    };
  }
  
  private async validateByCategory(
    file: File,
    analysis: FileAnalysis,
    optimization: OptimizationResult
  ): Promise<ValidationResult['checks']> {
    const checks: ValidationResult['checks'] = [];
    const content = optimization.optimizedContent;
    
    switch (analysis.category) {
      case 'page':
        if (typeof content === 'string') {
          // Validar estrutura HTML
          if (!analysis.characteristics.hasDoctype) {
            checks.push({
              name: 'HTML - DOCTYPE',
              status: 'warning',
              message: 'Página sem declaração DOCTYPE'
            });
          }
          
          if (!analysis.characteristics.hasHead) {
            checks.push({
              name: 'HTML - HEAD',
              status: 'warning',
              message: 'Página sem seção <head>'
            });
          }
          
          if (!analysis.characteristics.hasBody) {
            checks.push({
              name: 'HTML - BODY',
              status: 'error',
              message: 'Página sem seção <body>'
            });
          } else {
            checks.push({
              name: 'Estrutura HTML',
              status: 'valid',
              message: 'Estrutura HTML válida'
            });
          }
        }
        break;
        
      case 'script':
        if (typeof content === 'string') {
          if (analysis.characteristics.hasSyntaxErrors) {
            checks.push({
              name: 'Sintaxe JavaScript',
              status: 'error',
              message: 'Possíveis erros de sintaxe detectados'
            });
          } else {
            checks.push({
              name: 'Sintaxe JavaScript',
              status: 'valid',
              message: 'Sintaxe aparentemente válida'
            });
          }
        }
        break;
        
      case 'style':
        if (typeof content === 'string') {
          // Validação básica de CSS
          const braces = (content.match(/{/g) || []).length === (content.match(/}/g) || []).length;
          if (!braces) {
            checks.push({
              name: 'Sintaxe CSS',
              status: 'warning',
              message: 'Possível erro de sintaxe CSS (chaves desbalanceadas)'
            });
          } else {
            checks.push({
              name: 'Sintaxe CSS',
              status: 'valid',
              message: 'Sintaxe CSS aparentemente válida'
            });
          }
        }
        break;
        
      case 'data':
        if (typeof content === 'string') {
          try {
            JSON.parse(content);
            checks.push({
              name: 'JSON',
              status: 'valid',
              message: 'JSON válido'
            });
          } catch {
            checks.push({
              name: 'JSON',
              status: 'error',
              message: 'JSON inválido'
            });
          }
        }
        break;
        
      case 'image':
        if (analysis.characteristics.dimensions) {
          const { width, height } = analysis.characteristics.dimensions;
          if (width > 4000 || height > 4000) {
            checks.push({
              name: 'Dimensões',
              status: 'warning',
              message: `Imagem muito grande (${width}x${height}). Considere redimensionar.`
            });
          } else {
            checks.push({
              name: 'Dimensões',
              status: 'valid',
              message: `Dimensões OK (${width}x${height})`
            });
          }
        }
        break;
    }
    
    return checks;
  }
  
  private calculateQualityScore(
    checks: ValidationResult['checks'],
    analysis: FileAnalysis,
    optimization: OptimizationResult
  ): number {
    let score = 100;
    
    // Penalizar por erros e avisos
    checks.forEach(check => {
      if (check.status === 'error') score -= 15;
      if (check.status === 'warning') score -= 5;
    });
    
    // Bonificar por otimização
    if (optimization.optimized) {
      const reduction = 1 - optimization.compressionRatio;
      score += Math.min(reduction * 10, 10); // Até 10 pontos
    }
    
    // Bonificar por confiança na categoria
    score += (analysis.confidence - 0.5) * 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private generateSuggestions(
    analysis: FileAnalysis,
    optimization: OptimizationResult,
    suggestions: string[]
  ): void {
    // Sugestões baseadas em compressão
    if (optimization.compressionRatio > 0.9 && optimization.originalSize > 1024 * 100) {
      suggestions.push('Arquivo pode ser otimizado ainda mais');
    }
    
    // Sugestões baseadas em categoria
    if (analysis.category === 'page') {
      if (!analysis.characteristics.hasDoctype) {
        suggestions.push('Adicionar declaração <!DOCTYPE html>');
      }
      if (analysis.characteristics.externalResources && analysis.characteristics.externalResources.length > 0) {
        suggestions.push('Verificar recursos externos antes de publicar');
      }
    }
    
    if (analysis.category === 'image') {
      if (analysis.characteristics.dimensions) {
        const { width, height } = analysis.characteristics.dimensions;
        if (width > 2000 || height > 2000) {
          suggestions.push('Considere redimensionar imagens grandes para web');
        }
      }
    }
    
    // Sugestões de destino
    if (analysis.confidence < 0.7) {
      suggestions.push('Revisar pasta de destino sugerida');
    }
  }
  
  // ==========================================================================
  // PREVIEW
  // ==========================================================================
  
  async generatePreview(
    file: File,
    analysis: FileAnalysis,
    optimization: OptimizationResult
  ): Promise<PreviewData> {
    const content = optimization.optimizedContent;
    
    switch (analysis.category) {
      case 'page':
        return {
          type: 'html',
          content: typeof content === 'string' ? content : '',
          metadata: {
            hasDoctype: analysis.characteristics.hasDoctype,
            scripts: analysis.characteristics.scripts,
            styles: analysis.characteristics.styles
          }
        };
        
      case 'image':
        return {
          type: 'image',
          content: URL.createObjectURL(file),
          thumbnail: URL.createObjectURL(file),
          metadata: {
            dimensions: analysis.characteristics.dimensions,
            format: analysis.characteristics.format
          }
        };
        
      case 'data':
        if (typeof content === 'string') {
          try {
            const parsed = JSON.parse(content);
            return {
              type: 'json',
              content: JSON.stringify(parsed, null, 2),
              metadata: {
                keys: Object.keys(parsed),
                size: Object.keys(parsed).length
              }
            };
          } catch {}
        }
        return {
          type: 'text',
          content: typeof content === 'string' ? content : ''
        };
        
      case 'style':
      case 'script':
      case 'markdown':
      case 'document':
        return {
          type: 'text',
          content: typeof content === 'string' ? content.substring(0, 5000) : ''
        };
        
      default:
        return {
          type: 'none',
          content: 'Preview não disponível para este tipo de arquivo'
        };
    }
  }
  
  // ==========================================================================
  // PROCESSAMENTO COMPLETO
  // ==========================================================================
  
  async processFile(
    file: File,
    optimizationLevel: OptimizationLevel = 'medium'
  ): Promise<ProcessedFile> {
    const processed: ProcessedFile = {
      file,
      analysis: {} as FileAnalysis,
      optimization: {} as OptimizationResult,
      validation: {} as ValidationResult,
      preview: {} as PreviewData,
      suggestedPath: '/',
      suggestedName: file.name,
      status: 'analyzing',
      progress: 0
    };
    
    try {
      // 1. Análise
      processed.status = 'analyzing';
      processed.progress = 10;
      processed.analysis = await this.analyzeFile(file);
      processed.suggestedPath = processed.analysis.suggestedDestination;
      processed.progress = 30;
      
      // 2. Otimização
      processed.status = 'optimizing';
      processed.progress = 40;
      processed.optimization = await this.optimizeFile(file, processed.analysis, optimizationLevel);
      processed.progress = 60;
      
      // 3. Validação
      processed.status = 'validating';
      processed.progress = 70;
      processed.validation = await this.validateFile(file, processed.analysis, processed.optimization);
      processed.progress = 85;
      
      // 4. Preview
      processed.preview = await this.generatePreview(file, processed.analysis, processed.optimization);
      processed.progress = 100;
      
      // Status final
      processed.status = processed.validation.isValid ? 'ready' : 'error';
      
    } catch (error) {
      processed.status = 'error';
      processed.error = String(error);
    }
    
    return processed;
  }
  
  // ==========================================================================
  // UTILITÁRIOS
  // ==========================================================================
  
  private async readFileContent(file: File): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Detectar se é texto ou binário
      if (this.isTextFile(file)) {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      } else {
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      }
    });
  }
  
  private isTextFile(file: File): boolean {
    return file.type.startsWith('text/') ||
           file.type === 'application/json' ||
           file.type === 'application/javascript' ||
           ['.html', '.css', '.js', '.json', '.md', '.txt', '.xml', '.svg'].some(ext => 
             file.name.toLowerCase().endsWith(ext)
           );
  }
  
  private isTextContent(content: string | ArrayBuffer): boolean {
    return typeof content === 'string';
  }
  
  private getExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
  }
  
  private detectMimeType(fileName: string): string {
    const ext = this.getExtension(fileName);
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
  
  private getContentTypeDescription(category: FileCategory): string {
    const descriptions: Record<FileCategory, string> = {
      page: 'Página HTML',
      image: 'Imagem',
      style: 'Folha de Estilo',
      script: 'Script JavaScript',
      document: 'Documento',
      data: 'Dados Estruturados',
      markdown: 'Markdown',
      code: 'Código Fonte',
      unknown: 'Desconhecido'
    };
    return descriptions[category];
  }
  
  private hasMetadata(file: File, content: string | ArrayBuffer): boolean {
    if (file.type.startsWith('image/')) return true;
    if (file.type === 'application/pdf') return true;
    if (typeof content === 'string' && content.includes('<meta')) return true;
    return false;
  }
  
  private extractExternalResources(html: string): string[] {
    const resources: string[] = [];
    const urlPattern = /(href|src)=["'](https?:\/\/[^"']+)["']/g;
    let match;
    
    while ((match = urlPattern.exec(html)) !== null) {
      resources.push(match[2]);
    }
    
    return [...new Set(resources)];
  }
  
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
  private detectLanguage(fileName: string): string {
    const ext = this.getExtension(fileName);
    const languages: Record<string, string> = {
      '.js': 'JavaScript',
      '.jsx': 'React JSX',
      '.ts': 'TypeScript',
      '.tsx': 'React TSX',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.html': 'HTML',
      '.json': 'JSON',
      '.md': 'Markdown'
    };
    return languages[ext] || 'Unknown';
  }
  
  private isMinified(content: string): boolean {
    const lines = content.split('\n');
    const avgLineLength = content.length / lines.length;
    return avgLineLength > 200 || lines.length < 5;
  }
  
  private hasSyntaxErrors(content: string, category: FileCategory): boolean {
    // Validação básica de sintaxe
    if (category === 'script') {
      // Verifica parênteses, colchetes e chaves balanceados
      const open = (content.match(/[{[(]/g) || []).length;
      const close = (content.match(/[}\])]/g) || []).length;
      return open !== close;
    }
    return false;
  }
  
  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários
      .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um
      .replace(/\s*([{}:;,])\s*/g, '$1') // Remove espaços ao redor de caracteres especiais
      .trim();
  }
  
  private minifyJS(js: string): string {
    return js
      .replace(/\/\/.*$/gm, '') // Remove comentários de linha
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários de bloco
      .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um
      .replace(/\s*([{}();,:])\s*/g, '$1') // Remove espaços ao redor de caracteres especiais
      .trim();
  }
  
  private isAllowedExtension(ext: string): boolean {
    const allowed = [
      '.html', '.htm', '.css', '.js', '.json', '.txt', '.md',
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
      '.pdf', '.doc', '.docx'
    ];
    return allowed.includes(ext);
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const FileOptimizationService = new FileOptimizationServiceClass();
