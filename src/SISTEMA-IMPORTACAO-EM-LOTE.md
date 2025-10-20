# Sistema de Importação em Lote com IA

## 📋 Visão Geral

Sistema completo de importação inteligente em lote, integrado como aba em **Configurações do Sistema**, com mapeamento por IA, suporte a múltiplas fontes e workflow completo de revisão humana.

## 🎯 Funcionalidades Principais

### 1. **Múltiplas Fontes de Importação**
- ✅ **WordPress REST API** - Importação de posts e pages via API REST
- ✅ **HTML/Scraping** - Extração de sites estáticos com seletores CSS
- ✅ **RSS/Atom** - Importação de feeds de notícias
- ✅ **JSON APIs** - Integração com APIs customizadas
- ✅ **Sitemaps** - Descoberta automática via sitemaps XML

### 2. **Pipeline Inteligente de Processamento**

#### Etapas do Fluxo:
1. **Descoberta** 📡
   - Varredura de URLs por sitemap/RSS
   - Descoberta automática de conteúdo
   - Filtros por data, categoria, padrões de URL

2. **Fetch & Rendering** 🌐
   - HTTP fetching com rate limiting
   - Suporte a JavaScript pesado (Playwright simulado)
   - Respeito a robots.txt
   - Headers e autenticação customizáveis

3. **Extração** 🔍
   - Parsing HTML com seletores CSS
   - Extração de JSON-LD, Microdata, OpenGraph
   - Detecção de tipo de conteúdo
   - Qualidade score automático

4. **Normalização** 🧹
   - Sanitização HTML (XSS-safe)
   - Reescrita de URLs relativos
   - Detecção de idioma
   - Geração de slugs
   - Desduplicação por hash

5. **Mapeamento por IA** 🤖
   - Análise inteligente de campos
   - Few-shot learning por tipo de conteúdo
   - Validação de constraints
   - Pontuação de confiança (0-1)
   - Detecção de violações

6. **Revisão Humana** 👤
   - Interface side-by-side (extraído vs mapeado)
   - Editor de campos inline
   - Aprovação/rejeição em lote
   - Comentários e notas

7. **Importação** 💾
   - Criação/atualização idempotente
   - Diff inteligente (create vs update)
   - Versionamento automático
   - Rollback disponível

### 3. **Perfis de Fonte**

Configuração granular por domínio:

```typescript
{
  name: "WordPress - Portal Exemplo",
  domain: "portal.exemplo.gov.br",
  type: "wordpress",
  baseUrl: "https://portal.exemplo.gov.br",
  
  // Rate Limiting
  rateLimit: {
    requestsPerSecond: 2,
    concurrent: 3
  },
  
  // Configuração específica
  config: {
    wpRestEndpoint: "/wp-json/wp/v2",
    wpContentTypes: ["posts", "pages"],
    selectors: { /* CSS selectors */ },
    renderJs: false
  },
  
  // Autenticação
  auth: {
    type: "bearer",
    credentials: { token: "..." }
  },
  
  // Allowlist/Denylist
  allowlist: ["/noticias/*", "/artigos/*"],
  denylist: ["/admin/*", "/private/*"]
}
```

### 4. **Jobs de Importação**

Controle completo do processo:

**Configurações do Job:**
- ✅ **Incremental** - Importa apenas novos/alterados (via ETag/Last-Modified)
- ✅ **Dry Run** - Executa sem importar (teste)
- ✅ **Auto-Approve** - Aprova automaticamente se confiança >= threshold
- ✅ **Confidence Threshold** - Limiar de confiança (0.8 padrão)
- ✅ **Max Items** - Limite de itens por job
- ✅ **Filtros** - Por data, categoria, URL pattern

**Status do Job:**
- 🟡 **Pendente** - Aguardando execução
- 🔵 **Executando** - Em processamento
- 🟡 **Pausado** - Pausado manualmente
- 🟢 **Concluído** - Finalizado com sucesso
- 🔴 **Falhou** - Erro durante execução
- ⚫ **Cancelado** - Cancelado pelo usuário

**Métricas em Tempo Real:**
- Descobertos, Extraídos, Normalizados, Mapeados
- Pendentes de Revisão, Aprovados, Rejeitados, Importados
- Taxa de Sucesso, Confiança Média
- Duração, Velocidade (items/s)
- Contagem de Erros

### 5. **Dashboard Analítico**

#### Métricas Globais:
- 📊 Total de Jobs (ativos/concluídos/falhados)
- 📈 Itens Importados / Total
- 🎯 Taxa de Sucesso Geral
- 🤖 Confiança Média de IA
- ⚠️ Itens Pendentes de Revisão

#### Gráficos:
- **Timeline** - Linha do tempo (últimos 30 dias)
  - Descobertos, Importados, Falhas
- **Performance por Fonte** - Barras comparativas
  - Total vs Importados por perfil
- **Tipos de Conteúdo** - Distribuição
  - Articles, Pages, Events, etc.

