# 📖 GUIA RÁPIDO DE USO

## 🎯 NOVAS FUNCIONALIDADES

### **1. 📝 Criar Matéria Agendada**

```
1. Login → Matérias → "+ Nova Matéria"
2. Digite o título
3. Adicione componentes da biblioteca
4. Clique no ícone 📅 (calendário)
5. Selecione data e hora
6. Clique em "⏰ Agendar Publicação"
```

**Resultado:**
- Status: "Agendado" (badge amarelo)
- Data de publicação salva
- Matéria não visível até a data/hora

---

### **2. 🚀 Publicar Imediatamente**

```
1. Criar/Editar matéria
2. Adicionar conteúdo
3. Clicar em "✓ Publicar Agora"
```

**Resultado:**
- Status: "Publicado" (badge verde)
- Visível no site imediatamente
- Indexável por motores de busca

---

### **3. 👁️ Despublicar Matéria**

```
1. Editar matéria publicada
2. Clicar em "👁️‍🗨️ Despublicar" (botão vermelho)
3. Confirmar ação
```

**Resultado:**
- Status: "Rascunho"
- Removida do site imediatamente
- Meta robots="noindex,nofollow" adicionada
- Não indexável por motores de busca

---

### **4. 🖼️ Inserir Imagens**

**Método 1: Da Biblioteca**
```
1. Abrir editor (Matéria ou Página)
2. Clicar na aba "Imagens"
3. Navegar pelas pastas
4. Clicar na imagem desejada
5. Clicar em "✓ Inserir Imagem Selecionada"
```

**Método 2: Upload Novo**
```
1. Ir para "Arquivos"
2. Navegar até /Arquivos/imagens
3. Clicar em "📤 Upload"
4. Selecionar imagem (WebP, PNG, JPG)
5. Voltar ao editor
6. Usar método 1
```

**O sistema lembra o último diretório usado!**

---

### **5. 📁 Estrutura de Pastas**

#### **Pastas Padrão (🔒 Protegidas):**
```
/Arquivos
├── 🔒 imagens/       (Imagens do site)
├── 🔒 paginas/       (Páginas criadas)
└── 🔒 estaticos/     (CSS, JS, assets)
```

#### **Criar Subpasta:**
```
1. Ir para "Arquivos"
2. Navegar até pasta desejada
3. Clicar em "📁 Nova Pasta"
4. Digite o nome
5. Confirmar
```

**Exemplo:**
```
/Arquivos/imagens/
├── eventos/          ← Pode criar
├── produtos/         ← Pode criar
└── banners/          ← Pode criar
```

#### **Proteção:**
- ❌ Não pode deletar: `/Arquivos`, `/imagens`, `/paginas`, `/estaticos`
- ✅ Pode deletar: Qualquer subpasta criada por você

---

## 🎨 EDITOR UNIFICADO

### **Componentes Disponíveis:**

#### **Básicos:**
- **Texto** → Parágrafos, títulos
- **Imagem** → Fotos, gráficos
- **Botão** → CTAs, links
- **Espaçador** → Margens

#### **Layout:**
- **Container** → Seções
- **Grid** → Colunas
- **Flex** → Linhas flexíveis
- **Card** → Cartões

#### **Conteúdo:**
- **Hero** → Banner principal
- **Galeria** → Grid de imagens
- **Vídeo** → YouTube, Vimeo
- **Lista** → Bullets, numerada

#### **Formulários:**
- **Input** → Campos de texto
- **Textarea** → Textos longos
- **Select** → Dropdown
- **Checkbox** → Marcação

---

## ⌨️ Atalhos do Editor

```
Ctrl + S      → Salvar rascunho
Ctrl + Z      → Desfazer
Ctrl + Y      → Refazer
Ctrl + P      → Preview
Delete        → Deletar componente selecionado
```

---

## 📊 Status de Publicação

| Status | Badge | Descrição | Visível? | Indexável? |
|--------|-------|-----------|----------|------------|
| Rascunho | Cinza | Em edição | ❌ Não | ❌ Não |
| Agendado | Amarelo | Publicação futura | ❌ Não | ❌ Não |
| Publicado | Verde | No ar | ✅ Sim | ✅ Sim |

---

## 🔄 Workflow Recomendado

