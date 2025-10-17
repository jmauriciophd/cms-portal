# 🎬 BIBLIOTECA DE MÍDIA INTEGRADA AO EDITOR DE MATÉRIAS

## ✅ STATUS: IMPLEMENTADO COM SUCESSO!

**Data:** 16/10/2025  
**Funcionalidade:** Seletor de mídia integrado para inserir imagens, vídeos e áudios no editor de matérias  
**Arquivos:** `/components/files/MediaLibrarySelector.tsx` + `/components/articles/ArticleEditor.tsx`  

---

## 🎯 O QUE FOI IMPLEMENTADO

### **Componente MediaLibrarySelector**
✅ Dialog modal para selecionar arquivos  
✅ Navegação por pastas (FileManager integrado)  
✅ Filtro por tipo de arquivo (imagem, vídeo, áudio)  
✅ Busca de arquivos  
✅ Preview de imagens em miniatura  
✅ Seleção única ou múltipla  
✅ Breadcrumb de navegação  
✅ Info de tamanho e tipo de arquivo  

### **Integração no ArticleEditor**
✅ Botão "Biblioteca de Mídia" no editor  
✅ Inserção inteligente no cursor  
✅ Geração automática de HTML correto  
✅ Suporte para imagens, vídeos e áudios  
✅ Ref para controle do textarea  

---

## 🎨 INTERFACE DO SELETOR

```
┌────────────────────────────────────────────────────┐
│  Biblioteca de Mídia                          [×]  │
├────────────────────────────────────────────────────┤
│                                                    │
│  [←] Início / Pasta1 / Pasta2       [🔍 Buscar]  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │                                             │  │
│  │  📁 Pasta1    📁 Pasta2    📁 Pasta3       │  │
│  │                                             │  │
│  │  [IMG]        [IMG]        [IMG]           │  │
│  │  foto1.jpg    foto2.png    banner.jpg      │  │
│  │  Imagem|2MB   Imagem|1MB   Imagem|500KB    │  │
│  │                                             │  │
│  │  [🎬]          [🎵]                         │  │
│  │  video.mp4    audio.mp3                    │  │
│  │  Vídeo|10MB   Áudio|3MB                    │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  foto1.jpg selecionado       [Cancelar] [Inserir] │
└────────────────────────────────────────────────────┘
```

---

## 🔧 ARQUIVOS CRIADOS/MODIFICADOS

### **1. `/components/files/MediaLibrarySelector.tsx`** ✅ NOVO

**Principais Funcionalidades:**

```typescript
interface MediaLibrarySelectorProps {
  open: boolean;              // Controla visibilidade
  onClose: () => void;        // Callback ao fechar
  onSelect: (file: FileItem) => void;  // Callback ao selecionar
  allowedTypes?: string[];    // Filtro de tipos ['image/*', 'video/*', 'audio/*']
  multiple?: boolean;         // Seleção múltipla
}
```

**Recursos:**

1. **Carregamento de Arquivos**
```typescript
const loadFiles = () => {
  const stored = localStorage.getItem('fileSystem');
  if (stored) {
    const allFiles = JSON.parse(stored);
    setFiles(allFiles);
  }
};
```

2. **Filtro por Tipo**
```typescript
const isFileTypeAllowed = (file: FileItem): boolean => {
  if (!file.mimeType) return false;
  
  return allowedTypes.some(allowedType => {
    if (allowedType.endsWith('/*')) {
      const typePrefix = allowedType.replace('/*', '');
      return file.mimeType?.startsWith(typePrefix);
    }
    return file.mimeType === allowedType;
  });
};
```

3. **Navegação por Pastas**
```typescript
const getCurrentFiles = (): FileItem[] => {
  return files.filter(f => {
    const matchesPath = f.parent === currentPath;
    const matchesSearch = searchTerm === '' || 
      f.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (f.type === 'folder') {
      return matchesPath && matchesSearch;
    }
    
    return matchesPath && matchesSearch && isFileTypeAllowed(f);
  });
};
```

