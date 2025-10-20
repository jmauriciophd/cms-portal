# Reorganização do Menu e Correções do Editor HTML

## Mudanças Implementadas

### 1. Reorganização do Menu Principal

#### Páginas movidas para dentro do Page Builder
- ✅ Removido "Páginas" do menu principal
- ✅ Adicionado "Páginas" como primeira aba dentro do "Page Builder"
- ✅ Estrutura atual do Page Builder:
  - 📄 Páginas
  - 🎨 Templates

#### Editor Inteligente removido do menu
- ✅ Removido "Editor Inteligente" do menu principal
- ✅ Funcionalidade de sugestões já está integrada no RichTextEditor
- ✅ Arquivo EditorDemo.tsx excluído
- ✅ Botão de sugestões disponível na toolbar do editor de páginas

### 2. Correções do Editor de Código HTML

#### Bug 1: Auto-formatação ao abrir - CORRIGIDO ✅
**Problema:** O código era automaticamente formatado ao abrir o editor
**Solução:** 
- Removida formatação automática no `useEffect` que carrega o valor inicial
- Código agora preserva a formatação original ao abrir
- Botão "Formatar Código" disponível para formatação manual quando desejado

#### Bug 2: Sugestões de tags HTML - IMPLEMENTADO ✅
**Problema:** Não havia autocomplete de tags HTML como em editores modernos
**Solução:**
- Implementado sistema de sugestões de tags HTML
- 40+ tags HTML disponíveis para autocomplete
- Ativação automática ao digitar `<`
- Navegação com ↑↓
- Aceitação com Tab ou Enter
- Cancelamento com Esc
- Painel de sugestões estilizado no tema dark do editor

**Tags suportadas:**
- Estrutura: div, span, p, a, img, h1-h6
- Listas: ul, ol, li
- Tabelas: table, tr, td, th, thead, tbody
- Semânticas: header, footer, nav, section, article, aside, main
- Formulários: form, input, button, textarea, select, option, label
- Mídia: video, audio, source, canvas, svg, iframe
- Outros: script, style, meta, link, title, br, hr, strong, em, code, pre

#### Bug 3: Problema de linhas ao editar - CORRIGIDO ✅
**Problema:** Ao editar uma linha, as palavras apareciam uma linha acima
**Solução:**
- Alterado `whiteSpace: 'pre'` para `whiteSpace: 'pre-wrap'`
- Adicionado `wordBreak: 'break-word'`
- Alterado `overflowWrap: 'normal'` para `overflowWrap: 'anywhere'`
- Sincronização perfeita entre textarea e syntax highlighting
- Editor agora respeita quebras de linha e quebra palavras longas corretamente

#### Bug 4: Escapamento HTML - CORRIGIDO ✅
**Problema:** Erro no escapamento de `&` causava problemas no syntax highlighting
**Solução:**
- Corrigido `.replace(/&/g, '&')` para `.replace(/&/g, '&')`
- Syntax highlighting agora funciona corretamente

### 3. Melhorias na Usabilidade

#### Tooltip informativa adicionada
- ✅ Adicionada dica visual na toolbar do editor HTML
- ✅ Texto: "💡 Digite < para ver sugestões de tags | Tab/Enter para aceitar | ↑↓ para navegar"
- ✅ Usuários agora sabem como usar o autocomplete

#### Editor de Páginas já possui sugestões IA
- ✅ Botão "Sugestões" (💡) já existente na toolbar
- ✅ Botão "IA" (✨ Sparkles) para assistente de IA
- ✅ Atalho Ctrl+M para ativar/desativar sugestões
- ✅ Funcionalidade completa de sugestões inteligentes de texto

## Estrutura do Menu Atualizada

```
📊 Dashboard
📐 Page Builder
  ├─ 📄 Páginas
  └─ 🎨 Templates
🖼️ Arquivos
🗑️ Lixeira
🍔 Menu
🏷️ Tags e Categorias
📋 Listas
🗄️ Campos Personalizados
💻 Snippets
⚙️ Configurações do Sistema
  ├─ 👥 Usuários
  ├─ 🔗 Links
  ├─ 🔐 Segurança
  ├─ 🔄 Sincronização
  └─ 📤 Importação em Lote
```

## Arquivos Modificados

### Removidos
- `/components/editor/EditorDemo.tsx` - Excluído (funcionalidade já integrada)

### Modificados
1. `/components/dashboard/Dashboard.tsx`
   - Removido tipo 'editorDemo' do View
   - Removido menu item "Editor Inteligente"
   - Removido case 'editorDemo' do renderView
   - Removido import do EditorDemo
   - Adicionado "Páginas" como filho do Page Builder

