# Documentação - Editor Visual e Sistema de Templates

## Visão Geral

Sistema completo de edição visual drag-and-drop com biblioteca de componentes, painel de estilos CSS completo, sistema de templates reutilizáveis e suporte para JavaScript personalizado.

---

## 1. Componentes do Sistema

### 1.1 Visual Editor (`/components/editor/VisualEditor.tsx`)
Editor principal com drag-and-drop, histórico de alterações (undo/redo), preview e exportação.

### 1.2 Component Library (`/components/editor/ComponentLibrary.tsx`)
Biblioteca com 50+ componentes prontos organizados em categorias.

### 1.3 Style Panel (`/components/editor/StylePanel.tsx`)
Painel completo de estilos CSS com interface visual para todas as propriedades.

### 1.4 Template Manager (`/components/templates/TemplateManager.tsx`)
Gerenciador de templates reutilizáveis para artigos e páginas.

---

## 2. Funcionalidades Principais

### 2.1 Edição Drag-and-Drop
```typescript
✅ Arrastar componentes da biblioteca
✅ Reordenar componentes na página
✅ Duplicar componentes
✅ Excluir componentes
✅ Seleção visual de componentes
```

### 2.2 Biblioteca de Componentes

#### **Categoria: Texto**
- Título (H1-H6)
- Parágrafo
- Subtítulo
- Citação

#### **Categoria: Mídia**
- Imagem
- Vídeo
- Galeria de Imagens

#### **Categoria: Layout**
- Container
- Grid (2, 3, 4+ colunas)
- Seção
- Divisor

#### **Categoria: Componentes**
- Hero Section
- Card
- Botão
- Depoimento

#### **Categoria: Formulários**
- Formulário Completo
- Campo de Texto
- Área de Texto
- Seleção/Dropdown

#### **Categoria: Navegação**
- Barra de Navegação
- Breadcrumb
- Rodapé

#### **Categoria: Listas**
- Lista
- Timeline
- Tabela de Preços

#### **Categoria: Contato**
- Informações de Contato
- Mapa
- Redes Sociais

#### **Categoria: Avançado**
- Accordion
- Abas (Tabs)
- Carrossel
- Código
- Tabela

### 2.3 Painel de Estilos CSS

#### **Aba: Conteúdo**
```typescript
// Propriedades específicas de cada componente
- Texto (para títulos e parágrafos)
- URL (para imagens)
- Links e ações (para botões)
- Configurações específicas (grid, hero, etc)
```

#### **Aba: Estilos**

**Layout:**
```css
width, height, maxWidth, maxHeight
display: block | inline-block | flex | grid | inline | none
justifyContent, alignItems (para flex)
gap (espaçamento interno)
```

**Espaçamento:**
```css
padding: top, right, bottom, left
margin: top, right, bottom, left
```

**Tipografia:**
```css
fontSize: 1rem, 16px, etc
fontWeight: 100-900, normal, bold
textAlign: left | center | right | justify
lineHeight: 1.5, 1.8, etc
letterSpacing: 0, 1px, etc
```

**Cores:**
```css
color: #000000 (cor do texto)
background: #ffffff, linear-gradient(), url()
```

**Paleta de Cores Rápida:**
```
Pretos/Brancos, Azuis, Verdes, Vermelhos, 
Laranjas, Roxos
```

**Borda:**
```css
borderWidth: 0, 1px, 2px, etc
borderStyle: solid | dashed | dotted | double | none
borderColor: #000000
borderRadius: 0, 0.25rem, 0.5rem, etc
```

**Efeitos:**
```css
opacity: 0-100%
boxShadow: 0 4px 6px rgba(0,0,0,0.1)
transform: rotate(45deg), scale(1.1), etc
transition: all 0.3s ease
```

#### **Aba: Avançado**

**CSS Personalizado:**
```css
.meu-componente {
  color: red;
  font-size: 2rem;
}

.meu-componente:hover {
  color: blue;
}
```

