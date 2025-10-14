# Documentação - Nova Estrutura de Menu

## Visão Geral

Sistema completo de gerenciamento de menus com suporte a múltiplos menus independentes, URLs amigáveis e controle de visibilidade de filhos.

---

## 1. Estrutura do MenuItem

### 1.1 Interface

```typescript
interface MenuItem {
  title: string;                    // Título exibido no menu
  targetUrl: string;                 // URL original (.aspx)
  ignorarFilhosNoMenu: boolean;      // Flag para ocultar filhos
  filhos: MenuItem[] | null;         // Array de itens filhos ou null
  href: string;                      // URL amigável gerada
  id?: string;                       // ID único (opcional)
  expanded?: boolean;                // Estado de expansão no editor
}
```

### 1.2 Exemplo de Estrutura

```json
[
  {
    "title": "Institucional",
    "targetUrl": "/sites/portalp/Paginas/inc/MenuList.aspx",
    "ignorarFilhosNoMenu": false,
    "filhos": [
      {
        "title": "Atribuições",
        "targetUrl": "/sites/portalp/Paginas/Institucional/Atribuicoes.aspx",
        "ignorarFilhosNoMenu": false,
        "filhos": null,
        "href": "/Institucional/Atribuicoes"
      },
      {
        "title": "Composição",
        "targetUrl": "/sites/portalp/Paginas/Institucional/Composicao.aspx",
        "ignorarFilhosNoMenu": false,
        "filhos": null,
        "href": "/Institucional/Composicao"
      }
    ],
    "href": "/Institucional"
  }
]
```

---

## 2. Campos do MenuItem

### 2.1 title (obrigatório)
- **Tipo:** `string`
- **Descrição:** Nome exibido no menu
- **Exemplo:** `"Institucional"`, `"Atribuições"`

### 2.2 targetUrl (obrigatório)
- **Tipo:** `string`
- **Descrição:** URL original do sistema (pode incluir .aspx)
- **Exemplo:** `"/sites/portalp/Paginas/Institucional/Atribuicoes.aspx"`
- **Formato:** Caminho completo ou relativo

### 2.3 ignorarFilhosNoMenu (obrigatório)
- **Tipo:** `boolean`
- **Descrição:** Controla visibilidade dos itens filhos
- **Valores:**
  - `false` - Filhos são exibidos (padrão)
  - `true` - Filhos ficam ocultos no menu
- **Uso:** Útil para páginas que têm filhos mas você quer um menu mais limpo

### 2.4 filhos (obrigatório)
- **Tipo:** `MenuItem[] | null`
- **Descrição:** Array de itens filhos ou null se não houver
- **Importante:** Sempre use `null` ao invés de array vazio quando não há filhos
- **Hierarquia:** Suporta múltiplos níveis

### 2.5 href (obrigatório)
- **Tipo:** `string`
- **Descrição:** URL amigável final (HTML)
- **Gerado:** Automaticamente a partir do `targetUrl`
- **Exemplo:** `"/Institucional/Atribuicoes"`
- **Formato:** Sem extensão .aspx ou .html

---

## 3. Geração de href (URLs Amigáveis)

### 3.1 Algoritmo

```typescript
const generateHref = (targetUrl: string): string => {
  let href = targetUrl;
  
  // 1. Remove domain e base path
  href = href.replace(/^(https?:\/\/[^\/]+)?/, '');
  href = href.replace(/^\/sites\/[^\/]+\/Paginas/, '');
  
  // 2. Remove extensão .aspx
  href = href.replace(/\.aspx$/i, '');
  
  // 3. Limpa paths especiais
  href = href.replace(/\/inc\/MenuList$/, '');
  
  // 4. Garante que começa com /
  if (!href.startsWith('/')) {
    href = '/' + href;
  }
  
  // 5. Remove trailing slash
  href = href.replace(/\/$/, '');
  
  // 6. Handle root
  if (href === '' || href === '/') {
    href = '/';
  }
  
  return href;
};
```

### 3.2 Exemplos de Conversão

| targetUrl | href |
|-----------|------|
| `/sites/portalp/Paginas/Institucional/Atribuicoes.aspx` | `/Institucional/Atribuicoes` |
| `/sites/portalp/Paginas/inc/MenuList.aspx` | `/` |
| `/Contato.aspx` | `/Contato` |
| `https://example.com/Sobre.aspx` | `/Sobre` |
| `/sites/portal/Paginas/Noticias/2024/Anuncio.aspx` | `/Noticias/2024/Anuncio` |

---

## 4. Múltiplos Menus

### 4.1 MenuConfig Interface

