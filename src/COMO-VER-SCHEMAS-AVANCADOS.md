# 🎨 Como Visualizar o Sistema de Schemas Avançados

## ✅ O Que Foi Implementado

Acabamos de implementar um **sistema completo de schemas avançados** para componentes do Page Builder, incluindo:

1. ✅ **Schemas TypeScript completos** (`/utils/advancedComponentSchemas.ts`)
   - 100+ propriedades configuráveis
   - 20+ tipos de componentes
   - Suporte completo a responsividade, acessibilidade, animações, etc.

2. ✅ **Editor de Propriedades Avançado** (`/components/editor/AdvancedPropertyEditor.tsx`)
   - 4 tabs organizadas (Layout, Style, Advanced, Settings)
   - Interface visual intuitiva
   - Suporte a todas as propriedades dos schemas

3. ✅ **Página de Demonstração Interativa** (`/components/demo/AdvancedSchemaDemo.tsx`)
   - Explorer de componentes
   - Editor ao vivo
   - Documentação integrada

4. ✅ **Integração com Page Builder** (`/components/pages/HierarchicalPageBuilder.tsx`)
   - Painel de propriedades substituído pelo editor avançado
   - Suporte automático a todos os schemas

## 🚀 Como Acessar

### Opção 1: Através do Dashboard (RECOMENDADO)

1. **Faça login** no sistema admin (`/admin`)

2. Na **tela inicial do Dashboard**, você verá um novo card em destaque:
   ```
   ✨ Sistema de Schemas
   Explore as propriedades avançadas
   ```

3. **Clique no card** para ser direcionado à página de demonstração

### Opção 2: Acesso Direto via URL

Navegue diretamente para:
```
http://localhost:5173/admin/schemas-demo
```

### Opção 3: Através do Page Builder

1. Vá para **Páginas** no menu lateral

2. **Crie uma nova página** ou edite uma existente

3. No **Page Builder**, selecione qualquer componente no canvas

4. O **painel lateral direito** agora mostra o **AdvancedPropertyEditor** com:
   - Tab **Layout** - Dimensões e espaçamento
   - Tab **Style** - Tipografia, cores, bordas
   - Tab **Advanced** - Transformações, shadows
   - Tab **Settings** - Identidade e acessibilidade

## 📖 O Que Você Verá

### Página de Demonstração

A demonstração está organizada em **3 tabs principais**:

#### 1. **Explorer** 
- Lista de todos os componentes disponíveis organizados por categoria
- Preview visual ao selecionar cada componente
- Visualização de todas as propriedades ativas

#### 2. **Editor**
- Editor completo de propriedades (4 sub-tabs)
- Preview ao vivo que atualiza em tempo real
- Teste todas as propriedades: cores, espaçamento, tipografia, efeitos, etc.

#### 3. **Documentação**
- Guia completo de uso
- Lista de propriedades disponíveis
- Exemplos de código

### Propriedades Disponíveis

Cada componente agora suporta:

**Layout & Dimensões**
- width, height, min/max dimensions
- z-index
- position (relative, absolute, fixed, sticky)

**Espaçamento**
- margin (top, right, bottom, left)
- padding (top, right, bottom, left)
- Suporte a unidades: em, rem, %, px

**Tipografia**
- fontFamily, fontSize, fontWeight
- lineHeight, letterSpacing
- textTransform, textDecoration

**Cores**
- color (texto)
- backgroundColor
- borderColor

**Bordas**
- borderRadius
- borderWidth, borderStyle

**Efeitos Visuais**
- boxShadow (offsetX/Y, blur, spread, color, inset)
- opacity (0-1)
- filter (blur, brightness, contrast, etc.)

**Transformações**
- rotate (deg)
- scale (X/Y)
- translate (X/Y)
- skew (X/Y)

**Animações**
- transition
- animation
- scrollAnimation

**Estados**
- base, hover, focus, active, disabled
- Cada estado pode sobrescrever qualquer propriedade

**Responsividade**
- breakpoints (xs, sm, md, lg, xl)
- Propriedades específicas por breakpoint

**Acessibilidade**
- ARIA role, label, describedby
- tabIndex
- focusOutline

## 🎯 Testando as Funcionalidades

### Teste 1: Editor de Propriedades no Page Builder