**JavaScript Personalizado:**
```javascript
// Executado quando a página carrega
console.log('Componente carregado');

// Adicionar event listeners
document.querySelector('#meu-botao').addEventListener('click', () => {
  alert('Clicou!');
});
```

**ID e Classes:**
```html
id="meu-componente"
className="classe1 classe2 classe3"
```

---

## 3. Sistema de Templates

### 3.1 Templates Padrão

#### **Artigos:**

1. **Artigo Básico**
   - Título H1
   - Informações do autor
   - Imagem destaque
   - Parágrafo de texto

2. **Artigo Destaque**
   - Hero Section com imagem de fundo
   - Container centralizado
   - Conteúdo formatado

3. **Artigo Multimídia**
   - Título centralizado
   - Vídeo destaque
   - Texto introdutório
   - Grid de imagens

#### **Páginas:**

1. **Landing Page**
   - Hero Section com CTA
   - Grid de 3 cards (recursos)
   - Seções completas

2. **Página Sobre**
   - Título principal
   - Grid 2 colunas (imagem + texto)
   - Seção "Nossa História"

3. **Página de Contato**
   - Título
   - Grid 2 colunas (formulário + info)
   - Mapa opcional

### 3.2 Criar Template

```
1. Dashboard → Templates
2. Clicar em "Novo Template"
3. Preencher:
   - Nome: "Meu Template"
   - Descrição: "Template personalizado para..."
   - Tipo: Artigo | Página | Personalizado
4. Clicar em "Criar e Editar"
5. Editor Visual abre
6. Arrastar componentes
7. Configurar estilos
8. Salvar
```

### 3.3 Usar Template

#### **No ArticleManager:**
```
1. Clicar em "Usar Template"
2. Selecionar template desejado
3. Clicar em "Usar Template"
4. Editor abre com componentes do template
5. Editar conteúdo
6. Salvar matéria
```

#### **No PageManager:**
```
Mesmo fluxo do ArticleManager
```

### 3.4 Gerenciar Templates

**Editar:**
```
Templates → Editar (ícone lápis)
```

**Duplicar:**
```
Templates → Duplicar (ícone copiar)
Cria uma cópia com " (Cópia)" no nome
```

**Exportar:**
```
Templates → Exportar (ícone download)
Baixa arquivo JSON do template
```

**Importar:**
```
Templates → Importar
Selecionar arquivo .json
Template adicionado à biblioteca
```

**Excluir:**
```
Templates → Excluir (ícone lixeira)
Confirmação obrigatória
```

---

## 4. Fluxo de Trabalho

### 4.1 Criar Artigo com Template

```
┌─────────────────────────────────────┐
│ ArticleManager                      │
│ ↓                                   │
│ Clicar "Usar Template"              │
│ ↓                                   │
│ Seletor de Templates (Modal)       │
│ ↓                                   │
│ Escolher "Artigo Destaque"          │
│ ↓                                   │
│ Visual Editor abre                  │
│ ↓                                   │
│ Editar componentes:                 │
│ - Alterar título                    │
│ - Trocar imagem de fundo            │
│ - Modificar texto                   │
│ ↓                                   │
│ Ajustar estilos:                    │
│ - Cores                             │
│ - Fontes                            │
│ - Espaçamentos                      │
│ ↓                                   │
│ Salvar                              │
│ ↓                                   │
│ Artigo criado e salvo               │
└─────────────────────────────────────┘
```

### 4.2 Criar Página do Zero

