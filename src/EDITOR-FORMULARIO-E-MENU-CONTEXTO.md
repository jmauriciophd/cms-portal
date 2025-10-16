# 📝 EDITOR DE FORMULÁRIO E MENU DE CONTEXTO

## ✅ STATUS: IMPLEMENTADO COM SUCESSO!

**Data:** 16/10/2025  
**Componentes Criados:** 5 novos componentes  
**Componentes Atualizados:** PageManager  

---

## 🎯 OBJETIVO ALCANÇADO

Transformamos o sistema de páginas removendo o construtor visual (drag-and-drop) e implementando:

### ✅ **1. Editor de Formulário Completo**
- **Campos de Edição:**
  - Título da Página
  - Slug (URL amigável)
  - Imagem Destacada (upload do computador OU biblioteca de mídia)
  - Resumo/Descrição Curta
  - Editor Rich Text para conteúdo
  - Inserção de Snippets no conteúdo
  
- **Sidebar de Configurações:**
  - Status (Rascunho/Publicado/Agendado)
  - Data de Agendamento
  - Template (Padrão, Largura Total, etc)
  - Meta Description (SEO)
  - Meta Robots (SEO)
  - Preview do Google

- **Ações de Publicação:**
  - 💾 Salvar Rascunho
  - ⏰ Agendar Publicação
  - 🚀 Publicar Agora
  - 👁️ Preview em Tempo Real
  - ← Voltar

### ✅ **2. Menu de Contexto (Botão Direito)**
Implementado para **Páginas**, **Templates** e **Arquivos**:
- 📋 Copiar
- 📁 Mover
- ✏️ Renomear
- 🕐 Histórico
- 🔗 Copiar Caminho
- ℹ️ Propriedades
- 🗑️ Excluir (em vermelho)

---

## 📁 ARQUIVOS CRIADOS

### **1. `/components/pages/PageEditor.tsx`** (NEW) 
**Editor de Formulário Completo**

```typescript
interface PageEditorProps {
  page: Page | null;
  onSave: (page: Page) => void;
  onBack: () => void;
  availableSnippets?: Array<{ id: string; name: string; content: string }>;
  availableImages?: Array<{ id: string; name: string; url: string }>;
}
```

**Estrutura:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Header: [← Voltar] [Título]  [Preview][Rascunho][Agendar][Publicar] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Editor Principal - Centro]      │   [Sidebar - Direita]        │
│  ┌──────────────────────────┐     │   ┌────────────────────┐    │
│  │ Título *                 │     │   │ Publicação / SEO   │    │
│  │ Slug *                   │     │   │ ├─ Status          │    │
│  │ Imagem Destacada         │     │   │ ├─ Agendamento     │    │
│  │ Resumo                   │     │   │ ├─ Template        │    │
│  │ [Inserir Snippet]        │     │   │ ├─ Meta Desc       │    │
│  │ Editor Rich Text         │     │   │ └─ Preview Google  │    │
│  └──────────────────────────┘     │   └────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Recursos:**
- ✅ Upload de Imagem do Computador
- ✅ Seleção de Imagem da Biblioteca de Mídia
- ✅ Inserção de Snippets no Conteúdo
- ✅ Editor Rich Text (Negrito, Itálico, Listas, Links)
- ✅ Agendamento com Seletor de Data/Hora
- ✅ Preview em Tempo Real
- ✅ SEO Completo (Meta Description, Robots, Preview do Google)
- ✅ Templates Diferentes (Padrão, Largura Total, Sidebar)

---

### **2. `/components/common/ContextMenu.tsx`** (NEW)
**Menu de Contexto Reutilizável**

```typescript
export interface ContextMenuAction {
  onCopy?: () => void;
  onMove?: () => void;
  onRename?: () => void;
  onHistory?: () => void;
  onCopyPath?: () => void;
  onProperties?: () => void;
  onDelete?: () => void;
}

<ItemContextMenu
  actions={{
    onCopy: () => handleCopy(item),
    onMove: () => handleMove(item),
    onRename: () => handleRename(item),
    onHistory: () => handleHistory(item),
    onCopyPath: () => handleCopyPath(item),
    onProperties: () => handleProperties(item),
    onDelete: () => handleDelete(item)
  }}
>
  {children}
</ItemContextMenu>
```

