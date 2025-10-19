# Exemplo Prático: Criando um Sistema de Botões com Design System

## 🎯 Objetivo

Criar um sistema completo de botões (primary, secondary, danger) usando Design System, com tokens, bindings e validação automática.

## Passo 1: Definir Tokens no Design System

### Acesse: Configurações → Design System → Tokens

**Cores de Brand:**
```json
{
  "color": {
    "brand": {
      "primary": {
        "500": { "value": "#2563EB", "$description": "Primary brand color" },
        "600": { "value": "#1D4ED8", "$description": "Primary hover" },
        "700": { "value": "#1E40AF", "$description": "Primary active" }
      },
      "secondary": {
        "500": { "value": "#7C3AED" },
        "600": { "value": "#6D28D9" }
      },
      "danger": {
        "500": { "value": "#EF4444" },
        "600": { "value": "#DC2626" }
      }
    },
    "neutral": {
      "0": { "value": "#FFFFFF" },
      "900": { "value": "#111827" }
    }
  }
}
```

**Espaçamentos:**
```json
{
  "spacing": {
    "button": {
      "xs": { "value": "4px 8px" },
      "sm": { "value": "6px 12px" },
      "md": { "value": "8px 16px" },
      "lg": { "value": "12px 24px" }
    }
  }
}
```

**Raios:**
```json
{
  "radius": {
    "button": {
      "sm": { "value": "4px" },
      "md": { "value": "6px" },
      "lg": { "value": "8px" }
    }
  }
}
```

**Sombras:**
```json
{
  "shadow": {
    "button": {
      "default": { "value": "0 1px 2px 0 rgba(0, 0, 0, 0.05)" },
      "hover": { "value": "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }
    }
  }
}
```

**Tipografia:**
```json
{
  "typography": {
    "button": {
      "fontWeight": { "value": "500" },
      "fontSize": { "value": "14px" },
      "lineHeight": { "value": "20px" }
    }
  }
}
```

### Resultado: CSS Variables Geradas

```css
:root {
  /* Colors */
  --color-brand-primary-500: #2563EB;
  --color-brand-primary-600: #1D4ED8;
  --color-brand-primary-700: #1E40AF;
  --color-brand-secondary-500: #7C3AED;
  --color-brand-secondary-600: #6D28D9;
  --color-brand-danger-500: #EF4444;
  --color-brand-danger-600: #DC2626;
  --color-neutral-0: #FFFFFF;
  --color-neutral-900: #111827;
  
  /* Spacing */
  --spacing-button-xs: 4px 8px;
  --spacing-button-sm: 6px 12px;
  --spacing-button-md: 8px 16px;
  --spacing-button-lg: 12px 24px;
  
  /* Radius */
  --radius-button-sm: 4px;
  --radius-button-md: 6px;
  --radius-button-lg: 8px;
  
  /* Shadow */
  --shadow-button-default: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-button-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  /* Typography */
  --typography-button-fontWeight: 500;
  --typography-button-fontSize: 14px;
  --typography-button-lineHeight: 20px;
}
```

## Passo 2: Criar Componentes do DS

### Acesse: Configurações → Design System → Componentes

**Componente: Button**
```json
{
  "id": "ds.button",
  "name": "Button",
  "category": "Actions",
  "description": "Botão padrão do sistema",
  "version": "1.0.0",
  "variants": [
    {
      "id": "primary",
      "name": "Primary",
      "props": { "variant": "primary", "size": "md" },
      "tokens": {
        "bg": "{color.brand.primary.500}",
        "bgHover": "{color.brand.primary.600}",
        "bgActive": "{color.brand.primary.700}",
        "color": "{color.neutral.0}",
        "padding": "{spacing.button.md}",
        "borderRadius": "{radius.button.md}",
        "boxShadow": "{shadow.button.default}",
        "fontWeight": "{typography.button.fontWeight}",
        "fontSize": "{typography.button.fontSize}"
      }
    },
    {
      "id": "secondary",
      "name": "Secondary",
      "props": { "variant": "secondary", "size": "md" },
      "tokens": {
        "bg": "{color.brand.secondary.500}",
        "bgHover": "{color.brand.secondary.600}",
        "color": "{color.neutral.0}",
        "padding": "{spacing.button.md}",
        "borderRadius": "{radius.button.md}",
        "boxShadow": "{shadow.button.default}"
      }
    },
    {
      "id": "danger",
      "name": "Danger",
      "props": { "variant": "danger", "size": "md" },
      "tokens": {
        "bg": "{color.brand.danger.500}",
        "bgHover": "{color.brand.danger.600}",
        "color": "{color.neutral.0}",
        "padding": "{spacing.button.md}",
        "borderRadius": "{radius.button.md}",
        "boxShadow": "{shadow.button.default}"
      }
    }
  ],
  "props": [
    {
      "name": "variant",
      "type": "enum",
      "options": ["primary", "secondary", "danger", "outline"],
      "default": "primary",
      "required": true
    },
    {
      "name": "size",
      "type": "enum",
      "options": ["xs", "sm", "md", "lg"],
      "default": "md"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": false
    }
  ],
  "states": ["default", "hover", "active", "disabled", "focus"]
}
```

