# Documentação - Sistema de Gerenciamento de Links

## Visão Geral

Sistema completo para gerenciar links internos e externos com URLs dinâmicas baseadas na estrutura de pastas e configurações de domínio.

---

## 1. Conceitos Fundamentais

### 1.1 Tipos de Link

**Link Externo (Público)**
- Acessível publicamente pela internet
- Usa URL base: `https://www.stj.jus.br`
- Exemplo: `https://www.stj.jus.br/institucional/sobre`
- Qualquer pessoa pode acessar

**Link Interno (Rede Interna)**
- Acessível apenas na rede interna
- Usa URL base: `https://www.interno.stj.jus.br`
- Exemplo: `https://www.interno.stj.jus.br/sistemas/administrativo`
- Requer acesso à rede corporativa

### 1.2 Estrutura de URL

```
[URL Base] + [Caminho do Arquivo/Página]
```

**Exemplos:**

```
Externo: https://www.stj.jus.br + /institucional/sobre
         ↓
         https://www.stj.jus.br/institucional/sobre

Interno: https://www.interno.stj.jus.br + /sistemas/rh
         ↓
         https://www.interno.stj.jus.br/sistemas/rh
```

---

## 2. Configuração do Sistema

### 2.1 URLs Base

Acesse: **Dashboard → Links → Configurações**

```typescript
interface LinkSettings {
  internalBase: string;  // https://www.interno.stj.jus.br
  externalBase: string;  // https://www.stj.jus.br
}
```

**Padrão do Sistema:**
- **Externa:** `https://www.stj.jus.br`
- **Interna:** `https://www.interno.stj.jus.br`

### 2.2 Armazenamento

```typescript
// localStorage
{
  "linkSettings": {
    "internalBase": "https://www.interno.stj.jus.br",
    "externalBase": "https://www.stj.jus.br"
  }
}
```

---

## 3. Estrutura de Dados

### 3.1 Interface Link

```typescript
interface Link {
  id: string;                    // Identificador único
  title: string;                 // Título do link
  path: string;                  // Caminho relativo
  type: 'internal' | 'external'; // Tipo de acesso
  category?: string;             // Categoria/agrupamento
  description?: string;          // Descrição opcional
  createdAt: string;            // Data de criação
}
```

### 3.2 Exemplo de Link

```json
{
  "id": "link-1234567890",
  "title": "Portal Institucional",
  "path": "/institucional/sobre",
  "type": "external",
  "category": "Institucional",
  "description": "Página sobre o STJ",
  "createdAt": "2025-10-14T10:00:00.000Z"
}
```

### 3.3 URL Gerada

```typescript
const generateFullUrl = (link: Link, settings: LinkSettings): string => {
  const baseUrl = link.type === 'internal' 
    ? settings.internalBase 
    : settings.externalBase;
  
  const path = link.path.startsWith('/') 
    ? link.path 
    : `/${link.path}`;
  
  return `${baseUrl}${path}`;
};

// Resultado:
// https://www.stj.jus.br/institucional/sobre
```

---

## 4. Criação de Links

### 4.1 Criar Link Manualmente

**Via Interface:**

1. Acesse **Dashboard → Links**
2. Clique em **"Novo Link"**
3. Preencha:
   - **Título:** Nome descritivo
   - **Tipo:** Externo ou Interno
   - **Caminho:** Path relativo
   - **Categoria:** Agrupamento (opcional)
   - **Descrição:** Detalhes (opcional)
4. Clique em **"Criar Link"**

**Exemplo:**

```
Título: Sistema de RH
Tipo: Interno
Caminho: /sistemas/recursos-humanos
Categoria: Sistemas Internos
Descrição: Sistema de gestão de recursos humanos

URL Gerada:
https://www.interno.stj.jus.br/sistemas/recursos-humanos
```

### 4.2 Importar de Arquivos

Importa todos os arquivos do FileManager como links:

```typescript
const importFromFiles = () => {
  const files = JSON.parse(localStorage.getItem('files') || '[]');
  
  files.forEach((file: any) => {
    if (file.type !== 'folder') {
      const link: Link = {
        id: `link-file-${file.id}`,
        title: file.name,
        path: file.path,
        type: 'external',
        category: 'Arquivos',
        description: `Arquivo importado: ${file.type}`,
        createdAt: new Date().toISOString()
      };
      // Adicionar link
    }
  });
};
```

