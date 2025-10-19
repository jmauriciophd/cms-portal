# 🚀 Guia Rápido: Design System Integration

## ⏱️ Setup em 5 Minutos

### Passo 1: Criar Design System (2 min)

1. Acesse **Configurações do Sistema** → **Design System**
2. Clique em **"Criar Design System Padrão"**
3. ✅ Sistema criado com tokens básicos!

**Tokens inclusos:**
- 🎨 Cores: Brand (primary, secondary), Neutral, Semantic
- 📏 Espaçamentos: xs, sm, md, lg, xl, 2xl, 3xl
- 🔘 Raios: none, sm, md, lg, xl, full
- ✨ Sombras: sm, md, lg, xl
- 📝 Tipografia: Família, tamanhos, pesos

---

### Passo 2: Criar Primeiro Binding (2 min)

1. Vá em **Design System** → aba **"Bindings CMS"**
2. Clique **"Novo Binding"**
3. Configure:

```
┌─────────────────────────────────────┐
│ Componente CMS: button              │
│ Componente DS:  ds.button           │
│ Status: ✅ Ativo                    │
└─────────────────────────────────────┘

Token Bindings:
┌──────────────┬─────────────────────────┬──────────────────┐
│ Prop CMS     │ Token Path              │ CSS Property     │
├──────────────┼─────────────────────────┼──────────────────┤
│ background   │ color.brand.primary.500 │ background-color │
│ color        │ color.neutral.0         │ color            │
│ borderRadius │ radius.sm               │ border-radius    │
│ padding      │ spacing.sm              │ padding          │
└──────────────┴─────────────────────────┴──────────────────┘
```

4. Clique **"Salvar"**
5. ✅ Binding criado!

---

### Passo 3: Ativar no Page Builder (1 min)

1. Abra **Páginas** → **Page Builder**
2. Clique no botão **🎨 Design System** na toolbar
3. Vá em **Config** (⚙️)
4. Ative:
   - ✅ **Aplicar Tokens Automaticamente**
   - ✅ **Validar Automaticamente**
5. Feche o painel
6. ✅ Pronto para usar!

---

## 🎯 Uso Diário

### Inserir Componente com Tokens

```
1. No Page Builder, arraste um "Button"
2. Tokens aplicados automaticamente! 🎉
3. Componente criado com:
   • background: var(--color-brand-primary-500)
   • color: var(--color-neutral-0)
   • border-radius: var(--radius-sm)
   • padding: var(--spacing-sm)
```

### Validar Página

```
1. Clique 🎨 Design System
2. Aba "Validar" (🛡️)
3. Veja status:
   ✅ Validação Bem-Sucedida
   ou
   ⚠️ X Erros, Y Avisos
4. Clique "Corrigir Automaticamente" nos avisos
```

### Aplicar Tokens Manualmente

```
Opção A - Todos os componentes:
1. 🎨 Design System → Ações
2. "Aplicar a Todos"
3. ✅ Feito!

Opção B - Componente específico:
1. Selecione o componente
2. 🎨 Design System → Ações
3. "Aplicar ao Selecionado"
4. ✅ Feito!
```

---

## 🎨 Criar Tokens Personalizados

### No Design System Manager

```
1. Design System → Tokens
2. Expanda categoria (ex: "color")
3. Clique "Adicionar Token"
4. Configure:
   • Nome: accent
   • Valor: #FF6B6B
   • Tipo: color
5. Salvar
6. ✅ Novo token criado!

Uso: color.accent
CSS var: --color-accent
```

### Usar em Binding

```
1. Bindings CMS → Editar binding
2. Token Bindings → Adicionar
3. Configure:
   • Prop CMS: accentColor
   • Token Path: color.accent
   • CSS Property: border-color
4. Salvar
5. ✅ Pronto!
```

---

## 🔄 Sincronizar com Figma

### Setup Único (5 min)

```
1. Design System → Sincronização
2. "Adicionar Fonte"
3. Selecione: Figma
4. Configure:
   • File Key: [seu-file-key]
   • Access Token: [seu-token]
   • Auto-sync: ✅ Sim
   • Intervalo: 60 minutos
5. Salvar
6. "Sincronizar Agora"
7. ✅ Tokens importados!
```

### Obter Figma File Key

```
URL do Figma:
https://www.figma.com/file/ABC123XYZ/Design-System

File Key = ABC123XYZ
```

### Obter Access Token

```
1. Figma → Settings
2. Personal Access Tokens
3. Generate New Token
4. Copiar token
```

---

## ✅ Checklist Pré-Publicação

Antes de publicar uma página:

```
☐ Abrir 🎨 Design System
☐ Ir em "Validar"
☐ Verificar:
  ☐ Sem erros críticos
  ☐ Contraste OK (≥4.5:1)
  ☐ Tokens aplicados
  ☐ Versão DS atualizada
☐ Corrigir avisos (se possível)
☐ ✅ Publicar!
```

---

## 🎯 Dicas Rápidas

### 💡 Velocidade