### 6. **Sistema de Revisão Humana**

Interface completa para validação manual:

**Recursos:**
- 📋 Lista de itens com confiança < threshold ou violações
- 👁️ Visualização lado a lado (extraído vs mapeado)
- ✏️ Editor inline de todos os campos
- 📊 Indicadores de confiança por campo
- ⚠️ Alertas de violações de validação
- ✅ Aprovação individual ou em lote
- ❌ Rejeição com motivo
- 🔄 Reprocessamento de itens

**Comparação Visual:**
```
┌─────────────────────┬─────────────────────┐
│ Dados Extraídos     │ Dados Mapeados      │
├─────────────────────┼─────────────────────┤
│ Título: ...         │ Título: ... (95%)   │
│ Autor: ...          │ Autor: ... (75%)    │
│ Resumo: ...         │ Resumo: ... (82%)   │
│ Categorias: ...     │ Categorias: ... (70%)│
└─────────────────────┴─────────────────────┘
```

### 7. **Mapeamento por IA**

Sistema inteligente de conversão:

**Entrada:**
- JSON extraído + HTML limpo
- Schema de destino (JSON Schema do CMS)
- Few-shot examples por tipo/fonte
- Histórico de mapeamentos anteriores

**Saída:**
```typescript
{
  contentType: "article",
  fields: {
    title: "...",
    body_html: "...",
    excerpt: "...",
    slug: "...",
    author: "...",
    published_at: "2024-01-15T10:00:00Z",
    categories: ["Notícias", "Governo"],
    tags: ["cidade", "prefeitura"],
    status: "draft",
    visibility: "public"
  },
  confidence: {
    overall: 0.89,
    byField: {
      title: 0.95,
      body_html: 0.88,
      excerpt: 0.82,
      author: 0.75,
      categories: 0.70
    }
  },
  rationale: "Mapeamento baseado em...",
  violations: [], // Problemas detectados
  needsReview: false
}
```

**Few-Shot Examples:**
- ✅ Notícia
- ✅ Página Institucional
- ✅ Publicação Oficial
- ✅ Evento

**Validações:**
- Campos obrigatórios presentes
- Enums e taxonomias válidas
- Datas em ISO 8601
- Limites de tamanho respeitados

## 🎨 Interface do Usuário

### Abas Principais:

#### 1. **Dashboard**
- Cards com métricas principais
- Gráficos de timeline e performance
- Lista de jobs recentes com progresso

#### 2. **Jobs**
- Lista completa de jobs
- Filtros por status e busca
- Criação de novo job
- Ações: Iniciar, Pausar, Cancelar, Ver Detalhes
- Progresso visual com barras
- Métricas por job

#### 3. **Revisão**
- Lista de itens pendentes
- Indicadores de confiança e violações
- Ação rápida: Aprovar/Rejeitar
- Dialog de revisão detalhada
- Comparação lado a lado
- Editor de campos

#### 4. **Perfis**
- Grid de perfis configurados
- Cards com estatísticas
- Ícones por tipo de fonte
- Status ativo/inativo
- Criação e edição de perfis

## 🔧 Como Usar

### 1. Criar um Perfil de Fonte

```
Configurações → Importação em Lote → Perfis → Novo Perfil
```

Preencha:
- Nome do perfil
- Domínio
- Tipo (WordPress, HTML, RSS, etc.)
- URL Base
- Rate limiting (req/s e concorrentes)
- Configurações específicas do tipo

### 2. Criar um Job de Importação

```
Configurações → Importação em Lote → Jobs → Novo Job
```

Configure:
- Nome do job
- Perfil de fonte
- Limiar de confiança (0.8 recomendado)
- Máximo de itens (0 = ilimitado)
- Opções:
  - ✅ Importação Incremental
  - ⬜ Dry Run
  - ⬜ Aprovação Automática
  - ✅ Iniciar Imediatamente

### 3. Monitorar o Progresso

O job passará pelas etapas:
1. **Descoberta** - Encontrando URLs
2. **Fetch** - Baixando conteúdo
3. **Extração** - Parseando dados
4. **Normalização** - Limpando e padronizando
5. **Mapeamento IA** - Convertendo para schema CMS
6. **Revisão** - Aguardando aprovação (se necessário)
7. **Importação** - Salvando no CMS

### 4. Revisar Itens (se necessário)

```
Configurações → Importação em Lote → Revisão
```

Para cada item:
1. Clique em "Revisar"
2. Compare dados extraídos vs mapeados
3. Edite campos se necessário
4. Aprove ou Rejeite

### 5. Ver Detalhes do Job

Clique no job para ver:
- **Itens** - Lista de todos os itens processados
- **Logs** - Histórico de eventos
- **Erros** - Lista de problemas encontrados
- **Configuração** - Configurações do job

## 📊 Métricas e Observabilidade