```
┌─────────────────────────────────────┐
│ PageManager                         │
│ ↓                                   │
│ Clicar "Nova Página"                │
│ ↓                                   │
│ Visual Editor abre vazio            │
│ ↓                                   │
│ Arrastar componentes:               │
│                                     │
│ Biblioteca → Canvas                 │
│ ┌──────┐    ┌───────────┐          │
│ │ Hero │ →  │           │          │
│ │ Card │ →  │  Canvas   │          │
│ │ Form │ →  │           │          │
│ └──────┘    └───────────┘          │
│ ↓                                   │
│ Configurar cada componente:         │
│ - Selecionar componente             │
│ - Abrir painel de estilos           │
│ - Ajustar propriedades              │
│ ↓                                   │
│ Preview (ícone olho)                │
│ ↓                                   │
│ Salvar                              │
└─────────────────────────────────────┘
```

### 4.3 Editar Componente

```
┌─────────────────────────────────────┐
│ 1. Selecionar Componente            │
│    (Clicar sobre ele no canvas)     │
│    ↓                                │
│    Borda azul aparece               │
│    Barra de ações no topo           │
│                                     │
│ 2. Painel de Estilos Abre           │
│    (Lado direito da tela)           │
│                                     │
│ 3. Abas Disponíveis:                │
│    ┌──────────┬──────────┬────────┐│
│    │ Conteúdo │ Estilos  │Avançado││
│    └──────────┴──────────┴────────┘│
│                                     │
│ 4. Modificar:                       │
│    ✓ Texto, imagens, links          │
│    ✓ Cores, fontes, tamanhos        │
│    ✓ Espaçamentos, bordas           │
│    ✓ CSS/JS personalizado           │
│                                     │
│ 5. Ver em Tempo Real                │
│    Mudanças aparecem imediatamente  │
│                                     │
│ 6. Salvar                           │
│    Histórico de alterações mantido  │
└─────────────────────────────────────┘
```

---

## 5. Exemplos Práticos

### 5.1 Criar Hero Section Personalizado

```typescript
// 1. Arrastar "Hero Section" para o canvas

// 2. Aba Conteúdo:
Título: "Transforme Sua Experiência Digital"
Subtítulo: "Soluções inovadoras para seu negócio"
Texto do Botão: "Solicitar Demo"
Imagem de Fundo: https://exemplo.com/hero-bg.jpg

// 3. Aba Estilos:
// Layout
minHeight: 600px
display: flex
alignItems: center
justifyContent: center

// Tipografia
Título fontSize: 3.5rem
Título fontWeight: bold
Subtítulo fontSize: 1.5rem

// Cores
Título color: #ffffff
Background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

// Efeitos
boxShadow: 0 10px 40px rgba(0,0,0,0.2)

// 4. Aba Avançado:
// CSS Personalizado:
.hero-content {
  text-align: center;
  max-width: 800px;
  padding: 2rem;
}

.hero-content h1 {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  animation: fadeInUp 1s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// JavaScript:
document.querySelector('.hero-button').addEventListener('click', () => {
  // Scroll suave para seção de contato
  document.querySelector('#contato').scrollIntoView({ 
    behavior: 'smooth' 
  });
});
```

### 5.2 Grid de Cards Responsivo

```typescript
// 1. Arrastar "Grid 3 Colunas"

// 2. Configurar Grid:
columns: 3
gap: 2rem

// 3. Adicionar Cards:
// Arrastar 3 componentes "Card" para dentro do grid

// 4. Card 1:
Título: "Velocidade"
Descrição: "Performance otimizada"
Imagem: https://exemplo.com/speed-icon.png

// 5. Estilos do Grid:
// Desktop
gridTemplateColumns: repeat(3, 1fr)

// Aba Avançado - CSS:
@media (max-width: 768px) {
  grid-template-columns: 1fr;
}

@media (min-width: 769px) and (max-width: 1024px) {
  grid-template-columns: repeat(2, 1fr);
}

// 6. Cada Card:
padding: 2rem
borderRadius: 1rem
boxShadow: 0 4px 6px rgba(0,0,0,0.1)
transition: all 0.3s ease

// CSS Hover:
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}
```

### 5.3 Formulário de Contato Estilizado

