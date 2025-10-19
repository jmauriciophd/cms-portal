# Integração Design System ↔ Page Builder

## 📋 Visão Geral

O sistema agora possui integração completa entre o **Design System** e o **Page Builder**, permitindo que os tokens, componentes e regras de layout do Design System sejam aplicados automaticamente às páginas criadas no editor visual.

## 🎯 Arquitetura da Integração

```
┌─────────────────────────────────────────────────────────────────┐
│                        DESIGN SYSTEM                             │
│  Tokens │ Componentes │ Temas │ Regras de Layout │ Versões      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Sincronização
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              CAMADA DE INTEGRAÇÃO (Novo!)                        │
│                                                                   │
│  • Bindings CMS ↔ DS                                            │
│  • Token Bindings (prop → token path)                           │
│  • Validação Automática                                         │
│  • Aplicação de Tokens                                          │
│  • Migração de Versões                                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PAGE BUILDER                               │
│  Componentes CMS │ Árvore Hierárquica │ Editor Visual           │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Como Usar

### 1. Configurar o Design System

**Acesse:** Configurações do Sistema → Design System → Tokens

1. Crie ou importe um Design System
2. Defina seus tokens (cores, espaçamentos, tipografia, etc.)
3. Os tokens serão automaticamente convertidos em CSS Variables

### 2. Criar Bindings de Componentes

**Acesse:** Configurações do Sistema → Design System → Bindings CMS

1. Clique em **"Novo Binding"**
2. Selecione:
   - **Componente CMS**: Tipo de componente do Page Builder (ex: `button`)
   - **Componente DS**: Componente correspondente no Design System (ex: `ds.button`)

3. Configure **Token Bindings**:
   - **Propriedade CMS**: Propriedade do componente (ex: `backgroundColor`)
   - **Token Path**: Caminho do token (ex: `color.brand.primary.500`)
   - **Propriedade CSS**: Propriedade CSS final (ex: `background-color`)

4. Salve o binding

#### Exemplo de Binding

```json
{
  "cmsComponentType": "button",
  "dsComponentId": "ds.button",
  "tokenBindings": [
    {
      "cmsProp": "backgroundColor",
      "tokenPath": "color.brand.primary.500",
      "cssProperty": "background-color"
    },
    {
      "cmsProp": "color",
      "tokenPath": "color.neutral.0",
      "cssProperty": "color"
    },
    {
      "cmsProp": "borderRadius",
      "tokenPath": "radius.sm",
      "cssProperty": "border-radius"
    },
    {
      "cmsProp": "padding",
      "tokenPath": "spacing.sm",
      "cssProperty": "padding"
    }
  ],
  "enabled": true
}
```

### 3. Usar no Page Builder

**Acesse:** Páginas → Page Builder

1. Clique no botão **"Design System"** na toolbar (ícone de paleta 🎨)
2. Isso abrirá o **Painel de Integração DS** na lateral direita

#### Painel de Integração

O painel possui 4 abas:

**🛡️ Validar**
- Exibe status de validação da página
- Lista erros e avisos
- Oferece correções automáticas
- Valida contraste de cores (WCAG AA)

**👁️ Info**
- Mostra informações do Design System atual
- Lista bindings ativos
- Exibe versão e changelog

**⚡ Ações**
- **Aplicar a Todos**: Aplica tokens do DS a todos os componentes
- **Aplicar ao Selecionado**: Aplica tokens apenas ao componente selecionado
- **Validar Página**: Executa validação completa
- **Copiar CSS**: Copia CSS variables gerado

**⚙️ Config**
- **Aplicar Tokens Automaticamente**: Aplica tokens ao inserir novos componentes
- **Validar Automaticamente**: Valida ao modificar componentes
- **Bloquear Estilos Fora do DS**: Impede uso de estilos não mapeados
- **Migração Automática**: Atualiza componentes ao mudar versão do DS

### 4. Aplicar Tokens

Há 3 formas de aplicar tokens do Design System:

**A) Automático ao Inserir**
- Ative "Aplicar Tokens Automaticamente" nas configurações
- Todo novo componente inserido terá tokens aplicados

**B) Manual - Todos os Componentes**
- Abra o Painel DS
- Vá em "Ações"
- Clique em "Aplicar a Todos"

**C) Manual - Componente Específico**
- Selecione o componente no canvas
- Abra o Painel DS
- Vá em "Ações"
- Clique em "Aplicar ao Selecionado"

## 🔄 Pipeline de Sincronização

Quando você sincroniza o Design System (Figma, GitHub, etc.):

```
1. TOKENS
   ↓ Importa e normaliza tokens
   
2. TEMAS
   ↓ Aplica CSS variables
   
3. COMPONENTES
   ↓ Atualiza definições e verifica migrações
   
4. LAYOUTS
   ↓ Valida regras de layout
   
5. CONTEÚDO
   ↓ Atualiza páginas existentes (se auto-migração ativa)
