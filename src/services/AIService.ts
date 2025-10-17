/**
 * AIService - Serviço centralizado para gerenciamento de APIs de IA
 * 
 * Funcionalidades:
 * - Configuração centralizada de credenciais
 * - Camada de abstração para diferentes provedores
 * - Autenticação e autorização
 * - Rate limiting e tratamento de erros
 * - Sistema modular e escalável
 */

import { SecurityService } from './SecurityService';
import { AuditService } from './AuditService';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type AIProviderType = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'cohere' 
  | 'huggingface'
  | 'azure-openai'
  | 'custom';

export type AuthMethod = 'api-key' | 'oauth' | 'client-credentials';

export interface AIProviderConfig {
  id: string;
  name: string;
  type: AIProviderType;
  enabled: boolean;
  authMethod: AuthMethod;
  credentials: {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    endpoint?: string;
    region?: string;
    organizationId?: string;
  };
  models: AIModelConfig[];
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerMinute?: number;
  };
  timeout: number; // em milissegundos
  retryConfig: {
    maxRetries: number;
    backoffMultiplier: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  displayName: string;
  provider: AIProviderType;
  capabilities: AICapability[];
  maxTokens: number;
  costPer1kTokens?: number;
  description?: string;
}

export type AICapability = 
  | 'text-completion' 
  | 'chat' 
  | 'code-generation'
  | 'translation'
  | 'summarization'
  | 'sentiment-analysis';

export interface AIRequest {
  providerId: string;
  modelId: string;
  prompt: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
  };
  context?: string;
  userId: string;
}

export interface AIResponse {
  success: boolean;
  providerId: string;
  modelId: string;
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  processingTime: number; // em milissegundos
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// ============================================================================
// PROVEDORES PRÉ-CONFIGURADOS
// ============================================================================

const PROVIDER_TEMPLATES: Partial<Record<AIProviderType, Omit<AIProviderConfig, 'id' | 'credentials' | 'createdAt' | 'updatedAt'>>> = {
  'openai': {
    name: 'OpenAI',
    type: 'openai',
    enabled: false,
    authMethod: 'api-key',
    models: [
      {
        id: 'gpt-4',
        name: 'gpt-4',
        displayName: 'GPT-4',
        provider: 'openai',
        capabilities: ['text-completion', 'chat', 'code-generation'],
        maxTokens: 8192,
        costPer1kTokens: 0.03,
        description: 'Modelo mais avançado da OpenAI'
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'gpt-3.5-turbo',
        displayName: 'GPT-3.5 Turbo',
        provider: 'openai',
        capabilities: ['text-completion', 'chat', 'code-generation'],
        maxTokens: 4096,
        costPer1kTokens: 0.002,
        description: 'Rápido e eficiente para a maioria dos casos'
      }
    ],
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerDay: 10000,
      tokensPerMinute: 90000
    },
    timeout: 30000,
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2
    }
  },
  'anthropic': {
    name: 'Anthropic (Claude)',
    type: 'anthropic',
    enabled: false,
    authMethod: 'api-key',
    models: [
      {
        id: 'claude-3-opus',
        name: 'claude-3-opus-20240229',
        displayName: 'Claude 3 Opus',
        provider: 'anthropic',
        capabilities: ['text-completion', 'chat', 'code-generation', 'summarization'],
        maxTokens: 200000,
        costPer1kTokens: 0.015,
        description: 'Modelo mais poderoso do Claude'
      },
      {
        id: 'claude-3-sonnet',
        name: 'claude-3-sonnet-20240229',
        displayName: 'Claude 3 Sonnet',
        provider: 'anthropic',
        capabilities: ['text-completion', 'chat', 'code-generation'],
        maxTokens: 200000,
        costPer1kTokens: 0.003,
        description: 'Equilíbrio entre performance e custo'
      }
    ],
    rateLimits: {
      requestsPerMinute: 50,
      requestsPerDay: 5000,
      tokensPerMinute: 40000
    },
    timeout: 30000,
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2
    }
  },
  'google': {
    name: 'Google AI (Gemini)',
    type: 'google',
    enabled: false,
    authMethod: 'api-key',
    models: [
      {
        id: 'gemini-pro',
        name: 'gemini-pro',
        displayName: 'Gemini Pro',
        provider: 'google',
        capabilities: ['text-completion', 'chat', 'code-generation'],
        maxTokens: 32000,
        costPer1kTokens: 0.00025,
        description: 'Modelo principal do Google AI'
      }
    ],
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerDay: 1500,
      tokensPerMinute: 32000
    },
    timeout: 30000,
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2
    }
  },
  'azure-openai': {
    name: 'Azure OpenAI',
    type: 'azure-openai',
    enabled: false,
    authMethod: 'api-key',
    models: [
      {
        id: 'gpt-4-azure',
        name: 'gpt-4',
        displayName: 'GPT-4 (Azure)',
        provider: 'azure-openai',
        capabilities: ['text-completion', 'chat', 'code-generation'],
        maxTokens: 8192,
        description: 'GPT-4 via Azure'
      }
    ],
    rateLimits: {
      requestsPerMinute: 120,
      requestsPerDay: 20000,
      tokensPerMinute: 120000
    },
    timeout: 30000,
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2
    }
  },
  'cohere': {
    name: 'Cohere',
    type: 'cohere',
    enabled: false,
    authMethod: 'api-key',
    models: [
      {
        id: 'command',
        name: 'command',
        displayName: 'Command',
        provider: 'cohere',
        capabilities: ['text-completion', 'chat', 'summarization'],
        maxTokens: 4096,
        description: 'Modelo principal do Cohere'
      }
    ],
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerDay: 10000
    },
    timeout: 30000,
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2
    }
  }
};

