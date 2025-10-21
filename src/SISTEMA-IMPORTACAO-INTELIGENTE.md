# Sistema de Importação Inteligente de Arquivos

## Visão Geral

Sistema completo e avançado de importação de arquivos com identificação automática, otimização, validação e pré-visualização integrado ao CMS.

## Arquitetura

### Componentes Principais

#### 1. FileOptimizationService (`/services/FileOptimizationService.ts`)
Serviço central responsável por toda a lógica de processamento:

**Funcionalidades:**
- **Análise e Identificação Automática**
  - Detecta tipo de arquivo por MIME type, extensão e conteúdo
  - 9 categorias suportadas: page, image, style, script, document, data, markdown, code, unknown
  - Análise de características específicas por tipo
  - Sugestão inteligente de pasta de destino com score de confiança

- **Otimização por Tipo**
  - HTML: Remove comentários, minifica CSS/JS inline, reduz espaços em branco
  - CSS: Minificação completa
  - JavaScript: Minificação com detecção de código já otimizado
  - JSON: Formatação ou minificação conforme nível
  - Imagens: Preparado para otimização (requer backend)

- **Validação Automatizada**
  - Verificação de tamanho (máx 10MB)
  - Validação de tipo permitido
  - Verificações específicas por categoria:
    - HTML: DOCTYPE, HEAD, BODY
    - JavaScript: Sintaxe e balanceamento de chaves
    - CSS: Sintaxe e chaves balanceadas
    - JSON: Parsing válido
    - Imagens: Dimensões e tamanho

- **Geração de Previews**
  - HTML: Preview renderizado em iframe sandbox
  - Imagens: Preview visual com dimensões
  - JSON: Formatado e colorido
  - Texto/Código: Syntax highlighting

#### 2. FileImportOptimizer (`/components/files/FileImportOptimizer.tsx`)
Componente React com interface visual completa:

**Interface:**
- Área de upload drag-and-drop
- Seletor de nível de otimização (none, light, medium, aggressive)
- Lista de arquivos com status em tempo real
- Indicadores de progresso por arquivo
- Preview integrado
- Painel de detalhes expandido

**Fluxo de Processamento:**
1. Usuário seleciona arquivos
2. Processamento automático em background
3. Exibição de resultados com badges de status
4. Revisão e ajuste de destino
5. Preview opcional
6. Confirmação e importação

**Features:**
- Processamento paralelo de múltiplos arquivos
- Progress bars individuais
- Score de qualidade (0-100)
- Alertas e sugestões contextuais
- Edição de caminho de destino
- Detecção de conflitos

## Categorias de Arquivos

### 1. Page (Páginas HTML)
- **Extensões:** .html, .htm
- **MIME:** text/html
- **Otimizações:**
  - Remove comentários HTML
  - Minifica CSS inline
  - Minifica JavaScript inline
  - Remove espaços em branco desnecessários
- **Validações:**
  - Presença de DOCTYPE
  - Estrutura HEAD e BODY
  - Recursos externos listados

