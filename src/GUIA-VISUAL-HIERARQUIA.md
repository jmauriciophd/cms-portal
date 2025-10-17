# 🎨 Guia Visual - Sistema de Hierarquia

## 🚀 Acesso Rápido

```
1. Login no sistema
2. Menu lateral → 🔷 "Page Builder Hierárquico"
3. Pronto! Comece a criar
```

---

## 📐 Layout da Interface

```
┌─────────────────────────────────────────────────────────────┐
│ ↶ ↷ | 👁️ </> | 📄 ⬇️ ⬆️ | 🗑️        [Cancelar] [💾 Salvar] │ Toolbar
├──────────┬──────────────────────────────────────┬───────────┤
│          │                                      │           │
│ BIBLIOTECA│           CANVAS                    │PROPRIEDADES│
│ DE COMPO-│         (Área de Edição)            │           │
│ NENTES   │                                      │           │
│          │  ┌──────────────────────────┐       │           │
│ 🔍 Buscar│  │ DROP ZONE (azul quando   │       │ Tipo: ...  │
│          │  │ você arrasta sobre)      │       │ ID: ...    │
│ 📦 Contai│  │                          │       │           │
│ ners     │  │  📦 section              │       │ ClassName: │
│          │  │    └─ 📦 container       │       │ [____...]  │
│ • Section│  │       ├─ 📄 h1          │       │           │
│ • Contai-│  │       ├─ 📄 p           │       │ Props:     │
│   ner    │  │       └─ 🔘 button      │       │ • text:... │
│ • Div    │  │                          │       │ • tag:...  │
│          │  └──────────────────────────┘       │           │
│ 🔲 Layouts│                                     │ Filhos: 3  │
│          │  (Arraste componentes aqui)         │           │
│ • Grid   │                                      │           │
│ • Flexbox│                                      │           │
│          │                                      │           │
│ 📄 Textos│                                      │           │
│          │                                      │           │
│ • Heading│                                      │           │
│ • Paragra│                                      │           │
│          │                                      │           │
└──────────┴──────────────────────────────────────┴───────────┘
```

---

## 🎯 Drop Zones Visuais

Quando você arrasta um componente sobre um container:

```
┌─────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← LINHA AZUL (Top) = Adiciona ANTES
│                                 │
│  📦 Container Alvo              │
│                                 │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ ÁREA AZUL COM BORDA      ┃  │ ← ÁREA CENTRAL = Adiciona DENTRO
│  ┃ (Middle/Inside)           ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← LINHA AZUL (Bottom) = Adiciona DEPOIS
└─────────────────────────────────┘
```

---

## 🎮 Controles do Componente

Ao passar o mouse sobre um componente:

```
┌────────────────────────────────────────────┐
│ [section] [≡] [+] [👁️] [📋] [🗑️]          │ ← Barra de controles
├────────────────────────────────────────────┤
│                                            │
│  📦 Section                                │
│    └─ Conteúdo aqui                       │
│                                            │
│                                [3 filhos] │ ← Badge de info
└────────────────────────────────────────────┘

Legenda:
• [section] = Tipo do componente
• [≡] = Arrastar (handle)
• [+] = Adicionar filho
• [👁️] = Colapsar/Expandir
• [📋] = Duplicar
• [🗑️] = Remover
```

---

## 📚 Biblioteca de Componentes

```
┌─────────────────────────────────┐
│ 🔍 Buscar componentes...        │
├─────────────────────────────────┤
│                                 │
│ 📦 CONTAINERS (8)               │
│ ┌─────────────────────────┐    │
│ │ 📦 Section              │    │
│ │ Container principal     │    │
│ │ [Badge: Container]      │    │
│ │ [Preview: ┌───┐]        │    │
│ └─────────────────────────┘    │
│                                 │
│ 🔲 LAYOUTS (5)                  │
│ ┌─────────────────────────┐    │
│ │ ⊞ Grid                  │    │
│ │ Layout em grade         │    │
│ │ [Badge: Container]      │    │
│ │ [Preview: [□][□][□]]    │    │
│ └─────────────────────────┘    │
│                                 │
│ 📄 TEXTOS (3)                   │
│ ┌─────────────────────────┐    │
│ │ H Heading               │    │
│ │ Título H1-H6            │    │
│ │ [Preview: Título]       │    │
│ └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

---

## 🏗️ Exemplos de Estrutura

### Estrutura Simples (3 níveis)

```
📦 section
  └─ 📦 container
      ├─ 📄 heading (h1)
      ├─ 📄 paragraph
      └─ 🔘 button
