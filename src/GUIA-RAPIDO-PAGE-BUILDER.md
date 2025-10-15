# 🚀 GUIA RÁPIDO - PAGE BUILDER

## ✅ Início Rápido (5 minutos)

### **1. Adicionar Primeiro Componente**

```
1. Abra o Page Builder
2. Sidebar esquerda → Clique em "Container"
3. Arraste para o canvas (área branca central)
4. Solte → Container aparece!
```

### **2. Adicionar Título**

```
1. Sidebar → Clique em "Título" (Heading)
2. Arraste para DENTRO do container
3. Solte → Título "Título" aparece
4. Duplo clique no título
5. Digite: "Minha Primeira Página"
6. Enter para salvar
```

### **3. Adicionar Parágrafo**

```
1. Sidebar → "Parágrafo"
2. Arraste para dentro do container (abaixo do título)
3. Duplo clique
4. Digite: "Esta é minha primeira página criada com o Page Builder!"
5. Enter
```

### **4. Adicionar Botão**

```
1. Sidebar → "Botão"
2. Arraste para dentro do container
3. Duplo clique
4. Digite: "Saiba Mais"
5. Enter
```

### **5. Estilizar o Botão**

```
1. Clique no botão (seleção)
2. Painel direito abre
3. Tab "Estilo"
4. Campo "Classes CSS": bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600
5. Classes aplicadas automaticamente!
```

### **6. Salvar**

```
1. Toolbar superior → Botão "Salvar"
   OU
2. Pressione Ctrl+S (Cmd+S no Mac)
3. Toast: "Layout salvo com sucesso!"
```

### **7. Preview**

```
1. Toolbar → Botão "Preview"
2. Modal abre mostrando a página
3. Visualize como ficará
4. Feche o modal
```

### **8. Exportar HTML**

```
1. Toolbar → Botão "HTML"
2. HTML completo aparece
3. Botão "Copiar" → Copia para clipboard
4. Botão "Baixar" → Baixa page.html
5. Abra o arquivo HTML em um navegador → Sua página!
```

---

## 🎯 Estrutura Criada:

```html
<div class="border border-gray-300 rounded-md p-4 min-h-[80px]">
  <h2 class="cursor-text hover:bg-gray-50 p-2 rounded">
    Minha Primeira Página
  </h2>
  <p class="cursor-text hover:bg-gray-50 p-2 rounded">
    Esta é minha primeira página criada com o Page Builder!
  </p>
  <button class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
    Saiba Mais
  </button>
</div>
```

---

## 📚 Exemplos Práticos

### **Exemplo 1: Landing Page Simples**

```typescript
1. Adicionar Header (tipo: header)
   - Dentro: Título "Meu Produto"
   - Dentro: Nav com Links

2. Adicionar Section (tipo: section)
   - Dentro: Container
     - Título "Recursos Incríveis"
     - Parágrafo "Descubra..."
     - Botão "Experimente Grátis"

3. Adicionar Footer (tipo: footer)
   - Dentro: Texto "© 2025"

Estrutura:
Header
├── Heading "Meu Produto"
└── Nav
    ├── Link "Início"
    ├── Link "Recursos"
    └── Link "Contato"

Section
└── Container
    ├── Heading "Recursos Incríveis"
    ├── Paragraph "Descubra..."
    └── Button "Experimente Grátis"

Footer
└── Text "© 2025 Meu Produto"
```

### **Exemplo 2: Card de Produto**

```typescript
1. Container (classes: "max-w-sm rounded-lg overflow-hidden shadow-lg")
   2. Image (URL: https://via.placeholder.com/400x300)
   3. Container (classes: "p-6")
      4. Heading "Nome do Produto"
      5. Paragraph "Descrição do produto..."
      6. Container (classes: "flex justify-between items-center mt-4")
         7. Text "$99.00" (classes: "text-2xl font-bold")
         8. Button "Comprar" (classes: "bg-green-500 text-white px-4 py-2 rounded")

Resultado:
┌──────────────────────┐
│  [Imagem 400x300]    │
├──────────────────────┤
│ Nome do Produto      │
│ Descrição...         │
│                      │
│ $99.00    [Comprar]  │
└──────────────────────┘
```

### **Exemplo 3: Grid de 3 Colunas**