**Design:**
```
┌────────────────────┐
│ Copiar        [📋] │
│ Mover         [📁] │
│ Renomear      [✏️] │
├────────────────────┤
│ Histórico     [🕐] │
│ Copiar Caminho[🔗] │
├────────────────────┤
│ Propriedades  [ℹ️] │
├────────────────────┤
│ Excluir       [🗑️] │ ← Vermelho
└────────────────────┘
```

---

### **3. `/components/common/ItemOperations.ts`** (NEW)
**Serviço de Operações para Itens**

```typescript
export class ItemOperationsService {
  copyItem(item: BaseItem): void
  pasteItem(targetPath?: string): BaseItem | null
  moveItem(item: BaseItem, newPath: string): BaseItem
  renameItem(item: BaseItem, newName: string): BaseItem
  deleteItem(item: BaseItem): void
  copyPath(item: BaseItem): void
  getHistory(itemId?: string): HistoryEntry[]
  addToHistory(entry: HistoryEntry): void
  restoreFromHistory(historyEntry: HistoryEntry): BaseItem | null
}

// Instâncias separadas para cada tipo
export const pageOperations = new ItemOperationsService('pages');
export const templateOperations = new ItemOperationsService('templates');
export const fileOperations = new ItemOperationsService('files');
```

**Histórico:**
```typescript
interface HistoryEntry {
  id: string;
  itemId: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'rename' | 'copy';
  timestamp: string;
  user: string;
  before?: any;
  after?: any;
  description: string;
}
```

**Armazenamento:**
- ✅ LocalStorage separado por tipo (`pages-history`, `templates-history`, `files-history`)
- ✅ Mantém últimos 100 registros
- ✅ Registra todas as ações (criar, editar, mover, renomear, excluir)

---

### **4. `/components/common/ItemDialogs.tsx`** (NEW)
**4 Diálogos de Operações**

#### **A. MoveDialog - Mover Item**
```typescript
<MoveDialog
  open={open}
  onOpenChange={setOpen}
  item={item}
  availablePaths={['pasta1', 'pasta2', 'pasta3']}
  onConfirm={(newPath) => moveItem(newPath)}
/>
```

Layout:
```
┌──────────────────────────────┐
│ Mover Item                   │
├──────────────────────────────┤
│ Localização Atual:           │
│ [📁 pasta/atual]             │
│                              │
│         ↓                    │
│                              │
│ Nova Localização:            │
│ [Select: Raiz/pasta1/pasta2] │
│                              │
│ [Cancelar] [Mover]           │
└──────────────────────────────┘
```

#### **B. RenameDialog - Renomear Item**
```typescript
<RenameDialog
  open={open}
  onOpenChange={setOpen}
  item={item}
  onConfirm={(newName) => renameItem(newName)}
/>
```

Layout:
```
┌──────────────────────────────┐
│ Renomear Item                │
├──────────────────────────────┤
│ Nome Atual:                  │
│ [Página Inicial] (disabled)  │
│                              │
│ Novo Nome:                   │
│ [Digite o novo nome...]      │
│                              │
│ [Cancelar] [Renomear]        │
└──────────────────────────────┘
```

#### **C. HistoryDialog - Histórico do Item**
```typescript
<HistoryDialog
  open={open}
  onOpenChange={setOpen}
  item={item}
  history={historyEntries}
  onRestore={(entry) => restoreVersion(entry)}
/>
```

