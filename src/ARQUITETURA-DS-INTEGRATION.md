# Arquitetura: Design System Integration

## 📐 Diagrama Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FONTES EXTERNAS                                   │
│                                                                           │
│  ┌─────────┐         ┌─────────┐         ┌─────────┐                    │
│  │  Figma  │         │ GitHub  │         │   URL   │                    │
│  │  API    │         │   API   │         │ Custom  │                    │
│  └────┬────┘         └────┬────┘         └────┬────┘                    │
└───────┼──────────────────┼──────────────────┼──────────────────────────┘
        │                   │                   │
        │   Webhooks/Poll   │    Webhooks       │   HTTP Fetch
        ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  DESIGN SYSTEM SYNC SERVICE                              │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  syncFromFigma()                                             │        │
│  │    ↓ Extract styles & tokens                                │        │
│  │    ↓ figmaColorToHex()                                       │        │
│  │    ↓ traverseFigmaNodes()                                    │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  syncFromGitHub()                                            │        │
│  │    ↓ Fetch file from repo                                   │        │
│  │    ↓ Decode base64                                           │        │
│  │    ↓ Parse JSON                                              │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  calculateDiff()                                             │        │
│  │    ↓ Compare old vs new tokens                              │        │
│  │    ↓ Detect: added, modified, removed                       │        │
│  │    ↓ Generate migrations                                    │        │
│  │    ↓ Calculate impact level                                 │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  createNewVersion()                                          │        │
│  │    ↓ Semantic versioning                                    │        │
│  │    ↓ Generate changelog                                     │        │
│  │    ↓ Mark breaking changes                                  │        │
│  └─────────────────────────────────────────────────────────────┘        │
└───────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 │ Save version
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DESIGN SYSTEM SERVICE                                 │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Tokens     │  │ Components   │  │   Versions   │                  │
│  │              │  │              │  │              │                  │
│  │ • color      │  │ • ds.button  │  │ • v1.0.0     │                  │
│  │ • spacing    │  │ • ds.card    │  │ • v1.1.0     │                  │
│  │ • typography │  │ • ds.input   │  │ • v2.0.0     │                  │
│  │ • radius     │  │ • ...        │  │ • ...        │                  │
│  │ • shadow     │  │              │  │              │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                  │                  │                          │
│         ├──────────────────┴──────────────────┤                          │
│         │                                      │                          │
│  ┌──────▼──────────────────────────────────────▼──────┐                 │
│  │  flattenTokens()                                    │                 │
│  │    color.brand.primary.500 → #2B6CB0               │                 │
│  │    spacing.sm → 8px                                │                 │
│  └──────┬──────────────────────────────────────────────┘                │
│         │                                                                 │
│  ┌──────▼──────────────────────────────────────────────┐                │
│  │  applyCSSVariables()                                │                │
│  │    --color-brand-primary-500: #2B6CB0               │                │
│  │    --spacing-sm: 8px                                │                │
│  └──────┬──────────────────────────────────────────────┘                │
│         │                                                                 │
│         │ Inject to :root                                                │
│         ▼                                                                 │
│  ┌─────────────────────────────────────────────────────┐                │
│  │  document.documentElement.style.setProperty()       │                │
│  └─────────────────────────────────────────────────────┘                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 │ Used by
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              PAGE BUILDER DS INTEGRATION SERVICE                         │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  DSComponentBinding                                           │       │
│  │  ┌────────────────────────────────────────────────────────┐  │       │
│  │  │ cmsComponentType: "button"                             │  │       │
│  │  │ dsComponentId: "ds.button"                             │  │       │
│  │  │ tokenBindings: [                                       │  │       │
│  │  │   {                                                    │  │       │
│  │  │     cmsProp: "backgroundColor"                         │  │       │
│  │  │     tokenPath: "color.brand.primary.500"               │  │       │
│  │  │     cssProperty: "background-color"                    │  │       │
│  │  │   }                                                    │  │       │
│  │  │ ]                                                      │  │       │
│  │  └────────────────────────────────────────────────────────┘  │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  applyDSTokensToNode(node)                                   │       │
│  │    1. Get binding for node.type                             │       │
│  │    2. For each tokenBinding:                                │       │
│  │       • Get token value from DS                             │       │
│  │       • Apply to node.styles[cssProperty]                   │       │
│  │    3. Mark node as __dsTokensApplied: true                  │       │
│  │    4. Store __dsVersion                                     │       │
│  │    5. Return updated node                                   │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  validateNode(node)                                          │       │
│  │    1. Check if binding exists                               │       │
│  │    2. Validate DS component exists                          │       │
│  │    3. Validate required props                               │       │
│  │    4. Validate token references                             │       │
│  │    5. Check DS version                                      │       │
│  │    6. Validate WCAG contrast                                │       │
│  │    7. Return ValidationResult                               │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  executeSyncPipeline()                                       │       │
│  │    Stage 1: Sync tokens                                     │       │
│  │    Stage 2: Apply themes (CSS vars)                         │       │
│  │    Stage 3: Update components                               │       │
│  │    Stage 4: Validate layouts                                │       │
│  │    Stage 5: Update content                                  │       │
│  └──────────────────────────────────────────────────────────────┘       │
└───────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 │ Used by
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       PAGE BUILDER (UI)                                  │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────┐          │
│  │  HierarchicalPageBuilder                                  │          │
│  │                                                            │          │
│  │  createComponent(type, definition)                        │          │
│  │    ↓ Create HierarchicalNode                             │          │
│  │    ↓ if (config.autoApplyTokens)                         │          │
│  │    ↓    node = pbDSIntegration.applyDSTokensToNode(node) │          │
│  │    ↓ return node                                          │          │
│  └───────────────────────────────────────────────────────────┘          │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────┐          │
│  │  DS Integration Panel (sidebar)                           │          │
│  │                                                            │          │
│  │  Tabs:                                                    │          │
│  │  • 🛡️  Validar    → ValidationResult display             │          │
│  │  • 👁️  Info       → Current DS info, bindings            │          │
│  │  • ⚡ Ações      → Apply tokens, validate                │          │
│  │  • ⚙️  Config     → Auto-apply, validate, block           │          │
│  └───────────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados Completo