```typescript
interface MenuConfig {
  id: string;                    // ID único do menu
  name: string;                  // Nome do menu
  description: string;           // Descrição
  items: MenuItem[];             // Itens do menu
  createdAt: string;             // Data de criação
  updatedAt: string;             // Data de atualização
  associatedPages?: string[];    // IDs de páginas associadas
}
```

### 4.2 Estrutura de Armazenamento

```json
[
  {
    "id": "menu-principal",
    "name": "Menu Principal",
    "description": "Menu de navegação principal do site",
    "items": [...],
    "createdAt": "2025-10-14T10:00:00.000Z",
    "updatedAt": "2025-10-14T15:30:00.000Z",
    "associatedPages": ["page-1", "page-2"]
  },
  {
    "id": "menu-footer",
    "name": "Menu Footer",
    "description": "Menu do rodapé",
    "items": [...],
    "createdAt": "2025-10-14T11:00:00.000Z",
    "updatedAt": "2025-10-14T16:00:00.000Z",
    "associatedPages": []
  }
]
```

### 4.3 Casos de Uso

**Menu Principal:**
- Navegação principal do site
- Visível em todas as páginas
- Hierarquia completa

**Menu Footer:**
- Links institucionais
- Mapa do site simplificado
- Apenas links principais

**Menu Sidebar:**
- Navegação contextual
- Específico para certas seções
- Vinculado a páginas específicas

**Menu Mobile:**
- Versão otimizada para mobile
- Estrutura mais simples
- Pode ter itens diferentes

---

## 5. Funcionalidade: ignorarFilhosNoMenu

### 5.1 Comportamento

```typescript
// Item pai com filhos visíveis
{
  "title": "Produtos",
  "ignorarFilhosNoMenu": false,
  "filhos": [
    { "title": "Eletrônicos", ... },
    { "title": "Móveis", ... }
  ]
}

// Renderização:
Produtos
  • Eletrônicos
  • Móveis
```

```typescript
// Item pai com filhos ocultos
{
  "title": "Produtos",
  "ignorarFilhosNoMenu": true,
  "filhos": [
    { "title": "Eletrônicos", ... },
    { "title": "Móveis", ... }
  ]
}

// Renderização:
Produtos
(filhos não aparecem)
```

### 5.2 Quando Usar

**Use `ignorarFilhosNoMenu: true` quando:**
- Menu tem muitos níveis e fica poluído
- Filhos são páginas técnicas/administrativas
- Quer link direto sem dropdown
- Design requer menu mais limpo

**Use `ignorarFilhosNoMenu: false` quando:**
- Navegação hierárquica é importante
- Usuário precisa ver todas opções
- Estrutura é essencial para UX

### 5.3 Exemplo Prático

```json
{
  "title": "Portal da Transparência",
  "ignorarFilhosNoMenu": true,
  "filhos": [
    {
      "title": "Servidores - Janeiro 2024",
      "href": "/transparencia/servidores/2024/01"
    },
    {
      "title": "Servidores - Fevereiro 2024",
      "href": "/transparencia/servidores/2024/02"
    }
    // ... 100+ páginas de meses anteriores
  ],
  "href": "/transparencia"
}
```

**Resultado:** Menu mostra apenas "Portal da Transparência" como link único, sem sobrecarregar com 100+ sub-itens.

---

## 6. Associação de Menus a Páginas

### 6.1 Funcionalidade

Permite vincular menus específicos a páginas específicas:

```typescript
// Menu configurado
{
  "id": "menu-institucional",
  "name": "Menu Institucional",
  "associatedPages": ["page-sobre", "page-historia", "page-missao"]
}

// Renderização
if (currentPage.id in menu.associatedPages) {
  renderMenu(menu);
}
```

### 6.2 Interface de Associação

```tsx
<Card>
  <CardHeader>
    <CardTitle>Páginas Associadas</CardTitle>
  </CardHeader>
  <CardContent>
    {pages.map(page => (
      <Switch
        checked={menu.associatedPages?.includes(page.id)}
        onCheckedChange={() => associatePage(menu.id, page.id)}
      />
      <span>{page.title}</span>
    ))}
  </CardContent>
</Card>
```

### 6.3 Casos de Uso

**Seção Institucional:**
- Menu específico com links internos
- Páginas: Sobre, História, Equipe, etc.
- Menu contextual diferente do principal

**Área de Serviços:**
- Menu com serviços disponíveis
- Páginas: Solicitações, Consultas, Downloads
- Navegação focada na tarefa

**Blog/Notícias:**
- Menu com categorias
- Páginas: Artigos, Arquivo, Categorias
- Filtros e navegação de conteúdo

---

## 7. Operações CRUD

### 7.1 Criar Menu