Layout:
```
┌────────────────────────────────────────┐
│ 🕐 Histórico: Nome do Item             │
├────────────────────────────────────────┤
│ [Scroll Area]                          │
│                                        │
│  ●─────────────────────────────────   │
│  │ [Renomeado] 15/10/2025 14:30      │
│  │ Item renomeado de "X" para "Y"    │
│  │ 👤 user@email.com                 │
│  │ [Restaurar]                       │
│  │                                   │
│  ●─────────────────────────────────   │
│  │ [Atualizado] 14/10/2025 10:15     │
│  │ Conteúdo atualizado               │
│  │ 👤 user@email.com                 │
│  │                                   │
│  ●─────────────────────────────────   │
│  │ [Criado] 13/10/2025 09:00         │
│  │ Item "Y" criado                   │
│  │ 👤 user@email.com                 │
│                                        │
│ [Fechar]                               │
└────────────────────────────────────────┘
```

**Badges por Ação:**
- 🟢 Criado (verde)
- 🔵 Atualizado (azul)
- 🔴 Excluído (vermelho)
- 🟣 Movido (roxo)
- 🟡 Renomeado (amarelo)
- 🔷 Copiado (ciano)

#### **D. PropertiesDialog - Propriedades do Item**
```typescript
<PropertiesDialog
  open={open}
  onOpenChange={setOpen}
  item={item}
  additionalInfo={{
    'Slug': 'pagina-inicial',
    'Status': 'published',
    'Template': 'default'
  }}
/>
```

Layout:
```
┌────────────────────────────────────────┐
│ ℹ️ Propriedades                        │
├────────────────────────────────────────┤
│ Nome:                  Página Inicial  │
│ ─────────────────────────────────────  │
│ ID:                    123456789       │
│ ─────────────────────────────────────  │
│ Tipo:                  page            │
│ ─────────────────────────────────────  │
│ Caminho:               /pasta/sub      │
│ ─────────────────────────────────────  │
│ Criado em:             13/10/2025      │
│ ─────────────────────────────────────  │
│ Atualizado em:         15/10/2025      │
│                                        │
│ ═══════════════════════════════════   │
│ Informações Adicionais                │
│ ───────────────────────────────────   │
│ Slug:                  pagina-inicial  │
│ Status:                published       │
│ Template:              default         │
│                                        │
│ [Fechar]                               │
└────────────────────────────────────────┘
```

---

## 📊 INTERFACE ATUALIZADA

### **Page Interface - Antes vs Depois**

#### **ANTES:**
```typescript
interface Page {
  id: string;
  title: string;
  slug: string;
  components: any[]; // ❌ Array de componentes do builder
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  folder?: string;
  meta?: { description?: string; robots?: string };
}
```

#### **DEPOIS:**
```typescript
interface Page {
  id: string;
  title: string;
  slug: string;
  content: string; // ✅ HTML puro do editor
  excerpt?: string; // ✅ NOVO: Resumo
  featuredImage?: string; // ✅ NOVO: Imagem destacada
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  folder?: string;
  template?: string; // ✅ NOVO: Template selecionado
  meta?: { description?: string; robots?: string };
  
  // Para compatibilidade com ItemOperations
  name?: string;
  path?: string;
  type?: string;
}
```

---

## 🎨 FLUXO DE USO

### **1. Criar Nova Página**

```
Usuário: Clica "Nova Página"
  ↓
Sistema: Abre PageEditor com template padrão
  ↓
Formulário Exibido:
  - Título: (vazio)
  - Slug: (gerado automaticamente ao digitar título)
  - Conteúdo: <h2>Bem-vindo...</h2> (template padrão)
  - Imagem: (vazia)
  - Status: Rascunho
  ↓
Usuário: Preenche campos, adiciona imagem, insere snippets
  ↓
Usuário: Clica "Salvar Rascunho" ou "Publicar Agora"
  ↓
Sistema: Salva página, gera HTML, cria link automático
  ↓
Toast: "Página criada com sucesso!"
  ↓
Retorna para lista de páginas
```

### **2. Editar Página Existente**