### **Para Matérias:**
```
1. Criar matéria (draft)
2. Adicionar conteúdo
3. Salvar rascunho (Ctrl+S)
4. Review interno
5. Agendar ou publicar
6. Monitorar métricas
7. Atualizar se necessário
```

### **Para Páginas:**
```
1. Criar página (draft)
2. Usar template ou começar do zero
3. Adicionar componentes
4. Configurar SEO (meta description)
5. Preview (Ctrl+P)
6. Publicar
7. Testar link
```

---

## 🛠️ Solução de Problemas

### **Imagem não aparece**
```
1. Verificar se está em /Arquivos/imagens
2. Verificar formato (WebP, PNG, JPG)
3. Recarregar editor
4. Tentar inserir novamente
```

### **Pasta não deletando**
```
Se aparecer "pasta protegida":
→ É uma das 4 pastas padrão
→ Não pode ser deletada
→ Crie subpastas dentro delas
```

### **Agendamento não funciona**
```
1. Verificar se data é futura
2. Verificar se horário está correto
3. Clicar em "Agendar Publicação" (não "Salvar")
4. Verificar badge "Agendado"
```

### **Editor não abre**
```
1. Verificar console (F12)
2. Limpar cache (Ctrl+Shift+Del)
3. Atualizar página (F5)
4. Re-login
```

---

## 💡 Dicas e Truques

### **1. Memória de Diretório**
O sistema lembra o último diretório usado ao inserir imagens.
**Dica:** Organize imagens em subpastas por tipo (eventos, produtos, etc)

### **2. Templates**
Use templates prontos para acelerar criação de matérias.
**Acesso:** Matérias → "+ Nova Matéria" → "Usar Template"

### **3. Snippets Reutilizáveis**
Crie snippets de código HTML/CSS para reusar.
**Acesso:** Menu → Snippets

### **4. Preview Antes de Publicar**
Sempre use o preview (👁️) antes de publicar.
**Atalho:** Botão de olho no header

### **5. Versionamento**
Use Undo/Redo (Ctrl+Z / Ctrl+Y) livremente.
O sistema mantém histórico de alterações.

---

## 📱 Responsividade

### **Editor:**
- Desktop: 3 painéis (biblioteca, canvas, propriedades)
- Tablet: 2 painéis (canvas + sidebar)
- Mobile: 1 painel (canvas fullscreen)

### **Site Público:**
- Todos os componentes são responsivos
- Grid adapta automaticamente
- Imagens escalam proporcionalmente

---

## 🔐 Permissões

| Ação | Viewer | Editor | Admin |
|------|--------|--------|-------|
| Ver dashboard | ✅ | ✅ | ✅ |
| Criar matéria | ❌ | ✅ | ✅ |
| Publicar matéria | ❌ | ✅ | ✅ |
| Despublicar | ❌ | ✅ | ✅ |
| Criar página | ❌ | ❌ | ✅ |
| Gerenciar arquivos | ❌ | ✅ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ✅ |
| Deletar pastas protegidas | ❌ | ❌ | ❌ |

---

## 📞 Suporte

### **Problemas Comuns:**

**1. "Edit is not defined"**
→ Limpar cache e recarregar

**2. "_redirects virou pasta"**
→ Executar `./PROTEGER-REDIRECTS.sh`

**3. "Pasta protegida"**
→ Criar subpasta dentro dela

**4. "Imagem não carrega"**
→ Verificar formato e tamanho (max 10MB)

---

## ✅ Checklist Pré-Publicação

### **Matérias:**
- [ ] Título definido
- [ ] Slug correto (URL amigável)
- [ ] Conteúdo completo
- [ ] Imagem destacada (se houver)
- [ ] Categorias selecionadas
- [ ] Preview testado
- [ ] SEO configurado (meta description)
- [ ] Agendamento ou publicação definida

### **Páginas:**
- [ ] Título definido
- [ ] Slug correto
- [ ] Componentes adicionados
- [ ] Layout responsivo testado
- [ ] Links funcionando
- [ ] Imagens carregando
- [ ] Preview testado
- [ ] SEO configurado

---

## 🎓 Tutoriais em Vídeo

*Serão disponibilizados em breve*

---

**Precisa de ajuda? Consulte a documentação completa em `/SISTEMA-UNIFICADO-COMPLETO.md`**