## Passo 3: Criar Binding CMS → DS

### Acesse: Configurações → Design System → Bindings CMS

**Novo Binding: Button**

```json
{
  "cmsComponentType": "button",
  "dsComponentId": "ds.button",
  "enabled": true,
  "version": "1.0.0",
  
  "variantMapping": {
    "primary": "primary",
    "secondary": "secondary",
    "danger": "danger"
  },
  
  "propMapping": {
    "variant": "variant",
    "size": "size",
    "disabled": "disabled"
  },
  
  "tokenBindings": [
    {
      "cmsProp": "backgroundColor",
      "tokenPath": "color.brand.primary.500",
      "cssProperty": "background-color",
      "transform": null
    },
    {
      "cmsProp": "color",
      "tokenPath": "color.neutral.0",
      "cssProperty": "color"
    },
    {
      "cmsProp": "padding",
      "tokenPath": "spacing.button.md",
      "cssProperty": "padding"
    },
    {
      "cmsProp": "borderRadius",
      "tokenPath": "radius.button.md",
      "cssProperty": "border-radius"
    },
    {
      "cmsProp": "boxShadow",
      "tokenPath": "shadow.button.default",
      "cssProperty": "box-shadow"
    },
    {
      "cmsProp": "fontWeight",
      "tokenPath": "typography.button.fontWeight",
      "cssProperty": "font-weight"
    },
    {
      "cmsProp": "fontSize",
      "tokenPath": "typography.button.fontSize",
      "cssProperty": "font-size"
    },
    {
      "cmsProp": "lineHeight",
      "tokenPath": "typography.button.lineHeight",
      "cssProperty": "line-height"
    }
  ]
}
```

## Passo 4: Configurar Auto-Aplicação

### Acesse: Page Builder → Design System → Config

Ative:
- ✅ **Aplicar Tokens Automaticamente**
- ✅ **Validar Automaticamente**
- ❌ Bloquear Estilos Fora do DS (desativado por enquanto)
- ✅ **Migração Automática**

## Passo 5: Usar no Page Builder

### Inserir Botão Primary

```typescript
// 1. Usuário arrasta "Button" para o canvas
// 2. Sistema cria nó:

const newNode = {
  id: "btn-001",
  type: "button",
  props: {
    text: "Salvar",
    variant: "primary",
    size: "md"
  },
  styles: {},
  className: "",
  children: []
};

// 3. Auto-aplicação de tokens:
// pbDSIntegration.applyDSTokensToNode(newNode)

const binding = getBinding("button"); // → ds.button

for (const tokenBinding of binding.tokenBindings) {
  const tokenValue = designSystemService.getToken(
    tokenBinding.tokenPath
  );
  
  newNode.styles[tokenBinding.cssProperty] = tokenValue;
}

// 4. Nó final:
{
  id: "btn-001",
  type: "button",
  props: {
    text: "Salvar",
    variant: "primary",
    size: "md",
    __dsTokensApplied: true,
    __dsVersion: "1.0.0"
  },
  styles: {
    backgroundColor: "#2563EB",      // var(--color-brand-primary-500)
    color: "#FFFFFF",                 // var(--color-neutral-0)
    padding: "8px 16px",              // var(--spacing-button-md)
    borderRadius: "6px",              // var(--radius-button-md)
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "20px"
  },
  className: "",
  children: []
}
```

### HTML Gerado

```html
<button 
  class=""
  style="
    background-color: var(--color-brand-primary-500);
    color: var(--color-neutral-0);
    padding: var(--spacing-button-md);
    border-radius: var(--radius-button-md);
    box-shadow: var(--shadow-button-default);
    font-weight: var(--typography-button-fontWeight);
    font-size: var(--typography-button-fontSize);
    line-height: var(--typography-button-lineHeight);
  "
>
  Salvar
</button>
```

## Passo 6: Criar Variantes

### Botão Secondary

```typescript
// Usuário muda prop "variant" para "secondary"
{
  props: {
    variant: "secondary"  // mudança
  }
}

// Sistema re-aplica tokens para variante "secondary"
// Binding usa tokens diferentes baseado na variante

backgroundColor: "#7C3AED",  // color.brand.secondary.500
// ... outros tokens
```

### Botão Danger

```typescript
{
  props: {
    variant: "danger"
  },
  styles: {
    backgroundColor: "#EF4444",  // color.brand.danger.500
    // ...
  }
}
```

## Passo 7: Validação

### Validar Página

```typescript
// Usuário abre DS Panel → Validar

pbDSIntegration.validateTree(nodes)

// Sistema verifica:
// 1. Binding existe? ✅
// 2. Tokens existem? ✅
// 3. Versão atualizada? ✅
// 4. Contraste adequado?
//    - Foreground: #FFFFFF
//    - Background: #2563EB
//    - Ratio: 8.2:1 ✅ (> 4.5:1)

ValidationResult {
  valid: true,
  errors: [],
  warnings: [],
  suggestions: [
    "Este componente possui 4 variantes disponíveis: Primary, Secondary, Danger, Outline"
  ]
}
```

