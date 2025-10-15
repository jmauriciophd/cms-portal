# 📦 SISTEMA DE COMPONENTES - DOCUMENTAÇÃO COMPLETA

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Hierarquia de Componentes](#hierarquia-de-componentes)
3. [Categorias de Componentes](#categorias-de-componentes)
4. [Propriedades dos Componentes](#propriedades-dos-componentes)
5. [Sistema de Containers](#sistema-de-containers)
6. [Sistema de Slots](#sistema-de-slots)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [Guia de Referência Rápida](#guia-de-referência-rápida)

---

## 🎯 VISÃO GERAL

O Sistema de Componentes do Editor Visual é um framework robusto e flexível que permite criar páginas web complexas através de componentes reutilizáveis e configuráveis.

### **Características Principais:**

- ✅ **90+ Componentes** organizados em 9 categorias
- ✅ **Hierarquia Clara**: Container, Leaf e Hybrid
- ✅ **Propriedades Completas**: Cada componente tem todas as propriedades necessárias
- ✅ **Sistema de Children**: Containers aceitam componentes filhos
- ✅ **Sistema de Slots**: Componentes híbridos com áreas nomeadas
- ✅ **TypeScript**: Tipagem completa para todas as propriedades
- ✅ **Documentação Inline**: Cada propriedade é documentada

---

## 🏗️ HIERARQUIA DE COMPONENTES

### **1. CONTAINER (Contêineres)**

Componentes que **PODEM** e **DEVEM** conter outros componentes.

**Características:**
- `allowChildren: true`
- Têm área de drop zone
- Podem ter children ilimitados
- Gerenciam layout dos filhos

**Exemplos:**
- Container
- Grid
- Grid Cell
- Section
- Form
- Columns

```typescript
{
  type: 'container',
  category: 'CONTAINER',
  allowChildren: true,
  children: [
    { type: 'heading', ... },
    { type: 'paragraph', ... }
  ]
}
```

---

### **2. LEAF (Folhas)**

Componentes que **NÃO** podem conter outros componentes.

**Características:**
- `allowChildren: false`
- Componentes auto-contidos
- Renderização direta
- Sem children

**Exemplos:**
- Heading
- Paragraph
- Image
- Button
- Input
- Divider

```typescript
{
  type: 'heading',
  category: 'LEAF',
  allowChildren: false,
  props: { text: 'Título' },
  children: [] // Sempre vazio
}
```

---

### **3. HYBRID (Híbridos)**

Componentes que **PODEM** conter outros componentes, mas também funcionam sem eles.

**Características:**
- `allowChildren: true` (opcional)
- Têm slots nomeados
- Conteúdo padrão + customizado
- Flexibilidade máxima

**Exemplos:**
- Hero
- Card
- Footer
- Navbar
- Modal
- Accordion

```typescript
{
  type: 'card',
  category: 'HYBRID',
  allowChildren: true,
  slots: {
    header: [...],
    content: [...],
    footer: [...]
  },
  props: {
    headerTitle: 'Título padrão', // Usado se slot estiver vazio
    allowChildren: true
  }
}
```

---

## 📚 CATEGORIAS DE COMPONENTES

### **1. Texto (6 componentes)**

Componentes para conteúdo textual.

| Componente | Tipo | Descrição | Propriedades Principais |
|------------|------|-----------|------------------------|
| **Heading H1** | LEAF | Título principal | `tag`, `text`, `textAlign`, `color` |
| **Heading H2** | LEAF | Título secundário | `tag`, `text`, `textAlign` |
| **Heading H3** | LEAF | Subtítulo | `tag`, `text`, `textAlign` |
| **Paragraph** | LEAF | Parágrafo de texto | `text`, `textAlign`, `lineHeight` |
| **Quote** | LEAF | Citação/Blockquote | `text`, `author`, `authorRole`, `borderSide` |
| **List** | LEAF | Lista ordenada/não-ordenada | `type`, `items`, `listStyle` |

**Exemplo de Uso:**

```tsx
// Título H1
{
  type: 'heading',
  props: {
    tag: 'h1',
    text: 'Bem-vindo ao Site',
    textAlign: 'center',
    color: '#1a202c',
    fontFamily: 'system-ui',
    fontSize: '3rem',
    fontWeight: 'bold',
    lineHeight: '1.2',
    textTransform: 'uppercase',
    margin: '2rem 0'
  }
}

// Quote
{
  type: 'quote',
  props: {
    text: 'A inovação distingue um líder de um seguidor.',
    author: 'Steve Jobs',
    authorRole: 'Fundador da Apple',
    borderSide: 'left',
    borderColor: '#3b82f6',
    borderWidth: '4px',
    backgroundColor: '#f9fafb',
    padding: '2rem',
    fontStyle: 'italic'
  }
}
```

---

### **2. Mídia (3 componentes)**

Componentes para imagens, vídeos e galerias.

| Componente | Tipo | Descrição | Propriedades Principais |
|------------|------|-----------|------------------------|
| **Image** | LEAF | Imagem única | `src`, `alt`, `objectFit`, `aspectRatio` |
| **Video** | LEAF | Player de vídeo | `src`, `controls`, `autoplay`, `loop` |
| **Gallery** | CONTAINER | Galeria de imagens | `images[]`, `columns`, `layout`, `lightbox` |

**Exemplo de Uso:**

```tsx
// Image com link
{
  type: 'image',
  props: {
    src: 'https://exemplo.com/imagem.jpg',
    alt: 'Descrição da imagem',
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: '1rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    loading: 'lazy',
    link: '/produto/123',
    linkTarget: '_blank',
    caption: 'Legenda da imagem'
  }
}

// Gallery Grid
{
  type: 'gallery',
  props: {
    images: [
      { src: '/img1.jpg', alt: 'Imagem 1', caption: 'Legenda 1' },
      { src: '/img2.jpg', alt: 'Imagem 2', caption: 'Legenda 2' },
      { src: '/img3.jpg', alt: 'Imagem 3', caption: 'Legenda 3' }
    ],
    columns: 3,
    gap: '1.5rem',
    aspectRatio: '16/9',
    layout: 'grid',
    lightbox: true,
    borderRadius: '0.5rem'
  }
}
```

---

### **3. Layout Containers (8 componentes)**

Componentes estruturais que organizam outros componentes.

| Componente | Tipo | Descrição | Aceita Children | Propriedades Principais |
|------------|------|-----------|----------------|------------------------|
| **Container Simples** | CONTAINER | Container básico | ✅ | `padding`, `maxWidth`, `backgroundColor` |
| **Container Flex** | CONTAINER | Container com Flexbox | ✅ | `flexDirection`, `justifyContent`, `alignItems`, `gap` |
| **Grid 2 Colunas** | CONTAINER | Grid 2 colunas | ✅ | `columns: 2`, `gap`, `gridTemplateColumns` |
| **Grid 3 Colunas** | CONTAINER | Grid 3 colunas | ✅ | `columns: 3`, `gap`, `gridTemplateColumns` |
| **Grid 4 Colunas** | CONTAINER | Grid 4 colunas | ✅ | `columns: 4`, `gap`, `gridTemplateColumns` |
| **Grid Cell** | CONTAINER | Célula de grid | ✅ | `gridColumn`, `gridRow`, `justifySelf`, `alignSelf` |
| **Section** | CONTAINER | Seção fullwidth | ✅ | `fullWidth`, `padding`, `backgroundImage` |
| **Columns** | CONTAINER | Sistema de colunas | ✅ | `count`, `layout`, `stackOnMobile` |

**Exemplo de Uso:**

```tsx
// Container Flex com 3 cards
{
  type: 'container',
  category: 'CONTAINER',
  allowChildren: true,
  props: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: '2rem',
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  children: [
    { type: 'card', props: { headerTitle: 'Card 1' } },
    { type: 'card', props: { headerTitle: 'Card 2' } },
    { type: 'card', props: { headerTitle: 'Card 3' } }
  ]
}

// Grid 3 Colunas Responsivo
{
  type: 'grid',
  category: 'CONTAINER',
  allowChildren: true,
  props: {
    columns: 3,
    gap: '2rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Responsivo!
    padding: '2rem'
  },
  children: [
    { type: 'grid-cell', children: [...] },
    { type: 'grid-cell', children: [...] },
    { type: 'grid-cell', children: [...] }
  ]
}

// Section com Background
{
  type: 'section',
  category: 'CONTAINER',
  allowChildren: true,
  props: {
    fullWidth: true,
    padding: '6rem 2rem',
    backgroundColor: '#1e3a8a',
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '600px'
  },
  children: [
    { type: 'container', children: [...] }
  ]
}
```

---

### **4. Componentes Pré-Construídos (7 componentes)**

Componentes complexos prontos para uso.

| Componente | Tipo | Descrição | Slots/Children | Propriedades Principais |
|------------|------|-----------|---------------|------------------------|
| **Hero Section** | HYBRID | Seção hero completa | ✅ | `title`, `subtitle`, `backgroundImage`, `buttons` |
| **Card Completo** | HYBRID | Card com header/footer | ✅ header, content, footer | `headerTitle`, `imageSrc`, `variant` |
| **Testimonial** | LEAF | Depoimento | ❌ | `text`, `author`, `rating`, `variant` |
| **Features** | HYBRID | Lista de recursos | ❌ | `features[]`, `columns`, `layout` |
| **Stats** | LEAF | Estatísticas | ❌ | `stats[]`, `columns`, `animateOnView` |
| **Pricing** | LEAF | Tabela de preços | ❌ | `plans[]`, `columns`, `showComparison` |
| **Team** | LEAF | Equipe/Time | ❌ | `members[]`, `columns`, `imageShape` |

**Exemplo de Uso:**

```tsx
// Hero Section Completo
{
  type: 'hero',
  category: 'HYBRID',
  props: {
    title: 'Transforme Seu Negócio',
    subtitle: 'Soluções Inovadoras para Empresas Modernas',
    description: 'Aumente sua produtividade em até 300% com nossas ferramentas',
    primaryButtonText: 'Começar Grátis',
    primaryButtonLink: '/cadastro',
    secondaryButtonText: 'Ver Demo',
    secondaryButtonLink: '/demo',
    backgroundImage: 'url(/hero-bg.jpg)',
    backgroundOverlay: true,
    overlayColor: 'rgba(0,0,0,0.5)',
    overlayOpacity: 0.6,
    textAlign: 'center',
    verticalAlign: 'center',
    minHeight: '600px',
    padding: '4rem 2rem'
  }
}

// Pricing Table
{
  type: 'pricing',
  props: {
    plans: [
      {
        id: '1',
        name: 'Starter',
        price: 'R$ 29',
        period: '/mês',
        description: 'Perfeito para começar',
        features: [
          '5 projetos',
          '10GB storage',
          'Suporte por email',
          '1 usuário'
        ],
        featuresExcluded: ['API access', 'Integrações'],
        buttonText: 'Começar',
        buttonLink: '/planos/starter',
        highlighted: false
      },
      {
        id: '2',
        name: 'Professional',
        price: 'R$ 99',
        period: '/mês',
        description: 'Para profissionais',
        features: [
          'Projetos ilimitados',
          '100GB storage',
          'Suporte prioritário',
          '10 usuários',
          'API access'
        ],
        buttonText: 'Assinar',
        buttonLink: '/planos/pro',
        highlighted: true // Destaque visual
      },
      {
        id: '3',
        name: 'Enterprise',
        price: 'Customizado',
        period: '',
        description: 'Para grandes empresas',
        features: [
          'Tudo do Pro',
          'Storage ilimitado',
          'Suporte 24/7',
          'Usuários ilimitados',
          'Integrações customizadas',
          'Gerente dedicado'
        ],
        buttonText: 'Contato',
        buttonLink: '/contato',
        highlighted: false
      }
    ],
    columns: 3,
    gap: '2rem',
    showComparison: true,
    currency: 'R$'
  }
}
```

---

### **5. Formulários (7 componentes)**

Componentes para criação de formulários.

| Componente | Tipo | Descrição | Aceita Children | Propriedades Principais |
|------------|------|-----------|----------------|------------------------|
| **Form** | CONTAINER | Container de formulário | ✅ | `action`, `method`, `submitButtonText`, `gap` |
| **Input** | LEAF | Campo de texto | ❌ | `type`, `name`, `label`, `required`, `validation` |
| **Textarea** | LEAF | Área de texto | ❌ | `name`, `label`, `rows`, `resize` |
| **Select** | LEAF | Campo de seleção | ❌ | `name`, `options[]`, `multiple` |
| **Checkbox** | LEAF | Caixa de seleção | ❌ | `name`, `label`, `checked` |
| **Radio Group** | LEAF | Grupo de rádios | ❌ | `name`, `options[]`, `orientation` |
| **Button Submit** | LEAF | Botão de envio | ❌ | `type: 'submit'`, `text`, `variant` |

**Exemplo de Uso:**

```tsx
// Formulário de Contato Completo
{
  type: 'form',
  category: 'CONTAINER',
  allowChildren: true,
  props: {
    name: 'contact-form',
    action: '/api/contact',
    method: 'POST',
    submitButtonText: 'Enviar Mensagem',
    submitButtonVariant: 'primary',
    gap: '1.5rem',
    maxWidth: '600px',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  children: [
    // Nome
    {
      type: 'input',
      props: {
        type: 'text',
        name: 'name',
        label: 'Nome Completo',
        placeholder: 'Digite seu nome',
        required: true,
        helperText: 'Como devemos te chamar?'
      }
    },
    // Email
    {
      type: 'input',
      props: {
        type: 'email',
        name: 'email',
        label: 'E-mail',
        placeholder: 'seu@email.com',
        required: true,
        pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
        helperText: 'Nunca compartilharemos seu email'
      }
    },
    // Assunto
    {
      type: 'select',
      props: {
        name: 'subject',
        label: 'Assunto',
        required: true,
        options: [
          { value: '', label: 'Selecione um assunto' },
          { value: 'suporte', label: 'Suporte Técnico' },
          { value: 'vendas', label: 'Vendas' },
          { value: 'parceria', label: 'Parceria' },
          { value: 'outro', label: 'Outro' }
        ]
      }
    },
    // Mensagem
    {
      type: 'textarea',
      props: {
        name: 'message',
        label: 'Mensagem',
        placeholder: 'Digite sua mensagem aqui...',
        rows: 6,
        required: true,
        minLength: 10,
        maxLength: 1000,
        helperText: 'Mínimo 10 caracteres'
      }
    },
    // Checkbox
    {
      type: 'checkbox',
      props: {
        name: 'newsletter',
        label: 'Quero receber novidades por email',
        checked: false
      }
    },
    // Termos
    {
      type: 'checkbox',
      props: {
        name: 'terms',
        label: 'Aceito os termos e condições',
        required: true
      }
    }
  ]
}
```

---

### **6. Navegação (4 componentes)**

Componentes para navegação e menu.

| Componente | Tipo | Descrição | Propriedades Principais |
|------------|------|-----------|------------------------|
| **Navbar** | HYBRID | Barra de navegação | `logo`, `items[]`, `position`, `ctaButton` |
| **Breadcrumb** | LEAF | Migalhas de pão | `items[]`, `separator`, `showHome` |
| **Footer Simples** | HYBRID | Rodapé básico | `copyrightText`, `showSocial` |
| **Footer Multi-Coluna** | HYBRID | Rodapé com colunas | `columns[]`, `showSocial`, `copyrightText` |

**Exemplo de Uso:**

```tsx
// Navbar Completo
{
  type: 'navbar',
  props: {
    logoText: 'MeuSite',
    logoLink: '/',
    items: [
      { label: 'Início', link: '/' },
      { 
        label: 'Serviços', 
        link: '/servicos',
        children: [
          { label: 'Consultoria', link: '/servicos/consultoria' },
          { label: 'Desenvolvimento', link: '/servicos/desenvolvimento' },
          { label: 'Suporte', link: '/servicos/suporte' }
        ]
      },
      { label: 'Sobre', link: '/sobre' },
      { label: 'Blog', link: '/blog' },
      { label: 'Contato', link: '/contato' }
    ],
    position: 'sticky',
    backgroundColor: 'white',
    textColor: '#1f2937',
    height: '80px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    ctaText: 'Começar Grátis',
    ctaLink: '/cadastro',
    ctaVariant: 'primary'
  }
}

// Footer Multi-Coluna
{
  type: 'footer',
  props: {
    variant: 'multi-column',
    columns: [
      {
        title: 'Empresa',
        links: [
          { label: 'Sobre Nós', link: '/sobre' },
          { label: 'Equipe', link: '/equipe' },
          { label: 'Carreiras', link: '/carreiras' },
          { label: 'Imprensa', link: '/imprensa' }
        ]
      },
      {
        title: 'Produtos',
        links: [
          { label: 'Features', link: '/features' },
          { label: 'Preços', link: '/precos' },
          { label: 'Integrações', link: '/integracoes' },
          { label: 'API', link: '/api' }
        ]
      },
      {
        title: 'Recursos',
        links: [
          { label: 'Blog', link: '/blog' },
          { label: 'Documentação', link: '/docs' },
          { label: 'Tutoriais', link: '/tutoriais' },
          { label: 'Suporte', link: '/suporte' }
        ]
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacidade', link: '/privacidade' },
          { label: 'Termos de Uso', link: '/termos' },
          { label: 'Cookies', link: '/cookies' }
        ]
      }
    ],
    copyrightText: '© 2024 MeuSite. Todos os direitos reservados.',
    showSocial: true,
    socialLinks: {
      facebook: 'https://facebook.com/meusite',
      twitter: 'https://twitter.com/meusite',
      instagram: 'https://instagram.com/meusite',
      linkedin: 'https://linkedin.com/company/meusite'
    },
    backgroundColor: '#111827',
    textColor: '#d1d5db',
    padding: '4rem 2rem 2rem'
  }
}
```

---

### **7. Interativos (5 componentes)**

Componentes com interação do usuário.

| Componente | Tipo | Descrição | Propriedades Principais |
|------------|------|-----------|------------------------|
| **Button Primário** | LEAF | Botão de ação | `text`, `variant`, `onClick`, `icon` |
| **Button Outline** | LEAF | Botão outline | `text`, `variant: 'outline'` |
| **Accordion** | HYBRID | Accordion/FAQ | `items[]`, `allowMultiple`, `defaultOpen[]` |
| **Tabs** | HYBRID | Abas/Tabs | `tabs[]`, `defaultTab`, `orientation` |
| **Modal** | HYBRID | Modal/Dialog | `triggerText`, `title`, `content`, `size` |

**Exemplo de Uso:**

```tsx
// Accordion FAQ
{
  type: 'accordion',
  props: {
    items: [
      {
        id: '1',
        title: 'Como funciona o período de teste?',
        content: '<p>Você tem 14 dias para testar todas as funcionalidades gratuitamente. Não é necessário cartão de crédito.</p>'
      },
      {
        id: '2',
        title: 'Posso cancelar a qualquer momento?',
        content: '<p>Sim! Você pode cancelar sua assinatura a qualquer momento sem custos adicionais.</p>'
      },
      {
        id: '3',
        title: 'Quais formas de pagamento são aceitas?',
        content: '<p>Aceitamos cartões de crédito, débito, PIX e boleto bancário.</p>'
      }
    ],
    allowMultiple: false,
    defaultOpen: ['1'], // Primeiro item aberto
    variant: 'bordered',
    iconPosition: 'right'
  }
}

// Tabs
{
  type: 'tabs',
  props: {
    tabs: [
      {
        id: 'features',
        label: 'Recursos',
        icon: 'Sparkles',
        content: '<div><h3>Recursos Principais</h3><ul><li>Feature 1</li><li>Feature 2</li></ul></div>'
      },
      {
        id: 'pricing',
        label: 'Preços',
        icon: 'DollarSign',
        content: '<div><h3>Planos e Preços</h3><p>Escolha o melhor plano para você</p></div>'
      },
      {
        id: 'faq',
        label: 'FAQ',
        icon: 'HelpCircle',
        content: '<div><h3>Perguntas Frequentes</h3><p>Tire suas dúvidas</p></div>'
      }
    ],
    defaultTab: 'features',
    orientation: 'horizontal',
    variant: 'underline',
    tabsPosition: 'start'
  }
}
```

---

### **8. Avançados (9 componentes)**

Componentes técnicos e especializados.

| Componente | Tipo | Descrição | Propriedades Principais |
|------------|------|-----------|------------------------|
| **Timeline** | LEAF | Linha do tempo | `events[]`, `orientation`, `alternating` |
| **Table** | LEAF | Tabela de dados | `headers[]`, `rows[][]`, `sortable` |
| **Code** | LEAF | Bloco de código | `code`, `language`, `theme`, `lineNumbers` |
| **Map** | LEAF | Mapa/Localização | `location`, `lat`, `lng`, `markers[]` |
| **Contact Info** | LEAF | Informações de contato | `email`, `phone`, `address`, `hours` |
| **Social Links** | LEAF | Links de redes sociais | `links{}`, `size`, `variant` |
| **Divider** | LEAF | Linha divisória | `variant`, `orientation`, `withText` |
| **Spacer** | LEAF | Espaçamento | `height`, `width`, `responsive{}` |
| **Icon** | LEAF | Ícone Lucide | `name`, `size`, `color`, `animation` |

**Exemplo de Uso:**

```tsx
// Timeline
{
  type: 'timeline',
  props: {
    orientation: 'vertical',
    events: [
      {
        id: '1',
        date: '2024',
        title: 'Lançamento',
        description: 'Lançamos oficialmente nosso produto',
        icon: 'Rocket',
        image: '/timeline/2024.jpg'
      },
      {
        id: '2',
        date: '2023',
        title: 'Série A',
        description: 'Captamos R$ 10M em investimento',
        icon: 'TrendingUp'
      },
      {
        id: '3',
        date: '2022',
        title: 'Fundação',
        description: 'A empresa foi fundada',
        icon: 'Flag'
      }
    ],
    alternating: true,
    lineColor: '#3b82f6',
    dotColor: '#3b82f6',
    dotSize: '1rem',
    spacing: '3rem'
  }
}

// Code Block
{
  type: 'code',
  props: {
    code: `function calculateTotal(items) {
  return items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
}

const total = calculateTotal(cartItems);
console.log('Total:', total);`,
    language: 'javascript',
    showLineNumbers: true,
    highlightLines: [2, 3, 7],
    theme: 'monokai',
    fileName: 'cart.js',
    copyButton: true,
    maxHeight: '400px'
  }
}
```

---

## 🔧 SISTEMA DE CONTAINERS

### **Como Funcionam os Containers**

Containers são componentes especiais que **aceitam outros componentes como filhos**.

#### **Estrutura Básica:**

```typescript
interface Container extends BaseComponent {
  allowChildren: true;
  children: BaseComponent[];
  // Propriedades de layout
  display?: 'block' | 'flex' | 'grid';
  flexDirection?: 'row' | 'column';
  gridTemplateColumns?: string;
  gap?: string;
  padding?: string;
}
```

#### **Tipos de Containers:**

1. **Container Flex**
   - Layout baseado em Flexbox
   - Bom para layouts lineares
   - Controle de direção e alinhamento

2. **Container Grid**
   - Layout baseado em CSS Grid
   - Bom para layouts bidimensionais
   - Controle preciso de colunas e linhas

3. **Container Básico**
   - Layout padrão (block)
   - Empilhamento vertical
   - Simples e direto

#### **Exemplo Prático:**

```tsx
// Layout de 3 Colunas com Cards
{
  type: 'container',
  category: 'CONTAINER',
  allowChildren: true,
  props: {
    display: 'flex',
    flexDirection: 'row',
    gap: '2rem',
    padding: '2rem',
    backgroundColor: '#f9fafb'
  },
  children: [
    // Card 1
    {
      type: 'card',
      props: {
        headerTitle: 'Produto 1',
        imageSrc: '/produto1.jpg',
        hasImage: true,
        hasFooter: true
      },
      children: [
        {
          type: 'paragraph',
          props: { text: 'Descrição do produto 1' }
        },
        {
          type: 'button',
          props: { text: 'Comprar', variant: 'primary' }
        }
      ]
    },
    // Card 2
    {
      type: 'card',
      props: {
        headerTitle: 'Produto 2',
        imageSrc: '/produto2.jpg',
        hasImage: true,
        hasFooter: true
      },
      children: [
        {
          type: 'paragraph',
          props: { text: 'Descrição do produto 2' }
        },
        {
          type: 'button',
          props: { text: 'Comprar', variant: 'primary' }
        }
      ]
    },
    // Card 3
    {
      type: 'card',
      props: {
        headerTitle: 'Produto 3',
        imageSrc: '/produto3.jpg',
        hasImage: true,
        hasFooter: true
      },
      children: [
        {
          type: 'paragraph',
          props: { text: 'Descrição do produto 3' }
        },
        {
          type: 'button',
          props: { text: 'Comprar', variant: 'primary' }
        }
      ]
    }
  ]
}
```

---

## 🎰 SISTEMA DE SLOTS

### **O que são Slots?**

Slots são **áreas nomeadas** dentro de um componente onde você pode inserir conteúdo customizado.

#### **Componentes com Slots:**

- **Card**: `header`, `content`, `footer`
- **Hero**: `content`, `buttons`
- **Footer**: `columns[]`, `social`, `legal`
- **Modal**: `header`, `body`, `footer`

#### **Exemplo - Card com Slots:**

```tsx
{
  type: 'card',
  category: 'HYBRID',
  props: {
    variant: 'elevated',
    hasHeader: true,
    hasImage: true,
    hasFooter: true
  },
  slots: {
    // Slot: Header
    header: [
      {
        type: 'heading',
        props: { tag: 'h3', text: 'Título Custom' }
      }
    ],
    // Slot: Content
    content: [
      {
        type: 'paragraph',
        props: { text: 'Conteúdo customizado do card' }
      },
      {
        type: 'list',
        props: {
          type: 'unordered',
          items: ['Item 1', 'Item 2', 'Item 3']
        }
      }
    ],
    // Slot: Footer
    footer: [
      {
        type: 'button',
        props: { text: 'Ação 1', variant: 'primary' }
      },
      {
        type: 'button',
        props: { text: 'Ação 2', variant: 'outline' }
      }
    ]
  }
}
```

#### **Fallback de Slots:**

Se um slot estiver vazio, o componente usa as props padrão:

```tsx
{
  type: 'card',
  props: {
    headerTitle: 'Título Padrão', // ← Usado se slots.header estiver vazio
    hasHeader: true,
    hasFooter: false
  },
  slots: {
    header: [], // Vazio → usa headerTitle da props
    content: [
      { type: 'paragraph', props: { text: 'Conteúdo' } }
    ]
  }
}
```

---

## 📖 EXEMPLOS DE USO

### **Exemplo 1: Landing Page Completa**

```tsx
const landingPage = [
  // Hero Section
  {
    type: 'hero',
    props: {
      title: 'Transforme Seu Negócio Digital',
      subtitle: 'Plataforma completa de gerenciamento de conteúdo',
      description: 'Crie, gerencie e publique conteúdo profissional em minutos',
      primaryButtonText: 'Começar Grátis',
      primaryButtonLink: '/cadastro',
      secondaryButtonText: 'Ver Demo',
      secondaryButtonLink: '/demo',
      backgroundImage: 'url(/hero-bg.jpg)',
      backgroundOverlay: true,
      minHeight: '700px'
    }
  },

  // Features Grid
  {
    type: 'section',
    allowChildren: true,
    props: {
      padding: '6rem 2rem',
      backgroundColor: 'white'
    },
    children: [
      {
        type: 'container',
        allowChildren: true,
        props: {
          maxWidth: '1200px',
          margin: '0 auto'
        },
        children: [
          {
            type: 'heading',
            props: {
              tag: 'h2',
              text: 'Recursos Poderosos',
              textAlign: 'center'
            }
          },
          {
            type: 'features',
            props: {
              features: [
                {
                  id: '1',
                  icon: 'Zap',
                  title: 'Super Rápido',
                  description: 'Performance otimizada para carregamento instantâneo'
                },
                {
                  id: '2',
                  icon: 'Shield',
                  title: 'Seguro',
                  description: 'Proteção avançada de dados e backup automático'
                },
                {
                  id: '3',
                  icon: 'Users',
                  title: 'Colaborativo',
                  description: 'Trabalhe em equipe com permissões granulares'
                }
              ],
              columns: 3,
              gap: '3rem'
            }
          }
        ]
      }
    ]
  },

  // Pricing Section
  {
    type: 'section',
    allowChildren: true,
    props: {
      padding: '6rem 2rem',
      backgroundColor: '#f9fafb'
    },
    children: [
      {
        type: 'container',
        allowChildren: true,
        props: {
          maxWidth: '1200px',
          margin: '0 auto'
        },
        children: [
          {
            type: 'heading',
            props: {
              tag: 'h2',
              text: 'Planos e Preços',
              textAlign: 'center'
            }
          },
          {
            type: 'pricing',
            props: {
              plans: [
                {
                  id: '1',
                  name: 'Básico',
                  price: 'R$ 49',
                  period: '/mês',
                  features: ['10 usuários', '10GB storage'],
                  buttonText: 'Começar',
                  buttonLink: '/planos/basico'
                },
                {
                  id: '2',
                  name: 'Pro',
                  price: 'R$ 99',
                  period: '/mês',
                  features: ['50 usuários', '100GB storage', 'API access'],
                  highlighted: true,
                  buttonText: 'Assinar',
                  buttonLink: '/planos/pro'
                },
                {
                  id: '3',
                  name: 'Enterprise',
                  price: 'Customizado',
                  features: ['Ilimitado', 'Suporte 24/7', 'Onboarding'],
                  buttonText: 'Contato',
                  buttonLink: '/contato'
                }
              ],
              columns: 3
            }
          }
        ]
      }
    ]
  },

  // FAQ Section
  {
    type: 'section',
    allowChildren: true,
    props: {
      padding: '6rem 2rem',
      backgroundColor: 'white'
    },
    children: [
      {
        type: 'container',
        allowChildren: true,
        props: {
          maxWidth: '800px',
          margin: '0 auto'
        },
        children: [
          {
            type: 'heading',
            props: {
              tag: 'h2',
              text: 'Perguntas Frequentes',
              textAlign: 'center'
            }
          },
          {
            type: 'accordion',
            props: {
              items: [
                {
                  id: '1',
                  title: 'Como funciona o período de teste?',
                  content: '14 dias grátis, sem cartão de crédito'
                },
                {
                  id: '2',
                  title: 'Posso cancelar a qualquer momento?',
                  content: 'Sim, sem multas ou taxas'
                }
              ],
              variant: 'bordered'
            }
          }
        ]
      }
    ]
  },

  // CTA Section
  {
    type: 'section',
    allowChildren: true,
    props: {
      padding: '6rem 2rem',
      backgroundColor: '#3b82f6',
      textAlign: 'center'
    },
    children: [
      {
        type: 'heading',
        props: {
          tag: 'h2',
          text: 'Pronto para Começar?',
          color: 'white'
        }
      },
      {
        type: 'paragraph',
        props: {
          text: 'Junte-se a milhares de empresas que já usam nossa plataforma',
          color: 'white'
        }
      },
      {
        type: 'button',
        props: {
          text: 'Começar Grátis Agora',
          variant: 'secondary',
          size: 'large'
        }
      }
    ]
  }
];
```

---

### **Exemplo 2: Blog Post**

```tsx
const blogPost = [
  // Header
  {
    type: 'container',
    allowChildren: true,
    props: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '4rem 2rem'
    },
    children: [
      {
        type: 'breadcrumb',
        props: {
          items: [
            { label: 'Início', link: '/' },
            { label: 'Blog', link: '/blog' },
            { label: 'Como Criar um CMS' }
          ]
        }
      },
      {
        type: 'heading',
        props: {
          tag: 'h1',
          text: 'Como Criar um CMS Moderno'
        }
      },
      {
        type: 'paragraph',
        props: {
          text: 'Publicado em 15 de dezembro de 2024 por João Silva'
        }
      },
      {
        type: 'image',
        props: {
          src: '/blog/cms-cover.jpg',
          alt: 'CMS Moderno',
          borderRadius: '1rem'
        }
      },
      {
        type: 'paragraph',
        props: {
          text: 'Introdução ao artigo...'
        }
      },
      {
        type: 'heading',
        props: {
          tag: 'h2',
          text: 'O que é um CMS?'
        }
      },
      {
        type: 'paragraph',
        props: {
          text: 'CMS significa Content Management System...'
        }
      },
      {
        type: 'list',
        props: {
          type: 'unordered',
          items: [
            'Facilita a criação de conteúdo',
            'Gerencia múltiplos usuários',
            'Permite customização'
          ]
        }
      },
      {
        type: 'quote',
        props: {
          text: 'Um bom CMS economiza horas de trabalho',
          author: 'Especialista em Web'
        }
      },
      {
        type: 'code',
        props: {
          code: 'const cms = new ContentManagementSystem();',
          language: 'javascript'
        }
      }
    ]
  }
];
```

---

## 🔍 GUIA DE REFERÊNCIA RÁPIDA

### **Atalhos por Categoria**

#### **Precisa de um Container?**
✅ Use: `container`, `grid`, `section`, `form`, `columns`

#### **Precisa de Texto?**
✅ Use: `heading`, `paragraph`, `quote`, `list`

#### **Precisa de Imagens?**
✅ Use: `image`, `gallery`, `video`

#### **Precisa de Formulário?**
✅ Use: `form` + `input` + `textarea` + `select` + `button`

#### **Precisa de Navegação?**
✅ Use: `navbar`, `breadcrumb`, `footer`

#### **Precisa de Componente Pronto?**
✅ Use: `hero`, `card`, `features`, `pricing`, `testimonial`

---

### **Propriedades Comuns**

Todas as propriedades CSS são suportadas via `styles`:

```tsx
styles: {
  // Layout
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1rem',
  
  // Spacing
  margin: '1rem',
  padding: '2rem',
  
  // Size
  width: '100%',
  height: 'auto',
  maxWidth: '1200px',
  minHeight: '400px',
  
  // Colors
  color: '#000000',
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  
  // Border
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  
  // Shadow
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  
  // Typography
  fontSize: '1rem',
  fontWeight: 'bold',
  lineHeight: '1.6',
  textAlign: 'center',
  
  // Position
  position: 'relative',
  zIndex: 10
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Ao Criar um Novo Componente:**

- [ ] Definir categoria (CONTAINER / LEAF / HYBRID)
- [ ] Criar interface de props em `ComponentDefinitions.ts`
- [ ] Adicionar componente em `ComponentLibraryAdvanced.tsx`
- [ ] Definir propriedades padrão
- [ ] Definir estilos padrão
- [ ] Configurar `allowChildren` corretamente
- [ ] Definir slots (se aplicável)
- [ ] Adicionar ícone apropriado
- [ ] Testar renderização
- [ ] Documentar no guia

---

## 🎯 RESUMO

**Sistema de Componentes = 90+ componentes robustos**

✅ **Hierarquia Clara**: Container, Leaf, Hybrid  
✅ **Propriedades Completas**: Tudo documentado  
✅ **Containers Funcionais**: Aceitam children  
✅ **Slots Avançados**: Áreas nomeadas  
✅ **TypeScript**: Tipagem completa  
✅ **Exemplos Práticos**: Casos de uso reais  

**Use este guia como referência ao trabalhar com o editor visual!** 📚
