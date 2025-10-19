# 🔍 Documentação - Sistema de Pesquisa Global

## 📋 Visão Geral

O Sistema de Pesquisa Global é uma funcionalidade avançada integrada ao topo do Dashboard que permite aos usuários pesquisar rapidamente qualquer conteúdo do CMS com filtros personalizáveis e sugestões em tempo real.

## ✨ Funcionalidades Principais

### 1. **Barra de Pesquisa**
- Posicionada no topo do Dashboard (sticky)
- Campo de busca com ícone de pesquisa
- Botão para limpar a pesquisa
- Botão de filtros com contador de filtros ativos

### 2. **Sugestões em Tempo Real**
- Aparecem automaticamente ao digitar
- Limitadas a 8 resultados mais relevantes
- Exibem informações detalhadas:
  - Título
  - Tipo de conteúdo (badge)
  - Descrição/resumo
  - Categoria
  - Autor
  - Data de atualização
  - Tags associadas

### 3. **Filtros Avançados**
- **Tipo de Conteúdo**: Todos, Páginas, Artigos, Arquivos, Templates, Snippets, Menus
- **Categorias**: Notícias, Tecnologia, Esportes, Entretenimento, Negócios
- **Tags**: Importante, Destaque, Urgente, Atualização, Novo
- Contador visual de filtros ativos
- Botão para limpar todos os filtros

### 4. **Navegação Inteligente**
- Ao clicar em uma sugestão, navega automaticamente para a view correspondente
- Feedback visual com toast notification
- Fecha automaticamente após seleção

## 🛠️ Arquitetura Técnica

### Estrutura de Arquivos

```
/components/dashboard/
├── GlobalSearch.tsx      # Componente principal de pesquisa
├── Dashboard.tsx         # Integração da pesquisa no topo
└── DashboardHome.tsx     # Dashboard inicial
```

### Componente Principal: GlobalSearch.tsx

```typescript
interface GlobalSearchProps {
  onNavigate: (viewId: string, itemId?: string) => void;
}

interface SearchSuggestion {
  id: string;
  title: string;
  type: ContentType;
  path?: string;
  description?: string;
  tags?: string[];
  category?: string;
  author?: string;
  updatedAt?: string;
  icon: any;
  viewId: string;
}

interface SearchFilters {
  contentTypes: ContentType[];
  categories: string[];
  tags: string[];
  dateFrom?: string;
  dateTo?: string;
  author?: string;
  status?: string;
}
```

## 📝 Como Personalizar

### 1. Adicionar Novos Tipos de Conteúdo

**Passo 1**: Adicionar o tipo no `ContentType`

```typescript
type ContentType = 'all' | 'pages' | 'articles' | 'files' | 'templates' | 'snippets' | 'menus' | 'seu-novo-tipo';
```

**Passo 2**: Adicionar ícone e label

```typescript
const getTypeIcon = (type: ContentType) => {
  switch (type) {
    // ... outros cases
    case 'seu-novo-tipo': return SeuIcone;
    default: return Search;
  }
};

const getTypeLabel = (type: ContentType) => {
  switch (type) {
    // ... outros cases
    case 'seu-novo-tipo': return 'Seu Novo Tipo';
    default: return 'Todos';
  }
};
```

**Passo 3**: Adicionar dados na função `getAllContent()`

```typescript
const getAllContent = (): SearchSuggestion[] => {
  // ... outros conteúdos
  
  // Seu novo tipo
  const seuNovoConteudo = JSON.parse(localStorage.getItem('seu-novo-conteudo') || '[]');
  seuNovoConteudo.forEach((item: any) => {
    allSuggestions.push({
      id: item.id,
      title: item.title,
      type: 'seu-novo-tipo',
      description: item.description,
      icon: SeuIcone,
      viewId: 'sua-view-id'
    });
  });
  
  return allSuggestions;
};
```

### 2. Adicionar Novas Categorias

```typescript
const availableCategories = [
  'Notícias', 
  'Tecnologia', 
  'Esportes', 
  'Entretenimento', 
  'Negócios',
  'Sua Nova Categoria' // Adicione aqui
];
```

### 3. Adicionar Novas Tags

```typescript
const availableTags = [
  'Importante', 
  'Destaque', 
  'Urgente', 
  'Atualização', 
  'Novo',
  'Sua Nova Tag' // Adicione aqui
];
```

### 4. Adicionar Filtros Personalizados

**Exemplo: Filtro por Autor**

```typescript
// No estado
const [selectedAuthor, setSelectedAuthor] = useState<string>('');

// No JSX do painel de filtros
<div>
  <label className="text-sm mb-2 block flex items-center gap-2">
    <User className="w-4 h-4" />
    Autor
  </label>
  <div className="flex flex-wrap gap-2">
    {availableAuthors.map(author => (
      <Badge
        key={author}
        variant={selectedAuthor === author ? 'default' : 'outline'}
        className="cursor-pointer"
        onClick={() => setSelectedAuthor(author)}
      >
        {author}
      </Badge>
    ))}
  </div>
</div>

// Na função performSearch
const matchesAuthor = 
  !selectedAuthor || 
  item.author === selectedAuthor;

return matchesQuery && matchesType && matchesCategory && matchesTags && matchesAuthor;
```

**Exemplo: Filtro por Data**

```typescript
// No estado
const [dateFrom, setDateFrom] = useState<string>('');
const [dateTo, setDateTo] = useState<string>('');

// No JSX do painel de filtros
<div>
  <label className="text-sm mb-2 block flex items-center gap-2">
    <Calendar className="w-4 h-4" />
    Período
  </label>
  <div className="grid grid-cols-2 gap-2">
    <Input
      type="date"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
      placeholder="De"
    />
    <Input
      type="date"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
      placeholder="Até"
    />
  </div>
</div>

// Na função performSearch
const matchesDate = 
  (!dateFrom || new Date(item.updatedAt) >= new Date(dateFrom)) &&
  (!dateTo || new Date(item.updatedAt) <= new Date(dateTo));
```

