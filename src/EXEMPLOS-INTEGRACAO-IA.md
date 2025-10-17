# 💡 Exemplos Práticos de Integração com IA

## 📚 Índice
1. [Configuração de Provedores](#configuração-de-provedores)
2. [Exemplos de Uso](#exemplos-de-uso)
3. [Requisições Programáticas](#requisições-programáticas)
4. [Templates Customizados](#templates-customizados)
5. [Casos de Uso Reais](#casos-de-uso-reais)

---

## 🔧 Configuração de Provedores

### Exemplo 1: Configurar OpenAI

```typescript
import { AIService } from './services/AIService';

// Configurar provedor OpenAI
const openaiConfig = AIService.saveProvider({
  type: 'openai',
  name: 'OpenAI Principal',
  enabled: true,
  authMethod: 'api-key',
  credentials: {
    apiKey: 'sk-proj-...',  // Sua API key
    organizationId: 'org-...'  // Opcional
  }
  // Outros campos usam valores padrão do template
});

console.log('Provedor configurado:', openaiConfig.id);
```

### Exemplo 2: Configurar Anthropic (Claude)

```typescript
const claudeConfig = AIService.saveProvider({
  type: 'anthropic',
  name: 'Claude 3',
  enabled: true,
  authMethod: 'api-key',
  credentials: {
    apiKey: 'sk-ant-...'  // Sua API key da Anthropic
  }
});
```

### Exemplo 3: Configurar Azure OpenAI

```typescript
const azureConfig = AIService.saveProvider({
  type: 'azure-openai',
  name: 'Azure OpenAI',
  enabled: true,
  authMethod: 'api-key',
  credentials: {
    apiKey: 'your-azure-key',
    endpoint: 'https://your-resource.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview',
    region: 'eastus'
  }
});
```

### Exemplo 4: Configurar API Customizada

```typescript
const customConfig = AIService.saveProvider({
  type: 'custom',
  name: 'Minha API Local',
  enabled: true,
  authMethod: 'api-key',
  credentials: {
    apiKey: 'my-custom-key',
    endpoint: 'http://localhost:8000/v1/generate'
  },
  models: [
    {
      id: 'my-model',
      name: 'my-model-v1',
      displayName: 'Meu Modelo',
      provider: 'custom',
      capabilities: ['text-completion', 'chat'],
      maxTokens: 2048,
      description: 'Modelo customizado local'
    }
  ],
  rateLimits: {
    requestsPerMinute: 100,
    requestsPerDay: 10000
  },
  timeout: 60000  // 60 segundos para APIs locais
});
```

---

## 🎯 Exemplos de Uso

### Exemplo 5: Gerar Introdução de Artigo

```typescript
import { AIService } from './services/AIService';
import { SecurityService } from './services/SecurityService';

async function gerarIntroducaoArtigo(topico: string) {
  const providers = AIService.getActiveProviders();
  if (providers.length === 0) {
    throw new Error('Nenhum provedor de IA configurado');
  }

  const provider = providers[0];
  const model = provider.models[0];

  const request = {
    providerId: provider.id,
    modelId: model.id,
    prompt: `Escreva uma introdução cativante para um artigo sobre: ${topico}`,
    context: 'Você é um escritor de blog profissional. Crie conteúdo envolvente, informativo e otimizado para SEO.',
    options: {
      temperature: 0.7,
      maxTokens: 300
    },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  const response = await AIService.executeRequest(request);

  if (response.success) {
    console.log('Introdução gerada:', response.content);
    console.log('Tokens usados:', response.usage?.totalTokens);
    return response.content;
  } else {
    throw new Error(response.error?.message || 'Erro ao gerar introdução');
  }
}

// Uso
gerarIntroducaoArtigo('Inteligência Artificial no Marketing Digital')
  .then(intro => console.log(intro))
  .catch(err => console.error(err));
```

### Exemplo 6: Melhorar Texto Existente

```typescript
async function melhorarTexto(textoOriginal: string) {
  const providers = AIService.getActiveProviders();
  const provider = providers[0];
  const model = provider.models[0];

  const request = {
    providerId: provider.id,
    modelId: model.id,
    prompt: `Melhore o seguinte texto, tornando-o mais claro, conciso e profissional:\n\n${textoOriginal}`,
    options: {
      temperature: 0.5,  // Menos criativo, mais focado
      maxTokens: 500
    },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  const response = await AIService.executeRequest(request);
  return response.success ? response.content : textoOriginal;
}

// Uso
const textoOriginal = "A gente faz produto muito bom e é legal.";
melhorarTexto(textoOriginal).then(melhorado => {
  console.log('Original:', textoOriginal);
  console.log('Melhorado:', melhorado);
  // Melhorado: "Oferecemos produtos de alta qualidade que se destacam no mercado."
});
```

### Exemplo 7: Resumir Conteúdo Longo

```typescript
async function resumirConteudo(conteudo: string, tamanho: 'curto' | 'medio' | 'longo' = 'medio') {
  const maxTokensMap = {
    'curto': 150,
    'medio': 300,
    'longo': 500
  };

  const providers = AIService.getActiveProviders();
  const provider = providers[0];
  const model = provider.models[0];

  const request = {
    providerId: provider.id,
    modelId: model.id,
    prompt: `Resuma o seguinte conteúdo de forma clara e objetiva:\n\n${conteudo}`,
    options: {
      temperature: 0.3,  // Mais objetivo
      maxTokens: maxTokensMap[tamanho]
    },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  const response = await AIService.executeRequest(request);
  return response.success ? response.content : '';
}

// Uso
const artigoLongo = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit...
  [texto muito longo]
`;

resumirConteudo(artigoLongo, 'curto').then(resumo => {
  console.log('Resumo:', resumo);
});
```

### Exemplo 8: Traduzir Conteúdo

```typescript
async function traduzirTexto(texto: string, idioma: string = 'inglês') {
  const providers = AIService.getActiveProviders();
  const provider = providers[0];
  const model = provider.models[0];

  const request = {
    providerId: provider.id,
    modelId: model.id,
    prompt: `Traduza o seguinte texto para ${idioma}:\n\n${texto}`,
    options: {
      temperature: 0.3,  // Tradução precisa
      maxTokens: texto.length * 2  // Estimativa generosa
    },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  const response = await AIService.executeRequest(request);
  return response.success ? response.content : '';
}

// Uso
traduzirTexto('Olá, como vai você?', 'inglês').then(traducao => {
  console.log('Tradução:', traducao);
  // Tradução: "Hello, how are you?"
});
```

### Exemplo 9: Gerar Títulos SEO

```typescript
async function gerarTitulosSEO(topico: string, quantidade: number = 5) {
  const providers = AIService.getActiveProviders();
  const provider = providers[0];
  const model = provider.models[0];

  const request = {
    providerId: provider.id,
    modelId: model.id,
    prompt: `Gere ${quantidade} títulos SEO-friendly (máximo 60 caracteres) para um artigo sobre: ${topico}`,
    context: 'Você é um especialista em SEO. Crie títulos que chamem atenção e incluam palavras-chave relevantes.',
    options: {
      temperature: 0.8,  // Mais criativo para variedade
      maxTokens: 400
    },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  const response = await AIService.executeRequest(request);
  
  if (response.success) {
    // Parsear títulos (assumindo que vêm em linhas)
    const titulos = response.content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
    return titulos;
  }
  
  return [];
}

// Uso
gerarTitulosSEO('marketing digital para pequenas empresas').then(titulos => {
  console.log('Títulos sugeridos:');
  titulos.forEach((titulo, i) => console.log(`${i+1}. ${titulo}`));
});
```

### Exemplo 10: Gerar Descrições de Produtos

```typescript
async function gerarDescricaoProduto(
  nomeProduto: string,
  caracteristicas: string[],
  publicoAlvo: string
) {
  const providers = AIService.getActiveProviders();
  const provider = providers[0];
  const model = provider.models[0];

  const caracteristicasTexto = caracteristicas.join(', ');

  const request = {
    providerId: provider.id,
    modelId: model.id,
    prompt: `Crie uma descrição atraente para o produto "${nomeProduto}" com as seguintes características: ${caracteristicasTexto}. Público-alvo: ${publicoAlvo}.`,
    context: 'Você é um especialista em e-commerce. Crie descrições atraentes que destacam características e benefícios dos produtos.',
    options: {
      temperature: 0.7,
      maxTokens: 300
    },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  const response = await AIService.executeRequest(request);
  return response.success ? response.content : '';
}

// Uso
gerarDescricaoProduto(
  'Smart Watch Pro X1',
  ['Tela OLED', 'Resistente à água', 'Monitoramento cardíaco', 'Bateria de 7 dias'],
  'Pessoas ativas e tecnológicas entre 25-45 anos'
).then(descricao => {
  console.log('Descrição gerada:', descricao);
});
```

---

## 💻 Requisições Programáticas

### Exemplo 11: Processar Múltiplos Textos em Lote

```typescript
async function processarLote(textos: string[], acao: 'melhorar' | 'resumir' | 'traduzir') {
  const providers = AIService.getActiveProviders();
  if (providers.length === 0) {
    throw new Error('Nenhum provedor configurado');
  }

  const provider = providers[0];
  const model = provider.models[0];

  const promptsMap = {
    'melhorar': (texto: string) => `Melhore este texto: ${texto}`,
    'resumir': (texto: string) => `Resuma este texto: ${texto}`,
    'traduzir': (texto: string) => `Traduza para inglês: ${texto}`
  };

  const resultados = [];

  for (const texto of textos) {
    const request = {
      providerId: provider.id,
      modelId: model.id,
      prompt: promptsMap[acao](texto),
      options: {
        temperature: 0.5,
        maxTokens: 500
      },
      userId: SecurityService.getCurrentUser()?.id || 'anonymous'
    };

    const response = await AIService.executeRequest(request);
    resultados.push({
      original: texto,
      processado: response.success ? response.content : texto,
      sucesso: response.success
    });

    // Pequeno delay para respeitar rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return resultados;
}

// Uso
const textos = [
  'Texto 1 para processar',
  'Texto 2 para processar',
  'Texto 3 para processar'
];

processarLote(textos, 'melhorar').then(resultados => {
  resultados.forEach((r, i) => {
    console.log(`\nTexto ${i+1}:`);
    console.log('Original:', r.original);
    console.log('Processado:', r.processado);
  });
});
```

### Exemplo 12: Sistema de Retry Customizado

```typescript
async function executarComRetry(
  request: any,
  maxTentativas: number = 3,
  delayMs: number = 1000
): Promise<any> {
  let ultimoErro: any;

  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    try {
      const response = await AIService.executeRequest(request);
      
      if (response.success) {
        return response;
      }

      ultimoErro = response.error;

      // Não fazer retry para certos erros
      if (response.error?.code === 'INVALID_API_KEY' || 
          response.error?.code === 'INSUFFICIENT_QUOTA') {
        break;
      }

    } catch (error) {
      ultimoErro = error;
    }

    if (tentativa < maxTentativas) {
      // Backoff exponencial
      const delay = delayMs * Math.pow(2, tentativa - 1);
      console.log(`Tentativa ${tentativa} falhou. Tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Falhou após ${maxTentativas} tentativas: ${ultimoErro?.message || 'Erro desconhecido'}`);
}

// Uso
executarComRetry({
  providerId: 'provider-id',
  modelId: 'model-id',
  prompt: 'Gerar conteúdo...',
  userId: 'user-id'
}, 5, 2000).then(response => {
  console.log('Sucesso após retry:', response.content);
}).catch(err => {
  console.error('Falhou mesmo com retry:', err.message);
});
```

---

## 🎨 Templates Customizados

### Exemplo 13: Criar Template de Contexto Customizado

```typescript
// Adicionar ao arquivo AIProviders.ts ou criar dinamicamente

const CUSTOM_CONTEXTS = {
  'juridico': {
    name: 'Conteúdo Jurídico',
    context: 'Você é um advogado especializado. Escreva de forma técnica, precisa e fundamentada em legislação. Use linguagem formal e cite artigos de lei quando relevante.',
    icon: '⚖️'
  },
  'medico': {
    name: 'Conteúdo Médico',
    context: 'Você é um médico. Escreva de forma científica e baseada em evidências. Use terminologia médica apropriada mas explique conceitos complexos de forma acessível.',
    icon: '🏥'
  },
  'educacional': {
    name: 'Conteúdo Educacional',
    context: 'Você é um professor. Explique conceitos de forma didática, usando exemplos práticos e analogias. Adapte a linguagem ao nível de conhecimento do público.',
    icon: '📚'
  }
};

// Usar contexto customizado
async function gerarConteudoComContexto(
  prompt: string,
  contextoTipo: keyof typeof CUSTOM_CONTEXTS
) {
  const contexto = CUSTOM_CONTEXTS[contextoTipo];
  const providers = AIService.getActiveProviders();
  const provider = providers[0];
  const model = provider.models[0];

  const request = {
    providerId: provider.id,
    modelId: model.id,
    prompt,
    context: contexto.context,
    options: {
      temperature: 0.6,
      maxTokens: 1000
    },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  const response = await AIService.executeRequest(request);
  return response.success ? response.content : '';
}

// Uso
gerarConteudoComContexto(
  'Explique o que é habeas corpus',
  'juridico'
).then(conteudo => console.log(conteudo));
```

### Exemplo 14: Criar Prompt Engineering Avançado

```typescript
interface PromptConfig {
  role: string;
  task: string;
  format: string;
  constraints: string[];
  examples?: string[];
}

function construirPrompt(config: PromptConfig, userInput: string): string {
  let prompt = `Papel: ${config.role}\n\n`;
  prompt += `Tarefa: ${config.task}\n\n`;
  prompt += `Formato esperado: ${config.format}\n\n`;
  
  if (config.constraints.length > 0) {
    prompt += `Restrições:\n`;
    config.constraints.forEach(c => prompt += `- ${c}\n`);
    prompt += '\n';
  }
  
  if (config.examples && config.examples.length > 0) {
    prompt += `Exemplos:\n`;
    config.examples.forEach((ex, i) => prompt += `${i+1}. ${ex}\n`);
    prompt += '\n';
  }
  
  prompt += `Input do usuário: ${userInput}`;
  
  return prompt;
}

// Uso
const config: PromptConfig = {
  role: 'Especialista em email marketing',
  task: 'Criar uma linha de assunto para email',
  format: 'Texto curto, máximo 50 caracteres, com emoji opcional',
  constraints: [
    'Deve ser chamativo e gerar curiosidade',
    'Evitar palavras como "grátis" que podem cair em spam',
    'Personalizar com o nome quando possível'
  ],
  examples: [
    '🎁 João, sua oferta especial expira hoje',
    '⚡ Última chance: 50% de desconto só para você'
  ]
};

const prompt = construirPrompt(config, 'Promoção de Black Friday para loja de eletrônicos');

// Enviar para IA...
```

---

## 🏢 Casos de Uso Reais

### Exemplo 15: Sistema de Geração de Notícias

```typescript
interface NoticiaInput {
  titulo: string;
  fatos: string[];
  categoria: string;
  fontes?: string[];
}

async function gerarNoticia(input: NoticiaInput): Promise<string> {
  const providers = AIService.getActiveProviders();
  const provider = providers[0];
  const model = provider.models[0];

  const fatosTexto = input.fatos.map((f, i) => `${i+1}. ${f}`).join('\n');
  const fontesTexto = input.fontes ? `\n\nFontes: ${input.fontes.join(', ')}` : '';

  const prompt = `
Escreva uma notícia jornalística sobre: ${input.titulo}

Categoria: ${input.categoria}

Fatos principais:
${fatosTexto}${fontesTexto}

A notícia deve:
- Seguir a pirâmide invertida (mais importante primeiro)
- Ser objetiva e imparcial
- Ter entre 300-400 palavras
- Incluir título, lead e corpo
`;

  const request = {
    providerId: provider.id,
    modelId: model.id,
    prompt,
    context: 'Você é um jornalista profissional. Escreva de forma objetiva, clara e imparcial, seguindo os princípios do jornalismo.',
    options: {
      temperature: 0.4,  // Mais factual
      maxTokens: 800
    },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  const response = await AIService.executeRequest(request);
  return response.success ? response.content : '';
}

// Uso
gerarNoticia({
  titulo: 'Nova tecnologia de energia solar bate recorde de eficiência',
  fatos: [
    'Cientistas da Universidade XYZ desenvolveram painéis solares com 47% de eficiência',
    'Recorde anterior era de 39%',
    'Tecnologia usa nova combinação de materiais semicondutores',
    'Previsão de comercialização em 3 anos'
  ],
  categoria: 'Tecnologia',
  fontes: ['Universidade XYZ', 'Nature Energy Journal']
}).then(noticia => console.log(noticia));
```

### Exemplo 16: Assistente de Atendimento ao Cliente

```typescript
interface ConversaHistorico {
  mensagens: Array<{ role: 'user' | 'assistant'; content: string }>;
}

async function responderCliente(
  pergunta: string,
  contextoEmpresa: string,
  historico?: ConversaHistorico
): Promise<string> {
  const providers = AIService.getActiveProviders();
  const provider = providers[0];
  const model = provider.models[0];

  let promptCompleto = `Contexto da empresa:\n${contextoEmpresa}\n\n`;

  if (historico) {
    promptCompleto += 'Histórico da conversa:\n';
    historico.mensagens.forEach(msg => {
      promptCompleto += `${msg.role === 'user' ? 'Cliente' : 'Atendente'}: ${msg.content}\n`;
    });
    promptCompleto += '\n';
  }

  promptCompleto += `Nova pergunta do cliente: ${pergunta}\n\nResposta:`;

  const request = {
    providerId: provider.id,
    modelId: model.id,
    prompt: promptCompleto,
    context: 'Você é um atendente de suporte ao cliente. Seja educado, prestativo e resolva problemas de forma eficiente. Mantenha tom profissional mas amigável.',
    options: {
      temperature: 0.7,
      maxTokens: 500
    },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  const response = await AIService.executeRequest(request);
  return response.success ? response.content : 'Desculpe, não consegui processar sua solicitação no momento.';
}

// Uso
const contextoEmpresa = `
Empresa: TechStore
Produtos: Eletrônicos e gadgets
Horário: Segunda a Sexta, 9h-18h
Política de troca: 30 dias
Frete: Grátis acima de R$200
`;

responderCliente(
  'Quanto tempo demora a entrega para São Paulo?',
  contextoEmpresa
).then(resposta => console.log('Resposta:', resposta));
```

### Exemplo 17: Gerador de Conteúdo para Redes Sociais

```typescript
interface PostSocialConfig {
  plataforma: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  topico: string;
  tom: 'profissional' | 'casual' | 'engracado' | 'inspiracional';
  incluirHashtags: boolean;
  incluirEmojis: boolean;
}

async function gerarPostSocial(config: PostSocialConfig): Promise<string> {
  const providers = AIService.getActiveProviders();
  const provider = providers[0];
  const model = provider.models[0];

  const limiteCaracteres = {
    'twitter': 280,
    'instagram': 2200,
    'facebook': 500,
    'linkedin': 700
  };

  const prompt = `
Crie um post para ${config.plataforma} sobre: ${config.topico}

Tom: ${config.tom}
Limite de caracteres: ${limiteCaracteres[config.plataforma]}
${config.incluirHashtags ? 'Incluir hashtags relevantes' : 'Não incluir hashtags'}
${config.incluirEmojis ? 'Usar emojis apropriados' : 'Não usar emojis'}

O post deve ser envolvente e apropriado para a plataforma.
`;

  const request = {
    providerId: provider.id,
    modelId: model.id,
    prompt,
    context: 'Você é um gestor de redes sociais. Crie conteúdo curto, engajador e adequado para plataformas sociais.',
    options: {
      temperature: 0.8,  // Mais criativo
      maxTokens: 300
    },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  const response = await AIService.executeRequest(request);
  return response.success ? response.content : '';
}

// Uso
gerarPostSocial({
  plataforma: 'instagram',
  topico: 'Lançamento de novo produto eco-friendly',
  tom: 'inspiracional',
  incluirHashtags: true,
  incluirEmojis: true
}).then(post => console.log('Post gerado:\n', post));
```

### Exemplo 18: Otimização SEO Automatizada

```typescript
interface ConteudoSEO {
  titulo: string;
  conteudo: string;
  palavrasChave: string[];
}

async function otimizarSEO(conteudo: ConteudoSEO): Promise<{
  tituloOtimizado: string;
  metaDescricao: string;
  conteudoOtimizado: string;
  sugestoesHashtags: string[];
}> {
  const providers = AIService.getActiveProviders();
  const provider = providers[0];
  const model = provider.models[0];

  const palavrasChaveTexto = conteudo.palavrasChave.join(', ');

  // 1. Otimizar título
  const tituloRequest = {
    providerId: provider.id,
    modelId: model.id,
    prompt: `Otimize este título para SEO (máx 60 caracteres) incluindo as palavras-chave: ${palavrasChaveTexto}\n\nTítulo original: ${conteudo.titulo}`,
    options: { temperature: 0.5, maxTokens: 100 },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  // 2. Gerar meta descrição
  const metaRequest = {
    providerId: provider.id,
    modelId: model.id,
    prompt: `Crie uma meta descrição SEO (150-160 caracteres) incluindo: ${palavrasChaveTexto}\n\nConteúdo: ${conteudo.conteudo.substring(0, 500)}...`,
    options: { temperature: 0.5, maxTokens: 100 },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  // 3. Otimizar conteúdo
  const conteudoRequest = {
    providerId: provider.id,
    modelId: model.id,
    prompt: `Otimize este conteúdo para SEO, incluindo naturalmente as palavras-chave: ${palavrasChaveTexto}\n\n${conteudo.conteudo}`,
    options: { temperature: 0.4, maxTokens: 2000 },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  // 4. Sugerir hashtags
  const hashtagsRequest = {
    providerId: provider.id,
    modelId: model.id,
    prompt: `Sugira 10 hashtags relevantes para: ${conteudo.titulo}. Palavras-chave: ${palavrasChaveTexto}`,
    options: { temperature: 0.6, maxTokens: 150 },
    userId: SecurityService.getCurrentUser()?.id || 'anonymous'
  };

  // Executar todas as requisições
  const [tituloResp, metaResp, conteudoResp, hashtagsResp] = await Promise.all([
    AIService.executeRequest(tituloRequest),
    AIService.executeRequest(metaRequest),
    AIService.executeRequest(conteudoRequest),
    AIService.executeRequest(hashtagsRequest)
  ]);

  return {
    tituloOtimizado: tituloResp.success ? tituloResp.content : conteudo.titulo,
    metaDescricao: metaResp.success ? metaResp.content : '',
    conteudoOtimizado: conteudoResp.success ? conteudoResp.content : conteudo.conteudo,
    sugestoesHashtags: hashtagsResp.success 
      ? hashtagsResp.content.split('\n').filter(h => h.trim())
      : []
  };
}

// Uso
otimizarSEO({
  titulo: 'Como usar IA no seu negócio',
  conteudo: 'Inteligência artificial está transformando...',
  palavrasChave: ['inteligência artificial', 'IA', 'negócios', 'automação']
}).then(resultado => {
  console.log('Título otimizado:', resultado.tituloOtimizado);
  console.log('Meta descrição:', resultado.metaDescricao);
  console.log('Hashtags:', resultado.sugestoesHashtags);
});
```

---

## 🎓 Conclusão

Estes exemplos demonstram a versatilidade e poder do sistema de IA. Com uma arquitetura bem projetada e APIs modernas, as possibilidades são praticamente ilimitadas.

**Próximos passos:**
1. Experimentar com diferentes temperaturas e parâmetros
2. Criar seus próprios templates customizados
3. Integrar IA em workflows específicos do seu negócio
4. Monitorar custos e otimizar uso

**Lembre-se:**
- Sempre revisar conteúdo gerado por IA
- Monitorar custos de API
- Respeitar rate limits
- Manter credenciais seguras

---

**Desenvolvido para Portal CMS**
**Versão: 1.0.0**