4. **Ícones por Tipo**
```typescript
const getFileIcon = (file: FileItem) => {
  if (file.type === 'folder') return <Folder className="w-8 h-8 text-blue-500" />;
  if (file.mimeType?.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-green-500" />;
  if (file.mimeType?.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
  if (file.mimeType?.startsWith('audio/')) return <Music className="w-8 h-8 text-pink-500" />;
  return <FileIcon className="w-8 h-8 text-gray-500" />;
};
```

5. **Preview de Imagens**
```typescript
{file.mimeType?.startsWith('image/') && file.url ? (
  <div className="w-full h-24 mb-2 flex items-center justify-center overflow-hidden rounded">
    <img 
      src={file.url} 
      alt={file.name}
      className="max-w-full max-h-full object-contain"
    />
  </div>
) : (
  <div className="mb-2">{getFileIcon(file)}</div>
)}
```

6. **Seleção com Feedback Visual**
```typescript
const isSelected = multiple 
  ? selectedFiles.some(f => f.id === file.id)
  : selectedFile?.id === file.id;

<div className={`
  flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all
  ${isSelected 
    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500' 
    : 'hover:bg-gray-50 hover:border-gray-300'
  }
`}>
  {isSelected && (
    <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
      <Check className="w-3 h-3" />
    </div>
  )}
  ...
</div>
```

---

### **2. `/components/articles/ArticleEditor.tsx`** ✅ MODIFICADO

**Mudanças Implementadas:**

1. **Imports Adicionados**
```typescript
import { useState, useEffect, useRef } from 'react';  // + useRef
import { ArrowLeft, Save, Eye, Code, Image as ImageIcon } from 'lucide-react';  // + ImageIcon
import { MediaLibrarySelector } from '../files/MediaLibrarySelector';  // + Componente
```

2. **Estados Adicionados**
```typescript
const [showMediaLibrary, setShowMediaLibrary] = useState(false);
const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
```

3. **Função de Seleção de Mídia**
```typescript
const handleMediaSelect = (file: any) => {
  let mediaHtml = '';
  
  // Imagem
  if (file.mimeType?.startsWith('image/')) {
    mediaHtml = `<img src="${file.url}" alt="${file.name}" style="max-width: 100%; height: auto;" />`;
  } 
  // Vídeo
  else if (file.mimeType?.startsWith('video/')) {
    mediaHtml = `<video controls style="max-width: 100%; height: auto;">
  <source src="${file.url}" type="${file.mimeType}">
  Seu navegador não suporta vídeos.
</video>`;
  } 
  // Áudio
  else if (file.mimeType?.startsWith('audio/')) {
    mediaHtml = `<audio controls style="width: 100%;">
  <source src="${file.url}" type="${file.mimeType}">
  Seu navegador não suporta áudio.
</audio>`;
  } 
  // Outro arquivo
  else {
    mediaHtml = `<a href="${file.url}" download="${file.name}">${file.name}</a>`;
  }

  // Inserir no cursor atual
  const textarea = contentTextareaRef.current;
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = formData.content;
    
    const newContent = 
      currentContent.substring(0, start) + 
      '\n' + mediaHtml + '\n' +
      currentContent.substring(end);
    
    setFormData({ ...formData, content: newContent });
    
    // Refocar no textarea após inserção
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + mediaHtml.length + 2;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  }
};
```

4. **Botão Biblioteca de Mídia**
```typescript
<div className="flex items-center justify-between mb-2">
  <Label htmlFor="content">Conteúdo</Label>
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => setShowMediaLibrary(true)}
  >
    <ImageIcon className="w-4 h-4 mr-2" />
    Biblioteca de Mídia
  </Button>
</div>
```

5. **Textarea com Ref**
```typescript
<Textarea
  ref={contentTextareaRef}  // ← Ref para controle do cursor
  id="content"
  value={formData.content}
  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
  placeholder="Digite o conteúdo da matéria (HTML simples permitido)"
  rows={15}
  required
/>
```