```
Usuário: Clica na página OU clica direito → "Editar"
  ↓
Sistema: Abre PageEditor com dados da página
  ↓
Usuário: Edita campos necessários
  ↓
Preview: Clica "Preview" para ver resultado
  ↓
Sistema: Mostra preview renderizado
  ↓
Usuário: Clica "Editar" para voltar
  ↓
Usuário: Clica "Publicar Agora"
  ↓
Sistema: Atualiza página, atualiza HTML, atualiza link
  ↓
Toast: "Página atualizada!"
```

### **3. Usar Menu de Contexto**

```
Usuário: Clica DIREITO na página na lista
  ↓
Sistema: Exibe menu de contexto
  ┌────────────────────┐
  │ Copiar             │ ← Copia para área de transferência
  │ Mover              │ ← Abre diálogo de mover
  │ Renomear           │ ← Abre diálogo de renomear
  ├────────────────────┤
  │ Histórico          │ ← Abre diálogo de histórico
  │ Copiar Caminho     │ ← Copia caminho completo
  ├────────────────────┤
  │ Propriedades       │ ← Abre diálogo de propriedades
  ├────────────────────┤
  │ Excluir            │ ← Deleta (com confirmação)
  └────────────────────┘
  ↓
Usuário: Seleciona opção
  ↓
Sistema: Executa ação correspondente
```

### **4. Ver Histórico**

```
Usuário: Clica direito → "Histórico"
  ↓
Sistema: Abre HistoryDialog
  ↓
Exibe Timeline com todas as alterações:
  ●─────────────────────────────────
  │ [Renomeado] Hoje, 14:30
  │ Item renomeado de "Página 1" para "Home"
  │ 👤 admin@cms.com
  │ [Restaurar] ← Botão para restaurar
  │
  ●─────────────────────────────────
  │ [Atualizado] Ontem, 10:15
  │ Conteúdo atualizado
  │ 👤 editor@cms.com
  │
  ●─────────────────────────────────
  │ [Criado] 13/10/2025, 09:00
  │ Página "Home" criada
  │ 👤 admin@cms.com
  ↓
Usuário: Clica "Restaurar" em uma versão antiga
  ↓
Sistema: Restaura a versão selecionada
  ↓
Toast: "Versão restaurada do histórico"
```

---

## 🔄 OPERAÇÕES IMPLEMENTADAS

### **1. COPIAR**
```typescript
pageOperations.copyItem(page);
// Armazena em localStorage['clipboard-item']
// Toast: "Página Inicial" copiado para área de transferência
```

### **2. COLAR**
```typescript
const newPage = pageOperations.pasteItem(targetPath);
// Cria nova página com ID único
// Nome: "Página Inicial (Cópia)"
// Toast: "Página Inicial (Cópia)" colado com sucesso
```

### **3. MOVER**
```typescript
const movedPage = pageOperations.moveItem(page, '/nova/pasta');
// Move página para nova pasta
// Atualiza histórico
// Toast: "Página Inicial" movido para "/nova/pasta"
```

### **4. RENOMEAR**
```typescript
const renamedPage = pageOperations.renameItem(page, 'Novo Nome');
// Renomeia página
// Atualiza histórico
// Toast: Renomeado de "Página Inicial" para "Novo Nome"
```

### **5. EXCLUIR**
```typescript
pageOperations.deleteItem(page);
// Adiciona ao histórico
// Remove do localStorage
// Toast: "Página Inicial" excluído com sucesso
```

### **6. COPIAR CAMINHO**
```typescript
pageOperations.copyPath(page);
// Copia caminho completo: "/pasta/subpasta/Página Inicial"
// Para clipboard do sistema
// Toast: Caminho copiado para área de transferência
```

### **7. HISTÓRICO**
```typescript
const history = pageOperations.getHistory(page.id);
// Retorna array de HistoryEntry
// Ordenado por data (mais recente primeiro)
// Mostra até 100 últimas ações
```

---

## 📸 RECURSOS DO EDITOR

### **Upload de Imagem**
```typescript
// Do Computador
<input type="file" accept="image/*" onChange={handleImageUpload} />
// Lê arquivo com FileReader, converte para base64
// Armazena em page.featuredImage

// Da Biblioteca de Mídia
availableImages.map(img => (
  <button onClick={() => selectSystemImage(img)}>
    <img src={img.url} />
  </button>
))
```