### 5. Customizar a Função de Pesquisa

A função `performSearch` pode ser customizada para incluir:

- **Busca difusa (fuzzy search)**
- **Ponderação de resultados**
- **Busca em campos específicos**
- **Ordenação personalizada**

```typescript
const performSearch = (query: string, activeFilters: SearchFilters): SearchSuggestion[] => {
  const allContent = getAllContent();
  const lowerQuery = query.toLowerCase();

  return allContent
    .filter(item => {
      // Sua lógica de filtro personalizada
      const score = calculateRelevanceScore(item, query);
      return score > 0;
    })
    .sort((a, b) => {
      // Ordenação personalizada
      const scoreA = calculateRelevanceScore(a, query);
      const scoreB = calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    })
    .slice(0, 8);
};

const calculateRelevanceScore = (item: SearchSuggestion, query: string): number => {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  
  // Título exato = maior pontuação
  if (item.title.toLowerCase() === lowerQuery) score += 100;
  // Título começa com query = alta pontuação
  else if (item.title.toLowerCase().startsWith(lowerQuery)) score += 50;
  // Título contém query = média pontuação
  else if (item.title.toLowerCase().includes(lowerQuery)) score += 25;
  
  // Tags também contam
  if (item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) score += 10;
  
  return score;
};
```

## 🎨 Personalização Visual

### Cores e Estilos

O componente usa as classes Tailwind padrão do sistema. Para personalizar:

```typescript
// Cor de fundo das sugestões ao hover
className="hover:bg-gray-50" // Altere para hover:bg-blue-50

// Cor do badge de tipo
<Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">

// Tamanho da barra de pesquisa
className="h-11" // Altere para h-12 ou h-10
```

### Ícones

Os ícones são do `lucide-react`. Para trocar:

```typescript
import { SeuNovoIcone } from 'lucide-react';

const Icon = suggestion.icon; // Use SeuNovoIcone
```

## 🔧 Integração com Dashboard

### Como foi Integrado

```typescript
// Dashboard.tsx
import { GlobalSearch } from './GlobalSearch';

// No JSX
<main className="flex-1 overflow-y-auto flex flex-col">
  <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
    <div className="px-6 py-4">
      <GlobalSearch onNavigate={(viewId, itemId) => {
        setCurrentView(viewId as View);
      }} />
    </div>
  </div>
  
  <div className="flex-1">
    {renderView()}
  </div>
</main>
```

### Navegação para Item Específico (TODO)

Para implementar navegação direta para um item específico:

```typescript
// GlobalSearch.tsx
onNavigate(suggestion.viewId, suggestion.id);

// Dashboard.tsx
const [selectedItemId, setSelectedItemId] = useState<string | undefined>();

<GlobalSearch onNavigate={(viewId, itemId) => {
  setCurrentView(viewId as View);
  setSelectedItemId(itemId);
}} />

// Passar para os componentes filhos
{currentView === 'pages' && (
  <PageManager selectedId={selectedItemId} />
)}
```

## 📊 Fontes de Dados

O sistema busca dados de várias fontes do localStorage:

| Fonte | Key do localStorage | Tipo |
|-------|---------------------|------|
| Páginas | `hierarchical-pages` | View: `pages` |
| Artigos | `articles` | View: `editorDemo` |
| Arquivos | `files` | View: `files` |
| Templates | `hierarchical-templates` | View: `templates` |
| Snippets | `snippets` | View: `snippets` |
| Menus | `menus` | View: `menu` |

## 🚀 Melhorias Futuras

### 1. Histórico de Pesquisa
```typescript
const [searchHistory, setSearchHistory] = useState<string[]>([]);

useEffect(() => {
  const history = JSON.parse(localStorage.getItem('search-history') || '[]');
  setSearchHistory(history);
}, []);

const addToHistory = (query: string) => {
  const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
  setSearchHistory(newHistory);
  localStorage.setItem('search-history', JSON.stringify(newHistory));
};
```

### 2. Busca com Debounce
```typescript
import { useDebounce } from '../hooks/useDebounce';

const debouncedQuery = useDebounce(searchQuery, 300);

useEffect(() => {
  if (debouncedQuery.length > 0) {
    const results = performSearch(debouncedQuery, filters);
    setSuggestions(results);
  }
}, [debouncedQuery, filters]);
```

### 3. Atalhos de Teclado
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + K para abrir pesquisa
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 4. Pesquisa em Texto Completo
```typescript
// Indexar conteúdo completo ao invés de apenas metadados
const indexFullContent = () => {
  // Usar biblioteca como lunr.js ou flexsearch
  const idx = lunr(function () {
    this.ref('id');
    this.field('title');
    this.field('content');
    this.field('tags');
    
    allContent.forEach(item => this.add(item));
  });
  
  return idx;
};
```

## 🐛 Troubleshooting

### Problema: Sugestões não aparecem
**Solução**: Verifique se há dados no localStorage e se o formato está correto.

### Problema: Filtros não funcionam
**Solução**: Verifique se os campos de categoria e tags existem nos objetos de dados.

### Problema: Navegação não funciona
**Solução**: Verifique se o `viewId` corresponde a uma view válida no Dashboard.

### Problema: Performance lenta com muitos itens
**Solução**: Implemente paginação, debounce e limite de resultados.

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação completa do sistema ou entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0.0  
**Última Atualização**: Outubro 2025  
**Autor**: Equipe Portal CMS
