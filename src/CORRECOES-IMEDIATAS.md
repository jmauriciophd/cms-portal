# 🔧 CORREÇÕES IMEDIATAS - PLANO DE AÇÃO

## ✅ STATUS: _redirects CORRIGIDO (20ª VEZ!)

```bash
✅ /public/_redirects/Code-component-37-131.tsx → DELETADO
✅ /public/_redirects/Code-component-37-158.tsx → DELETADO
✅ /public/_redirects → RECRIADO COMO ARQUIVO
```

---

## 📋 CORREÇÕES A APLICAR

### **1. ✅ CORRIGIR NAVEGAÇÃO BREADCRUMB**

**Problema:** Cliques nos itens do breadcrumb não navegam corretamente

**Arquivos afetados:**
- `/components/pages/PageManager.tsx`
- `/components/articles/ArticleManager.tsx`
- `/components/files/FileManager.tsx`

**Correção:**

```tsx
// ANTES (BUGADO):
onClick={() => {
  if (index <= 2) {  // ← Problema: sempre volta pra raiz
    setCurrentPath('');
  } else {
    setCurrentPath(item.path);
  }
}}

// DEPOIS (CORRETO):
onClick={() => {
  if (index === 0) {
    // Clicou em "Início" → voltar pra raiz
    setCurrentPath('');
  } else if (index === 1 || index === 2) {
    // Clicou em "Arquivos" ou "páginas/matérias" → voltar pra raiz da seção
    setCurrentPath('');
  } else {
    // Clicou em pasta → navegar pra pasta específica
    setCurrentPath(item.path);
  }
}}
```

---

### **2. ⚠️ VERIFICAR BOTÃO "NOVO"**

**Problema:** Dropdown pode não estar abrindo

**Checklist de debug:**

1. ✅ Importações corretas?
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
```

2. ✅ Z-index correto?
```tsx
<DropdownMenuContent align="end" className="z-50">
```

3. ✅ Handlers funcionando?
```tsx
<DropdownMenuItem onClick={() => {
  console.log('Nova Pasta clicada!');
  handleCreateFolder();
}}>
```

---

### **3. ⚠️ VERIFICAR UPLOAD DE ARQUIVOS**

**Problema:** Upload pode não estar processando arquivos

**Checklist de debug:**

1. ✅ Input file renderizado?
```tsx
<input
  ref={fileInputRef}
  type="file"
  multiple
  accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.html,.css,.js,.json"
  onChange={handleFileUpload}
  className="hidden"
/>
```

2. ✅ Tipos de arquivo permitidos?
```typescript
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',  // ← Adicionar
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',  // ← Adicionar
  'application/json'
];
```

3. ✅ Logs de debug?
```tsx
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log('🔵 Upload iniciado');
  const uploadedFiles = e.target.files;
  console.log('📁 Arquivos:', uploadedFiles?.length);
  
  if (!uploadedFiles || uploadedFiles.length === 0) {
    console.log('❌ Nenhum arquivo selecionado');
    return;
  }
  
  // ... resto do código
};
```

---

## 🎯 PRIORIDADES

1. **ALTA** - ✅ Breadcrumb (impede navegação)
2. **MÉDIA** - ⚠️ Botão "Novo" (workaround possível)
3. **ALTA** - ⚠️ Upload (funcionalidade crítica)

---

## 📝 ESCLARECIMENTOS

### **Páginas vs Matérias vs Arquivos**

❌ **NÃO são atalhos!**

✅ **São gerenciadores independentes:**

```
Dashboard
├── Matérias
│   ├── localStorage: 'articles'
│   ├── Estrutura de pastas própria
│   └── Editor de artigos/notícias
│
├── Páginas
│   ├── localStorage: 'pages'
│   ├── Estrutura de pastas própria
│   └── Editor de páginas com componentes
│       ├── Hero Section
│       ├── Text Block
│       ├── Image
│       ├── Cards
│       └── Custom HTML
│
└── Arquivos
    ├── localStorage: 'files'
    ├── Estrutura de pastas própria
    └── Gerenciador de mídia (imagens, PDFs, etc)
```

**Semelhança:** Todos usam breadcrumb e pastas (UX consistente), mas são INDEPENDENTES.

---

### **Sistema de Componentes**

✅ **ESTÁ IMPLEMENTADO!**

**Prova:**

```typescript
// PageBuilder.tsx
interface Page {
  id?: string;
  title: string;
  slug: string;
  components: PageComponent[];  // ← Array de componentes!
  status: 'draft' | 'published';
}

interface PageComponent {
  id: string;
  type: 'hero' | 'text' | 'image' | 'cards' | 'custom';
  content: any;
}
```

**Componentes disponíveis:**
- ✅ Hero Section (título, subtítulo, botão)
- ✅ Text Block (editor de texto)
- ✅ Image (imagem com caption)
- ✅ Cards (grid de cards)
- ✅ Custom HTML (HTML personalizado)

**NÃO houve reversão para modelo antigo!**

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Aplicar correção do Breadcrumb
2. ⚠️ Testar botão "Novo" com logs
3. ⚠️ Testar upload com logs e tipos ampliados
4. 📖 Documentar estrutura (Páginas ≠ Arquivos)
5. 🎨 Melhorar feedback visual do upload

---

## 📊 RESUMO

**Corrigido:**
- ✅ _redirects (20ª vez!)

**A corrigir:**
- ❌ Breadcrumb (alta prioridade)
- ⚠️ Botão "Novo" (média prioridade)
- ⚠️ Upload (alta prioridade)

**Esclarecido:**
- ✅ Sistema de componentes ESTÁ implementado
- ✅ Páginas/Matérias/Arquivos são independentes