```

**Visual no Canvas:**
```
┌───────────────────────────────────┐
│ SECTION (gradient purple)         │
│ ┌───────────────────────────────┐ │
│ │ CONTAINER                     │ │
│ │                               │ │
│ │ Bem-vindo ao Futuro           │ │ ← h1
│ │                               │ │
│ │ Construa páginas incríveis... │ │ ← p
│ │                               │ │
│ │ [Começar Agora]               │ │ ← button
│ │                               │ │
│ └───────────────────────────────┘ │
└───────────────────────────────────┘
```

### Grid com Cards (5 níveis)

```
📦 section
  └─ 📦 grid (3 colunas)
      ├─ 📦 card
      │   ├─ 📄 heading (h3)
      │   └─ 📄 paragraph
      ├─ 📦 card
      │   ├─ 📄 heading (h3)
      │   └─ 📄 paragraph
      └─ 📦 card
          ├─ 📄 heading (h3)
          └─ 📄 paragraph
```

**Visual no Canvas:**
```
┌─────────────────────────────────────────────┐
│ SECTION                                     │
│ ┌─────────────────────────────────────────┐ │
│ │ GRID (3 columns)                        │ │
│ │ ┌───────┐  ┌───────┐  ┌───────┐        │ │
│ │ │ CARD  │  │ CARD  │  │ CARD  │        │ │
│ │ │       │  │       │  │       │        │ │
│ │ │ 🚀    │  │ 🎨    │  │ 🔒    │        │ │
│ │ │ Rápido│  │Flexível│  │ Seguro│        │ │
│ │ │       │  │       │  │       │        │ │
│ │ │ Texto │  │ Texto │  │ Texto │        │ │
│ │ │       │  │       │  │       │        │ │
│ │ └───────┘  └───────┘  └───────┘        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Accordion (com slots)

```
📦 accordion
  ├─ 📋 accordionItem
  │   └─ [slot: content]
  │       ├─ 📄 paragraph
  │       └─ 📄 paragraph
  ├─ 📋 accordionItem
  │   └─ [slot: content]
  │       └─ 📄 paragraph
  └─ 📋 accordionItem
      └─ [slot: content]
          └─ 📄 paragraph
```

**Visual no Canvas:**
```
┌─────────────────────────────────────────┐
│ ACCORDION                               │
│ ┌─────────────────────────────────────┐ │
│ │ ▼ Como funciona o sistema?          │ │ ← Item 1 (expandido)
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ O sistema permite que...        │ │ │
│ │ │ Cada componente pode ter...     │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ▶ Posso arrastar componentes?       │ │ ← Item 2 (colapsado)
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ▶ Existe limite de aninhamento?     │ │ ← Item 3 (colapsado)
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🎬 Fluxo de Criação

### Passo a Passo Visual

**1. Escolher Template**
```
┌────────────────────────────────────────────┐
│ Escolha um Template                        │
│                                            │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │ 📄   │ │ 📦   │ │ ⊞    │ │ ❓   │      │
│ │Branco│ │ Hero │ │Grid  │ │ FAQ  │      │
│ └──────┘ └──────┘ └──────┘ └──────┘      │
│                                            │
│ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │ ⊞⊞   │ │ ✉️   │ │ ✨   │               │
│ │2 Cols│ │Contato│ │Full │               │
│ └──────┘ └──────┘ └──────┘               │
└────────────────────────────────────────────┘
        ↓ Clique em um template