```typescript
const newMenu: MenuConfig = {
  id: `menu-${Date.now()}`,
  name: 'Novo Menu',
  description: 'Descrição do menu',
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  associatedPages: []
};
```

### 7.2 Adicionar Item

```typescript
const newItem: MenuItem = {
  title: 'Novo Item',
  targetUrl: '/novo',
  ignorarFilhosNoMenu: false,
  filhos: null,
  href: '/novo'
};

// Adicionar ao root
menu.items.push(newItem);

// Adicionar como filho
parentItem.filhos = [...(parentItem.filhos || []), newItem];
```

### 7.3 Editar Item

```typescript
const updateItem = (item: MenuItem) => {
  item.title = 'Novo Título';
  item.targetUrl = '/nova-url.aspx';
  item.href = generateHref(item.targetUrl);
  item.ignorarFilhosNoMenu = true;
};
```

### 7.4 Excluir Item

```typescript
// Remove item e todos os filhos
menu.items = menu.items.filter(item => item.id !== itemToDelete.id);
```

### 7.5 Reordenar Itens

```typescript
const moveItem = (index: number, direction: 'up' | 'down') => {
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  [items[index], items[newIndex]] = [items[newIndex], items[index]];
};
```

---

## 8. Importação/Exportação

### 8.1 Exportar Menu

```typescript
const exportMenu = (menu: MenuConfig) => {
  const json = JSON.stringify(menu.items, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${menu.name}-${Date.now()}.json`;
  link.click();
};
```

### 8.2 Importar Menu

```typescript
const importMenu = (jsonString: string) => {
  try {
    const items = JSON.parse(jsonString);
    
    // Validação
    const isValid = items.every(validateMenuItem);
    if (!isValid) {
      throw new Error('Estrutura inválida');
    }
    
    menu.items = items;
    saveMenu(menu);
  } catch (error) {
    console.error('Erro ao importar:', error);
  }
};
```

### 8.3 Validação

```typescript
const validateMenuItem = (item: any): boolean => {
  // Campos obrigatórios
  if (typeof item.title !== 'string') return false;
  if (typeof item.targetUrl !== 'string') return false;
  if (typeof item.ignorarFilhosNoMenu !== 'boolean') return false;
  if (typeof item.href !== 'string') return false;
  
  // Validar filhos recursivamente
  if (item.filhos !== null) {
    if (!Array.isArray(item.filhos)) return false;
    return item.filhos.every(validateMenuItem);
  }
  
  return true;
};
```

---

## 9. Renderização no Site Público

### 9.1 Carregamento

```typescript
// Carregar menu principal
const storedMenus = localStorage.getItem('menus');
if (storedMenus) {
  const menus = JSON.parse(storedMenus);
  const mainMenu = menus.find(m => m.id === 'menu-principal') || menus[0];
  setMenuItems(mainMenu.items);
}
```

### 9.2 Renderização Recursiva

```tsx
const renderMenu = (items: MenuItem[], level: number = 0) => (
  <ul className={level > 0 ? 'submenu' : 'menu'}>
    {items.map(item => (
      <li key={item.href}>
        <a href={item.href}>{item.title}</a>
        {item.filhos && !item.ignorarFilhosNoMenu && (
          renderMenu(item.filhos, level + 1)
        )}
      </li>
    ))}
  </ul>
);
```

### 9.3 Navegação

```typescript
const navigateToPage = (href: string) => {
  // Buscar página por href/slug
  const page = pages.find(p => 
    `/${p.slug}` === href || p.slug === href
  );
  
  if (page) {
    setCurrentPage(page);
  }
};
```

---

## 10. Migrações

### 10.1 Formato Antigo → Novo Formato

```typescript
// Formato antigo
interface OldMenuItem {
  id: string;
  label: string;
  url: string;
  children?: OldMenuItem[];
}