### 1. Importação de Tokens

```
Figma/GitHub/URL
      │
      │ 1. Webhook/Poll trigger
      ▼
DesignSystemSyncService.sync()
      │
      │ 2. Fetch tokens
      ▼
syncFromFigma/GitHub/URL()
      │
      │ 3. Normalize to W3C format
      ▼
{
  "color": {
    "brand": {
      "primary": {
        "500": { "value": "#2B6CB0" }
      }
    }
  }
}
      │
      │ 4. Calculate diff
      ▼
calculateDiff()
      │
      ├─ added: ["color.brand.accent"]
      ├─ modified: ["color.brand.primary.500"]
      ├─ removed: ["color.old"]
      └─ migrations: [...]
      │
      │ 5. Create new version
      ▼
createNewVersion()
      │
      ├─ version: "1.2.0"
      ├─ changelog: [...]
      └─ breaking: false
      │
      │ 6. Save
      ▼
DesignSystemService.saveVersion()
      │
      │ 7. Apply CSS variables
      ▼
applyCSSVariables()
      │
      │ 8. Inject to DOM
      ▼
document.documentElement.style.setProperty(
  "--color-brand-primary-500",
  "#2B6CB0"
)
```

### 2. Aplicação de Tokens a Componentes

```
Page Builder: User inserts Button
      │
      │ 1. Create component
      ▼
createComponent("button", definition)
      │
      │ 2. Check config
      ▼
if (config.autoApplyTokens) {
      │
      │ 3. Get binding
      ▼
  binding = pbDSIntegration.getBinding("button")
      │
      │ 4. Found: ds.button with 4 tokenBindings
      ▼
  for each tokenBinding {
    │
    │ 5. Get token value
    ▼
    tokenValue = designSystemService.getToken(
      "color.brand.primary.500"
    )
    │  → "#2B6CB0"
    │
    │ 6. Apply to styles
    ▼
    node.styles["background-color"] = "#2B6CB0"
  }
      │
      │ 7. Mark as applied
      ▼
  node.props.__dsTokensApplied = true
  node.props.__dsVersion = "1.2.0"
      │
      │ 8. Return
      ▼
  return node
}
      │
      │ 9. Render
      ▼
<button style={{
  backgroundColor: "var(--color-brand-primary-500)",
  color: "var(--color-neutral-0)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--spacing-sm)"
}}>
  Click me
</button>
```