```typescript
// 1. Arrastar "Formulário"

// 2. Estilos do Container:
maxWidth: 600px
margin: 0 auto
padding: 3rem
background: #ffffff
borderRadius: 1rem
boxShadow: 0 8px 16px rgba(0,0,0,0.1)

// 3. CSS Personalizado:
.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.contact-form button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.contact-form button:hover {
  transform: scale(1.02);
}

// 4. JavaScript:
const form = document.querySelector('.contact-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    name: form.querySelector('[name="name"]').value,
    email: form.querySelector('[name="email"]').value,
    message: form.querySelector('[name="message"]').value
  };
  
  // Enviar para API
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('Mensagem enviada com sucesso!');
      form.reset();
    }
  } catch (error) {
    alert('Erro ao enviar mensagem. Tente novamente.');
  }
});
```

---

## 6. Atalhos de Teclado

```
Ctrl/Cmd + Z = Desfazer
Ctrl/Cmd + Shift + Z = Refazer
Ctrl/Cmd + S = Salvar
Delete = Excluir componente selecionado
Ctrl/Cmd + D = Duplicar componente
Ctrl/Cmd + C = Copiar componente
Ctrl/Cmd + V = Colar componente
Esc = Desselecionar componente
```

---

## 7. Toolbar do Editor

```
┌─────────────────────────────────────┐
│ [👁️] Preview Mode                   │
│ [</>] Ver Código JSON               │
│ [↶] Desfazer                        │
│ [↷] Refazer                         │
│ [💾] Salvar                         │
│ [</>] Exportar HTML                 │
└─────────────────────────────────────┘
```

---

## 8. Estrutura de Dados

### 8.1 Component

```typescript
interface Component {
  id: string;                    // ID único
  type: string;                  // Tipo do componente
  props: {                       // Propriedades específicas
    text?: string;
    src?: string;
    href?: string;
    // ... outras props
  };
  styles: React.CSSProperties;  // Estilos CSS inline
  customCSS?: string;           // CSS personalizado
  customJS?: string;            // JavaScript personalizado
  children?: Component[];       // Componentes filhos
}
```

**Exemplo:**
```json
{
  "id": "component-1728912345678",
  "type": "heading",
  "props": {
    "tag": "h1",
    "text": "Título Principal"
  },
  "styles": {
    "fontSize": "3rem",
    "fontWeight": "bold",
    "color": "#1f2937",
    "marginBottom": "2rem",
    "textAlign": "center"
  },
  "customCSS": ".titulo-principal:hover { color: #3b82f6; }",
  "customJS": "console.log('Título carregado');"
}
```

### 8.2 Template

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  type: 'article' | 'page' | 'custom';
  thumbnail?: string;
  components: Component[];
  createdAt: string;
  updatedAt: string;
}
```

**Exemplo:**
```json
{
  "id": "template-article-basic",
  "name": "Artigo Básico",
  "description": "Template simples com título, imagem e texto",
  "type": "article",
  "components": [
    {
      "id": "comp-1",
      "type": "heading",
      "props": { "tag": "h1", "text": "Título" },
      "styles": { "fontSize": "2.5rem" }
    },
    {
      "id": "comp-2",
      "type": "image",
      "props": { "src": "...", "alt": "..." },
      "styles": { "width": "100%" }
    }
  ],
  "createdAt": "2025-10-14T10:00:00.000Z",
  "updatedAt": "2025-10-14T15:30:00.000Z"
}
```

---

## 9. Exportação HTML

O sistema permite exportar páginas completas em HTML estático:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página Exportada</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: system-ui; }
    
    /* CSS personalizado de cada componente */
    .hero { /* ... */ }
    .card { /* ... */ }
  </style>
</head>
<body>
  <!-- HTML gerado dos componentes -->
  <div class="hero">...</div>
  <div class="card">...</div>
  
  <script>
    // JavaScript personalizado de cada componente
    console.log('Página carregada');
  </script>
</body>
</html>
```

---

## 10. Responsividade

### 10.1 Breakpoints Recomendados