```

**2. Arrastar da Biblioteca**
```
Biblioteca          Canvas
┌─────────┐        ┌──────────────┐
│ 📦      │        │              │
│ Section │ ─────→ │ [Drop aqui]  │
│         │        │              │
└─────────┘        └──────────────┘
 (arraste)          (solte)
```

**3. Ver Drop Zones**
```
        Mouse sobre container
               ↓
┌────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Azul
│ ┏━━━━━━━━━━━━━━━━━━━━━┓ │ ← Azul com borda
│ ┃   Container Alvo     ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━┛ │
│ ━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Azul
└────────────────────────────┘
```

**4. Soltar no Local**
```
Antes:                  Depois:
┌──────────┐           ┌──────────┐
│ section  │           │ section  │
│          │    →      │  └─ div  │ ← Adicionado!
│          │           │          │
└──────────┘           └──────────┘
```

**5. Adicionar Filhos**
```
Método 1: Botão +
┌────────────────────┐
│ [section] [+] ...  │ ← Clique aqui
├────────────────────┤
│ section            │
│   └─ div ← criado! │
└────────────────────┘

Método 2: Arrastar para dentro
┌────────────────────┐
│ section            │
│ ┏━━━━━━━━━━━━━━━┓ │ ← Solte aqui
│ ┃ [Drop Inside]  ┃ │
│ ┗━━━━━━━━━━━━━━━┛ │
└────────────────────┘
```

---

## 🎨 Estados Visuais

### 1. Normal (sem interação)
```
┌────────────────┐
│ section        │
│   └─ div       │
│      └─ p      │
└────────────────┘
```

### 2. Hover (mouse sobre)
```
┌────────────────┐ ┐
│ section        │ │ Outline cinza tracejado
│   └─ div       │ │
│      └─ p      │ │
└────────────────┘ ┘
 + Barra de controles aparece
```

### 3. Selected (selecionado)
```
┏━━━━━━━━━━━━━━━━┓ ┐
┃ section        ┃ │ Outline azul sólido (2px)
┃   └─ div       ┃ │
┃      └─ p      ┃ │
┗━━━━━━━━━━━━━━━━┛ ┘
 + Propriedades no painel direito
```

### 4. Dragging (arrastando)
```
┌────────────────┐
│ section        │ ← Opacidade 50%
│   └─ div       │   (semi-transparente)
│      └─ p      │
└────────────────┘
```

### 5. Drop Valid (pode soltar)
```
┌────────────────┐
│ ━━━━━━━━━━━━━━ │ ← Linhas AZUIS
│ ┏━━━━━━━━━━━━┓ │
│ ┃ Container  ┃ │ ← Fundo AZUL claro
│ ┗━━━━━━━━━━━━┛ │
│ ━━━━━━━━━━━━━━ │
└────────────────┘
```

### 6. Drop Invalid (não pode soltar)
```
┌────────────────┐
│ ━━━━━━━━━━━━━━ │ ← Linhas VERMELHAS
│ ┏━━━━━━━━━━━━┓ │
│ ┃ Container  ┃ │ ← Fundo VERMELHO claro
│ ┗━━━━━━━━━━━━┛ │
│ ━━━━━━━━━━━━━━ │
└────────────────┘
```

### 7. Empty (container vazio)
```
┌──────────────────────────┐
│                          │
│    +                     │
│  Arraste componentes     │ ← Placeholder
│  aqui ou clique para     │
│  adicionar               │
│                          │
│  section                 │
│                          │
└──────────────────────────┘
```

### 8. Collapsed (colapsado)
```
┌────────────────┐
│ section [👁️]   │ ← Clique para expandir
│ (filhos ocultos)│
└────────────────┘
```

---

## 🖱️ Interações do Mouse

### Arrastar Componente
```
1. Mouse Down (pressionar)
   ┌─────┐
   │ div │ ← Cursor normal
   └─────┘

2. Drag (arrastar)
   ┌─────┐
   │ div │ ← Cursor "grabbing" (mão fechada)
   └─────┘   Opacidade 50%

3. Hover sobre Container
   ┌──────────────┐
   │ Container    │ ← Drop zones aparecem (azul)
   │ [Drop aqui]  │
   └──────────────┘