### 3. Validação

```
User opens DS Panel → Validate tab
      │
      │ 1. Trigger validation
      ▼
pbDSIntegration.validateTree(nodes)
      │
      │ 2. For each node
      ▼
validateNode(node)
      │
      ├─ Check: binding exists? ✅
      │
      ├─ Check: binding active? ✅
      │
      ├─ Check: DS component exists? ✅
      │
      ├─ Check: required props? ✅
      │
      ├─ Check: token refs valid? ✅
      │
      ├─ Check: DS version current?
      │    ▼ node.__dsVersion = "1.1.0"
      │    ▼ current DS = "1.2.0"
      │    ▼ ⚠️ WARNING: outdated
      │
      ├─ Check: WCAG contrast?
      │    ▼ fg = "#2B6CB0"
      │    ▼ bg = "#FFFFFF"
      │    ▼ ratio = 4.52:1
      │    ▼ ✅ PASS (≥4.5:1)
      │
      │ 3. Aggregate results
      ▼
ValidationResult {
  valid: false,
  errors: [],
  warnings: [
    {
      nodeId: "abc-123",
      componentType: "button",
      message: "Design System desatualizado",
      autoFixable: true,
      suggestion: "Atualizar para versão 1.2.0"
    }
  ],
  suggestions: [...]
}
      │
      │ 4. Display in UI
      ▼
DSIntegrationPanel renders:
  ⚠️ 0 Erros, 1 Aviso
  
  [Warning Card]
  button
  Design System desatualizado (1.1.0 → 1.2.0)
  💡 Atualizar para versão mais recente
  [Corrigir Automaticamente]
```

## 🏗️ Estrutura de Dados

### Design System Version

```typescript
{
  version: "1.2.0",
  timestamp: 1729353600000,
  tokens: {
    $schema: "https://design-tokens.org",
    color: { ... },
    spacing: { ... },
    typography: { ... }
  },
  components: [
    {
      id: "ds.button",
      name: "Button",
      category: "Actions",
      description: "Botão do Design System",
      version: "1.0.0",
      variants: [
        {
          id: "primary",
          name: "Primary",
          props: { variant: "primary" },
          tokens: {
            bg: "{color.brand.primary.500}",
            color: "{color.neutral.0}"
          }
        }
      ],
      props: [
        {
          name: "variant",
          type: "enum",
          options: ["primary", "secondary"],
          default: "primary"
        }
      ]
    }
  ],
  changelog: [ ... ],
  breaking: false
}
```

### DS Component Binding

```typescript
{
  cmsComponentType: "button",
  dsComponentId: "ds.button",
  variantMapping: {
    "primary": "primary",
    "secondary": "secondary"
  },
  propMapping: {
    "variant": "variant",
    "size": "size"
  },
  tokenBindings: [
    {
      cmsProp: "backgroundColor",
      tokenPath: "color.brand.primary.500",
      cssProperty: "background-color",
      transform: null
    },
    {
      cmsProp: "color",
      tokenPath: "color.neutral.0",
      cssProperty: "color",
      transform: null
    }
  ],
  enabled: true,
  version: "1.0.0"
}
```