// Converter
const migrate = (old: OldMenuItem): MenuItem => ({
  title: old.label,
  targetUrl: old.url,
  ignorarFilhosNoMenu: false,
  filhos: old.children ? old.children.map(migrate) : null,
  href: generateHref(old.url),
  id: old.id
});
```

### 10.2 Script de Migração

```typescript
const migrateAllMenus = () => {
  const oldMenu = localStorage.getItem('menuItems');
  if (!oldMenu) return;
  
  const oldItems = JSON.parse(oldMenu);
  const newItems = oldItems.map(migrate);
  
  const newMenu: MenuConfig = {
    id: 'menu-principal',
    name: 'Menu Principal',
    description: 'Menu migrado automaticamente',
    items: newItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('menus', JSON.stringify([newMenu]));
  localStorage.removeItem('menuItems'); // Limpar antigo
};
```

---

## 11. Boas Práticas

### 11.1 Estrutura de Dados

✅ **Fazer:**
- Use `null` para `filhos` quando não há filhos
- Sempre gere `href` a partir de `targetUrl`
- Mantenha `title` descritivo e conciso
- Use IDs únicos

❌ **Evitar:**
- Array vazio `[]` ao invés de `null`
- Editar `href` manualmente
- Títulos muito longos
- IDs duplicados

### 11.2 Performance

✅ **Fazer:**
- Cache de menus em localStorage
- Renderização lazy de submenus
- Indexação por ID

❌ **Evitar:**
- Busca linear repetida
- Re-renderização desnecessária
- Menus muito profundos (>4 níveis)

### 11.3 UX

✅ **Fazer:**
- Use `ignorarFilhosNoMenu` para menus grandes
- Breadcrumbs para navegação
- Indicador visual de item ativo
- Mobile-friendly

❌ **Evitar:**
- Muitos níveis de hierarquia
- Textos ambíguos
- Menus sem estrutura lógica

---

## 12. Exemplos Completos

### 12.1 Menu Institucional

```json
[
  {
    "title": "Institucional",
    "targetUrl": "/sites/portal/Paginas/Institucional.aspx",
    "ignorarFilhosNoMenu": false,
    "filhos": [
      {
        "title": "Quem Somos",
        "targetUrl": "/sites/portal/Paginas/Institucional/QuemSomos.aspx",
        "ignorarFilhosNoMenu": false,
        "filhos": null,
        "href": "/Institucional/QuemSomos"
      },
      {
        "title": "Nossa História",
        "targetUrl": "/sites/portal/Paginas/Institucional/Historia.aspx",
        "ignorarFilhosNoMenu": false,
        "filhos": null,
        "href": "/Institucional/Historia"
      },
      {
        "title": "Equipe",
        "targetUrl": "/sites/portal/Paginas/Institucional/Equipe.aspx",
        "ignorarFilhosNoMenu": false,
        "filhos": [
          {
            "title": "Diretoria",
            "targetUrl": "/sites/portal/Paginas/Institucional/Equipe/Diretoria.aspx",
            "ignorarFilhosNoMenu": false,
            "filhos": null,
            "href": "/Institucional/Equipe/Diretoria"
          },
          {
            "title": "Coordenação",
            "targetUrl": "/sites/portal/Paginas/Institucional/Equipe/Coordenacao.aspx",
            "ignorarFilhosNoMenu": false,
            "filhos": null,
            "href": "/Institucional/Equipe/Coordenacao"
          }
        ],
        "href": "/Institucional/Equipe"
      }
    ],
    "href": "/Institucional"
  }
]
```

### 12.2 Menu com Filhos Ocultos

```json
[
  {
    "title": "Legislação",
    "targetUrl": "/sites/portal/Paginas/Legislacao.aspx",
    "ignorarFilhosNoMenu": true,
    "filhos": [
      {
        "title": "Lei 001/2020",
        "targetUrl": "/sites/portal/Paginas/Legislacao/Lei001-2020.aspx",
        "ignorarFilhosNoMenu": false,
        "filhos": null,
        "href": "/Legislacao/Lei001-2020"
      },
      {
        "title": "Lei 002/2020",
        "targetUrl": "/sites/portal/Paginas/Legislacao/Lei002-2020.aspx",
        "ignorarFilhosNoMenu": false,
        "filhos": null,
        "href": "/Legislacao/Lei002-2020"
      }
      // ... 500+ leis
    ],
    "href": "/Legislacao"
  }
]
```

---

## 13. Troubleshooting

### Problema: href não está sendo gerado
**Solução:** Sempre use `generateHref(targetUrl)` ao criar/editar itens

### Problema: Filhos não aparecem no menu
**Solução:** Verifique se `ignorarFilhosNoMenu` está `false`

### Problema: Menu não carrega no site público
**Solução:** Verifique se existe ao menos um menu em localStorage `menus`

### Problema: Associação de páginas não funciona
**Solução:** Verifique se `associatedPages` contém IDs válidos de páginas existentes

---

## 14. Conclusão

A nova estrutura de menu oferece:

✅ **Flexibilidade**: Múltiplos menus independentes
✅ **URLs Amigáveis**: Conversão automática ASPX → HTML
✅ **Controle**: Flag `ignorarFilhosNoMenu` para menus limpos
✅ **Organização**: Hierarquia ilimitada com `filhos`
✅ **Integração**: Associação com páginas específicas
✅ **Compatibilidade**: Importação/exportação JSON
✅ **Manutenibilidade**: Código limpo e documentado

Esta estrutura foi projetada para ser escalável, mantível e user-friendly, atendendo às necessidades de portais governamentais e corporativos complexos.