6. **Componente MediaLibrarySelector**
```typescript
<MediaLibrarySelector
  open={showMediaLibrary}
  onClose={() => setShowMediaLibrary(false)}
  onSelect={handleMediaSelect}
  allowedTypes={['image/*', 'video/*', 'audio/*']}
  multiple={false}
/>
```

---

## 🎬 COMO FUNCIONA

### **Fluxo Completo:**

```
1. Usuário está editando uma matéria
   ↓
2. Clica no botão "Biblioteca de Mídia"
   ↓
3. Abre o MediaLibrarySelector em modal
   ↓
4. Usuário navega pelas pastas
   ├── Clica em pasta → Abre pasta
   ├── Clica voltar → Volta pasta anterior
   └── Usa busca → Filtra arquivos
   ↓
5. Usuário seleciona uma mídia
   ├── Imagem → Preview aparece
   ├── Vídeo → Ícone de vídeo
   └── Áudio → Ícone de áudio
   ↓
6. Clica "Inserir"
   ↓
7. handleMediaSelect() é chamado
   ↓
8. Gera HTML correto conforme tipo:
   ├── Imagem: <img src="..." />
   ├── Vídeo: <video><source src="..." /></video>
   └── Áudio: <audio><source src="..." /></audio>
   ↓
9. Insere no cursor atual do textarea
   ↓
10. Fecha o modal
    ↓
11. Mídia inserida no conteúdo! ✅
```

---

## 🧪 EXEMPLOS DE USO

### **Exemplo 1: Inserir Imagem**

**Ação:**
```
1. Escrever texto: "Veja a foto do evento:"
2. Posicionar cursor após os dois pontos
3. Clicar "Biblioteca de Mídia"
4. Navegar até pasta "eventos/2025"
5. Selecionar "evento-principal.jpg"
6. Clicar "Inserir"
```

**Resultado:**
```html
<p>Veja a foto do evento:</p>
<img src="data:image/jpeg;base64,..." alt="evento-principal.jpg" style="max-width: 100%; height: auto;" />
<p></p>
```

---

### **Exemplo 2: Inserir Vídeo**

**Ação:**
```
1. Escrever: "Assista ao vídeo completo:"
2. Posicionar cursor no final
3. Clicar "Biblioteca de Mídia"
4. Selecionar "entrevista.mp4"
5. Clicar "Inserir"
```

**Resultado:**
```html
<p>Assista ao vídeo completo:</p>
<video controls style="max-width: 100%; height: auto;">
  <source src="data:video/mp4;base64,..." type="video/mp4">
  Seu navegador não suporta vídeos.
</video>
```

---

### **Exemplo 3: Inserir Áudio**

**Ação:**
```
1. Escrever: "Ouça o podcast:"
2. Clicar "Biblioteca de Mídia"
3. Selecionar "episodio-01.mp3"
4. Clicar "Inserir"
```

**Resultado:**
```html
<p>Ouça o podcast:</p>
<audio controls style="width: 100%;">
  <source src="data:audio/mpeg;base64,..." type="audio/mpeg">
  Seu navegador não suporta áudio.
</audio>
```

---

## 📊 TIPOS DE ARQUIVO SUPORTADOS

### **Imagens** 🖼️
```
✅ image/jpeg (.jpg, .jpeg)
✅ image/png (.png)
✅ image/gif (.gif)
✅ image/webp (.webp)
✅ image/svg+xml (.svg)
```

**HTML Gerado:**
```html
<img src="[URL]" alt="[NOME]" style="max-width: 100%; height: auto;" />
```

---

### **Vídeos** 🎬
```
✅ video/mp4 (.mp4)
✅ video/webm (.webm)
✅ video/ogg (.ogg)
```

**HTML Gerado:**
```html
<video controls style="max-width: 100%; height: auto;">
  <source src="[URL]" type="[MIME_TYPE]">
  Seu navegador não suporta vídeos.
</video>
```

---

