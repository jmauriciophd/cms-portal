# Sistema de Schemas Avançados de Componentes

## Visão Geral

Implementamos um sistema completo de schemas de componentes para o Page Builder, baseado na especificação detalhada fornecida. Este sistema define todas as propriedades e funcionalidades disponíveis para cada tipo de componente.

## Arquivos Criados/Atualizados

### 1. `/utils/advancedComponentSchemas.ts`
**Schema completo de propriedades dos componentes**

Este arquivo contém:

#### Núcleo Comum (BaseComponentProperties)
Propriedades compartilhadas por todos os componentes:

- **1.1 Identidade e metadados**: id, key, name, componentType, dataBinding, visibility, locked, version
- **1.2 Layout e dimensões**: zIndex, width, height, minWidth, minHeight, maxWidth, maxHeight
- **1.3 Espaçamento**: margin, padding (com variantes Top/Right/Bottom/Left) em em, rem, %, px
- **1.4 Tipografia e cores**: fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, color, backgroundColor, textDecoration, textTransform
- **1.5 Borda e raio**: borderRadius, borderWidth, borderStyle, borderColor (em/rem/%/px)
- **1.6 Efeitos visuais**: boxShadow (offsetX/Y, blur, spread, color, inset), opacity, filter (blur, brightness, contrast, grayscale, saturate)
- **1.7 Transformações 2D/3D**: rotate, scaleX/Y, translateX/Y, skewX/Y, transformOrigin
- **1.8 Animações e transições**: transition, animation, scrollAnimation
- **1.9 Estados**: base, hover, focus, active, disabled
- **1.10 Responsividade**: breakpoints (xs, sm, md, lg, xl), containerQueries, visibilityByBreakpoint
- **1.11 Acessibilidade**: role, aria-label, aria-labelledby, aria-describedby, tabIndex, focusOutline, keyboardShortcuts, readingOrder
- **1.12 SEO e semântico**: tagName, idAnchor, meta (data-attributes)
- **1.13 Estilos customizados**: className, styleOverrides, cssVariables
- **1.14 Eventos e ações**: onClick, onDblClick, onMouseEnter/Leave, onFocus/Blur, onKeyDown/Up, onVisible

#### Componentes Estruturais

##### **Container**
- Display: flex, grid, block, inline-block
- Flex: direction, wrap, justifyContent, alignItems, alignContent, gap
- Grid: templateColumns/Rows, areas, autoFlow, columnGap, rowGap
- Background: color, gradient, image (url, repeat, position, size), overlay
- Overflow: visible, hidden, scroll, auto
- Position: static, relative, absolute, fixed, sticky
- Funções: asSection, makeScrollable, snapType, isolateStackingContext

##### **Section**
Estende Container com:
- maxWidth (em/rem/px)
- verticalPadding
- stickyHeader/Footer
- alternateBackground

##### **Grid**
Layout de colunas/linhas com:
- columns, rows
- columnGap, rowGap
- areas (grid areas nomeadas)
- responsiveTemplates
- autoLayout

#### Componentes de Conteúdo

##### **Text**
- textType: p, span, div, blockquote
- content
- textAlign
- maxLines (line-clamp)
- linkify (auto transform URLs)
- whiteSpace

##### **Heading**
- level: h1-h6
- content
- anchorLink
- semanticPriority
- textAlign

##### **Image**
- src, alt (obrigatório), title
- lazy, decoding
- aspectRatio
- srcSet, sizes
- placeholder: blur, color
- objectFit, objectPosition
- Efeitos: hoverZoom, parallax, mask
- Funções: openLightbox, artDirection

##### **Button**
- label
- variant: default, outline, ghost, link, destructive
- size: sm, md, lg
- iconLeft, iconRight
- disabled, loading
- ariaPressed
- href, target
- formAction: submit, reset, button

##### **Link**
- href, target, rel
- prefetch
- content
- underline: none, hover, always

##### **Icon**
- name (lib/tokens)
- library: lucide, heroicons, custom
- size (em/rem/px)
- color
- spin, pulse
- ariaHidden

##### **Video/Media**
- source, poster
- controls, autoplay, loop, muted, playsInline
- captions (VTT), trackLang
- pip (picture-in-picture)
- playbackRate

##### **List/Repeater**
- listType: ul, ol
- dataSource (array binding)
- itemTemplate
- emptyState
- pagination (pageSize, controls)
- sortBy, sortOrder
- filterExpression

##### **Card**
- elevation: none, sm, md, lg, xl
- mediaTop
- header, content, footer
- interactive (hover raise)
- clickable, href

##### **Table**
- columns (key, label, width, sortable, filterable)
- data
- stickyHeader, rowStriped, rowHover
- sortable, filterable, selectable, exportable

#### Componentes de Navegação

