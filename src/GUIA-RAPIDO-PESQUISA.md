# 🔍 Guia Rápido - Pesquisa Global

## Como Usar

### 1️⃣ Localização
A barra de pesquisa está localizada **no topo do Dashboard**, sempre visível (sticky).

### 2️⃣ Pesquisa Básica
1. Clique na barra de pesquisa
2. Digite o que procura (páginas, artigos, arquivos, etc.)
3. As sugestões aparecem automaticamente
4. Clique em uma sugestão para navegar

### 3️⃣ Usar Filtros
1. Clique no botão **"Filtros"** (ao lado da barra de pesquisa)
2. Selecione os filtros desejados:
   - **Tipo de Conteúdo**: Escolha entre Páginas, Artigos, Arquivos, etc.
   - **Categorias**: Filtre por Notícias, Tecnologia, Esportes, etc.
   - **Tags**: Filtre por Importante, Destaque, Urgente, etc.
3. Os resultados são filtrados automaticamente
4. O número de filtros ativos aparece no botão

### 4️⃣ Limpar Pesquisa
- **X na barra**: Limpa apenas o texto de pesquisa
- **Limpar no painel de filtros**: Remove todos os filtros ativos

## ✨ Recursos

### Sugestões Inteligentes
- Aparecem ao digitar (mínimo 1 caractere)
- Mostram até 8 resultados mais relevantes
- Exibem informações completas:
  - Título do item
  - Tipo de conteúdo
  - Descrição
  - Categoria
  - Autor
  - Data de atualização
  - Tags

### Busca Abrangente
A pesquisa procura em:
- ✅ Títulos
- ✅ Descrições
- ✅ Tags
- ✅ Categorias
- ✅ Todos os tipos de conteúdo

### Navegação Rápida
- Clique em qualquer sugestão
- Navega automaticamente para o item
- Feedback com notificação de sucesso

## 🎯 Exemplos de Uso

### Exemplo 1: Encontrar uma Página
```
1. Digite: "home"
2. Veja as páginas com "home" no título
3. Clique na página desejada
4. Abre a página no gerenciador
```

### Exemplo 2: Buscar por Categoria
```
1. Clique em "Filtros"
2. Selecione categoria "Notícias"
3. Digite qualquer termo
4. Veja apenas conteúdo de Notícias
```

### Exemplo 3: Buscar Arquivos Recentes
```
1. Clique em "Filtros"
2. Selecione "Arquivos" em tipo de conteúdo
3. Digite o nome do arquivo
4. Veja apenas arquivos correspondentes
```

### Exemplo 4: Filtro Combinado
```
1. Clique em "Filtros"
2. Selecione tipo "Artigos"
3. Selecione categoria "Tecnologia"
4. Selecione tag "Destaque"
5. Digite termo de busca
6. Veja artigos de tecnologia em destaque
```

## 🎨 Interface

### Elementos Visuais
- 🔍 **Ícone de pesquisa**: Indica o campo de busca
- ⬇️ **Seta para baixo**: No botão de filtros, indica expansão
- 🔢 **Badge numérico**: Mostra quantidade de filtros ativos
- 🎨 **Cores dos badges**:
  - Azul (default): Filtro ativo
  - Cinza (outline): Filtro inativo

### Informações nas Sugestões
- 📄 **Ícone colorido**: Indica o tipo de conteúdo
- 🏷️ **Badge de tipo**: Mostra o tipo (Página, Artigo, etc.)
- 📁 **Categoria**: Exibida com ícone de pasta
- 👤 **Autor**: Exibido com ícone de usuário
- 🕐 **Data**: Exibida com ícone de relógio
- 🏷️ **Tags**: Exibidas como badges secundários

## ⚡ Atalhos e Dicas

### Dicas de Uso
- Digite apenas algumas letras para ver sugestões
- Use filtros para refinar buscas amplas
- Combine múltiplos filtros para buscar específico
- Limpe filtros para voltar à busca geral

### Comportamento
- **Clique fora**: Fecha sugestões e filtros
- **ESC**: Fecha painel de filtros
- **Enter**: Seleciona primeira sugestão (futuro)
- **Setas**: Navega entre sugestões (futuro)

## 📱 Responsividade

### Desktop
- Barra de pesquisa: Largura máxima 2xl (672px)
- Painel de filtros: Largura completa da barra
- Sugestões: Largura completa da barra

### Tablet
- Layouts adaptam automaticamente
- Filtros em grid responsivo
- Sugestões com scroll vertical

### Mobile
- Barra de pesquisa ocupa largura total
- Filtros empilhados verticalmente
- Sugestões com informações condensadas

## 🔧 Personalização Rápida

### Adicionar Nova Categoria
```typescript
// Em GlobalSearch.tsx, linha ~65
const availableCategories = [
  'Notícias', 
  'Tecnologia', 
  // Adicione aqui:
  'Sua Nova Categoria'
];
```

### Adicionar Nova Tag
```typescript
// Em GlobalSearch.tsx, linha ~66
const availableTags = [
  'Importante', 
  'Destaque', 
  // Adicione aqui:
  'Sua Nova Tag'
];
```

### Alterar Limite de Sugestões
```typescript
// Em GlobalSearch.tsx, função performSearch
.slice(0, 8); // Altere 8 para o número desejado
```

## ❓ FAQ

**P: Por que não vejo resultados?**  
R: Verifique se há conteúdo criado no sistema e se os filtros não estão muito restritivos.

**P: Como desativar um filtro?**  
R: Clique novamente no badge do filtro ativo (azul) ou use "Limpar" no painel.

**P: Posso pesquisar em múltiplos tipos ao mesmo tempo?**  
R: Sim! Selecione "Todos" ou selecione vários tipos específicos.

**P: A pesquisa diferencia maiúsculas/minúsculas?**  
R: Não, a pesquisa é case-insensitive (ignora maiúsculas).

**P: Posso salvar filtros favoritos?**  
R: Ainda não, mas está planejado para versão futura.

## 🚀 Próximos Recursos

- [ ] Atalho de teclado (Ctrl/Cmd + K)
- [ ] Histórico de pesquisas
- [ ] Pesquisas salvas
- [ ] Busca em texto completo
- [ ] Navegação por teclado nas sugestões
- [ ] Filtros avançados (data, autor, status)
- [ ] Exportar resultados
- [ ] Compartilhar pesquisa

---

**Para mais detalhes técnicos, consulte**: `/DOCUMENTACAO-PESQUISA-GLOBAL.md`
