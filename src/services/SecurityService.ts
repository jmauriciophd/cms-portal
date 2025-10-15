/**
 * SERVIÇO DE SEGURANÇA
 * 
 * Sistema completo de validação, sanitização e proteção
 * contra ataques comuns (XSS, SQL Injection, etc)
 */

import DOMPurify from 'dompurify';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: any;
}

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  blocked: boolean;
}

export class SecurityService {
  private static RATE_LIMIT_STORAGE = 'security-rate-limits';
  private static BLOCKED_IPS_STORAGE = 'security-blocked-ips';

  /**
   * Sanitiza string para prevenir XSS
   */
  static sanitizeString(input: string): string {
    if (!input) return '';

    // Remove caracteres perigosos
    let sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    // Usa DOMPurify se disponível (em ambiente browser)
    if (typeof window !== 'undefined' && DOMPurify) {
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'title']
      });
    }

    return sanitized.trim();
  }

  /**
   * Sanitiza HTML permitindo apenas tags seguras
   */
  static sanitizeHTML(html: string, allowedTags?: string[]): string {
    if (!html) return '';

    const defaultAllowedTags = [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote', 'code', 'pre',
      'div', 'span'
    ];

    if (typeof window !== 'undefined' && DOMPurify) {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: allowedTags || defaultAllowedTags,
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
        ALLOW_DATA_ATTR: false
      });
    }

    // Fallback: remove scripts e iframes
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Valida email
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email é obrigatório');
      return { valid: false, errors };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email inválido');
    }

    // Previne SQL injection em email
    if (email.includes("'") || email.includes('"') || email.includes(';')) {
      errors.push('Email contém caracteres inválidos');
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: this.sanitizeString(email)
    };
  }

  /**
   * Valida senha
   */
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Senha é obrigatória');
      return { valid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Senha deve ter no mínimo 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida slug/URL
   */
  static validateSlug(slug: string): ValidationResult {
    const errors: string[] = [];

    if (!slug) {
      errors.push('Slug é obrigatório');
      return { valid: false, errors };
    }

    // Apenas letras minúsculas, números e hífens
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      errors.push('Slug deve conter apenas letras minúsculas, números e hífens');
    }

    // Não pode começar ou terminar com hífen
    if (slug.startsWith('-') || slug.endsWith('-')) {
      errors.push('Slug não pode começar ou terminar com hífen');
    }

    // Tamanho razoável
    if (slug.length > 100) {
      errors.push('Slug muito longo (máximo 100 caracteres)');
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    };
  }

  /**
   * Valida nome de arquivo
   */
  static validateFileName(fileName: string): ValidationResult {
    const errors: string[] = [];

    if (!fileName) {
      errors.push('Nome do arquivo é obrigatório');
      return { valid: false, errors };
    }

    // Extensões perigosas
    const dangerousExtensions = [
      'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js',
      'jar', 'php', 'asp', 'aspx', 'jsp', 'sh', 'bash', 'ps1'
    ];

    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext && dangerousExtensions.includes(ext)) {
      errors.push('Extensão de arquivo não permitida por segurança');
    }

    // Caracteres perigosos
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      errors.push('Nome do arquivo contém caracteres inválidos');
    }

    // Previne path traversal
    if (fileName.includes('..')) {
      errors.push('Path traversal detectado');
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: fileName.replace(/[^\w.-]/g, '_')
    };
  }

  /**
   * Valida JSON
   */
  static validateJSON(jsonString: string): ValidationResult {
    const errors: string[] = [];

    if (!jsonString) {
      errors.push('JSON é obrigatório');
      return { valid: false, errors };
    }

    try {
      const parsed = JSON.parse(jsonString);
      
      // Verifica tamanho (previne DoS)
      if (jsonString.length > 1024 * 1024) { // 1MB
        errors.push('JSON muito grande (máximo 1MB)');
      }

      return {
        valid: errors.length === 0,
        errors,
        sanitized: parsed
      };
    } catch (error: any) {
      errors.push(`JSON inválido: ${error.message}`);
      return { valid: false, errors };
    }
  }

  /**
   * Previne SQL Injection (para queries construídas)
   */
  static escapeSQLString(input: string): string {
    if (!input) return '';

    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/xp_/gi, '')
      .replace(/exec/gi, '')
      .replace(/execute/gi, '')
      .replace(/drop/gi, '')
      .replace(/delete/gi, '')
      .replace(/truncate/gi, '');
  }

  /**
   * Rate Limiting - Verifica se ação é permitida
   */
  static checkRateLimit(
    identifier: string, // user ID ou IP
    action: string,
    config: RateLimitConfig
  ): RateLimitStatus {
    const key = `${identifier}:${action}`;
    const now = Date.now();

    // Verifica se está bloqueado
    const blocked = this.isBlocked(identifier);
    if (blocked.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: blocked.resetAt,
        blocked: true
      };
    }

    // Obtém histórico de tentativas
    const rateLimits = this.getRateLimits();
    const record = rateLimits[key] || { attempts: [], firstAttempt: now };

    // Remove tentativas antigas (fora da janela)
    record.attempts = record.attempts.filter(
      (timestamp: number) => now - timestamp < config.windowMs
    );

    // Verifica se excedeu limite
    if (record.attempts.length >= config.maxAttempts) {
      // Bloquear se configurado
      if (config.blockDurationMs) {
        this.blockIdentifier(identifier, config.blockDurationMs);
      }

      const oldestAttempt = Math.min(...record.attempts);
      const resetAt = new Date(oldestAttempt + config.windowMs);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
        blocked: false
      };
    }

    // Registra nova tentativa
    record.attempts.push(now);
    rateLimits[key] = record;
    localStorage.setItem(this.RATE_LIMIT_STORAGE, JSON.stringify(rateLimits));

    const resetAt = new Date(record.attempts[0] + config.windowMs);

    return {
      allowed: true,
      remaining: config.maxAttempts - record.attempts.length,
      resetAt,
      blocked: false
    };
  }

  /**
   * Bloqueia identifier (IP ou user)
   */
  private static blockIdentifier(identifier: string, durationMs: number): void {
    const blocked = this.getBlockedIdentifiers();
    blocked[identifier] = Date.now() + durationMs;
    localStorage.setItem(this.BLOCKED_IPS_STORAGE, JSON.stringify(blocked));
  }

  /**
   * Verifica se identifier está bloqueado
   */
  private static isBlocked(identifier: string): { blocked: boolean; resetAt: Date } {
    const blocked = this.getBlockedIdentifiers();
    const blockUntil = blocked[identifier];

    if (!blockUntil) {
      return { blocked: false, resetAt: new Date() };
    }

    const now = Date.now();
    if (now < blockUntil) {
      return { blocked: true, resetAt: new Date(blockUntil) };
    }

    // Desbloqueou, remover
    delete blocked[identifier];
    localStorage.setItem(this.BLOCKED_IPS_STORAGE, JSON.stringify(blocked));

    return { blocked: false, resetAt: new Date() };
  }

  /**
   * Desbloqueia identifier manualmente (admin)
   */
  static unblockIdentifier(identifier: string): void {
    const blocked = this.getBlockedIdentifiers();
    delete blocked[identifier];
    localStorage.setItem(this.BLOCKED_IPS_STORAGE, JSON.stringify(blocked));
  }

  /**
   * Obtém todos os identifiers bloqueados
   */
  static getBlockedIdentifiers(): Record<string, number> {
    const stored = localStorage.getItem(this.BLOCKED_IPS_STORAGE);
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Obtém rate limits
   */
  private static getRateLimits(): any {
    const stored = localStorage.getItem(this.RATE_LIMIT_STORAGE);
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Limpa rate limits expirados
   */
  static cleanupRateLimits(): void {
    const rateLimits = this.getRateLimits();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    Object.keys(rateLimits).forEach(key => {
      const record = rateLimits[key];
      if (record.firstAttempt && now - record.firstAttempt > maxAge) {
        delete rateLimits[key];
      }
    });

    localStorage.setItem(this.RATE_LIMIT_STORAGE, JSON.stringify(rateLimits));
  }

  /**
   * Hash de senha (SHA-256)
   */
  static async hashPassword(password: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      // Fallback simples (não usar em produção real!)
      return btoa(password);
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica força da senha
   */
  static getPasswordStrength(password: string): {
    score: number;
    label: 'Muito Fraca' | 'Fraca' | 'Média' | 'Forte' | 'Muito Forte';
    suggestions: string[];
  } {
    let score = 0;
    const suggestions: string[] = [];

    // Tamanho
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (password.length < 8) suggestions.push('Use pelo menos 8 caracteres');

    // Complexidade
    if (/[a-z]/.test(password)) score++;
    else suggestions.push('Adicione letras minúsculas');

    if (/[A-Z]/.test(password)) score++;
    else suggestions.push('Adicione letras maiúsculas');

    if (/[0-9]/.test(password)) score++;
    else suggestions.push('Adicione números');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else suggestions.push('Adicione caracteres especiais');

    // Não usar palavras comuns
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.some(p => password.toLowerCase().includes(p))) {
      score -= 2;
      suggestions.push('Evite palavras comuns');
    }

    const labels: Array<'Muito Fraca' | 'Fraca' | 'Média' | 'Forte' | 'Muito Forte'> = [
      'Muito Fraca',
      'Muito Fraca',
      'Fraca',
      'Média',
      'Forte',
      'Forte',
      'Muito Forte',
      'Muito Forte'
    ];

    return {
      score: Math.max(0, Math.min(score, 7)),
      label: labels[Math.max(0, Math.min(score, 7))],
      suggestions
    };
  }

  /**
   * Gera token aleatório seguro
   */
  static generateSecureToken(length: number = 32): string {
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Fallback
    return Array.from({ length }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  /**
   * Valida objeto de forma recursiva
   */
  static validateObject(obj: any, schema: any): ValidationResult {
    const errors: string[] = [];

    const validate = (data: any, rules: any, path: string = ''): void => {
      Object.keys(rules).forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        const rule = rules[key];
        const value = data[key];

        // Obrigatório
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push(`${fullPath} é obrigatório`);
          return;
        }

        if (value === undefined || value === null) return;

        // Tipo
        if (rule.type && typeof value !== rule.type) {
          errors.push(`${fullPath} deve ser do tipo ${rule.type}`);
        }

        // Min/Max (strings e números)
        if (rule.min !== undefined) {
          if (typeof value === 'string' && value.length < rule.min) {
            errors.push(`${fullPath} deve ter no mínimo ${rule.min} caracteres`);
          }
          if (typeof value === 'number' && value < rule.min) {
            errors.push(`${fullPath} deve ser no mínimo ${rule.min}`);
          }
        }

        if (rule.max !== undefined) {
          if (typeof value === 'string' && value.length > rule.max) {
            errors.push(`${fullPath} deve ter no máximo ${rule.max} caracteres`);
          }
          if (typeof value === 'number' && value > rule.max) {
            errors.push(`${fullPath} deve ser no máximo ${rule.max}`);
          }
        }

        // Pattern (regex)
        if (rule.pattern && typeof value === 'string') {
          if (!rule.pattern.test(value)) {
            errors.push(`${fullPath} não corresponde ao padrão esperado`);
          }
        }

        // Validação customizada
        if (rule.validate && typeof rule.validate === 'function') {
          const result = rule.validate(value);
          if (!result.valid) {
            errors.push(...result.errors.map((e: string) => `${fullPath}: ${e}`));
          }
        }

        // Objeto aninhado
        if (rule.properties && typeof value === 'object') {
          validate(value, rule.properties, fullPath);
        }
      });
    };

    validate(obj, schema);

    return {
      valid: errors.length === 0,
      errors,
      sanitized: obj
    };
  }

  /**
   * Previne clickjacking
   */
  static preventClickjacking(): void {
    if (typeof window !== 'undefined') {
      // Adiciona X-Frame-Options via meta tag
      const meta = document.createElement('meta');
      meta.httpEquiv = 'X-Frame-Options';
      meta.content = 'DENY';
      document.head.appendChild(meta);

      // Previne embedding
      if (window.top !== window.self) {
        window.top!.location = window.self.location;
      }
    }
  }

  /**
   * Estatísticas de segurança
   */
  static getSecurityStats(): {
    blockedIdentifiers: number;
    rateLimitRecords: number;
    oldestRateLimit: Date | null;
  } {
    const blocked = this.getBlockedIdentifiers();
    const rateLimits = this.getRateLimits();

    const records = Object.values(rateLimits);
    const oldestTimestamp = records.length > 0
      ? Math.min(...records.map((r: any) => r.firstAttempt))
      : null;

    return {
      blockedIdentifiers: Object.keys(blocked).length,
      rateLimitRecords: Object.keys(rateLimits).length,
      oldestRateLimit: oldestTimestamp ? new Date(oldestTimestamp) : null
    };
  }
}