// ============================================================================
// CLASSE PRINCIPAL DO SERVIÇO
// ============================================================================

class AIServiceClass {
  private providers: Map<string, AIProviderConfig> = new Map();
  private rateLimitTracking: Map<string, RateLimitInfo> = new Map();
  private requestCache: Map<string, { response: AIResponse; timestamp: number }> = new Map();
  private readonly STORAGE_KEY = 'ai_providers_config';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.loadProviders();
  }

  // ==========================================================================
  // GERENCIAMENTO DE PROVEDORES
  // ==========================================================================

  /**
   * Carrega provedores do localStorage
   */
  private loadProviders(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const configs = JSON.parse(stored);
        this.providers = new Map(configs.map((c: AIProviderConfig) => [c.id, c]));
      }
    } catch (error) {
      console.error('Erro ao carregar provedores de IA:', error);
    }
  }

  /**
   * Salva provedores no localStorage
   */
  private saveProviders(): void {
    try {
      const configs = Array.from(this.providers.values());
      // Remover credenciais sensíveis antes de salvar em log
      const configsToLog = configs.map(c => ({
        ...c,
        credentials: { ...c.credentials, apiKey: c.credentials.apiKey ? '***' : undefined }
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
      
      AuditService.log({
        action: 'ai_providers_updated',
        userId: SecurityService.getCurrentUser()?.id || 'system',
        details: { count: configs.length },
        severity: 'info'
      });
    } catch (error) {
      console.error('Erro ao salvar provedores de IA:', error);
      throw new Error('Falha ao salvar configurações de IA');
    }
  }

  /**
   * Obtém todos os provedores configurados
   */
  getAllProviders(): AIProviderConfig[] {
    return Array.from(this.providers.values());
  }

  /**
   * Obtém provedores ativos
   */
  getActiveProviders(): AIProviderConfig[] {
    return this.getAllProviders().filter(p => p.enabled);
  }

  /**
   * Obtém provedor por ID
   */
  getProvider(id: string): AIProviderConfig | undefined {
    return this.providers.get(id);
  }

  /**
   * Adiciona ou atualiza um provedor
   */
  saveProvider(config: Partial<AIProviderConfig> & { type: AIProviderType }): AIProviderConfig {
    const id = config.id || `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const template = PROVIDER_TEMPLATES[config.type];
    
    const provider: AIProviderConfig = {
      id,
      name: config.name || template?.name || config.type,
      type: config.type,
      enabled: config.enabled ?? false,
      authMethod: config.authMethod || template?.authMethod || 'api-key',
      credentials: this.sanitizeCredentials(config.credentials || {}),
      models: config.models || template?.models || [],
      rateLimits: config.rateLimits || template?.rateLimits || {
        requestsPerMinute: 60,
        requestsPerDay: 1000
      },
      timeout: config.timeout || template?.timeout || 30000,
      retryConfig: config.retryConfig || template?.retryConfig || {
        maxRetries: 3,
        backoffMultiplier: 2
      },
      createdAt: config.createdAt || now,
      updatedAt: now
    };

    this.providers.set(id, provider);
    this.saveProviders();

    AuditService.log({
      action: 'ai_provider_configured',
      userId: SecurityService.getCurrentUser()?.id || 'system',
      details: { providerId: id, type: config.type },
      severity: 'medium'
    });

    return provider;
  }

  /**
   * Remove um provedor
   */
  deleteProvider(id: string): boolean {
    const deleted = this.providers.delete(id);
    if (deleted) {
      this.saveProviders();
      AuditService.log({
        action: 'ai_provider_deleted',
        userId: SecurityService.getCurrentUser()?.id || 'system',
        details: { providerId: id },
        severity: 'medium'
      });
    }
    return deleted;
  }

  /**
   * Obtém templates de provedores disponíveis
   */
  getProviderTemplates(): Array<{ type: AIProviderType; name: string; description: string }> {
    return [
      { type: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5 e outros modelos da OpenAI' },
      { type: 'anthropic', name: 'Anthropic (Claude)', description: 'Claude 3 Opus, Sonnet e Haiku' },
      { type: 'google', name: 'Google AI (Gemini)', description: 'Gemini Pro e outros modelos do Google' },
      { type: 'azure-openai', name: 'Azure OpenAI', description: 'Modelos OpenAI via Microsoft Azure' },
      { type: 'cohere', name: 'Cohere', description: 'Command e outros modelos do Cohere' },
      { type: 'huggingface', name: 'Hugging Face', description: 'Acesso a milhares de modelos open-source' },
      { type: 'custom', name: 'API Customizada', description: 'Configure sua própria API compatível' }
    ];
  }

  // ==========================================================================
  // REQUISIÇÕES E RESPOSTAS
  // ==========================================================================

  /**
   * Executa uma requisição para a API de IA
   */
  async executeRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // 1. Validação de permissões
      if (!this.checkPermission(request.userId)) {
        throw new Error('Usuário não autorizado a usar IA');
      }

      // 2. Obter provedor
      const provider = this.getProvider(request.providerId);
      if (!provider || !provider.enabled) {
        throw new Error('Provedor de IA não disponível');
      }

      // 3. Validar credenciais
      if (!this.validateCredentials(provider)) {
        throw new Error('Credenciais do provedor não configuradas corretamente');
      }

      // 4. Verificar rate limits
      this.checkRateLimit(provider);

      // 5. Verificar cache
      const cacheKey = this.getCacheKey(request);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // 6. Executar requisição
      const response = await this.performRequest(provider, request);

      // 7. Atualizar rate limit
      this.updateRateLimit(provider.id);

      // 8. Cache da resposta
      if (response.success) {
        this.cacheResponse(cacheKey, response);
      }

      // 9. Auditoria
      AuditService.log({
        action: 'ai_request_executed',
        userId: request.userId,
        details: {
          providerId: request.providerId,
          modelId: request.modelId,
          success: response.success,
          tokensUsed: response.usage?.totalTokens
        },
        severity: 'low'
      });

      return {
        ...response,
        processingTime: Date.now() - startTime
      };

    } catch (error: any) {
      const errorResponse: AIResponse = {
        success: false,
        providerId: request.providerId,
        modelId: request.modelId,
        content: '',
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'Erro desconhecido ao processar requisição',
          details: error
        },
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      };

      AuditService.log({
        action: 'ai_request_failed',
        userId: request.userId,
        details: {
          providerId: request.providerId,
          error: error.message
        },
        severity: 'high'
      });

      return errorResponse;
    }
  }

  /**
   * Executa a requisição HTTP para o provedor
   */
  private async performRequest(
    provider: AIProviderConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    const model = provider.models.find(m => m.id === request.modelId);
    if (!model) {
      throw new Error('Modelo não encontrado');
    }

    // Implementação específica por provedor
    switch (provider.type) {
      case 'openai':
        return await this.executeOpenAIRequest(provider, model, request);
      case 'anthropic':
        return await this.executeAnthropicRequest(provider, model, request);
      case 'google':
        return await this.executeGoogleRequest(provider, model, request);
      case 'azure-openai':
        return await this.executeAzureOpenAIRequest(provider, model, request);
      case 'cohere':
        return await this.executeCohereRequest(provider, model, request);
      case 'custom':
        return await this.executeCustomRequest(provider, model, request);
      default:
        throw new Error(`Provedor ${provider.type} não suportado`);
    }
  }

  /**
   * Implementação para OpenAI
   */
  private async executeOpenAIRequest(
    provider: AIProviderConfig,
    model: AIModelConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    const endpoint = provider.credentials.endpoint || 'https://api.openai.com/v1/chat/completions';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.credentials.apiKey}`
    };

    if (provider.credentials.organizationId) {
      headers['OpenAI-Organization'] = provider.credentials.organizationId;
    }

    const body = {
      model: model.name,
      messages: [
        ...(request.context ? [{ role: 'system', content: request.context }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.options?.temperature ?? 0.7,
      max_tokens: request.options?.maxTokens ?? 1000,
      top_p: request.options?.topP,
      frequency_penalty: request.options?.frequencyPenalty,
      presence_penalty: request.options?.presencePenalty,
      stop: request.options?.stopSequences
    };

    try {
      const response = await this.fetchWithTimeout(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      }, provider.timeout);

      const data = await response.json();

      if (!response.ok) {
        throw {
          code: data.error?.code || 'API_ERROR',
          message: data.error?.message || 'Erro na API da OpenAI',
          details: data
        };
      }

      return {
        success: true,
        providerId: provider.id,
        modelId: model.id,
        content: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        finishReason: data.choices[0]?.finish_reason,
        timestamp: new Date().toISOString(),
        processingTime: 0
      };
    } catch (error: any) {
      throw {
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'Erro de conexão com OpenAI'
      };
    }
  }

  /**
   * Implementação para Anthropic (Claude)
   */
  private async executeAnthropicRequest(
    provider: AIProviderConfig,
    model: AIModelConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    const endpoint = provider.credentials.endpoint || 'https://api.anthropic.com/v1/messages';
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': provider.credentials.apiKey || '',
      'anthropic-version': '2023-06-01'
    };

    const body = {
      model: model.name,
      messages: [
        { role: 'user', content: request.prompt }
      ],
      max_tokens: request.options?.maxTokens ?? 1000,
      temperature: request.options?.temperature ?? 0.7,
      system: request.context
    };

    try {
      const response = await this.fetchWithTimeout(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      }, provider.timeout);

      const data = await response.json();

      if (!response.ok) {
        throw {
          code: data.error?.type || 'API_ERROR',
          message: data.error?.message || 'Erro na API da Anthropic',
          details: data
        };
      }

      return {
        success: true,
        providerId: provider.id,
        modelId: model.id,
        content: data.content[0]?.text || '',
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        },
        finishReason: data.stop_reason,
        timestamp: new Date().toISOString(),
        processingTime: 0
      };
    } catch (error: any) {
      throw {
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'Erro de conexão com Anthropic'
      };
    }
  }

  /**
   * Implementação para Google AI (Gemini)
   */
  private async executeGoogleRequest(
    provider: AIProviderConfig,
    model: AIModelConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    const endpoint = provider.credentials.endpoint || 
      `https://generativelanguage.googleapis.com/v1/models/${model.name}:generateContent?key=${provider.credentials.apiKey}`;
    
    const body = {
      contents: [
        {
          parts: [
            { text: request.context ? `${request.context}\n\n${request.prompt}` : request.prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: request.options?.temperature ?? 0.7,
        maxOutputTokens: request.options?.maxTokens ?? 1000,
        topP: request.options?.topP
      }
    };

    try {
      const response = await this.fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }, provider.timeout);

      const data = await response.json();

      if (!response.ok) {
        throw {
          code: data.error?.code || 'API_ERROR',
          message: data.error?.message || 'Erro na API do Google',
          details: data
        };
      }

      return {
        success: true,
        providerId: provider.id,
        modelId: model.id,
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0
        },
        finishReason: data.candidates?.[0]?.finishReason,
        timestamp: new Date().toISOString(),
        processingTime: 0
      };
    } catch (error: any) {
      throw {
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'Erro de conexão com Google AI'
      };
    }
  }

  /**
   * Implementação para Azure OpenAI
   */
  private async executeAzureOpenAIRequest(
    provider: AIProviderConfig,
    model: AIModelConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    if (!provider.credentials.endpoint) {
      throw new Error('Endpoint do Azure não configurado');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'api-key': provider.credentials.apiKey || ''
    };

    const body = {
      messages: [
        ...(request.context ? [{ role: 'system', content: request.context }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.options?.temperature ?? 0.7,
      max_tokens: request.options?.maxTokens ?? 1000
    };

    try {
      const response = await this.fetchWithTimeout(provider.credentials.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      }, provider.timeout);

      const data = await response.json();

      if (!response.ok) {
        throw {
          code: data.error?.code || 'API_ERROR',
          message: data.error?.message || 'Erro na API do Azure OpenAI',
          details: data
        };
      }

      return {
        success: true,
        providerId: provider.id,
        modelId: model.id,
        content: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        finishReason: data.choices[0]?.finish_reason,
        timestamp: new Date().toISOString(),
        processingTime: 0
      };
    } catch (error: any) {
      throw {
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'Erro de conexão com Azure OpenAI'
      };
    }
  }

  /**
   * Implementação para Cohere
   */
  private async executeCohereRequest(
    provider: AIProviderConfig,
    model: AIModelConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    const endpoint = provider.credentials.endpoint || 'https://api.cohere.ai/v1/generate';
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.credentials.apiKey}`
    };

    const body = {
      model: model.name,
      prompt: request.context ? `${request.context}\n\n${request.prompt}` : request.prompt,
      max_tokens: request.options?.maxTokens ?? 1000,
      temperature: request.options?.temperature ?? 0.7,
      stop_sequences: request.options?.stopSequences
    };

    try {
      const response = await this.fetchWithTimeout(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      }, provider.timeout);

      const data = await response.json();

      if (!response.ok) {
        throw {
          code: 'API_ERROR',
          message: data.message || 'Erro na API do Cohere',
          details: data
        };
      }

      return {
        success: true,
        providerId: provider.id,
        modelId: model.id,
        content: data.generations?.[0]?.text || '',
        finishReason: data.generations?.[0]?.finish_reason,
        timestamp: new Date().toISOString(),
        processingTime: 0
      };
    } catch (error: any) {
      throw {
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'Erro de conexão com Cohere'
      };
    }
  }

  /**
   * Implementação para APIs customizadas
   */
  private async executeCustomRequest(
    provider: AIProviderConfig,
    model: AIModelConfig,
    request: AIRequest
  ): Promise<AIResponse> {
    if (!provider.credentials.endpoint) {
      throw new Error('Endpoint customizado não configurado');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (provider.credentials.apiKey) {
      headers['Authorization'] = `Bearer ${provider.credentials.apiKey}`;
    }

    const body = {
      model: model.name,
      prompt: request.prompt,
      context: request.context,
      options: request.options
    };

    try {
      const response = await this.fetchWithTimeout(provider.credentials.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      }, provider.timeout);

      const data = await response.json();

      if (!response.ok) {
        throw {
          code: 'API_ERROR',
          message: data.error || 'Erro na API customizada',
          details: data
        };
      }

      return {
        success: true,
        providerId: provider.id,
        modelId: model.id,
        content: data.content || data.text || data.response || '',
        usage: data.usage,
        timestamp: new Date().toISOString(),
        processingTime: 0
      };
    } catch (error: any) {
      throw {
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'Erro de conexão com API customizada'
      };
    }
  }

  // ==========================================================================
  // UTILITÁRIOS
  // ==========================================================================

  /**
   * Fetch com timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw { code: 'TIMEOUT', message: 'Requisição excedeu o tempo limite' };
      }
      throw error;
    }
  }

  /**
   * Sanitiza credenciais
   */
  private sanitizeCredentials(credentials: any): AIProviderConfig['credentials'] {
    return {
      apiKey: credentials.apiKey?.trim(),
      clientId: credentials.clientId?.trim(),
      clientSecret: credentials.clientSecret?.trim(),
      endpoint: credentials.endpoint?.trim(),
      region: credentials.region?.trim(),
      organizationId: credentials.organizationId?.trim()
    };
  }

  /**
   * Valida credenciais de um provedor
   */
  private validateCredentials(provider: AIProviderConfig): boolean {
    switch (provider.authMethod) {
      case 'api-key':
        return !!provider.credentials.apiKey;
      case 'oauth':
        return !!provider.credentials.clientId && !!provider.credentials.clientSecret;
      case 'client-credentials':
        return !!provider.credentials.clientId && !!provider.credentials.clientSecret;
      default:
        return false;
    }
  }

  /**
   * Verifica permissão do usuário
   */
  private checkPermission(userId: string): boolean {
    const user = SecurityService.getCurrentUser();
    if (!user || user.id !== userId) {
      return false;
    }
    // Verificar se usuário tem permissão para usar IA
    // Por enquanto, qualquer usuário autenticado pode usar
    return true;
  }

  /**
   * Verifica rate limit
   */
  private checkRateLimit(provider: AIProviderConfig): void {
    const key = `ratelimit_${provider.id}`;
    const now = Date.now();
    const info = this.rateLimitTracking.get(key);

    if (info) {
      if (now < info.resetTime) {
        if (info.count >= provider.rateLimits.requestsPerMinute) {
          throw {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Limite de requisições por minuto excedido',
            details: { resetTime: info.resetTime }
          };
        }
      } else {
        // Reset do contador
        this.rateLimitTracking.set(key, {
          count: 0,
          resetTime: now + 60000 // 1 minuto
        });
      }
    } else {
      this.rateLimitTracking.set(key, {
        count: 0,
        resetTime: now + 60000
      });
    }
  }

  /**
   * Atualiza contador de rate limit
   */
  private updateRateLimit(providerId: string): void {
    const key = `ratelimit_${providerId}`;
    const info = this.rateLimitTracking.get(key);
    if (info) {
      info.count++;
    }
  }

  /**
   * Gera chave de cache
   */
  private getCacheKey(request: AIRequest): string {
    const data = {
      providerId: request.providerId,
      modelId: request.modelId,
      prompt: request.prompt,
      context: request.context,
      options: request.options
    };
    return btoa(JSON.stringify(data));
  }

  /**
   * Obtém resposta do cache
   */
  private getFromCache(key: string): AIResponse | null {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.response;
    }
    return null;
  }

  /**
   * Armazena resposta em cache
   */
  private cacheResponse(key: string, response: AIResponse): void {
    this.requestCache.set(key, {
      response,
      timestamp: Date.now()
    });

    // Limpar cache antigo
    if (this.requestCache.size > 100) {
      const entries = Array.from(this.requestCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 50).forEach(([k]) => this.requestCache.delete(k));
    }
  }

  /**
   * Testa conexão com um provedor
   */
  async testProvider(providerId: string): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const provider = this.getProvider(providerId);
      if (!provider) {
        return { success: false, message: 'Provedor não encontrado' };
      }

      if (!this.validateCredentials(provider)) {
        return { success: false, message: 'Credenciais inválidas ou incompletas' };
      }

      const testRequest: AIRequest = {
        providerId,
        modelId: provider.models[0]?.id || '',
        prompt: 'Test connection',
        options: { maxTokens: 10 },
        userId: SecurityService.getCurrentUser()?.id || 'system'
      };

      const response = await this.executeRequest(testRequest);

      if (response.success) {
        return { success: true, message: 'Conexão estabelecida com sucesso!' };
      } else {
        return { 
          success: false, 
          message: response.error?.message || 'Falha no teste de conexão',
          details: response.error?.details
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Erro ao testar provedor',
        details: error
      };
    }
  }

  /**
   * Limpa cache de respostas
   */
  clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Obtém estatísticas de uso
   */
  getUsageStats(): {
    totalProviders: number;
    activeProviders: number;
    totalModels: number;
    cacheSize: number;
  } {
    return {
      totalProviders: this.providers.size,
      activeProviders: this.getActiveProviders().length,
      totalModels: Array.from(this.providers.values()).reduce((sum, p) => sum + p.models.length, 0),
      cacheSize: this.requestCache.size
    };
  }
}

// Exportar instância singleton
export const AIService = new AIServiceClass();
