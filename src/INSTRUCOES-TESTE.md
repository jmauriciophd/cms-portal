# 🧪 INSTRUÇÕES DE TESTE - GUIA PASSO A PASSO

## ✅ O QUE JÁ FOI CORRIGIDO

1. ✅ **_redirects** (20ª vez!)
2. ✅ **Breadcrumb** (navegação correta)

---

## 🧪 TESTES A REALIZAR

### **TESTE 1: Navegação Breadcrumb** ✅ (Deve estar funcionando)

**Passos:**

1. Ir para Dashboard → Páginas
2. Criar pasta "projetos"
3. Entrar na pasta "projetos"
4. Criar subpasta "website"
5. Entrar na subpasta "website"

**Breadcrumb esperado:**
```
Início > Arquivos > páginas > projetos > website
  ↑        ↑          ↑          ↑         ↑
  [0]      [1]        [2]        [3]       [4] (atual)
```

**Testes de navegação:**

6. Clicar em "Início" → ✅ Deve voltar pra raiz (`currentPath = ''`)
7. Clicar em "Arquivos" → ✅ Deve voltar pra raiz (`currentPath = ''`)
8. Clicar em "páginas" → ✅ Deve voltar pra raiz (`currentPath = ''`)
9. Clicar em "projetos" → ✅ Deve ir para `currentPath = 'projetos'`

**Resultado esperado:**
- ✅ Todos os cliques funcionam corretamente
- ✅ URL/path atualiza na interface

**Se não funcionar:**
- ❌ Reportar com screenshot do breadcrumb
- ❌ Verificar console por erros

---

### **TESTE 2: Botão "Novo"** ⚠️ (Investigar)

**Preparação:**
1. Abrir console (F12 → Console)
2. Limpar console (ícone 🚫)

**Passos:**

1. Ir para Dashboard → Páginas
2. Clicar no botão "+ Novo"

**Resultado esperado:**
```
Dropdown abre com opções:
┌─ Novo ─────────────┐
│ 📁 Nova Pasta      │
│ 📄 Nova Página     │
└────────────────────┘
```

**Casos possíveis:**

#### **Caso A: Dropdown abre normalmente**
✅ **Funcionando!** Prosseguir para Teste 3.

#### **Caso B: Dropdown não abre**
1. Verificar console por erros
2. Verificar se há log "Botão Novo clicado!"
3. Se SIM → Problema no DropdownMenu
4. Se NÃO → Button não está capturando clique

**Screenshot necessário:**
- Estado do botão
- Console com erros

#### **Caso C: Dropdown abre mas não aparece (z-index)**
1. Inspecionar elemento (botão direito → Inspecionar)
2. Procurar por `<div role="menu"` ou `[role="menu"]`
3. Verificar estilo `z-index`
4. Se `z-index` < 50 → Problema confirmado

**Correção temporária:**
```css
/* Adicionar no DevTools (Elements → Styles): */
[role="menu"] {
  z-index: 9999 !important;
  background: white !important;
  border: 1px solid #ccc !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}
```

Se funcionar com correção → Reportar problema de z-index.

---

### **TESTE 3: Upload de Arquivos** ⚠️ (Investigar)

**Preparação:**
1. Abrir console (F12 → Console)
2. Limpar console
3. Preparar arquivo de teste:
   - **Teste 1:** Imagem PNG pequena (< 1MB)
   - **Teste 2:** PDF pequeno (< 5MB)
   - **Teste 3:** Imagem JPG grande (> 10MB) - deve falhar

**Passos:**

#### **Upload Teste 1: PNG pequeno**

1. Ir para Dashboard → Arquivos
2. Clicar em "Upload" ou arrastar arquivo

**Logs esperados:**
```
🔵 Upload iniciado
📁 Arquivos: 1
📄 Processando arquivo 1: { name: "teste.png", size: 245678, type: "image/png" }
✅ Validação: { valid: true }
📖 Lendo arquivo...
✅ Arquivo lido com sucesso
💾 Salvando arquivo no localStorage...
✅ Upload concluído. 1 arquivos salvos.
```

**Resultado esperado:**
- ✅ Toast de sucesso: "1 arquivo(s) enviado(s) com sucesso!"
- ✅ Arquivo aparece na lista

**Se não funcionar:**

#### **Erro A: Nenhum log no console**
❌ **Input file não está conectado**

**Debug:**
1. Inspecionar elemento do botão Upload
2. Verificar se existe `<input type="file"` no DOM
3. Verificar se `onChange` está conectado

**Correção temporária:**
```javascript
// No console, executar:
document.querySelector('input[type="file"]').addEventListener('change', function(e) {
  console.log('Input mudou!', e.target.files);
});
```

Se log aparecer → Input funcionando, problema no handler.

---

#### **Erro B: "Arquivo rejeitado: Tipo de arquivo não permitido"**
❌ **Tipo MIME não está na lista permitida**

