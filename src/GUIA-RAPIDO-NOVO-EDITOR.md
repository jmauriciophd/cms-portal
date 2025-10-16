# 🚀 GUIA RÁPIDO - NOVO EDITOR E MENU DE CONTEXTO

## 📝 EDITOR DE PÁGINAS

### **Criar Nova Página**
1. Vá em **Páginas** no menu
2. Clique em **Novo** → **Nova Página**
3. Editor abre com template padrão

### **Campos do Formulário**

#### **📌 Campos Principais:**
```
┌─────────────────────────────────────┐
│ Título da Página *                  │
│ [Digite o título aqui]              │
│                                     │
│ Slug (URL) *                        │
│ yoursite.com/[url-amigavel]         │
│                                     │
│ Imagem Destacada                    │
│ [Upload do Computador] [Biblioteca] │
│                                     │
│ Resumo / Descrição Curta            │
│ [Breve descrição...]                │
│                                     │
│ [Inserir Snippet ▼]                 │
│                                     │
│ Conteúdo da Página                  │
│ ┌─────────────────────────────────┐ │
│ │ [B][I][U] [≡][≣] [•][1] [🔗]   │ │
│ ├─────────────────────────────────┤ │
│ │ Digite o conteúdo aqui...       │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### **⚙️ Sidebar Direita:**

**Aba Publicação:**
- Status: Rascunho / Publicado / Agendado
- Data de Agendamento: `DD/MM/AAAA HH:MM`
- Template: Padrão / Largura Total / Sidebar

**Aba SEO:**
- Meta Description (0/160 caracteres)
- Meta Robots: `index, follow`
- Preview do Google (tempo real)

### **Ações Disponíveis**

```
[← Voltar] [👁️ Preview] [💾 Rascunho] [⏰ Agendar] [🚀 Publicar]
```

- **Voltar**: Retorna sem salvar
- **Preview**: Visualiza como ficará a página
- **Salvar Rascunho**: Salva sem publicar
- **Agendar**: Agenda para data/hora específica
- **Publicar Agora**: Publica imediatamente

---

## 🖱️ MENU DE CONTEXTO (BOTÃO DIREITO)

### **Como Usar:**
1. **Clique DIREITO** em qualquer página, template ou arquivo
2. Menu aparece com opções

### **Opções Disponíveis:**

```
┌────────────────────┐
│ 📋 Copiar          │ ← Copia para área de transferência
│ 📁 Mover           │ ← Move para outra pasta
│ ✏️ Renomear        │ ← Muda o nome
├────────────────────┤
│ 🕐 Histórico       │ ← Ver todas as alterações
│ 🔗 Copiar Caminho  │ ← Copia caminho completo
├────────────────────┤
│ ℹ️ Propriedades    │ ← Ver detalhes
├────────────────────┤
│ 🗑️ Excluir         │ ← Deleta (confirmação)
└────────────────────┘
```

---

## 📋 OPERAÇÃO: COPIAR

1. Clique direito na página
2. Selecione **Copiar**
3. Toast: *"Nome da Página" copiado*
4. Navegue para pasta destino
5. Clique direito no espaço vazio
6. Selecione **Colar**
7. Nova página criada: *"Nome da Página (Cópia)"*

---

## 📁 OPERAÇÃO: MOVER

1. Clique direito na página
2. Selecione **Mover**
3. Diálogo abre:
   ```
   Localização Atual: [📁 pasta/atual]
                ↓
   Nova Localização: [Select: Raiz / pasta1 / pasta2]
   ```
4. Selecione destino
5. Clique **Mover**
6. Toast: *"Página movida para nova pasta"*

---

## ✏️ OPERAÇÃO: RENOMEAR

1. Clique direito na página
2. Selecione **Renomear**
3. Diálogo abre:
   ```
   Nome Atual: [Página Inicial] (bloqueado)
   Novo Nome:  [Digite aqui...]
   ```
4. Digite novo nome
5. Pressione **Enter** ou clique **Renomear**
6. Toast: *Renomeado de "X" para "Y"*

---

## 🕐 OPERAÇÃO: HISTÓRICO

1. Clique direito na página
2. Selecione **Histórico**
3. Timeline visual aparece:
   ```
   ●────────────────────────────
   │ [Renomeado] Hoje, 14:30
   │ "Página 1" → "Home"
   │ 👤 admin@cms.com
   │ [Restaurar] ← Clique para restaurar
   │
   ●────────────────────────────
   │ [Atualizado] Ontem, 10:15
   │ Conteúdo modificado
   │ 👤 editor@cms.com
   │
   ●────────────────────────────
   │ [Criado] 13/10/2025, 09:00
   │ Página criada
   │ 👤 admin@cms.com
   ```
4. Clique **Restaurar** para voltar versão
5. Clique **Fechar** para sair

---

## 🔗 OPERAÇÃO: COPIAR CAMINHO

1. Clique direito na página
2. Selecione **Copiar Caminho**
3. Caminho completo copiado: `/pasta/subpasta/Nome da Página`
4. Toast: *"Caminho copiado"*
5. Cole onde precisar (Ctrl+V)

---

## ℹ️ OPERAÇÃO: PROPRIEDADES

1. Clique direito na página
2. Selecione **Propriedades**
3. Diálogo mostra:
   ```
   Nome:           Página Inicial
   ID:             123456789
   Tipo:           page
   Caminho:        /pasta
   Criado em:      13/10/2025 09:00
   Atualizado em:  15/10/2025 14:30
   ═══════════════════════════════
   Informações Adicionais
   Slug:           pagina-inicial
   Status:         published
   Template:       default
   Resumo:         Bem-vindo...
   ```
4. Clique **Fechar** para sair

---

## 🗑️ OPERAÇÃO: EXCLUIR

1. Clique direito na página
2. Selecione **Excluir** (em vermelho)
3. Confirmação: *"Deseja excluir esta página?"*
4. Clique **OK** para confirmar
5. Página deletada e registrada no histórico
6. Toast: *"Página excluída com sucesso"*

---

## 🖼️ UPLOAD DE IMAGENS

### **Do Computador:**
1. No editor, seção "Imagem Destacada"
2. Clique **Upload do Computador**
3. Seletor de arquivo abre
4. Escolha imagem (JPG, PNG, GIF, WebP)
5. Imagem carregada e exibida

### **Da Biblioteca:**
1. Clique **Biblioteca de Mídia**
2. Grid com imagens disponíveis
3. Clique na imagem desejada
4. Imagem selecionada
5. Toast: *"Imagem selecionada"*

---

## 📝 INSERÇÃO DE SNIPPETS

1. No editor, clique **Inserir Snippet**
2. Lista de snippets aparece:
   ```
   [Botão CTA] [Card Simples] [Lista com Ícones]
   ```
3. Clique no snippet desejado
4. Código inserido no final do conteúdo
5. Toast: *"Snippet inserido!"*

### **Snippets Padrão:**
- **Botão CTA**: Botão azul com hover
- **Card Simples**: Card branco com sombra
- **Lista com Ícones**: Lista com checkmarks

---

## ⏰ AGENDAMENTO DE PUBLICAÇÃO

1. No editor, Sidebar → Aba **Publicação**
2. Status: Selecione **Agendado**
3. Data de Agendamento: Escolha data/hora
4. Clique **Agendar** no header
5. Toast: *"Página agendada para DD/MM/AAAA HH:MM"*

---

## 👁️ PREVIEW EM TEMPO REAL

1. No header, clique **Preview**
2. Visualização renderizada aparece
3. Veja como ficará a página publicada
4. Clique **Editar** para voltar ao formulário

---

## 🔍 SEO - META TAGS

### **Meta Description:**
1. Sidebar → Aba **SEO**
2. Campo "Meta Description"
3. Digite descrição (máx. 160 caracteres)
4. Contador em tempo real: `120 / 160`

### **Meta Robots:**
- `index, follow`: Indexar e seguir links (padrão)
- `noindex, follow`: Não indexar, seguir links
- `index, nofollow`: Indexar, não seguir links
- `noindex, nofollow`: Não indexar, não seguir

### **Preview do Google:**
```
┌────────────────────────────────┐
│ Preview no Google:             │
├────────────────────────────────┤
│ Título da Página               │ ← Azul, hover underline
│ yoursite.com/slug              │ ← Verde
│ Meta description ou resumo...  │ ← Cinza
└────────────────────────────────┘
```

---

## 🎨 TEMPLATES DISPONÍVEIS

1. **Padrão**: Layout comum, container 1200px
2. **Largura Total**: Sem container, 100% largura
3. **Sidebar Esquerda**: Conteúdo + sidebar à esquerda
4. **Sidebar Direita**: Conteúdo + sidebar à direita

Selecione na Sidebar → Publicação → Template

---

## 💡 DICAS E TRUQUES

### **Atalhos de Teclado:**
- `Enter`: Salvar no diálogo Renomear
- `Esc`: Fechar diálogos
- `Ctrl+V`: Colar caminho copiado

### **Slug Automático:**
- Ao digitar o título, slug é gerado automaticamente
- "Página Inicial" → `pagina-inicial`
- Pode editar manualmente se quiser

### **Copiar & Colar Páginas:**
1. Copie uma página existente
2. Navegue para pasta destino
3. Cole para criar duplicata rápida
4. Edite nome e conteúdo da cópia

### **Restaurar Versão Antiga:**
1. Abra Histórico da página
2. Encontre versão desejada
3. Clique **Restaurar**
4. Página volta ao estado anterior
5. Nova entrada criada no histórico

### **Organização com Pastas:**
1. Crie estrutura de pastas lógica
2. Use Mover para organizar páginas
3. Copiar Caminho para referências
4. Breadcrumb para navegação rápida

---

## ⚠️ AVISOS IMPORTANTES

### **Campos Obrigatórios:**
- ⚠️ **Título** não pode estar vazio
- ⚠️ **Slug** não pode estar vazio
- ⚠️ **Data de Agendamento** obrigatória se Status = Agendado

### **Slug Único:**
- Cada página deve ter slug único
- Sistema não valida automaticamente
- Slugs duplicados causam conflito de rotas

### **Histórico Limitado:**
- Mantém apenas últimas 100 ações
- Ações mais antigas são removidas automaticamente
- Backup importante antes de grandes mudanças

### **Imagens Base64:**
- Upload do computador cria imagem base64
- Pode aumentar tamanho do JSON
- Prefira usar URLs externas ou CDN

---

## 🎯 FLUXO COMPLETO DE CRIAÇÃO

```
1. Páginas → Novo → Nova Página
   ↓