```typescript
1. Section (classes: "py-8")
   2. Container (classes: "max-w-6xl mx-auto")
      3. Heading "Nossos Serviços"
      4. Container (classes: "grid grid-cols-3 gap-6 mt-6")
         5. Container (classes: "bg-white p-6 rounded-lg shadow")
            6. Heading "Serviço 1"
            7. Paragraph "Descrição..."
         8. Container (classes: "bg-white p-6 rounded-lg shadow")
            9. Heading "Serviço 2"
            10. Paragraph "Descrição..."
         11. Container (classes: "bg-white p-6 rounded-lg shadow")
            12. Heading "Serviço 3"
            13. Paragraph "Descrição..."

Resultado:
Nossos Serviços
┌─────────┐ ┌─────────┐ ┌─────────┐
│Serviço 1│ │Serviço 2│ │Serviço 3│
│Descrição│ │Descrição│ │Descrição│
└─────────┘ └─────────┘ └─────────┘
```

---

## 🎨 Classes Tailwind Úteis

### **Layout:**
```
flex              → Display flex
flex-col          → Direção coluna
grid              → Display grid
grid-cols-2       → 2 colunas
grid-cols-3       → 3 colunas
gap-4             → Espaçamento 1rem
```

### **Espaçamento:**
```
p-4               → Padding 1rem
px-6              → Padding horizontal 1.5rem
py-3              → Padding vertical 0.75rem
m-4               → Margin 1rem
mt-6              → Margin top 1.5rem
space-y-4         → Espaçamento vertical entre filhos
```

### **Cores:**
```
bg-blue-500       → Fundo azul
text-white        → Texto branco
text-gray-600     → Texto cinza
border-gray-300   → Borda cinza
```

### **Tamanhos:**
```
w-full            → Largura 100%
max-w-4xl         → Largura máxima 56rem
h-64              → Altura 16rem
min-h-[80px]      → Altura mínima 80px
```

### **Bordas:**
```
border            → Borda 1px
border-2          → Borda 2px
rounded           → Bordas arredondadas
rounded-lg        → Bordas arredondadas grandes
shadow            → Sombra
shadow-lg         → Sombra grande
```

### **Tipografia:**
```
text-sm           → Tamanho pequeno
text-lg           → Tamanho grande
text-2xl          → Tamanho 2x grande
font-bold         → Negrito
font-medium       → Médio
text-center       → Centralizar
```

### **Efeitos:**
```
hover:bg-blue-600 → Cor de fundo no hover
transition        → Transição suave
duration-300      → Duração 300ms
opacity-50        → Opacidade 50%
```

---

## ⌨️ Atalhos de Teclado

```
Ctrl/Cmd + Z       → Desfazer última ação
Ctrl/Cmd + Shift + Z → Refazer
Ctrl/Cmd + S       → Salvar layout
Duplo Clique       → Editar texto do componente
Enter              → Confirmar edição de texto
Esc                → Cancelar edição de texto
```

---

## 💡 Dicas Profissionais

### **1. Organizar com Containers**
```
Use containers para agrupar elementos relacionados.
Container "Hero Section"
├── Título
├── Subtítulo
└── Botão CTA
```

### **2. Reutilizar com Duplicar**
```
1. Crie um card perfeito
2. Clique no ícone de duplicar (⋮⋮ → Copy)
3. Duplique 5x
4. Edite o conteúdo de cada um
```

### **3. Classes Globais**
```
Container principal:
- max-w-6xl mx-auto → Centraliza com largura máxima
- p-6 → Padding interno
- bg-white rounded-lg shadow → Estilo de card
```

### **4. Responsividade**
```
Classes responsivas do Tailwind:
- sm:grid-cols-1     → 1 coluna em mobile
- md:grid-cols-2     → 2 colunas em tablet
- lg:grid-cols-3     → 3 colunas em desktop

Exemplo:
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

### **5. Cores Consistentes**
```
Defina uma paleta:
- Primária: bg-blue-500, text-blue-600
- Secundária: bg-gray-100, text-gray-600
- Sucesso: bg-green-500, text-green-600
- Perigo: bg-red-500, text-red-600

Use sempre as mesmas cores para consistência visual.
```

### **6. Hierarquia Visual**
```
Títulos:
- H1: text-4xl font-bold
- H2: text-3xl font-bold
- H3: text-2xl font-semibold

Parágrafos:
- Principal: text-base text-gray-700
- Secundário: text-sm text-gray-500
```

### **7. Espaçamento Consistente**
```
Use escala de 4:
- p-2  → 0.5rem
- p-4  → 1rem
- p-6  → 1.5rem
- p-8  → 2rem