### **Áudios** 🎵
```
✅ audio/mpeg (.mp3)
✅ audio/wav (.wav)
✅ audio/ogg (.ogg)
✅ audio/webm (.webm)
```

**HTML Gerado:**
```html
<audio controls style="width: 100%;">
  <source src="[URL]" type="[MIME_TYPE]">
  Seu navegador não suporta áudio.
</audio>
```

---

## 🎯 RECURSOS AVANÇADOS

### **1. Inserção no Cursor**
```typescript
const textarea = contentTextareaRef.current;
const start = textarea.selectionStart;  // Posição inicial seleção
const end = textarea.selectionEnd;      // Posição final seleção

// Insere entre start e end (substitui seleção se houver)
const newContent = 
  currentContent.substring(0, start) + 
  '\n' + mediaHtml + '\n' +
  currentContent.substring(end);
```

**Exemplo:**
```
Texto antes do cursor|[SELEÇÃO]texto depois

↓ Insere imagem ↓

Texto antes do cursor
<img src="..." />
texto depois
```

---

### **2. Navegação por Pastas**
```
/
├── eventos/
│   ├── 2025/
│   │   ├── janeiro/
│   │   │   ├── evento1.jpg ← Seleciona aqui
│   │   │   └── evento2.jpg
│   │   └── fevereiro/
│   └── 2024/
├── produtos/
└── banners/
```

**Breadcrumb:**
```
Início > eventos > 2025 > janeiro
  ↑        ↑        ↑       ↑
Clicável em cada parte para voltar
```

---

### **3. Busca Inteligente**
```typescript
const getCurrentFiles = (): FileItem[] => {
  return files.filter(f => {
    const matchesPath = f.parent === currentPath;
    const matchesSearch = searchTerm === '' || 
      f.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Mostra apenas arquivos do tipo permitido
    if (f.type === 'folder') {
      return matchesPath && matchesSearch;
    }
    
    return matchesPath && matchesSearch && isFileTypeAllowed(f);
  });
};
```

**Exemplo de Busca:**
```
Termo: "evento"

Resultados:
✅ evento-2025.jpg
✅ evento-principal.mp4
✅ podcast-evento.mp3
❌ banner.jpg (não contém "evento")
```

---

### **4. Preview de Imagens**
```typescript
{file.mimeType?.startsWith('image/') && file.url ? (
  <div className="w-full h-24 mb-2">
    <img 
      src={file.url} 
      alt={file.name}
      className="max-w-full max-h-full object-contain"
    />
  </div>
) : (
  <div className="mb-2">{getFileIcon(file)}</div>
)}
```

**Resultado Visual:**
```
┌────────────┐  ┌────────────┐  ┌────────────┐
│  [PREVIEW] │  │  [PREVIEW] │  │  [PREVIEW] │
│   IMAGEM   │  │   IMAGEM   │  │   IMAGEM   │
├────────────┤  ├────────────┤  ├────────────┤
│ foto1.jpg  │  │ foto2.png  │  │ banner.jpg │
│ Imagem|2MB │  │ Imagem|1MB │  │ Imagem|5MB │
└────────────┘  └────────────┘  └────────────┘

┌────────────┐  ┌────────────┐
│     🎬     │  │     🎵     │
│   VÍDEO    │  │   ÁUDIO    │
├────────────┤  ├────────────┤
│ video.mp4  │  │ audio.mp3  │
│ Vídeo|10MB │  │ Áudio|3MB  │
└────────────┘  └────────────┘
```

---

### **5. Badges de Tipo**
```typescript
<Badge variant="secondary" className="text-xs">
  {getFileTypeLabel(file.mimeType)}
</Badge>

const getFileTypeLabel = (mimeType?: string): string => {
  if (!mimeType) return 'Arquivo';
  if (mimeType.startsWith('image/')) return 'Imagem';
  if (mimeType.startsWith('video/')) return 'Vídeo';
  if (mimeType.startsWith('audio/')) return 'Áudio';
  return 'Arquivo';
};
```

---

## ✅ BENEFÍCIOS