### **Inserção de Snippets**
```typescript
const availableSnippets = [
  { id: '1', name: 'Botão CTA', content: '<button class="...">Clique</button>' },
  { id: '2', name: 'Card Simples', content: '<div class="...">...</div>' },
  { id: '3', name: 'Lista com Ícones', content: '<ul>...</ul>' }
];

// Ao selecionar snippet:
setContent(prevContent => prevContent + '\n\n' + snippet.content);
```

### **Agendamento**
```typescript
<Input
  type="datetime-local"
  value={scheduledDate}
  onChange={(e) => setScheduledDate(e.target.value)}
/>

// Ao salvar com status='scheduled':
if (status === 'scheduled' && !scheduledDate) {
  toast.error('Selecione a data de agendamento');
  return;
}
```

### **SEO - Preview do Google**
```typescript
<div className="google-preview">
  <div className="title">{page.title}</div>
  <div className="url">{window.location.origin}/{page.slug}</div>
  <div className="description">{page.meta.description || page.excerpt}</div>
</div>
```

---

## 🎯 MENU DE CONTEXTO - APLICAÇÃO

### **Para Páginas:**
```typescript
<ItemContextMenu
  actions={{
    onCopy: () => pageOperations.copyItem(page),
    onMove: () => setMoveDialog({ open: true, item: page }),
    onRename: () => setRenameDialog({ open: true, item: page }),
    onHistory: () => setHistoryDialog({ open: true, item: page }),
    onCopyPath: () => pageOperations.copyPath(page),
    onProperties: () => setPropertiesDialog({ open: true, item: page }),
    onDelete: () => handleDelete(page.id)
  }}
>
  <Card>...</Card>
</ItemContextMenu>
```

### **Para Templates:**
```typescript
<ItemContextMenu
  actions={{
    onCopy: () => templateOperations.copyItem(template),
    onMove: () => setMoveDialog({ open: true, item: template }),
    onRename: () => setRenameDialog({ open: true, item: template }),
    onHistory: () => setHistoryDialog({ open: true, item: template }),
    onCopyPath: () => templateOperations.copyPath(template),
    onProperties: () => setPropertiesDialog({ open: true, item: template }),
    onDelete: () => handleDelete(template.id)
  }}
>
  <Card>...</Card>
</ItemContextMenu>
```

### **Para Arquivos:**
```typescript
<ItemContextMenu
  actions={{
    onCopy: () => fileOperations.copyItem(file),
    onMove: () => setMoveDialog({ open: true, item: file }),
    onRename: () => setRenameDialog({ open: true, item: file }),
    onHistory: () => setHistoryDialog({ open: true, item: file }),
    onCopyPath: () => fileOperations.copyPath(file),
    onProperties: () => setPropertiesDialog({ open: true, item: file }),
    onDelete: () => handleDelete(file.id)
  }}
>
  <Card>...</Card>
</ItemContextMenu>
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Editor de Páginas:**
- ✅ Formulário de edição completo
- ✅ Título e Slug
- ✅ Upload de imagem do computador
- ✅ Seleção de imagem da biblioteca
- ✅ Resumo/Excerpt
- ✅ Editor rich text
- ✅ Inserção de snippets
- ✅ Status (Draft/Published/Scheduled)
- ✅ Data de agendamento
- ✅ Seleção de template
- ✅ Meta description (SEO)
- ✅ Meta robots (SEO)
- ✅ Preview do Google
- ✅ Preview em tempo real
- ✅ Botões de ação (Salvar/Agendar/Publicar)

### **Menu de Contexto:**
- ✅ Componente ItemContextMenu reutilizável
- ✅ Copiar item
- ✅ Mover item
- ✅ Renomear item
- ✅ Ver histórico
- ✅ Copiar caminho
- ✅ Ver propriedades
- ✅ Excluir item

### **Serviço de Operações:**
- ✅ ItemOperationsService class
- ✅ Instâncias separadas (pages/templates/files)
- ✅ Copiar/Colar funcional
- ✅ Mover com seleção de pasta
- ✅ Renomear com validação
- ✅ Histórico completo
- ✅ Restaurar versões antigas
- ✅ Copiar caminho para clipboard

### **Diálogos:**
- ✅ MoveDialog (mover para pasta)
- ✅ RenameDialog (renomear item)
- ✅ HistoryDialog (timeline visual)
- ✅ PropertiesDialog (informações detalhadas)

### **Integração:**
- ✅ PageManager atualizado
- ✅ Interface Page atualizada
- ✅ Snippets disponíveis
- ✅ Biblioteca de imagens
- ✅ Histórico persistente
- ✅ Toast notifications

---

## 📚 COMO USAR

### **1. Criar Página**
```typescript
import { PageManager } from './components/pages/PageManager';