### Métricas Disponíveis:
- ✅ Total de jobs e status
- ✅ Total de itens descobertos/importados
- ✅ Taxa de sucesso global e por fonte
- ✅ Confiança média de IA
- ✅ Itens pendentes de revisão
- ✅ Timeline de importações (30 dias)
- ✅ Performance por fonte
- ✅ Distribuição por tipo de conteúdo

### Logs Estruturados:
Cada job mantém logs detalhados:
```typescript
{
  timestamp: "2024-01-15T10:30:00Z",
  level: "info" | "warning" | "error",
  stage: "discovery" | "fetch" | "extraction" | ...,
  message: "...",
  metadata: { ... }
}
```

### Rastreamento de Erros:
```typescript
{
  timestamp: "...",
  itemId: "...",
  stage: "ai-mapping",
  error: "Falha ao mapear campo obrigatório",
  retryCount: 0,
  resolved: false
}
```

## 🔒 Segurança e Qualidade

### Segurança:
- ✅ Sanitização HTML (XSS-safe)
- ✅ Validação de MIME types
- ✅ Respeito a robots.txt
- ✅ Rate limiting por fonte
- ✅ Timeout e retry com backoff exponencial
- ✅ Auditoria completa (quem/quando/o quê)

### Qualidade:
- ✅ Validação de schema
- ✅ Detecção de duplicatas
- ✅ Quality score automático
- ✅ Confidence threshold configurável
- ✅ Revisão humana para casos de baixa confiança

## 💾 Armazenamento

Dados armazenados em localStorage:

```
batch_import_profiles  - Perfis de fonte
batch_import_jobs      - Jobs de importação
batch_import_items     - Itens descobertos/processados
batch_import_metrics   - Métricas agregadas
```

## 🚀 Recursos Avançados

### Importação Incremental:
- Usa ETag e Last-Modified para detectar mudanças
- Hash de conteúdo para desduplicação
- Skip de itens não modificados

### Idempotência:
- Chave única: `hash(canonical_url + content_hash)`
- Create vs Update inteligente
- Diff de campos significativos

### Retry e Resiliência:
- Retry automático com backoff exponencial
- DLQ (Dead Letter Queue) para falhas persistentes
- Reprocessamento manual de itens

### Dry Run:
- Executa todo o pipeline sem importar
- Gera relatório completo
- Ideal para testes e validações

## 📚 Exemplos de Uso

### Exemplo 1: Migração de WordPress

```
1. Criar perfil:
   - Nome: "Portal Antigo WordPress"
   - Tipo: wordpress
   - URL: https://old.portal.gov.br
   - Endpoint: /wp-json/wp/v2
   - Content Types: posts, pages

2. Criar job:
   - Incremental: Sim
   - Auto-Approve: Não (revisar manualmente)
   - Threshold: 0.8

3. Executar e revisar itens com baixa confiança

4. Aprovar em lote os itens corretos
```

### Exemplo 2: Importação de RSS

```
1. Criar perfil:
   - Nome: "Feed de Notícias"
   - Tipo: rss
   - URL Feed: https://noticias.gov.br/feed

2. Criar job agendado (cron):
   - Incremental: Sim
   - Auto-Approve: Sim (confiança alta em RSS)
   - Schedule: Diário às 8h

3. Sistema importa automaticamente novas notícias
```

### Exemplo 3: Scraping de HTML

```
1. Criar perfil:
   - Nome: "Site Estático Antigo"
   - Tipo: html
   - Seletores CSS:
     - title: "h1.titulo"
     - content: "div.conteudo"
     - author: "span.autor"
     - date: "time.data"

2. Criar job:
   - Dry Run: Sim (primeiro teste)
   - Max Items: 10

3. Revisar resultados do dry run

4. Executar job real sem dry run
```

## 🎯 Boas Práticas

### ✅ Faça:
- Comece com Dry Run para testar
- Configure rate limiting adequado
- Use importação incremental
- Revise itens de baixa confiança
- Monitore logs e erros
- Crie perfis específicos por fonte

### ❌ Evite:
- Rate limiting muito agressivo
- Auto-approve com threshold muito baixo
- Ignorar violações de validação
- Jobs muito grandes sem limite
- Desabilitar importação incremental

## 🔮 Próximos Passos (Futuro)

- [ ] Integração com backend real (API)
- [ ] Suporte a Playwright/Puppeteer real
- [ ] Webhooks para notificações
- [ ] Agendamento CRON visual
- [ ] Export de relatórios PDF/Excel
- [ ] Machine Learning para melhorar mapeamento
- [ ] Suporte a mais tipos de fonte
- [ ] Importação de mídia (imagens/vídeos)
- [ ] API REST para automação

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do job
2. Consulte esta documentação
3. Revise as configurações do perfil
4. Teste com Dry Run primeiro

---

**Sistema desenvolvido com:**
- React + TypeScript
- Recharts (gráficos)
- shadcn/ui (componentes)
- localStorage (armazenamento mock)
- Arquitetura preparada para backend real