```

### Sincronização com Fontes Externas

**Figma:**
1. Configure webhook ou polling
2. Tokens são extraídos automaticamente
3. Criada nova versão semântica
4. Bindings são atualizados

**GitHub:**
1. Configure repositório e branch
2. Tokens em formato W3C Design Tokens
3. Release webhook dispara sincronização

**URL Personalizada:**
1. Endpoint retorna JSON com tokens
2. Polling periódico (configurável)

## 🎨 Tokens Suportados

### Cores
```json
{
  "color": {
    "brand": {
      "primary": { "500": { "value": "#2B6CB0" } }
    },
    "neutral": { "0": { "value": "#FFFFFF" } },
    "semantic": {
      "success": { "value": "#38A169" }
    }
  }
}
```

### Tipografia
```json
{
  "typography": {
    "fontFamily": {
      "body": { "value": "Inter, sans-serif" }
    },
    "fontSize": {
      "base": { "value": "16px" }
    }
  }
}
```

### Espaçamento
```json
{
  "spacing": {
    "sm": { "value": "8px" },
    "md": { "value": "16px" }
  }
}
```

### Raios
```json
{
  "radius": {
    "sm": { "value": "4px" },
    "md": { "value": "8px" }
  }
}
```

### Sombras
```json
{
  "shadow": {
    "sm": { "value": "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }
  }
}
```

## ✅ Validação

### O que é validado:

**Componentes:**
- ✅ Binding existe e está ativo
- ✅ Componente do DS existe
- ✅ Propriedades obrigatórias definidas
- ✅ Tokens referenciados existem
- ✅ Versão do DS atualizada

**Acessibilidade:**
- ✅ Contraste de cores (WCAG AA: mínimo 4.5:1)
- ✅ Tamanhos de fonte adequados
- ✅ Áreas clicáveis suficientes

**Estrutura:**
- ✅ Hierarquia de componentes válida
- ✅ Props obrigatórias presentes

### Correções Automáticas

O sistema oferece correções automáticas para:
- Aplicar tokens não aplicados
- Atualizar versão desatualizada do DS
- Ajustar variantes depreciadas

## 🔐 Governança e Segurança

### Bloqueio de Estilos

Ative "Bloquear Estilos Fora do DS" para:
- ✅ Garantir consistência visual
- ✅ Evitar estilos ad-hoc
- ✅ Forçar uso de tokens aprovados

### Auditoria

Todas as ações são registradas:
- Aplicação de tokens
- Sincronização
- Criação/atualização de bindings
- Migrações de versão

## 📊 Versionamento

### Semantic Versioning

O Design System usa versionamento semântico:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
  - Tokens removidos
  - Componentes removidos
  - Mudanças incompatíveis

- **MINOR** (1.0.0 → 1.1.0): Novas features
  - Novos tokens
  - Novos componentes
  - Mudanças de médio impacto

- **PATCH** (1.0.0 → 1.0.1): Bug fixes
  - Correções de valores
  - Pequenos ajustes

### Pinning de Versão

Você pode fixar páginas em versões específicas do DS:
- Útil para migrações graduais
- Evita quebras em produção
- Permite testes em staging

## 🛠️ Ferramentas de Desenvolvedor

### Exportar CSS

Gere arquivo CSS com todas as variáveis:

```css
:root {
  --color-brand-primary-500: #2B6CB0;
  --color-neutral-0: #FFFFFF;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --radius-sm: 4px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
```

### Exportar/Importar Configuração

Exporte toda a configuração de integração:
- Bindings
- Configurações
- Versão

## 📚 Casos de Uso

### 1. Rebranding

```
1. Atualiza tokens de cores no DS
2. Sincroniza
3. Aplica tokens a todas as páginas
4. Preview em staging
5. Publica
```

### 2. Novo Componente do Design System

```
1. Adiciona componente no DS
2. Cria binding no CMS
3. Configura token bindings
4. Componente disponível no Page Builder
```

### 3. Migração de Versão

```
1. Nova versão do DS publicada
2. Sistema detecta mudanças
3. Gera plano de migração
4. Aplica (se auto-migração ativa) ou sugere mudanças
5. Valida e publica
```

## 🎯 Melhores Práticas

### Design System

1. **Use IDs estáveis** para tokens e componentes
2. **Documente breaking changes** no changelog
3. **Teste em staging** antes de produção
4. **Mantenha aliases** para tokens depreciados

### Bindings

1. **Mapeie propriedades essenciais** primeiro
2. **Use referências de tokens** em vez de valores fixos
3. **Documente transformações** personalizadas
4. **Teste todas as variantes** do componente

### Validação

1. **Execute validação** antes de publicar
2. **Corrija avisos de contraste** para acessibilidade
3. **Revise breaking changes** cuidadosamente
4. **Use canary deploys** para mudanças críticas

## 🔍 Troubleshooting

### Tokens não aparecem

✅ Verifique se o DS está carregado
✅ Confirme que os tokens estão no formato correto
✅ Execute "Revalidar" no DesignSystemManager

### Componente não aplica tokens

✅ Verifique se existe binding para o tipo do componente
✅ Confirme que o binding está ativo
✅ Verifique se os token paths estão corretos
✅ Execute "Aplicar Tokens" manualmente

### Validação falha

✅ Veja detalhes na aba "Validar" do painel DS
✅ Use correções automáticas quando disponíveis
✅ Verifique se componente do DS existe
✅ Confirme que tokens referenciados existem

### Sincronização falha

✅ Verifique credenciais (Figma token, GitHub token)
✅ Confirme formato dos tokens (W3C Design Tokens)
✅ Veja logs de erro no histórico de sincronização
✅ Teste conexão com a fonte

## 📖 Referências

- [W3C Design Tokens](https://design-tokens.github.io/community-group/format/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Semantic Versioning](https://semver.org/)

## 🎓 Próximos Passos

1. Configure seu primeiro Design System
2. Crie bindings para componentes mais usados
3. Ative aplicação automática de tokens
4. Configure sincronização com Figma/GitHub
5. Explore validação e correções automáticas

---

**Documentação atualizada:** Outubro 2025  
**Versão do Sistema:** 2.0.0 com Integração DS
