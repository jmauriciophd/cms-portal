# Correção da Pesquisa Global

## Problema Identificado

A pesquisa global não estava encontrando nenhum resultado quando o usuário digitava termos como "Pagina" ou outros.

## Causas Raiz

1. **Chaves incorretas do localStorage**: O GlobalSearch estava procurando dados em chaves incorretas:
   - Procurava `hierarchical-pages` mas o sistema usa `pages`
   - Procurava `hierarchical-templates` mas o sistema usa `templates`

2. **Falta de normalização de texto**: A pesquisa não estava removendo acentos, então "Pagina" não encontrava "Página"

## Correções Implementadas

### 1. Correção das Chaves do localStorage (GlobalSearch.tsx)

**Antes:**
```typescript
const pagesData = localStorage.getItem('hierarchical-pages');
const templatesData = localStorage.getItem('hierarchical-templates');
```

**Depois:**
```typescript
const pagesData = localStorage.getItem('pages');
const templatesData = localStorage.getItem('templates');
```

### 2. Normalização de Texto com Remoção de Acentos

**Adicionada função auxiliar:**
```typescript
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};
```

**Uso na pesquisa:**
```typescript
const normalizedQuery = normalizeText(query);

const matchesQuery = 
  normalizeText(item.title).includes(normalizedQuery) ||
  (item.description && normalizeText(item.description).includes(normalizedQuery)) ||
  item.tags?.some(tag => normalizeText(tag).includes(normalizedQuery)) ||
  (item.category && normalizeText(item.category).includes(normalizedQuery));
```

### 3. Melhorias no Carregamento de Arquivos

**Ícones específicos por tipo de arquivo:**
```typescript
import { 
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileText
} from 'lucide-react';
```

**Função para formatar tamanho:**
```typescript
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
```

**Processamento inteligente de arquivos:**
- Detecta tipo MIME (image/, video/, audio/, text/, application/pdf)
- Exibe ícone adequado para cada tipo
- Mostra extensão do arquivo
- Formata tamanho do arquivo (KB, MB, GB)
- Descrição: "Imagem (PNG) • 15.42 KB"

### 4. Melhorias no Carregamento de Dados

- Adicionado fallback para `page.excerpt` caso `page.description` não exista
- Adicionado fallback para `menu.description` caso `menu.location` não exista
- Ícones específicos por tipo de arquivo (imagens, vídeos, PDFs, etc.)
- Adicionado logging para debug (console.log)

### 5. Logging para Debug

Adicionados logs para facilitar debugging:
- Log do conteúdo carregado (quantidade de cada tipo)
- Log da pesquisa (query, query normalizada, total de items)
- Log dos resultados encontrados

## Arquivos Modificados

1. `/components/dashboard/GlobalSearch.tsx`
   - Corrigidas chaves do localStorage
   - Adicionada função de normalização de texto
   - Melhorado carregamento de dados
   - Adicionado logging para debug

## Resultado Esperado

Agora a pesquisa global deve:

1. ✅ Encontrar páginas criadas pelo PageManager
2. ✅ Encontrar artigos criados pelo ArticleManager
3. ✅ Encontrar templates criados pelo TemplateManager
4. ✅ Encontrar snippets criados pelo SnippetManager
5. ✅ Encontrar menus criados pelo MenuManager
6. ✅ **Encontrar arquivos no FileManager com informações detalhadas**
   - **Ícones específicos por tipo** (imagem, vídeo, PDF, código, etc.)
   - **Mostra extensão do arquivo** (PNG, JPG, PDF, etc.)
   - **Exibe tamanho formatado** (15.42 KB, 2.5 MB, etc.)
   - **Descrição rica** (ex: "Imagem (PNG) • 15.42 KB")
7. ✅ Funcionar com ou sem acentos (ex: "Pagina" encontra "Página")
8. ✅ Pesquisar em título, descrição, tags e categorias
9. ✅ Respeitar filtros por tipo de conteúdo, categoria e tags

## Como Testar

1. Abra o Dashboard
2. Digite qualquer termo na barra de pesquisa:
   - "Pagina" ou "página" → encontra páginas
   - "bem-vindo" ou "bem vindo" → encontra artigos/páginas
   - "inicial" → encontra página inicial
   - **"logo"** → **encontra arquivo logo.png**
   - **"banner"** → **encontra arquivo banner.jpg**
   - **"Inicio.html"** → **encontra arquivo de homepage**
   - **"pdf"** → **encontra arquivos PDF**
3. Verifique se os resultados aparecem com ícones e informações corretas
4. **Para arquivos, verifique se mostra:**
   - Ícone específico do tipo
   - Extensão do arquivo
   - Tamanho formatado
5. Teste sem acentos (ex: "pagina" deve encontrar "Página")
6. Teste os filtros (clique em "Filtros" e selecione tipos de conteúdo)
7. **Teste o filtro "Arquivos"** para ver apenas arquivos
8. Abra o Console do navegador para ver os logs de debug

## Dados Mockados Existentes

O sistema já inicializa dados mockados automaticamente:

### Páginas (PageManager)
- "Página Inicial" - Bem-vindo ao Portal

### Artigos (ArticleManager)
- "Bem-vindo ao CMS" - Primeiro artigo do sistema

### Templates (TemplateManager)
- "Cabeçalho Padrão"
- "Rodapé Padrão"
- Vários outros templates padrão

### Snippets (SnippetManager)
- "Assinatura do Editor"
- "Aviso Legal"

### Menus (MenuManager)
- "Menu Principal" - Com itens Início e Institucional

### **Arquivos (FileManager)**
O FileManager cria automaticamente uma estrutura de pastas e arquivos:

**Pastas:**
- `/Arquivos` (protegida)
- `/Arquivos/imagens` (protegida)
- `/Arquivos/paginas` (protegida)
- `/Arquivos/estaticos` (protegida)
- `/Arquivos/documentos` (criada dinamicamente se necessário)

**Arquivos:**
- `Inicio.html` - Homepage do site (HTML com size e mimeType)
- **Quando você faz upload, todos os arquivos são indexados com:**
  - `name` - Nome do arquivo
  - `size` - Tamanho em bytes
  - `mimeType` - Tipo MIME (image/png, application/pdf, etc.)
  - `url` - Dados do arquivo em base64
  - `path` - Caminho completo
  - `createdAt` - Data de criação
  - `modifiedAt` - Data de modificação

**Pesquisa de arquivos funciona por:**
- Nome do arquivo (ex: "logo" encontra "logo.png")
- Extensão (ex: "png" encontra todos os PNGs)
- Tipo (ex: pesquisar e filtrar por "Arquivos")
- Caminho (ex: "imagens" encontra arquivos na pasta /imagens)

## Verificação Adicional

Se ainda não aparecerem resultados:

1. Verifique o Console para ver os logs:
   ```
   GlobalSearch - Conteúdo carregado: { pages: X, articles: Y, ... }
   ```

2. Verifique se os dados estão no localStorage:
   - Abra DevTools > Application > Local Storage
   - Verifique as chaves: `pages`, `articles`, `templates`, `snippets`, `menus`, `files`

3. Force a reinicialização:
   - Navegue para cada seção (Páginas, Artigos, Templates, etc.)
   - Isso forçará a criação dos dados mockados se não existirem

## Próximas Melhorias Possíveis

1. Adicionar destaque (highlight) dos termos encontrados
2. Ordenar resultados por relevância
3. Adicionar histórico de pesquisas
4. Adicionar sugestões de pesquisa (autocomplete)
5. Adicionar pesquisa fuzzy (aproximada)
6. Adicionar pesquisa por data
7. Adicionar pesquisa por autor
