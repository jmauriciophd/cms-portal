/**
 * AIProviders - Definições e constantes para provedores de IA
 */

import type { AIProviderType, AICapability } from '../../services/AIService';

// ============================================================================
// ÍCONES E CORES DOS PROVEDORES
// ============================================================================

export const PROVIDER_ICONS: Record<AIProviderType, string> = {
  'openai': '🤖',
  'anthropic': '🧠',
  'google': '🔍',
  'cohere': '💬',
  'huggingface': '🤗',
  'azure-openai': '☁️',
  'custom': '⚙️'
};

export const PROVIDER_COLORS: Record<AIProviderType, { bg: string; text: string; border: string }> = {
  'openai': {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  'anthropic': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  'google': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  'cohere': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  'huggingface': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  'azure-openai': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200'
  },
  'custom': {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200'
  }
};

// ============================================================================
// CAPACIDADES E DESCRIÇÕES
// ============================================================================

export const CAPABILITY_INFO: Record<AICapability, { label: string; icon: string; description: string }> = {
  'text-completion': {
    label: 'Completar Texto',
    icon: '✍️',
    description: 'Completar e continuar textos'
  },
  'chat': {
    label: 'Chat',
    icon: '💬',
    description: 'Conversação interativa'
  },
  'code-generation': {
    label: 'Gerar Código',
    icon: '💻',
    description: 'Geração de código de programação'
  },
  'translation': {
    label: 'Tradução',
    icon: '🌐',
    description: 'Tradução entre idiomas'
  },
  'summarization': {
    label: 'Resumo',
    icon: '📝',
    description: 'Resumir textos longos'
  },
  'sentiment-analysis': {
    label: 'Análise de Sentimento',
    icon: '😊',
    description: 'Analisar tom e sentimento'
  }
};

// ============================================================================
// TEMPLATES DE PROMPTS CONTEXTUAIS
// ============================================================================

export const CONTEXT_TEMPLATES = {
  'blog-post': {
    name: 'Post de Blog',
    context: 'Você é um escritor de blog profissional. Crie conteúdo envolvente, informativo e otimizado para SEO.',
    icon: '📰'
  },
  'news-article': {
    name: 'Artigo de Notícias',
    context: 'Você é um jornalista profissional. Escreva de forma objetiva, clara e imparcial, seguindo os princípios do jornalismo.',
    icon: '📰'
  },
  'marketing-copy': {
    name: 'Copy de Marketing',
    context: 'Você é um copywriter de marketing. Crie textos persuasivos que convertem, com foco em benefícios e chamadas para ação.',
    icon: '📣'
  },
  'technical-doc': {
    name: 'Documentação Técnica',
    context: 'Você é um redator técnico. Escreva documentação clara, precisa e bem estruturada para desenvolvedores.',
    icon: '📖'
  },
  'product-description': {
    name: 'Descrição de Produto',
    context: 'Você é um especialista em e-commerce. Crie descrições atraentes que destacam características e benefícios dos produtos.',
    icon: '🛍️'
  },
  'social-media': {
    name: 'Redes Sociais',
    context: 'Você é um gestor de redes sociais. Crie conteúdo curto, engajador e adequado para plataformas sociais.',
    icon: '📱'
  },
  'email': {
    name: 'Email Profissional',
    context: 'Você é um assistente de comunicação profissional. Escreva emails claros, cordiais e eficazes.',
    icon: '✉️'
  },
  'creative-writing': {
    name: 'Escrita Criativa',
    context: 'Você é um escritor criativo. Use sua imaginação para criar histórias cativantes e descrições vívidas.',
    icon: '✨'
  }
};

// ============================================================================
// SUGESTÕES DE AÇÕES RÁPIDAS
// ============================================================================

export const QUICK_ACTIONS = [
  {
    id: 'improve',
    label: 'Melhorar Texto',
    icon: '✨',
    prompt: 'Melhore o seguinte texto, tornando-o mais claro, conciso e profissional:'
  },
  {
    id: 'expand',
    label: 'Expandir',
    icon: '📝',
    prompt: 'Expanda o seguinte texto com mais detalhes e informações relevantes:'
  },
  {
    id: 'summarize',
    label: 'Resumir',
    icon: '📋',
    prompt: 'Resuma o seguinte texto de forma clara e concisa:'
  },
  {
    id: 'simplify',
    label: 'Simplificar',
    icon: '💡',
    prompt: 'Simplifique o seguinte texto, tornando-o mais fácil de entender:'
  },
  {
    id: 'formalize',
    label: 'Formalizar',
    icon: '👔',
    prompt: 'Reescreva o seguinte texto em um tom mais formal e profissional:'
  },
  {
    id: 'casual',
    label: 'Tornar Casual',
    icon: '😊',
    prompt: 'Reescreva o seguinte texto em um tom mais casual e amigável:'
  },
  {
    id: 'fix-grammar',
    label: 'Corrigir Gramática',
    icon: '✓',
    prompt: 'Corrija erros gramaticais e ortográficos no seguinte texto:'
  },
  {
    id: 'translate',
    label: 'Traduzir',
    icon: '🌐',
    prompt: 'Traduza o seguinte texto para inglês:'
  },
  {
    id: 'continue',
    label: 'Continuar',
    icon: '➡️',
    prompt: 'Continue o seguinte texto de forma coerente e natural:'
  },
  {
    id: 'seo',
    label: 'Otimizar SEO',
    icon: '🔍',
    prompt: 'Otimize o seguinte texto para SEO, incluindo palavras-chave relevantes:'
  }
];