##### **Header/Navbar**
- brand (logo, logoAlt, text, href)
- menuItems (tree structure)
- sticky, transparent
- collapseBreakpoint
- height

##### **Footer**
- columns
- links (grid de itens)
- legal (privacy, terms, contact, lgpd)
- showBackToTop

##### **Breadcrumb**
- items (label, href, active)
- separator
- showHome

##### **Tabs**
- orientation: horizontal, vertical
- items (id, label, icon, content, disabled)
- activeId
- variant: default, pills, underline

##### **Accordion**
- items (id, title, content, expanded, disabled)
- allowMultiple
- defaultExpanded

##### **Modal/Drawer**
- isOpen
- size: sm, md, lg, xl, full
- closeOnEsc, closeOnBackdrop
- showCloseButton
- title, content, footer
- focusTrap

##### **Carousel**
- items
- autoPlay, autoPlayInterval
- loop
- showIndicators, showArrows
- slidesPerView, spaceBetween
- effect: slide, fade, cube, flip

#### Componentes de Formulário

##### **Form**
- method: GET, POST
- action, enctype
- noValidate
- onSubmit, onReset, onValidate

##### **Input**
- inputType: text, email, password, number, tel, url, search, date, time, etc.
- name, value, placeholder
- maxLength, minLength, pattern (regex)
- required, readOnly, disabled
- autoComplete, autoFocus
- helperText, error
- validationRules

##### **Textarea**
Estende Input com:
- rows, cols
- resize: none, both, horizontal, vertical

##### **Select**
- name, value
- options (value, label, disabled, group)
- multiple, clearable, searchable
- placeholder
- required, disabled
- helperText, error

##### **Checkbox**
- name, value, checked
- label
- disabled, required
- indeterminate

##### **Radio**
- name, value, checked
- label
- disabled, required

##### **Switch**
- name, checked
- label
- disabled
- size: sm, md, lg

#### Componentes Utilitários

##### **Spacer**
- size (em/rem/%/px)
- orientation: horizontal, vertical

##### **Divider**
- orientation: horizontal, vertical
- lineStyle: solid, dashed, dotted
- thickness, color
- spacing (margin ao redor)
- label (texto no meio)

##### **Map**
- provider: google, mapbox, openstreetmap
- center (lat, lon)
- zoom
- markers (id, position, title, description, icon)
- interactive
- height
- alternativeText (para acessibilidade)

##### **Embed/Code**
- embedType: iframe, script, html
- source
- sandbox (whitelist)
- height, width
- allowFullscreen
- allowedDomains (segurança)
- csp (Content Security Policy)

### 2. `/components/editor/AdvancedPropertyEditor.tsx`
**Editor de propriedades completo**

Interface visual para editar todas as propriedades dos componentes com 4 tabs:

#### Tab: Layout
- **Dimensões**: width, height, min/max width/height, z-index
- **Espaçamento**: margin e padding (Top/Right/Bottom/Left) com suporte a em, rem, %, px

#### Tab: Style
- **Tipografia**: fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textTransform, textDecoration
- **Cores**: color, backgroundColor com picker e input de texto
- **Bordas**: borderRadius, borderWidth, borderStyle, borderColor
- **Opacidade**: slider de 0-100%

#### Tab: Advanced
- **Transformações**: rotate, scaleX/Y, translateX/Y
- **Box Shadow**: offsetX/Y, blur, spread, color, inset

#### Tab: Settings
- **Identidade**: ID, nome, classes CSS, tag HTML, locked, visibility
- **Acessibilidade**: ARIA role, ARIA label, tabIndex, focusOutline

## Funções Auxiliares

### `initializeComponent(componentType, overrides)`
Cria um novo componente com valores padrão e ID único.

### `canAcceptChild(parentType, childType)`
Valida se um componente pode ser filho de outro baseado nas regras de hierarquia.

### `propertiesToCSS(props)`
Converte propriedades do componente para CSS inline (React.CSSProperties).

### `getAccessibilityProps(props)`
Extrai propriedades ARIA para aplicar ao elemento.

### `generateComponentId(type)`
Gera ID único para componente.

### `cloneComponent(component)`
Clona componente com novo ID.

## Padrões de Valores e Validações

### Unidades Permitidas
- **em, rem, %**: Recomendadas para responsividade
- **px**: Conversão opcional no runtime

### Validações
- Números não negativos para spacing/dimensões
- `alt` obrigatório em Image
- `aria-label` obrigatório para ícones informativos
- Contrast ratio (AA) checado quando cor de texto/fundo alteradas

## Responsividade

### Breakpoints
```typescript
breakpoints: {
  xs: { ... },  // <576px
  sm: { ... },  // ≥576px
  md: { ... },  // ≥768px
  lg: { ... },  // ≥992px
  xl: { ... }   // ≥1200px
}
```