### Display no Painel

```
┌─────────────────────────────────────────┐
│ ✅ Validação Bem-Sucedida               │
│ Todos os componentes estão em           │
│ conformidade                             │
└─────────────────────────────────────────┘

Sugestões:
┌─────────────────────────────────────────┐
│ Este componente possui 4 variantes      │
│ disponíveis: Primary, Secondary,        │
│ Danger, Outline                         │
└─────────────────────────────────────────┘
```

## Passo 8: Atualização do Design System

### Designer atualiza cor primary

```json
// Antes
{
  "color": {
    "brand": {
      "primary": {
        "500": { "value": "#2563EB" }
      }
    }
  }
}

// Depois
{
  "color": {
    "brand": {
      "primary": {
        "500": { "value": "#3B82F6" }  // novo azul
      }
    }
  }
}
```

### Sincronização Automática

```
1. Designer commit no GitHub
      ↓
2. Webhook dispara sync
      ↓
3. DesignSystemSyncService.sync()
      ↓
4. Diff calculado:
   - modified: ["color.brand.primary.500"]
   - impact: "medium"
      ↓
5. Nova versão: 1.1.0
      ↓
6. CSS variables atualizadas:
   --color-brand-primary-500: #3B82F6
      ↓
7. Todos os botões primary atualizam
   automaticamente! 🎉
```

### Validação Após Update

```
Página valida novamente:
⚠️ 1 Aviso

┌─────────────────────────────────────────┐
│ ⚠️ button                                │
│ Design System desatualizado              │
│ (1.0.0 → 1.1.0)                          │
│ 💡 Atualizar para versão mais recente   │
│ [Corrigir Automaticamente]              │
└─────────────────────────────────────────┘
```

### Correção Automática

```typescript
// Usuário clica "Corrigir Automaticamente"

pbDSIntegration.autoFixWarning(warning, node)
  ↓
pbDSIntegration.applyDSTokensToNode(node)
  ↓
node.props.__dsVersion = "1.1.0"
node.styles.backgroundColor = "#3B82F6"  // novo valor!
  ↓
✅ Atualizado!
```

## Resultado Final

### Código Gerado

**CSS Global:**
```css
:root {
  --color-brand-primary-500: #3B82F6;
  --color-brand-primary-600: #1D4ED8;
  --color-neutral-0: #FFFFFF;
  --spacing-button-md: 8px 16px;
  --radius-button-md: 6px;
  --shadow-button-default: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --typography-button-fontWeight: 500;
  --typography-button-fontSize: 14px;
}
```

**HTML da Página:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* CSS Variables injected */
  </style>
</head>
<body>
  <!-- Primary Button -->
  <button class="btn-primary" style="
    background-color: var(--color-brand-primary-500);
    color: var(--color-neutral-0);
    padding: var(--spacing-button-md);
    border-radius: var(--radius-button-md);
    box-shadow: var(--shadow-button-default);
  ">
    Salvar
  </button>
  
  <!-- Secondary Button -->
  <button class="btn-secondary" style="
    background-color: var(--color-brand-secondary-500);
    color: var(--color-neutral-0);
    /* ... */
  ">
    Cancelar
  </button>
  
  <!-- Danger Button -->
  <button class="btn-danger" style="
    background-color: var(--color-brand-danger-500);
    color: var(--color-neutral-0);
    /* ... */
  ">
    Excluir
  </button>
</body>
</html>
```

## Métricas do Exemplo

```
┌────────────────────────────────────────┐
│ Design System                          │
├────────────────────────────────────────┤
│ Versão: 1.1.0                          │
│ Tokens: 15                             │
│ Componentes: 1 (ds.button)             │
│ Variantes: 4                           │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Bindings                               │
├────────────────────────────────────────┤
│ Total: 1                               │
│ Ativos: 1                              │
│ Token Bindings: 8                      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Validação                              │
├────────────────────────────────────────┤
│ Status: ✅ Válido                      │
│ Erros: 0                               │
│ Avisos: 0                              │
│ Contraste: 8.2:1 ✅                    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Performance                            │
├────────────────────────────────────────┤
│ Tempo aplicação: 12ms                  │
│ Tempo validação: 8ms                   │
│ CSS vars geradas: 15                   │
└────────────────────────────────────────┘
```

## Próximos Passos

1. **Expandir Sistema:**
   - Adicionar mais variantes (outline, ghost)
   - Criar tokens para estados (hover, active, focus, disabled)
   - Implementar tamanhos (xs, sm, md, lg)

2. **Criar Mais Componentes:**
   - Input fields
   - Cards
   - Headers
   - Footers

3. **Configurar Sincronização:**
   - Conectar com Figma
   - Configurar webhook
   - Testar pipeline completo

4. **Validação Avançada:**
   - Configurar regras de acessibilidade
   - Adicionar testes de regressão visual
   - Implementar canary deploys

---

**Exemplo Completo:** Sistema de Botões  
**Tempo de Implementação:** ~30 minutos  
**Resultado:** Sistema de botões totalmente integrado com Design System, validado e pronto para produção! 🚀