**Exemplo de Conversão:**

```
Arquivo:
  name: "relatorio-2024.pdf"
  path: "/documentos/relatorios/relatorio-2024.pdf"

Link Gerado:
  title: "relatorio-2024.pdf"
  path: "/documentos/relatorios/relatorio-2024.pdf"
  type: external
  category: "Arquivos"
  
URL Final:
  https://www.stj.jus.br/documentos/relatorios/relatorio-2024.pdf
```

### 4.3 Importar de Páginas

Importa todas as páginas do PageManager como links:

```typescript
const importFromPages = () => {
  const pages = JSON.parse(localStorage.getItem('pages') || '[]');
  
  pages.forEach((page: any) => {
    const link: Link = {
      id: `link-page-${page.id}`,
      title: page.title,
      path: `/${page.slug}`,
      type: 'external',
      category: 'Páginas',
      description: `Página: ${page.status}`,
      createdAt: new Date().toISOString()
    };
    // Adicionar link
  });
};
```

**Exemplo de Conversão:**

```
Página:
  title: "Sobre o STJ"
  slug: "institucional/sobre"
  status: "published"

Link Gerado:
  title: "Sobre o STJ"
  path: "/institucional/sobre"
  type: external
  category: "Páginas"
  
URL Final:
  https://www.stj.jus.br/institucional/sobre
```

---

## 5. Casos de Uso

### 5.1 Portal Institucional (Externo)

**Cenário:** Páginas públicas do site

```json
{
  "title": "Quem Somos",
  "path": "/institucional/quem-somos",
  "type": "external",
  "category": "Institucional"
}
```

**URL:** `https://www.stj.jus.br/institucional/quem-somos`

**Acesso:** Qualquer pessoa na internet

---

### 5.2 Sistema Administrativo (Interno)

**Cenário:** Sistema corporativo interno

```json
{
  "title": "Sistema de Folha de Pagamento",
  "path": "/sistemas/folha-pagamento",
  "type": "internal",
  "category": "Sistemas Internos"
}
```

**URL:** `https://www.interno.stj.jus.br/sistemas/folha-pagamento`

**Acesso:** Apenas usuários na rede interna

---

### 5.3 Documentos Compartilhados (Interno)

**Cenário:** Arquivos confidenciais

```json
{
  "title": "Relatório Financeiro Q4",
  "path": "/documentos/confidencial/relatorio-q4-2024.pdf",
  "type": "internal",
  "category": "Documentos Confidenciais"
}
```

**URL:** `https://www.interno.stj.jus.br/documentos/confidencial/relatorio-q4-2024.pdf`

**Acesso:** Apenas rede interna

---

### 5.4 Notícias Públicas (Externo)

**Cenário:** Artigos e notícias

```json
{
  "title": "Nova Decisão sobre Direito Digital",
  "path": "/noticias/2024/direito-digital",
  "type": "external",
  "category": "Notícias"
}
```

**URL:** `https://www.stj.jus.br/noticias/2024/direito-digital`

**Acesso:** Público

---

## 6. Geração Automática de URLs

### 6.1 Baseado em Estrutura de Pastas

**FileManager → Links**

```
Estrutura de Arquivos:
/documentos
  /2024
    /janeiro
      - relatorio-jan.pdf

Link Gerado:
{
  "title": "relatorio-jan.pdf",
  "path": "/documentos/2024/janeiro/relatorio-jan.pdf",
  "type": "external"
}

URL Final:
https://www.stj.jus.br/documentos/2024/janeiro/relatorio-jan.pdf
```

### 6.2 Baseado em Slug de Página

**PageManager → Links**

```
Página:
  title: "História do STJ"
  slug: "institucional/historia"

Link Gerado:
{
  "title": "História do STJ",
  "path": "/institucional/historia",
  "type": "external"
}

URL Final:
https://www.stj.jus.br/institucional/historia
```

---

## 7. Operações CRUD

### 7.1 Criar (Create)