2. `/components/editor/HTMLCodeEditor.tsx`
   - Removida auto-formatação ao abrir
   - Adicionado sistema de sugestões de tags HTML
   - Corrigido escapamento HTML
   - Corrigido problema de quebra de linhas
   - Adicionado tooltip informativa
   - Implementado navegação com teclado nas sugestões

## Funcionalidades do Editor HTML

### Syntax Highlighting
- ✅ Coloração sintática completa para HTML
- ✅ Destaque de tags, atributos, valores e comentários
- ✅ Tema dark (estilo VS Code)
- ✅ Números de linha
- ✅ Sincronização de scroll

### Auto-complete
- ✅ Fechamento automático de tags ao digitar `>`
- ✅ Sugestões de tags ao digitar `<`
- ✅ Não fecha tags void (img, br, hr, etc.)
- ✅ Navegação intuitiva com teclado

### Edição
- ✅ Indentação com Tab (2 espaços)
- ✅ Formatação manual com botão
- ✅ Contador de linhas e caracteres
- ✅ Quebra de linha correta
- ✅ Quebra de palavras longas

### Atalhos de Teclado
- `Tab` - Indentar código (2 espaços)
- `>` - Auto-completar tag de fechamento
- `<` - Mostrar sugestões de tags
- `↑/↓` - Navegar nas sugestões
- `Tab/Enter` - Aceitar sugestão
- `Esc` - Cancelar sugestões

## Benefícios das Mudanças

### Organização
- ✅ Menu mais limpo e organizado
- ✅ Funcionalidades relacionadas agrupadas logicamente
- ✅ Redução de itens no menu principal
- ✅ Page Builder agora é um hub completo para criação de páginas

### Produtividade
- ✅ Autocomplete acelera digitação de HTML
- ✅ Sugestões reduzem erros de digitação
- ✅ Formatação opcional não interfere no fluxo
- ✅ Editor mais próximo da experiência do VS Code

### Experiência do Usuário
- ✅ Interface mais intuitiva
- ✅ Menos cliques para acessar recursos
- ✅ Tooltips informativas
- ✅ Feedback visual claro

## Próximas Melhorias Sugeridas

### Editor HTML
- [ ] Adicionar sugestões de atributos HTML
- [ ] Adicionar snippets de código comum
- [ ] Implementar busca e substituição
- [ ] Adicionar suporte para emmet
- [ ] Implementar folding de código

### Page Builder
- [ ] Adicionar aba "Layouts" no Page Builder
- [ ] Adicionar aba "Componentes" no Page Builder
- [ ] Integrar biblioteca de blocos reutilizáveis
- [ ] Adicionar histórico de versões visual

### Menu
- [ ] Adicionar ícones customizados para submenus
- [ ] Implementar breadcrumb no topo da página
- [ ] Adicionar contador de itens nos menus

## Testes Realizados

### Editor HTML
- ✅ Abertura de arquivo sem formatação automática
- ✅ Sugestões aparecem ao digitar `<`
- ✅ Navegação com setas funciona
- ✅ Tab/Enter aceitam sugestão
- ✅ Esc cancela sugestões
- ✅ Edição de linhas sem deslocamento
- ✅ Quebra de linha correta
- ✅ Syntax highlighting funcionando

### Menu
- ✅ Páginas aparece dentro do Page Builder
- ✅ Editor Inteligente removido
- ✅ Navegação entre abas funciona
- ✅ Estado expandido/colapsado preservado
- ✅ Permissões aplicadas corretamente

### Funcionalidades Existentes
- ✅ RichTextEditor com sugestões funcionando
- ✅ Botão de sugestões na toolbar
- ✅ Botão de IA na toolbar
- ✅ Atalho Ctrl+M funcionando
- ✅ PageEditor usando RichTextEditor

## Notas Técnicas

### Sincronização de Elementos
O editor HTML usa dois elementos sobrepostos:
1. `<pre>` com syntax highlighting (visual)
2. `<textarea>` transparente (interação)

Ambos precisam ter exatamente as mesmas propriedades de:
- `fontFamily`
- `lineHeight`
- `whiteSpace`
- `wordBreak`
- `overflowWrap`
- `padding`

Caso contrário, o cursor fica desalinhado com o texto visual.

### Sugestões de Tags
O sistema detecta o padrão `<[a-zA-Z]*` e filtra tags que começam com o texto digitado.
A posição do painel é calculada baseada em:
- Número da linha atual × altura da linha (21px)
- Largura dos números de linha (60px) + coluna atual × largura do caractere (7.2px)

### Performance
- Estado das sugestões é local ao componente
- Filtragem ocorre apenas quando necessário
- Renderização otimizada com memoização do syntax highlighting