<PageManager currentUser={user} />
```

### **2. Adicionar Snippets Customizados**
```typescript
const customSnippets = [
  { 
    id: '1', 
    name: 'Hero Section', 
    content: '<section class="hero">...</section>' 
  },
  { 
    id: '2', 
    name: 'Testimonial', 
    content: '<div class="testimonial">...</div>' 
  }
];

<PageEditor
  page={page}
  availableSnippets={customSnippets}
  ...
/>
```

### **3. Adicionar Imagens à Biblioteca**
```typescript
const libraryImages = [
  { id: '1', name: 'Logo', url: '/images/logo.png' },
  { id: '2', name: 'Banner', url: '/images/banner.jpg' },
  { id: '3', name: 'Avatar', url: '/images/avatar.png' }
];

<PageEditor
  page={page}
  availableImages={libraryImages}
  ...
/>
```

### **4. Usar Menu de Contexto em Outro Componente**
```typescript
import { ItemContextMenu } from './components/common/ContextMenu';
import { templateOperations } from './components/common/ItemOperations';

<ItemContextMenu
  actions={{
    onCopy: () => templateOperations.copyItem(template),
    onMove: () => openMoveDialog(template),
    onRename: () => openRenameDialog(template),
    onHistory: () => openHistoryDialog(template),
    onCopyPath: () => templateOperations.copyPath(template),
    onProperties: () => openPropertiesDialog(template),
    onDelete: () => deleteTemplate(template.id)
  }}
>
  <YourComponent>...</YourComponent>
</ItemContextMenu>
```

---

## 🎉 CONCLUSÃO

**SISTEMA DE EDITOR DE FORMULÁRIO E MENU DE CONTEXTO IMPLEMENTADO COM SUCESSO!**

### **Resultado:**
✅ **Editor profissional estilo WordPress** para criação de páginas  
✅ **Menu de contexto completo** com 7 operações  
✅ **Histórico visual** com timeline e restauração  
✅ **4 diálogos modais** para operações  
✅ **Sistema reutilizável** para páginas, templates e arquivos  
✅ **SEO integrado** com preview do Google  
✅ **Upload de imagens** do computador ou biblioteca  
✅ **Inserção de snippets** no conteúdo  
✅ **Agendamento de publicação**  
✅ **Preview em tempo real**  

### **Arquivos Criados:**
1. ✅ `/components/pages/PageEditor.tsx` - Editor de formulário completo
2. ✅ `/components/common/ContextMenu.tsx` - Menu de contexto reutilizável
3. ✅ `/components/common/ItemOperations.ts` - Serviço de operações
4. ✅ `/components/common/ItemDialogs.tsx` - 4 diálogos modais
5. ✅ `/EDITOR-FORMULARIO-E-MENU-CONTEXTO.md` - Esta documentação

### **Componentes Atualizados:**
1. ✅ `/components/pages/PageManager.tsx` - Usa novo editor e menu de contexto

**AGORA O CMS TEM UM SISTEMA DE EDIÇÃO PROFISSIONAL COM MENU DE CONTEXTO COMPLETO! 🚀📝✨**