```css
/* Mobile */
@media (max-width: 640px) {
  .container { padding: 1rem; }
  .grid { grid-template-columns: 1fr !important; }
  h1 { font-size: 2rem !important; }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .container { padding: 2rem; }
  .grid { grid-template-columns: repeat(2, 1fr) !important; }
}

/* Desktop */
@media (min-width: 1025px) {
  .container { max-width: 1200px; margin: 0 auto; }
}
```

### 10.2 Técnicas de Responsividade

**Usar unidades relativas:**
```css
fontSize: '1.5rem' (não '24px')
padding: '2rem' (não '32px')
gap: '1rem' (não '16px')
```

**Flexbox e Grid:**
```css
display: 'flex'
flexWrap: 'wrap'
flexDirection: 'column' (mobile)

display: 'grid'
gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
```

**Media Queries em CSS Personalizado:**
```css
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem !important;
  }
}
```

---

## 11. Boas Práticas

### 11.1 Performance

✅ **Fazer:**
- Otimizar imagens (WebP, compressão)
- Usar lazy loading para imagens
- Minimizar JavaScript personalizado
- Reutilizar componentes via templates

❌ **Evitar:**
- Imagens muito grandes (>500KB)
- JavaScript com loops infinitos
- Muitos efeitos de animação simultâneos

### 11.2 Acessibilidade

✅ **Fazer:**
- Usar texto alternativo em imagens
- Estrutura semântica (H1, H2, H3)
- Contraste adequado de cores
- Tamanhos de fonte legíveis (min 16px)

### 11.3 SEO

✅ **Fazer:**
- Hierarquia correta de títulos
- Textos descritivos
- URLs amigáveis
- Meta tags apropriadas

---

## 12. Casos de Uso

### 12.1 Portal de Notícias

**Templates Necessários:**
- Artigo Padrão (título, autor, imagem, texto)
- Artigo Destaque (hero + conteúdo)
- Artigo Galeria (múltiplas imagens)

**Componentes Usados:**
- Heading, Paragraph, Image, Grid
- Breadcrumb, Author Info
- Related Articles

### 12.2 Site Institucional

**Páginas:**
- Home (Landing Page template)
- Sobre (About Page template)
- Serviços (Grid de Cards)
- Contato (Form + Map)

**Componentes Usados:**
- Hero, Card, Grid, Form
- Testimonials, Team Members
- Footer com Social Links

### 12.3 Blog Pessoal

**Templates:**
- Post Simples
- Post com Vídeo
- Post com Galeria

**Componentes:**
- Heading, Paragraph, Image, Video
- Quote, Code Block
- Tags, Share Buttons

---

## 13. Troubleshooting

### Problema: Componente não aparece
**Solução:** Verificar se tem altura mínima definida

### Problema: Estilos não aplicam
**Solução:** Usar `!important` ou CSS mais específico

### Problema: JavaScript não executa
**Solução:** Verificar console para erros, usar `DOMContentLoaded`

### Problema: Grid não responsivo
**Solução:** Adicionar media queries no CSS personalizado

---

## 14. Roadmap Futuro

- [ ] Biblioteca de templates da comunidade
- [ ] Componentes React personalizados
- [ ] Integração com banco de dados
- [ ] Versionamento de páginas
- [ ] A/B testing
- [ ] Analytics integrado
- [ ] Multi-idioma
- [ ] Dark mode automático
- [ ] Componentização avançada
- [ ] Themes/Design Systems

---

## 15. Conclusão

O Editor Visual oferece:

✅ **Flexibilidade Total:** Componentes + CSS + JS
✅ **Produtividade:** Templates reutilizáveis
✅ **Facilidade:** Drag-and-drop intuitivo
✅ **Profissional:** Controle total de estilos
✅ **Moderno:** Interface elegante e responsiva

Agora você pode criar páginas e artigos profissionais sem escrever código, ou customizar completamente com CSS/JS quando necessário!
