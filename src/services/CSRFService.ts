/**
 * SERVIÇO DE PROTEÇÃO CSRF
 * 
 * Sistema de tokens CSRF para prevenir ataques
 * Cross-Site Request Forgery
 */

import { SecurityService } from './SecurityService';

export interface CSRFToken {
  token: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  formId?: string;
}

export class CSRFService {
  private static STORAGE_KEY = 'csrf-tokens';
  private static TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hora
  private static HEADER_NAME = 'X-CSRF-Token';

  /**
   * Gera um novo token CSRF
   */
  static generateToken(formId?: string): CSRFToken {
    const token = SecurityService.generateSecureToken(64);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.TOKEN_EXPIRY_MS);

    const csrfToken: CSRFToken = {
      token,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      used: false,
      formId
    };

    this.saveToken(csrfToken);
    this.cleanupExpiredTokens();

    return csrfToken;
  }

  /**
   * Valida um token CSRF
   */
  static validateToken(token: string, formId?: string): boolean {
    const tokens = this.getAllTokens();
    const csrfToken = tokens.find(t => t.token === token);

    if (!csrfToken) {
      console.warn('CSRF token not found');
      return false;
    }

    // Verifica se já foi usado (prevenção de replay attack)
    if (csrfToken.used) {
      console.warn('CSRF token already used');
      return false;
    }

    // Verifica se expirou
    if (new Date(csrfToken.expiresAt) < new Date()) {
      console.warn('CSRF token expired');
      this.removeToken(token);
      return false;
    }

    // Verifica form ID se fornecido
    if (formId && csrfToken.formId !== formId) {
      console.warn('CSRF token form ID mismatch');
      return false;
    }

    // Marca como usado
    csrfToken.used = true;
    this.updateToken(csrfToken);

    return true;
  }

  /**
   * Salva token
   */
  private static saveToken(token: CSRFToken): void {
    const tokens = this.getAllTokens();
    tokens.push(token);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
  }

  /**
   * Atualiza token
   */
  private static updateToken(token: CSRFToken): void {
    const tokens = this.getAllTokens();
    const index = tokens.findIndex(t => t.token === token.token);
    if (index >= 0) {
      tokens[index] = token;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
    }
  }

  /**
   * Remove token
   */
  private static removeToken(token: string): void {
    const tokens = this.getAllTokens();
    const filtered = tokens.filter(t => t.token !== token);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Obtém todos os tokens
   */
  private static getAllTokens(): CSRFToken[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Limpa tokens expirados
   */
  static cleanupExpiredTokens(): void {
    const tokens = this.getAllTokens();
    const now = new Date();
    const valid = tokens.filter(t => new Date(t.expiresAt) >= now && !t.used);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(valid));
  }

  /**
   * Gera HTML input hidden com token
   */
  static generateTokenInput(formId?: string): string {
    const csrfToken = this.generateToken(formId);
    return `<input type="hidden" name="_csrf" value="${csrfToken.token}" />`;
  }

  /**
   * Obtém token do form
   */
  static getTokenFromForm(form: HTMLFormElement): string | null {
    const input = form.querySelector('input[name="_csrf"]') as HTMLInputElement;
    return input ? input.value : null;
  }

  /**
   * Adiciona token ao header de requisição
   */
  static addTokenToHeaders(headers: Record<string, string>, formId?: string): Record<string, string> {
    const csrfToken = this.generateToken(formId);
    return {
      ...headers,
      [this.HEADER_NAME]: csrfToken.token
    };
  }

  /**
   * Valida token do header
   */
  static validateTokenFromHeader(headers: Record<string, string>, formId?: string): boolean {
    const token = headers[this.HEADER_NAME] || headers[this.HEADER_NAME.toLowerCase()];
    if (!token) {
      console.warn('CSRF token missing from headers');
      return false;
    }
    return this.validateToken(token, formId);
  }

  /**
   * Middleware para validação de requisições
   */
  static validateRequest(request: {
    method: string;
    headers?: Record<string, string>;
    body?: any;
  }): boolean {
    // GET requests não precisam de CSRF
    if (request.method === 'GET') {
      return true;
    }

    // Verifica header
    if (request.headers) {
      const token = request.headers[this.HEADER_NAME] || 
                   request.headers[this.HEADER_NAME.toLowerCase()];
      if (token) {
        return this.validateToken(token);
      }
    }

    // Verifica body
    if (request.body && request.body._csrf) {
      return this.validateToken(request.body._csrf);
    }

    console.warn('CSRF token not found in request');
    return false;
  }

  /**
   * Obtém estatísticas de tokens
   */
  static getStats(): {
    total: number;
    active: number;
    expired: number;
    used: number;
  } {
    const tokens = this.getAllTokens();
    const now = new Date();

    return {
      total: tokens.length,
      active: tokens.filter(t => !t.used && new Date(t.expiresAt) >= now).length,
      expired: tokens.filter(t => new Date(t.expiresAt) < now).length,
      used: tokens.filter(t => t.used).length
    };
  }
}