**Debug:**
1. Verificar log `type:` do arquivo
2. Exemplo: `type: "image/jpeg"` mas lista só tem `"image/jpg"`

**Arquivos permitidos atualmente:**
```
image/jpeg
image/jpg
image/png
image/gif
image/webp
image/svg+xml
application/pdf
text/plain
application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

**Se tipo não está na lista:**
- Reportar tipo MIME necessário
- Ex: "Preciso fazer upload de .json (application/json)"

---

#### **Erro C: "Arquivo muito grande. Máximo: 10MB"**
❌ **Arquivo excede limite**

**Limite atual:** 10MB (10 * 1024 * 1024 bytes)

**Se arquivo é necessário:**
- Reportar tamanho necessário
- Ex: "Preciso fazer upload de PDF de 15MB"

---

#### **Erro D: "Erro ao ler arquivo"**
❌ **FileReader falhou**

**Debug:**
1. Verificar log de erro completo
2. Verificar tipo de arquivo

**Possíveis causas:**
- Arquivo corrompido
- Permissão de leitura negada
- Tipo de arquivo problemático

**Reportar:**
- Tipo de arquivo
- Tamanho
- Mensagem de erro completa

---

#### **Upload Teste 2: PDF pequeno**

**Repetir passos do Teste 1 com arquivo PDF.**

**Logs esperados:**
```
📄 Processando arquivo 1: { name: "doc.pdf", size: 1234567, type: "application/pdf" }
✅ Validação: { valid: true }
```

**Resultado esperado:**
- ✅ Upload bem-sucedido
- ✅ PDF aparece na lista

---

#### **Upload Teste 3: Imagem > 10MB**

**Repetir passos com imagem grande.**

**Logs esperados:**
```
📄 Processando arquivo 1: { name: "grande.jpg", size: 15728640, type: "image/jpeg" }
❌ Validação: { valid: false, error: "Arquivo muito grande. Máximo: 10MB" }
❌ Rejeitado: Arquivo muito grande. Máximo: 10MB
```

**Resultado esperado:**
- ❌ Toast de erro: "Alguns arquivos não foram enviados"
- ❌ Arquivo NÃO aparece na lista

**Se arquivo grande for aceito:**
- ⚠️ Validação não está funcionando (reportar bug)

---

## 📊 FORMULÁRIO DE REPORTE

Use este template para reportar problemas:

```markdown
## REPORTE DE BUG

**Teste:** [Breadcrumb / Botão Novo / Upload]

**Problema:**
[Descreva o problema]

**Passos para reproduzir:**
1. ...
2. ...
3. ...

**Resultado esperado:**
[O que deveria acontecer]

**Resultado atual:**
[O que está acontecendo]

**Console logs:**
```
[Cole os logs do console aqui]
```

**Screenshot:**
[Anexar screenshot]

**Informações adicionais:**
- Navegador: [Chrome/Firefox/Safari/Edge]
- Versão: [ex: Chrome 120]
- Sistema: [Windows/Mac/Linux]
```

---

## ✅ CHECKLIST DE TESTES

### **Breadcrumb (Deve estar OK):**
- [ ] Clicar em "Início" volta pra raiz
- [ ] Clicar em "Arquivos" volta pra raiz
- [ ] Clicar em "páginas/matérias" volta pra raiz
- [ ] Clicar em pasta navega corretamente

### **Botão "Novo":**
- [ ] Dropdown abre ao clicar
- [ ] Opção "Nova Pasta" aparece
- [ ] Opção "Nova Página" aparece
- [ ] Clicar em opção executa ação

### **Upload:**
- [ ] PNG pequeno (<1MB) → Upload OK
- [ ] JPG pequeno (<1MB) → Upload OK
- [ ] PDF pequeno (<5MB) → Upload OK
- [ ] Arquivo grande (>10MB) → Rejeita corretamente
- [ ] Arquivo não permitido (.exe) → Rejeita corretamente

---

## 🎯 PRIORIDADES DE TESTE

1. **ALTA** - Breadcrumb (deve estar funcionando)
2. **MÉDIA** - Botão "Novo" (workaround possível)
3. **ALTA** - Upload (funcionalidade crítica)

---

## 📞 PRÓXIMOS PASSOS

1. **Executar testes acima**
2. **Coletar logs do console**
3. **Tirar screenshots**
4. **Reportar resultados**

---

## 🚀 DICAS

**Console (F12):**
- `Ctrl+L` ou `Cmd+K` → Limpar console
- `Ctrl+F` ou `Cmd+F` → Buscar no console
- Clicar direito → "Save as..." → Salvar logs

**Screenshots:**
- Windows: `Win+Shift+S`
- Mac: `Cmd+Shift+4`
- Linux: `PrtScn` ou `Shift+PrtScn`

**Inspecionar Elemento:**
- Clicar direito → "Inspecionar"
- Ou `F12` → Aba "Elements"

---

**BOA SORTE NOS TESTES! 🧪✨**

Reporte os resultados para continuarmos as correções.