4. Drop (soltar)
   ┌──────────────┐
   │ Container    │
   │   └─ div ✓   │ ← Componente adicionado!
   └──────────────┘
```

### Reordenar
```
1. Hover sobre componente
   ┌────────────────┐
   │ [≡] [+] ...    │ ← Controles aparecem
   └────────────────┘

2. Click + Drag no handle [≡]
   ┌────────────────┐
   │ div            │ ← Arrastando
   └────────────────┘

3. Hover sobre nova posição
   ━━━━━━━━━━━━━━━━━ ← Linha azul (drop zone)
   ┌────────────────┐
   │ outro div      │
   └────────────────┘

4. Soltar
   ┌────────────────┐
   │ div            │ ← Nova posição!
   └────────────────┘
   ┌────────────────┐
   │ outro div      │
   └────────────────┘
```

---

## 📱 Responsive Design

O canvas adapta ao modo de visualização:

### Desktop (padrão)
```
┌─────────────────────────────────────────┐
│           LARGURA TOTAL                 │
│                                         │
│  [Conteúdo ocupa toda largura]         │
│                                         │
└─────────────────────────────────────────┘
```

### Tablet
```
  ┌───────────────────────────┐
  │     MAX-WIDTH: 768px      │
  │                           │
  │  [Conteúdo centralizado]  │
  │                           │
  └───────────────────────────┘
```

### Mobile
```
    ┌─────────────────┐
    │ MAX-WIDTH: 480px│
    │                 │
    │  [Conteúdo      │
    │   compacto]     │
    │                 │
    └─────────────────┘
```

---

## 🎓 Dicas Visuais

### ✅ Faça (Boas Práticas)

```
✓ Use hierarquia lógica
  section → container → conteúdo

✓ Agrupe elementos relacionados
  card → header + body + footer

✓ Use grids para layouts
  grid → gridItem × N

✓ Mantenha profundidade razoável
  Máx 6-8 níveis
```

### ❌ Evite (Problemas Comuns)

```
✗ Não coloque div direto em nav
  nav só aceita links/botões

✗ Não exceda limites
  columns máx 12 filhos

✗ Não crie loops
  Pai dentro do próprio filho

✗ Não ignore validações
  Mensagens de erro são importantes
```

---

## 🎯 Atalhos Visuais

```
┌─────────────────────────────────────┐
│ Toolbar                             │
│                                     │
│ ↶ ↷     = Undo/Redo                │
│ 👁️       = Preview                  │
│ </>     = Ver código                │
│ 📄      = Exportar JSON             │
│ ⬇️       = Exportar HTML            │
│ ⬆️       = Importar JSON            │
│ 🗑️       = Limpar tudo              │
│ 💾      = Salvar (Ctrl+S)           │
│                                     │
│ Controles do Componente             │
│                                     │
│ ≡       = Arrastar                  │
│ +       = Adicionar filho           │
│ 👁️       = Colapsar/Expandir        │
│ 📋      = Duplicar                  │
│ 🗑️       = Remover (Delete)          │
│                                     │
│ Teclado                             │
│                                     │
│ Ctrl+Z  = Desfazer                  │
│ Ctrl+Y  = Refazer                   │
│ Ctrl+S  = Salvar                    │
│ Delete  = Remover selecionado       │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎉 Conclusão Visual

**Sistema Completo e Intuitivo!**

```
    📚 Biblioteca     🎨 Canvas      ⚙️ Propriedades
         ↓               ↓               ↓
    [Componentes] → [Arrastar] → [Personalizar]
         ↓               ↓               ↓
    [Escolher]     [Organizar]     [Editar Props]
         ↓               ↓               ↓
      📦 50+          ✅ Validação     💾 Salvar
```

**Acesse agora:**
```
Dashboard → Page Builder Hierárquico → Crie algo incrível! 🚀
```

---

**Desenvolvido com ❤️ para Portal CMS**  
**100% Visual | 100% Intuitivo | 100% Funcional**