```typescript
const createLink = () => {
  const newLink: Link = {
    id: `link-${Date.now()}`,
    title: newLinkTitle,
    path: newLinkPath,
    type: newLinkType,
    category: newLinkCategory || undefined,
    description: newLinkDescription || undefined,
    createdAt: new Date().toISOString()
  };

  saveLinks([...links, newLink]);
  toast.success('Link criado com sucesso!');
};
```

### 7.2 Ler (Read)

```typescript
const loadLinks = () => {
  const stored = localStorage.getItem('links');
  if (stored) {
    setLinks(JSON.parse(stored));
  }
};
```

### 7.3 Atualizar (Update)

```typescript
const updateLink = (id: string, updates: Partial<Link>) => {
  const updated = links.map(link =>
    link.id === id ? { ...link, ...updates } : link
  );
  saveLinks(updated);
};
```

### 7.4 Excluir (Delete)

```typescript
const deleteLink = (id: string) => {
  if (confirm('Tem certeza que deseja excluir este link?')) {
    saveLinks(links.filter(l => l.id !== id));
    toast.success('Link excluído com sucesso!');
  }
};
```

---

## 8. Funcionalidades Adicionais

### 8.1 Copiar URL

```typescript
const copyUrl = (link: Link) => {
  const fullUrl = generateFullUrl(link);
  navigator.clipboard.writeText(fullUrl)
    .then(() => {
      toast.success('URL copiada para a área de transferência!');
    })
    .catch(() => {
      toast.error('Não foi possível copiar a URL');
    });
};
```

### 8.2 Abrir Link

```typescript
const openLink = (link: Link) => {
  const fullUrl = generateFullUrl(link);
  window.open(fullUrl, '_blank');
};
```

### 8.3 Busca e Filtros

```typescript
const filteredLinks = links.filter(link => {
  const matchesSearch = 
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.path.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesType = 
    filterType === 'all' || link.type === filterType;
  
  return matchesSearch && matchesType;
});
```

### 8.4 Agrupamento por Categoria

```typescript
const groupedLinks = filteredLinks.reduce((acc, link) => {
  const category = link.category || 'Sem categoria';
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(link);
  return acc;
}, {} as { [key: string]: Link[] });
```

---

## 9. Integração com Outros Componentes

### 9.1 FileManager

**Gerar link de arquivo:**

```typescript
// No FileManager
const generatePublicLink = (file: FileData) => {
  const link: Link = {
    id: `link-${Date.now()}`,
    title: file.name,
    path: file.path,
    type: 'external',
    category: 'Arquivos',
    createdAt: new Date().toISOString()
  };
  
  // Salvar no LinkManager
  const links = JSON.parse(localStorage.getItem('links') || '[]');
  links.push(link);
  localStorage.setItem('links', JSON.stringify(links));
  
  return generateFullUrl(link, settings);
};
```

### 9.2 PageManager

**Gerar link de página:**

```typescript
// No PageManager
const getPageUrl = (page: Page, type: 'internal' | 'external' = 'external') => {
  const settings = JSON.parse(localStorage.getItem('linkSettings'));
  const baseUrl = type === 'internal' 
    ? settings.internalBase 
    : settings.externalBase;
  
  return `${baseUrl}/${page.slug}`;
};
```

### 9.3 MenuManager

**Usar links no menu:**

```typescript
// Buscar link por ID
const getLink = (linkId: string): Link | null => {
  const links = JSON.parse(localStorage.getItem('links') || '[]');
  return links.find((l: Link) => l.id === linkId) || null;
};

// Usar no menu
const menuItem = {
  title: 'Portal',
  href: getFullUrl(getLink('link-123'))
};
```

---

## 10. Estatísticas

### 10.1 Métricas Disponíveis

```typescript
const statistics = {
  total: links.length,
  external: links.filter(l => l.type === 'external').length,
  internal: links.filter(l => l.type === 'internal').length,
  categories: Object.keys(groupedLinks).length,
  byCategory: Object.entries(groupedLinks).map(([cat, items]) => ({
    category: cat,
    count: items.length
  }))
};
```

### 10.2 Exemplo de Estatísticas

```json
{
  "total": 45,
  "external": 32,
  "internal": 13,
  "categories": 5,
  "byCategory": [
    { "category": "Institucional", "count": 12 },
    { "category": "Notícias", "count": 18 },
    { "category": "Sistemas Internos", "count": 8 },
    { "category": "Documentos", "count": 5 },
    { "category": "Arquivos", "count": 2 }
  ]
}
```