1. Vá para **Páginas** → **Criar Nova Página**
2. No Page Builder, arraste um **Container** para o canvas
3. Selecione o container clicando nele
4. No painel direito:
   - Tab **Layout**: Altere width para `80%`, padding para `2rem`
   - Tab **Style**: Mude backgroundColor para uma cor de sua escolha
   - Tab **Advanced**: Adicione um boxShadow
   - Tab **Settings**: Defina um nome e adicione classes CSS

5. **Veja as mudanças aplicadas em tempo real** no canvas!

### Teste 2: Explorer de Componentes

1. Acesse `/admin/schemas-demo`
2. Na tab **Explorer**:
   - Clique em diferentes tipos de componentes (Container, Button, Heading, etc.)
   - Observe o preview e as propriedades de cada um
   - Note os badges mostrando quais features estão ativas

### Teste 3: Editor Interativo

1. Na mesma página, vá para a tab **Editor**
2. Use as 4 sub-tabs para modificar propriedades
3. Observe o **Preview Ao Vivo** atualizar instantaneamente
4. Teste diferentes combinações de cores, espaçamentos, efeitos

## 📦 Arquivos Criados

```
/utils/
  ✅ advancedComponentSchemas.ts (6.000+ linhas)

/components/editor/
  ✅ AdvancedPropertyEditor.tsx (600+ linhas)

/components/templates/
  ✅ AdvancedTemplatePreview.tsx (300+ linhas)

/components/demo/
  ✅ AdvancedSchemaDemo.tsx (600+ linhas)

/
  ✅ SISTEMA-SCHEMAS-AVANCADOS.md (Documentação completa)
  ✅ COMO-VER-SCHEMAS-AVANCADOS.md (Este arquivo)
```

## 🎨 Componentes Disponíveis

### Estruturais
- Container, Section, Grid

### Conteúdo
- Text, Heading, Image, Button, Link, Icon, Video, List, Card, Table

### Navegação
- Header, Footer, Breadcrumb, Tabs, Accordion, Modal, Carousel

### Formulários
- Form, Input, Textarea, Select, Checkbox, Radio, Switch

### Utilitários
- Spacer, Divider, Map, Embed

## 🔧 Integrações

O sistema de schemas está integrado com:

✅ **HierarchicalPageBuilder** - Painel de propriedades avançado
✅ **TemplateManager** - Pode usar schemas nos templates
✅ **Dashboard** - Link de acesso rápido
✅ **Routes** - Rota dedicada `/admin/schemas-demo`

## 💡 Próximos Passos Sugeridos

Agora que o sistema está implementado, você pode:

1. **Testar todas as propriedades** no editor
2. **Criar templates** usando os schemas avançados
3. **Personalizar componentes** com propriedades responsivas
4. **Explorar estados** (hover, focus, etc.)
5. **Adicionar novos componentes** aos schemas conforme necessário

## 📚 Documentação Adicional

Para detalhes técnicos completos, consulte:
- `/SISTEMA-SCHEMAS-AVANCADOS.md` - Documentação técnica completa
- `/utils/advancedComponentSchemas.ts` - Código fonte com comentários
- `/components/demo/AdvancedSchemaDemo.tsx` - Exemplos práticos

## 🐛 Resolução de Problemas

**Não vejo o card no Dashboard?**
- Certifique-se de estar logado
- Recarregue a página (F5)
- Verifique se tem permissão `content.create`

**Erro ao acessar /admin/schemas-demo?**
- Verifique se está autenticado
- Limpe o cache do navegador
- Tente fazer logout e login novamente

**Painel de propriedades não aparece?**
- Selecione um componente no canvas do Page Builder
- Verifique se não está no modo Preview
- Tente redimensionar a janela

## ✨ Recursos Destacados

🎯 **100% TypeScript** - Type-safe em toda a aplicação
🎨 **Interface Intuitiva** - Tabs organizadas por categoria
⚡ **Atualização em Tempo Real** - Veja as mudanças instantaneamente
📱 **Responsivo** - Propriedades por breakpoint
♿ **Acessível** - Suporte completo a ARIA
🔄 **Extensível** - Fácil adicionar novos componentes

---

**Pronto!** Agora você pode explorar todo o poder do sistema de schemas avançados! 🚀