### **Para Usuários:**
✅ **Fácil de Usar:** Interface intuitiva e familiar  
✅ **Navegação Visual:** Vê exatamente o que vai inserir  
✅ **Sem Código:** Não precisa escrever HTML manualmente  
✅ **Organizado:** Navega por pastas como no Windows/Mac  
✅ **Busca Rápida:** Encontra arquivos rapidamente  
✅ **Preview:** Vê miniaturas antes de inserir  

### **Para Desenvolvedores:**
✅ **Reutilizável:** Componente pode ser usado em outros editores  
✅ **Configurável:** Props para controlar comportamento  
✅ **Type-Safe:** TypeScript com interfaces claras  
✅ **Performático:** Carrega do localStorage  
✅ **Manutenível:** Código limpo e bem organizado  
✅ **Extensível:** Fácil adicionar novos tipos de arquivo  

---

## 🧪 TESTES COMPLETOS

### **Teste 1: Inserir Imagem**
1. ✅ Vá em "Matérias" → "Nova Matéria"
2. ✅ Digite algum texto no conteúdo
3. ✅ Posicione o cursor onde quer a imagem
4. ✅ Clique "Biblioteca de Mídia"
5. ✅ Navegue até encontrar uma imagem
6. ✅ Selecione a imagem (deve mostrar preview)
7. ✅ Clique "Inserir"
8. ✅ Imagem deve aparecer no código HTML

### **Teste 2: Navegação por Pastas**
1. ✅ Clique "Biblioteca de Mídia"
2. ✅ Clique em uma pasta → Deve abrir
3. ✅ Clique "←" → Deve voltar
4. ✅ Breadcrumb deve mostrar caminho atual
5. ✅ Clique em parte do breadcrumb → Deve navegar

### **Teste 3: Busca de Arquivos**
1. ✅ Clique "Biblioteca de Mídia"
2. ✅ Digite termo de busca
3. ✅ Deve filtrar arquivos em tempo real
4. ✅ Limpe busca → Deve mostrar todos novamente

### **Teste 4: Inserir Vídeo**
1. ✅ Posicione cursor
2. ✅ Biblioteca de Mídia
3. ✅ Selecione vídeo (.mp4, .webm)
4. ✅ Inserir → Deve gerar tag `<video>`

### **Teste 5: Inserir Áudio**
1. ✅ Posicione cursor
2. ✅ Biblioteca de Mídia
3. ✅ Selecione áudio (.mp3, .wav)
4. ✅ Inserir → Deve gerar tag `<audio>`

### **Teste 6: Preview Visual**
1. ✅ Vá em "Preview" da matéria
2. ✅ Imagens devem aparecer renderizadas
3. ✅ Vídeos devem ter player funcional
4. ✅ Áudios devem ter player funcional

---

## 🎉 CONCLUSÃO

**FUNCIONALIDADE 100% IMPLEMENTADA!**

### **O que foi criado:**
✅ **MediaLibrarySelector:** Componente completo de seleção  
✅ **Integração ArticleEditor:** Botão + inserção automática  
✅ **Navegação:** Sistema de pastas funcional  
✅ **Filtros:** Apenas mídias relevantes (img/video/audio)  
✅ **Preview:** Miniaturas de imagens  
✅ **Busca:** Filtro em tempo real  
✅ **Inserção:** HTML correto gerado automaticamente  
✅ **Cursor:** Insere na posição exata  

### **Arquivos Criados/Modificados:**
1. ✅ `/components/files/MediaLibrarySelector.tsx` - NOVO
2. ✅ `/components/articles/ArticleEditor.tsx` - MODIFICADO
3. ✅ `/BIBLIOTECA-MIDIA-INTEGRADA.md` - Esta documentação

---

**AGORA VOCÊ PODE INSERIR IMAGENS, VÍDEOS E ÁUDIOS DO FILE MANAGER DIRETAMENTE NO EDITOR DE MATÉRIAS! 🚀🎬🎵**

**Sistema completo, intuitivo e profissional!**