---

## 11. Boas Práticas

### 11.1 Nomenclatura de Caminhos

✅ **Fazer:**
```
/institucional/sobre
/sistemas/recursos-humanos
/documentos/2024/relatorio.pdf
```

❌ **Evitar:**
```
institucional/sobre (sem / inicial)
/Institucional/Sobre (maiúsculas)
/institucional/sobre/ (slash final)
/institucional//sobre (double slash)
```

### 11.2 Organização por Categorias

```
Institucional
├── Sobre
├── História
└── Missão

Sistemas Internos
├── RH
├── Financeiro
└── Administrativo

Documentos
├── Públicos
└── Confidenciais

Notícias
└── Por ano/mês
```

### 11.3 Tipo de Link Apropriado

**Use Externo quando:**
- Conteúdo público
- Acessível na internet
- Páginas do site
- Documentos públicos

**Use Interno quando:**
- Sistemas corporativos
- Documentos confidenciais
- Ferramentas internas
- Dados sensíveis

---

## 12. Segurança

### 12.1 Validação de Caminhos

```typescript
const validatePath = (path: string): boolean => {
  // Deve começar com /
  if (!path.startsWith('/')) return false;
  
  // Não pode ter ../
  if (path.includes('../')) return false;
  
  // Não pode ter //
  if (path.includes('//')) return false;
  
  return true;
};
```

### 12.2 Separação de Contextos

```typescript
// Links internos só acessíveis na rede
if (link.type === 'internal' && !isOnCorporateNetwork()) {
  throw new Error('Link interno só acessível na rede corporativa');
}
```

---

## 13. Exemplos Práticos

### 13.1 Criar Link Institucional

```typescript
const link: Link = {
  id: 'link-1',
  title: 'Sobre o STJ',
  path: '/institucional/sobre',
  type: 'external',
  category: 'Institucional',
  description: 'Informações sobre o Superior Tribunal de Justiça',
  createdAt: '2025-10-14T10:00:00Z'
};

// URL gerada:
// https://www.stj.jus.br/institucional/sobre
```

### 13.2 Criar Link de Sistema Interno

```typescript
const link: Link = {
  id: 'link-2',
  title: 'Portal do Servidor',
  path: '/sistemas/portal-servidor',
  type: 'internal',
  category: 'Sistemas Internos',
  description: 'Acesso ao portal do servidor',
  createdAt: '2025-10-14T10:00:00Z'
};

// URL gerada:
// https://www.interno.stj.jus.br/sistemas/portal-servidor
```

### 13.3 Criar Link de Documento

```typescript
const link: Link = {
  id: 'link-3',
  title: 'Relatório Anual 2024',
  path: '/documentos/relatorios/anual-2024.pdf',
  type: 'external',
  category: 'Documentos',
  description: 'Relatório anual de atividades',
  createdAt: '2025-10-14T10:00:00Z'
};

// URL gerada:
// https://www.stj.jus.br/documentos/relatorios/anual-2024.pdf
```

---

## 14. Troubleshooting

### Problema: URL não funciona
**Solução:** Verifique se o caminho está correto e se o tipo de link (interno/externo) está adequado.

### Problema: Link interno não abre
**Solução:** Certifique-se de estar na rede corporativa.

### Problema: Caminho com erro
**Solução:** Certifique-se que o caminho começa com `/` e não contém `//` ou `../`.

### Problema: Categoria não aparece
**Solução:** A categoria é opcional. Links sem categoria vão para "Sem categoria".

---

## 15. Conclusão

O sistema de gerenciamento de links oferece:

✅ **Flexibilidade:** Links internos e externos
✅ **Organização:** Categorias e agrupamentos
✅ **Automação:** Importação de arquivos e páginas
✅ **URLs Dinâmicas:** Baseadas em configuração
✅ **Integração:** Com todos os módulos do sistema
✅ **Segurança:** Separação de contextos interno/externo
✅ **Usabilidade:** Interface intuitiva e funcional

Este sistema permite gerenciar todos os links do portal de forma centralizada, mantendo a consistência das URLs e facilitando a manutenção.