// ============================================================================
// CONFIGURAÇÕES PADRÃO
// ============================================================================

export const DEFAULT_AI_OPTIONS = {
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0
};

export const TEMPERATURE_PRESETS = [
  { value: 0.1, label: 'Muito Preciso', description: 'Respostas consistentes e previsíveis' },
  { value: 0.3, label: 'Preciso', description: 'Pouca variação nas respostas' },
  { value: 0.5, label: 'Equilibrado', description: 'Equilíbrio entre precisão e criatividade' },
  { value: 0.7, label: 'Padrão', description: 'Boa mistura de precisão e criatividade' },
  { value: 0.9, label: 'Criativo', description: 'Respostas mais variadas e criativas' },
  { value: 1.2, label: 'Muito Criativo', description: 'Máxima criatividade e variação' }
];

// ============================================================================
// MENSAGENS DE ERRO
// ============================================================================

export const ERROR_MESSAGES: Record<string, string> = {
  'UNKNOWN_ERROR': 'Erro desconhecido ao processar requisição',
  'API_ERROR': 'Erro na API do provedor',
  'NETWORK_ERROR': 'Erro de conexão com o provedor',
  'TIMEOUT': 'Tempo limite de requisição excedido',
  'RATE_LIMIT_EXCEEDED': 'Limite de requisições excedido. Tente novamente em alguns minutos',
  'INVALID_API_KEY': 'Chave de API inválida',
  'INSUFFICIENT_QUOTA': 'Cota de uso excedida',
  'INVALID_REQUEST': 'Requisição inválida',
  'MODEL_NOT_FOUND': 'Modelo não encontrado',
  'CONTEXT_LENGTH_EXCEEDED': 'Texto muito longo para processar',
  'CONTENT_FILTERED': 'Conteúdo filtrado por políticas de segurança'
};

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Formata uso de tokens para exibição
 */
export function formatTokenUsage(tokens: number): string {
  if (tokens < 1000) return `${tokens} tokens`;
  return `${(tokens / 1000).toFixed(1)}k tokens`;
}

/**
 * Calcula custo estimado
 */
export function estimateCost(tokens: number, costPer1k?: number): string {
  if (!costPer1k) return 'N/A';
  const cost = (tokens / 1000) * costPer1k;
  if (cost < 0.01) return '< $0.01';
  return `$${cost.toFixed(4)}`;
}

/**
 * Obtém informações do provedor
 */
export function getProviderInfo(type: AIProviderType) {
  return {
    icon: PROVIDER_ICONS[type],
    colors: PROVIDER_COLORS[type]
  };
}

/**
 * Valida configuração mínima de provedor
 */
export function validateProviderConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.name?.trim()) {
    errors.push('Nome do provedor é obrigatório');
  }

  if (!config.type) {
    errors.push('Tipo de provedor é obrigatório');
  }

  if (config.authMethod === 'api-key' && !config.credentials?.apiKey?.trim()) {
    errors.push('API Key é obrigatória para este método de autenticação');
  }

  if (config.authMethod === 'oauth' || config.authMethod === 'client-credentials') {
    if (!config.credentials?.clientId?.trim()) {
      errors.push('Client ID é obrigatório para este método de autenticação');
    }
    if (!config.credentials?.clientSecret?.trim()) {
      errors.push('Client Secret é obrigatório para este método de autenticação');
    }
  }

  if (config.type === 'azure-openai' && !config.credentials?.endpoint?.trim()) {
    errors.push('Endpoint é obrigatório para Azure OpenAI');
  }

  if (config.type === 'custom' && !config.credentials?.endpoint?.trim()) {
    errors.push('Endpoint é obrigatório para API customizada');
  }

  if (!config.models || config.models.length === 0) {
    errors.push('Pelo menos um modelo deve ser configurado');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