### Estratégia de Herança
Cascata: xs → sm → md → lg → xl  
O mais específico sobrepõe o anterior.

## Ações e Automações (No-Code/Low-Code)

### Tipos de Ações
- `navigate`: Navegar para URL
- `openModal` / `closeModal`: Controlar modais
- `toggle`: Alternar estado
- `setState`: Definir valor de estado
- `emit`: Emitir evento customizado
- `runScript`: Executar script (whitelist)
- `callAPI`: Chamar API preset (seguro)
- `trackEvent`: Telemetria/analytics

### Encadeamento
Eventos podem executar múltiplas ações em sequência.

### Condições
```typescript
{
  type: 'navigate',
  condition: 'state.isLoggedIn',
  target: '/dashboard'
}
```

## Exemplo Prático

```typescript
import { initializeComponent, ContainerProperties } from '@/utils/advancedComponentSchemas';

// Criar container hero
const hero = initializeComponent('container', {
  name: 'Hero Section',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  padding: '4rem 2rem',
  margin: '0 auto',
  width: '100%',
  maxWidth: '64rem',
  background: {
    type: 'gradient',
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [
        { color: '#667eea', stop: 0 },
        { color: '#764ba2', stop: 100 }
      ]
    }
  },
  boxShadow: {
    offsetX: '0',
    offsetY: '0.75rem',
    blur: '1.5rem',
    spread: '0',
    color: 'rgba(0,0,0,0.1)',
    inset: false
  },
  animation: {
    name: 'fadeIn',
    duration: '600ms',
    timingFunction: 'ease-out'
  },
  breakpoints: {
    md: {
      padding: '6rem 3rem',
      maxWidth: '72rem'
    }
  },
  onVisible: [
    {
      type: 'trackEvent',
      params: { name: 'hero_seen' }
    }
  ]
} as Partial<ContainerProperties>);
```

## Convenções de Design Tokens

### Variáveis Recomendadas
```css
/* Spacing */
--space-2, --space-4, --space-8 (em rem)

/* Colors */
--color-brand-600, --color-bg-surface

/* Radius */
--radius-sm, --radius-md, --radius-lg

/* Shadow */
--shadow-sm, --shadow-md, --shadow-lg
```

### Uso
```typescript
{
  margin: 'var(--space-8)',
  boxShadow: 'var(--shadow-md)',
  fontSize: 'var(--font-size-600)'
}
```

## Checklist de Acessibilidade

✅ **Textos**
- h1 único por página
- Ordem h2/h3 coerente

✅ **Imagens**
- alt descritivo
- role="presentation" se decorativa

✅ **Foco**
- Foco visível
- tabIndex consistente
- Evitar tabindex > 0

✅ **Contraste**
- AA mínimo: normal 4.5:1, grande 3:1

✅ **Interações**
- Ações acessíveis via teclado
- onClick espelhado em onKeyDown Enter/Space

## Boas Práticas

1. **Padronize spacing** com rem para escala responsiva
2. Use **%** para layouts fluidos e gutters
3. Use **em** para efeitos relativos ao componente
4. Aplique **animações com parcimônia** e respeite `prefers-reduced-motion`
5. **Centralize presets** de boxShadow e transform em tokens
6. **Separe propriedades de editor** (lock, name) de propriedades de runtime
7. **Garanta segurança** (CSP, CORS, sem inline script perigoso)

## Integração com Templates

Os templates agora podem usar todas essas propriedades:

```typescript
const template = {
  id: 'template-hero',
  name: 'Hero Moderno',
  type: 'page',
  components: [
    initializeComponent('section', {
      // ... todas as propriedades disponíveis
    })
  ]
};
```

## Próximos Passos

1. ✅ Schemas avançados criados
2. ✅ Editor de propriedades implementado
3. ⏳ Integrar com HierarchicalPageBuilder
4. ⏳ Implementar validação de propriedades
5. ⏳ Adicionar presets de design tokens
6. ⏳ Implementar sistema de estados (hover, focus, etc)
7. ⏳ Adicionar suporte a breakpoints responsivos
8. ⏳ Implementar sistema de ações/eventos

## Conclusão

Implementamos um sistema completo e robusto de schemas de componentes que cobre todas as necessidades de um Page Builder profissional. O sistema é:

- **Completo**: Todas as propriedades CSS e funcionalidades modernas
- **Tipado**: TypeScript para segurança de tipos
- **Flexível**: Suporte a responsividade, estados, animações
- **Acessível**: Propriedades ARIA e foco em a11y
- **Seguro**: Validações e whitelists
- **Extensível**: Fácil adicionar novos componentes e propriedades

Este sistema serve como base sólida para o desenvolvimento contínuo do CMS.