### Hierarchical Node (with DS)

```typescript
{
  id: "abc-123",
  type: "button",
  props: {
    text: "Click me",
    variant: "primary",
    __dsTokensApplied: true,
    __dsVersion: "1.2.0"
  },
  styles: {
    backgroundColor: "#2B6CB0",  // from token
    color: "#FFFFFF",             // from token
    borderRadius: "4px",          // from token
    padding: "8px"                // from token
  },
  className: "",
  children: []
}
```

## 🎯 Responsabilidades por Camada

### Layer 1: External Sources
**Responsabilidade:** Fornecer tokens e estilos

- Figma API
- GitHub API
- Custom URLs

**Output:** Raw design data

---

### Layer 2: Design System Sync Service
**Responsabilidade:** Normalizar e sincronizar tokens

**Funções:**
- `syncFromFigma()` - Extrai tokens do Figma
- `syncFromGitHub()` - Busca do repositório
- `calculateDiff()` - Detecta mudanças
- `createNewVersion()` - Versiona mudanças

**Output:** `DesignSystemVersion`

---

### Layer 3: Design System Service
**Responsabilidade:** Gerenciar tokens e componentes

**Funções:**
- `getCurrentDesignSystem()` - Retorna DS atual
- `flattenTokens()` - Normaliza estrutura
- `applyCSSVariables()` - Injeta no DOM
- `resolveTokenReference()` - Resolve refs
- `validateContrast()` - Valida acessibilidade

**Output:** Tokens aplicados, componentes registrados

---

### Layer 4: Page Builder DS Integration
**Responsabilidade:** Conectar CMS ↔ DS

**Funções:**
- `getBinding()` - Busca binding para tipo
- `applyDSTokensToNode()` - Aplica tokens a nó
- `applyDSTokensToTree()` - Aplica a árvore
- `validateNode()` - Valida nó
- `validateTree()` - Valida árvore
- `autoFixWarning()` - Corrige problemas

**Output:** Nós com tokens, validação completa

---

### Layer 5: Page Builder UI
**Responsabilidade:** Interface do usuário

**Componentes:**
- `HierarchicalPageBuilder` - Editor principal
- `DSIntegrationPanel` - Painel lateral
- `DSComponentBindingPanel` - Gerenciador de bindings

**Output:** Interface interativa

## 📊 Fluxo de Estado

```
┌────────────────────────────────────────┐
│         User Action                    │
│  (Insert component / Change token)     │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│       State Update                     │
│  setNodes([...updatedNodes])           │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│     History Management                 │
│  addToHistory(newNodes)                │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│   Validation (if enabled)              │
│  pbDSIntegration.validateTree()        │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│      Render Update                     │
│  React re-renders components           │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│      DOM Update                        │
│  CSS vars applied, styles rendered     │
└────────────────────────────────────────┘
```

## 🔐 Segurança e Validação

### Níveis de Validação

```
Level 1: Schema Validation
  ↓ W3C Design Tokens format
  ↓ Type checking
  ↓ Required fields

Level 2: Reference Validation
  ↓ Token refs exist
  ↓ Component IDs valid
  ↓ Circular refs check

Level 3: Semantic Validation
  ↓ WCAG contrast
  ↓ Required props
  ↓ Breaking changes

Level 4: Runtime Validation
  ↓ CSS vars applied
  ↓ Styles computed
  ↓ Accessibility checks
```

### Auditoria

```
Event: ds_binding_updated
  ↓ Timestamp
  ↓ User ID
  ↓ Component type
  ↓ DS component

Event: ds_tokens_applied
  ↓ Timestamp
  ↓ Node count
  ↓ DS version

Event: ds_sync_completed
  ↓ Timestamp
  ↓ Source
  ↓ Changes count
  ↓ New version
```

---

**Documentação:** Arquitetura Técnica  
**Versão:** 1.0  
**Autor:** Sistema CMS  
**Data:** Outubro 2025