### 2. Image (Imagens)
- **Extensões:** .jpg, .jpeg, .png, .gif, .webp, .svg
- **MIME:** image/*
- **Análise:**
  - Dimensões (width x height)
  - Formato e tipo
  - Transparência (alpha channel)
- **Validações:**
  - Tamanho máximo: 4000x4000px (warning)
  - Formato válido

### 3. Style (Folhas de Estilo)
- **Extensões:** .css, .scss, .sass, .less
- **MIME:** text/css
- **Otimizações:**
  - Remove comentários
  - Minificação completa
  - Remoção de espaços
- **Validações:**
  - Sintaxe CSS (balanceamento de chaves)

### 4. Script (JavaScript)
- **Extensões:** .js, .jsx, .ts, .tsx, .mjs
- **MIME:** application/javascript, text/javascript
- **Otimizações:**
  - Remove comentários
  - Minificação (se ainda não estiver)
  - Detecção automática de código já minificado
- **Validações:**
  - Sintaxe JavaScript
  - Balanceamento de parênteses/chaves

### 5. Data (Dados Estruturados)
- **Extensões:** .json, .xml, .csv, .yaml, .yml
- **MIME:** application/json
- **Otimizações:**
  - JSON: Formatação ou minificação
  - Validação de parsing
- **Validações:**
  - Estrutura válida
  - Parsing sem erros

### 6. Document (Documentos)
- **Extensões:** .txt, .pdf, .doc, .docx
- **MIME:** application/pdf, text/plain
- **Análise:**
  - Extração de metadados
  - Tamanho e tipo

### 7. Markdown
- **Extensões:** .md, .mdx, .markdown
- **MIME:** text/markdown
- **Features:**
  - Preview convertido para HTML
  - Preservação de formatação

### 8. Code (Outros Códigos)
- Arquivos de código não categorizados
- Preview de texto puro

### 9. Unknown
- Tipos não reconhecidos
- Processamento básico sem otimização

## Níveis de Otimização

### None
- Sem otimização
- Apenas análise e validação
- Arquivo mantido original

### Light
- Otimizações mínimas
- Remove comentários (HTML)
- Formatação básica
- Preserva estrutura

### Medium (Padrão)
- Otimizações equilibradas
- Remove comentários e linhas vazias
- Minifica CSS/JS inline
- Redução moderada de tamanho

### Aggressive
- Otimização máxima
- Minificação completa
- Remove todos os espaços desnecessários
- Máxima redução de tamanho

## Sistema de Validação

### Status de Validação
- **valid:** Arquivo passou em todas as verificações
- **warning:** Avisos que não impedem importação
- **error:** Erros críticos que bloqueiam importação
- **unknown:** Não foi possível validar

### Verificações Realizadas

#### Tamanho
- Máximo: 10MB (erro)
- Aviso: 5MB (warning)
- OK: < 5MB

#### Tipo
- Tipos permitidos verificados
- Categoria detectada
- Extensão validada

#### Específicas por Categoria
- Cada categoria tem validações customizadas
- Verificação de estrutura
- Análise de sintaxe
- Detecção de erros comuns

### Score de Qualidade (0-100)

Cálculo baseado em:
- **Erros:** -15 pontos cada
- **Avisos:** -5 pontos cada
- **Otimização:** +10 pontos (se reduziu tamanho)
- **Confiança:** +10 pontos (baseado em análise)

## Preview System

### Tipos de Preview

#### HTML Preview
- Renderizado em iframe sandbox
- Isolamento de segurança
- Preview em tempo real

#### Image Preview
- Visualização direta da imagem
- Informações de dimensão
- Thumbnail gerado

#### JSON Preview
- Formatação com indentação
- Syntax highlighting
- Metadados extraídos

#### Text Preview
- Primeiros 5000 caracteres
- Código fonte formatado
- Monospace font

## Interface do Usuário

### Área de Upload
- Drag-and-drop support
- Seleção múltipla
- Indicação visual de área ativa
- Limites claros (tipo e tamanho)

### Lista de Arquivos
- Cards individuais por arquivo
- Ícones por categoria
- Status visual (cores e ícones)
- Progress bars em tempo real

### Badges e Indicadores
- **Otimizado:** Badge verde com % de redução
- **Validado:** Badge com shield icon
- **Score:** Badge com pontuação
- **Revisar:** Badge amarelo para baixa confiança

### Seletor de Destino
- Input editável de caminho
- Sugestão automática inteligente
- Badge de revisão se confiança < 70%
- Validação de caminho

### Botões de Ação
- **Preview:** Visualizar arquivo
- **Detalhes:** Ver informações completas
- **Importar:** Confirmar importação

### Dialogs Adicionais

#### Preview Dialog
- Visualização em tela cheia
- Suporte a todos os tipos
- Scroll para conteúdo longo
- Informações de metadata

#### Details Panel
- 3 tabs: Análise, Otimização, Validação
- **Análise:** Categorização e características
- **Otimização:** Métricas e logs
- **Validação:** Checks e sugestões

## Integração com FileManager

### Botão "Import Inteligente"
- Posicionado ao lado do botão Upload
- Ícone Sparkles (AI/Smart)
- Abre dialog completo

### Processamento de Arquivos Importados
- Conversão automática de conteúdo
- Geração de FileItem
- Criação de links automáticos
- Detecção de conflitos
- Atualização do localStorage

### Features Integradas
- Links automáticos via LinkManagementService
- Metadata preservada
- Versionamento compatível
- Pesquisa integrada

## Segurança

### Validações de Segurança
- Tamanho máximo: 10MB
- Tipos de arquivo permitidos (whitelist)
- Sandbox para preview HTML
- Validação de conteúdo

### Sanitização
- HTML sanitizado
- Scripts isolados em preview
- Conteúdo binário validado

## Performance

### Otimizações
- Processamento assíncrono
- UI não bloqueante
- Progress feedback em tempo real
- Lazy loading de previews

### Métricas Rastreadas
- Tempo de processamento
- Taxa de compressão
- Tamanho original vs otimizado
- Número de otimizações aplicadas

## Casos de Uso

### 1. Importação de Site Estático
- Upload de múltiplos arquivos HTML
- Detecção automática de páginas
- Otimização de CSS/JS inline
- Organização em /pages

### 2. Upload de Galeria de Imagens
- Múltiplas imagens selecionadas
- Validação de dimensões
- Sugestão para /media/images
- Preview antes de importar

### 3. Importação de Dados JSON
- Validação de estrutura
- Formatação ou minificação
- Destino: /data
- Preview estruturado

### 4. Deploy de Assets
- CSS/JS otimizados
- Organização em /assets
- Detecção de dependências
- Links automáticos

## Melhorias Futuras

### Planejadas
1. Otimização de imagens com compressão real
2. Suporte a ZIP/RAR para importação em lote
3. Conversão automática de formatos
4. Análise de dependências entre arquivos
5. Sugestão de organização por projeto
6. Integração com CDN
7. Backup automático pré-importação
8. Histórico de importações
9. Templates de organização
10. Análise de SEO para páginas

### Possíveis Extensões
- Suporte a mais formatos (SVG otimizado, WebP)
- Integração com ferramentas externas (ImageOptim, etc.)
- Processamento em worker threads
- Suporte a importação de URL remota
- Versionamento automático de arquivos importados

## Troubleshooting

### Arquivo não é otimizado
- Verificar se já está minificado
- Conferir nível de otimização selecionado
- Categoria pode não suportar otimização

### Preview não aparece
- Verificar tipo de arquivo
- Alguns tipos não têm preview
- Arquivo muito grande pode demorar

### Validação falha
- Ler mensagens de erro específicas
- Verificar sintaxe do arquivo
- Conferir tamanho e tipo

### Destino incorreto
- Ajustar manualmente o caminho
- Confiança baixa indica incerteza
- Revisar categoria detectada

## API e Exports

### FileOptimizationService
```typescript
// Processar arquivo completo
processFile(file: File, level: OptimizationLevel): Promise<ProcessedFile>

// Analisar apenas
analyzeFile(file: File): Promise<FileAnalysis>

// Otimizar apenas
optimizeFile(file: File, analysis: FileAnalysis, level: OptimizationLevel): Promise<OptimizationResult>

// Validar apenas
validateFile(file: File, analysis: FileAnalysis, optimization: OptimizationResult): Promise<ValidationResult>

// Gerar preview
generatePreview(file: File, analysis: FileAnalysis, optimization: OptimizationResult): Promise<PreviewData>
```

### Types Exportados
- FileCategory
- OptimizationLevel
- ValidationStatus
- FileAnalysis
- OptimizationResult
- ValidationResult
- PreviewData
- ProcessedFile

## Conclusão

O Sistema de Importação Inteligente de Arquivos oferece uma solução completa e profissional para upload e processamento de arquivos no CMS. Com análise automática, otimização inteligente, validação robusta e interface intuitiva, ele simplifica o fluxo de trabalho e garante qualidade dos arquivos importados.

**Principais Benefícios:**
- ✅ Identificação automática de tipos
- ✅ Otimização inteligente por categoria
- ✅ Validação completa com sugestões
- ✅ Preview integrado
- ✅ Interface visual moderna
- ✅ Integração perfeita com o sistema existente
- ✅ Segurança e performance