**Use atalhos:**
- `Ctrl/Cmd + Z`: Desfazer
- `Ctrl/Cmd + Y`: Refazer
- `Delete`: Remover selecionado

**Ative validação automática:**
- Feedback instantâneo
- Menos erros na publicação

### 💡 Consistência

**Bloqueie estilos fora do DS:**
```
🎨 Design System → Config
✅ Bloquear Estilos Fora do DS
```

**Resultado:**
- ✅ Apenas componentes com binding
- ✅ Apenas tokens do DS
- ✅ Visual 100% consistente

### 💡 Manutenção

**Exporte configuração regularmente:**
```
1. Design System → Sincronização
2. "Exportar Configuração"
3. Salvar JSON
4. ✅ Backup pronto!
```

**Versione seu DS:**
```
Mudança pequena → patch (1.0.1)
Nova feature → minor (1.1.0)
Breaking change → major (2.0.0)
```

---

## 🚨 Troubleshooting Rápido

### Problema: Tokens não aplicam

```
✓ Verificar: DS carregado?
  → Design System → Info
  
✓ Verificar: Binding existe?
  → Bindings CMS → Ver lista
  
✓ Verificar: Binding ativo?
  → Status = ✅ Ativo
  
✓ Tentar: Aplicar manualmente
  → Ações → "Aplicar a Todos"
```

### Problema: Validação falha

```
✓ Ver detalhes:
  → Validar → Lista de erros
  
✓ Token não existe?
  → Tokens → Criar token
  
✓ Componente DS não existe?
  → Componentes → Verificar ID
  
✓ Versão desatualizada?
  → Ações → "Aplicar ao Selecionado"
```

### Problema: Sincronização falha

```
✓ Verificar credenciais:
  → Access token válido?
  
✓ Verificar formato:
  → JSON = W3C Design Tokens?
  
✓ Ver logs:
  → Sincronização → Histórico
  
✓ Testar manualmente:
  → "Sincronizar Agora"
```

---

## 📊 Métricas Importantes

### Cobertura de Componentes

```
Total de componentes: 20
Com binding: 15
Cobertura: 75% ✅

Meta: >80%
```

### Conformidade

```
Páginas validadas: 45
Sem erros: 42
Taxa de sucesso: 93% ✅

Meta: >95%
```

### Contraste

```
Combinações testadas: 156
WCAG AA: 152
Taxa de aprovação: 97% ✅

Meta: 100%
```

---

## 🎓 Exemplos Práticos

### Exemplo 1: Botão Primário

**Binding:**
```json
{
  "cmsComponentType": "button",
  "tokenBindings": [
    {
      "cmsProp": "backgroundColor",
      "tokenPath": "color.brand.primary.500",
      "cssProperty": "background-color"
    }
  ]
}
```

**Resultado:**
```html
<button style="background-color: var(--color-brand-primary-500)">
  Click me
</button>
```

**CSS Gerado:**
```css
:root {
  --color-brand-primary-500: #2B6CB0;
}
```

### Exemplo 2: Card com Sombra

**Binding:**
```json
{
  "cmsComponentType": "card",
  "tokenBindings": [
    {
      "cmsProp": "boxShadow",
      "tokenPath": "shadow.md",
      "cssProperty": "box-shadow"
    },
    {
      "cmsProp": "borderRadius",
      "tokenPath": "radius.md",
      "cssProperty": "border-radius"
    }
  ]
}
```

**Resultado:**
```css
.card {
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-md);
}
```

### Exemplo 3: Container com Espaçamento

**Binding:**
```json
{
  "cmsComponentType": "container",
  "tokenBindings": [
    {
      "cmsProp": "padding",
      "tokenPath": "spacing.lg",
      "cssProperty": "padding"
    },
    {
      "cmsProp": "gap",
      "tokenPath": "spacing.md",
      "cssProperty": "gap"
    }
  ]
}
```

**Resultado:**
```css
.container {
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
}
```

---

## 🎯 Próximos Passos

### Semana 1
- [ ] Configurar Design System
- [ ] Criar 5 bindings principais
- [ ] Testar em página de exemplo

### Semana 2
- [ ] Configurar sincronização Figma/GitHub
- [ ] Criar bindings restantes
- [ ] Aplicar a páginas existentes

### Semana 3
- [ ] Ativar bloqueio de estilos
- [ ] Documentar padrões
- [ ] Treinar equipe

### Semana 4
- [ ] Auditar todas as páginas
- [ ] Corrigir problemas de contraste
- [ ] Publicar versão 1.0

---

## 📚 Recursos

### Links Úteis
- [Documentação Completa](./INTEGRACAO-DESIGN-SYSTEM-PAGE-BUILDER.md)
- [Resumo Técnico](./RESUMO-INTEGRACAO-DS-PB.md)
- [W3C Design Tokens](https://design-tokens.github.io/community-group/format/)

### Suporte
- 💬 Chat interno
- 📧 Email: suporte@exemplo.com
- 📖 Wiki do projeto

---

**Versão:** 1.0  
**Atualizado:** Outubro 2025  
**Tempo estimado de leitura:** 5 minutos