Evite valores ímpares (p-3, p-5) para manter consistência.
```

---

## 🐛 Solução de Problemas Comuns

### **Problema: "Não consigo arrastar componente"**
```
Solução:
1. Clique E SEGURE por 1 segundo
2. Depois arraste
3. DndKit precisa de um delay mínimo para ativar
```

### **Problema: "Duplo clique não edita"**
```
Solução:
1. Verifique se é um componente editável (não container)
2. Clique duas vezes rapidamente
3. Se não funcionar, use o painel de propriedades
```

### **Problema: "Classes Tailwind não aplicam"**
```
Solução:
1. Verifique se há espaços entre as classes
2. Classes válidas: "p-4 bg-blue-500"
3. Classes inválidas: "p-4,bg-blue-500" ou "p-4;bg-blue-500"
```

### **Problema: "Layout não salva"**
```
Solução:
1. Pressione Ctrl+S manualmente
2. Verifique console do browser (F12)
3. localStorage pode estar cheio → limpe outros dados
4. Auto-save funciona a cada 30 segundos
```

### **Problema: "Container vazio não aceita drop"**
```
Solução:
1. Container vazio mostra "Solte componentes aqui"
2. Arraste E SOLTE exatamente nessa área
3. Se não funcionar, adicione programaticamente via sidebar
```

---

## 📖 Glossário

| Termo | Significado |
|-------|-------------|
| **Canvas** | Área branca central onde você constrói a página |
| **Sidebar** | Painel esquerdo com paleta de componentes |
| **Container** | Componente que pode conter outros componentes |
| **Node** | Um componente na árvore (nó) |
| **Drag-and-Drop** | Arrastar e soltar |
| **Inline Editing** | Edição direta no componente (duplo clique) |
| **Painel de Propriedades** | Painel direito para editar atributos |
| **Store** | Estado global (Zustand) |
| **Recursivo** | Componentes dentro de componentes (ilimitado) |
| **Export** | Gerar JSON ou HTML da página |
| **Import** | Carregar JSON de outra página |

---

## 🎯 Fluxo de Trabalho Recomendado

### **Passo a Passo Completo:**

```
1. PLANEJAR
   - Esboce a página no papel
   - Defina seções (header, hero, features, footer)
   - Liste componentes necessários

2. ESTRUTURAR
   - Adicione containers principais (header, section, footer)
   - Crie a hierarquia básica
   - Não se preocupe com estilo ainda

3. CONTEÚDO
   - Adicione títulos, textos, botões
   - Preencha com conteúdo real
   - Duplo clique para editar cada um

4. ESTILIZAR
   - Selecione cada componente
   - Tab "Estilo" → Adicione classes Tailwind
   - Preview frequentemente

5. LAYOUT
   - Tab "Layout" → Ajuste grids/flex
   - Adicione espaçamentos
   - Teste responsividade

6. REFINAR
   - Ajuste cores
   - Alinhe elementos
   - Adicione efeitos de hover

7. SALVAR
   - Ctrl+S para salvar
   - Export HTML
   - Pronto!
```

---

## ✅ Checklist de Página Completa

```
□ Header criado
  □ Logo/Título
  □ Menu de navegação
  
□ Hero Section
  □ Título principal
  □ Subtítulo
  □ CTA (Call-to-Action) button
  □ Imagem/ilustração (opcional)

□ Conteúdo Principal
  □ Seções organizadas
  □ Títulos e textos
  □ Imagens relevantes
  □ Cards/grids (se necessário)

□ Footer
  □ Copyright
  □ Links úteis
  □ Redes sociais (opcional)

□ Estilização
  □ Cores consistentes
  □ Espaçamentos uniformes
  □ Fontes legíveis
  □ Efeitos de hover

□ Finalização
  □ Preview verificado
  □ Responsividade testada
  □ HTML exportado
  □ Layout salvo
```

---

## 🎉 Parabéns!

Você agora sabe:
- ✅ Adicionar e organizar componentes
- ✅ Criar layouts hierárquicos com containers
- ✅ Editar conteúdo inline
- ✅ Estilizar com Tailwind CSS
- ✅ Salvar e exportar páginas
- ✅ Usar atalhos de teclado
- ✅ Aplicar boas práticas de design

**Comece a criar páginas incríveis! 🚀**