2. Preencher Título (slug gerado automaticamente)
   ↓
3. [Opcional] Upload/Selecionar Imagem Destacada
   ↓
4. [Opcional] Escrever Resumo
   ↓
5. Editar Conteúdo no Editor Rich Text
   ↓
6. [Opcional] Inserir Snippets
   ↓
7. Sidebar → Configurar Status, Agendamento, Template
   ↓
8. Sidebar → Aba SEO → Meta Description
   ↓
9. Clicar "Preview" para visualizar
   ↓
10. Clicar "Publicar Agora" ou "Salvar Rascunho"
    ↓
11. Toast de confirmação
    ↓
12. Retorna para lista de páginas
```

---

## 📚 RECURSOS ADICIONAIS

### **Documentação Completa:**
- `/EDITOR-FORMULARIO-E-MENU-CONTEXTO.md`

### **Código Fonte:**
- Editor: `/components/pages/PageEditor.tsx`
- Menu: `/components/common/ContextMenu.tsx`
- Operações: `/components/common/ItemOperations.ts`
- Diálogos: `/components/common/ItemDialogs.tsx`

### **Exemplos de Uso:**
- Ver `PageManager.tsx` linha 360+

---

## ✅ CHECKLIST DE USO

Antes de publicar uma página:
- [ ] Título preenchido
- [ ] Slug único e amigável
- [ ] Imagem destacada adicionada (opcional)
- [ ] Conteúdo escrito e formatado
- [ ] Resumo escrito
- [ ] Meta description configurada (SEO)
- [ ] Template selecionado
- [ ] Preview visualizado
- [ ] Status correto (Publicado/Agendado/Rascunho)
- [ ] Data de agendamento (se agendado)

---

## 🎉 CONCLUSÃO

**Agora você sabe:**
✅ Criar e editar páginas com formulário completo  
✅ Usar menu de contexto (botão direito)  
✅ Copiar, mover, renomear páginas  
✅ Ver histórico e restaurar versões  
✅ Upload de imagens e inserção de snippets  
✅ Agendar publicações  
✅ Otimizar SEO com meta tags  

**BOM TRABALHO! 🚀**
