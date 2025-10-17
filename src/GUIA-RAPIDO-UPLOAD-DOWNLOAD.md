# 🚀 Guia Rápido: Upload/Download de Páginas

## ⚡ Início Rápido em 2 Minutos

### 📥 Baixar uma Página

```
1. Abrir "Gerenciamento de Páginas"
2. Encontrar a página desejada
3. Clicar com botão direito
4. Selecionar "Baixar"
5. Pronto! Arquivo .json salvo ✓
```

### 📤 Fazer Upload de uma Página

```
1. Clicar no botão "Importar" (toolbar)
2. Arrastar arquivo .json OU clicar para selecionar
3. Aguardar validação
4. Se houver conflito → Escolher "Substituir" ou "Cancelar"
5. Pronto! Página importada ✓
```

### 📜 Ver Histórico de Versões

```
1. Botão direito na página
2. Clicar em "Histórico"
3. Ver todas as versões
4. [Opcional] Restaurar versão anterior
5. [Opcional] Comparar versões
```

## 📋 Casos de Uso Comuns

### Caso 1: Backup Antes de Editar

```bash
ANTES DE EDITAR PÁGINA IMPORTANTE:
1. Baixar página (botão direito → Baixar)
2. Guardar arquivo em pasta segura
3. Fazer edições com tranquilidade
4. Se errar: Upload do backup OU restaurar do histórico
```

### Caso 2: Copiar Página para Outro Projeto

```bash
PROJETO A (origem):
1. Baixar página

PROJETO B (destino):
2. Importar página baixada
3. Se slug existir: Renomear ou substituir
4. Editar conforme necessário
```

### Caso 3: Recuperar Versão Antiga

```bash
OPÇÃO 1 - Pelo Histórico (mais rápido):
1. Botão direito → Histórico
2. Localizar versão desejada
3. Clicar "Restaurar"
4. Confirmar

OPÇÃO 2 - Via Arquivo:
1. Se tiver arquivo exportado
2. Importar → Substituir
```

## 🎯 Atalhos e Dicas

### Atalhos de Teclado

```
Botão Direito     = Menu de contexto
⋮ (3 pontos)      = Menu dropdown
Ctrl + Clique     = [Futuro: seleção múltipla]
```

### Dicas Importantes

```
✓ Sempre exportar antes de mudanças grandes
✓ Nomear arquivos de forma organizada
✓ Manter backup dos arquivos exportados
✓ Revisar conflitos antes de substituir
✓ Usar descrições claras nas versões
```

## 📊 Interface Visual

### Menu de Contexto (Botão Direito)

```
┌─────────────────────┐
│ ✏️  Editar          │
│ 📋 Copiar           │
│ 📁 Mover            │
│ ✍️  Renomear        │
├─────────────────────┤
│ 🕐 Histórico        │ ← Ver versões
│ 🔗 Copiar Caminho   │
│ 📥 Baixar           │ ← Exportar página
├─────────────────────┤
│ 📄 Propriedades     │
├─────────────────────┤
│ 🗑️  Excluir         │
└─────────────────────┘
```

### Toolbar Principal

```
┌──────────────────────────────────────────────┐
│ [Buscar...]  [📊] [📋]  [📤 Importar] [+ Novo]│
│                                               │
│  📊 = Grid view                               │
│  📋 = List view                               │
│  📤 = Upload de página                        │
│  + = Criar nova página/pasta                  │
└──────────────────────────────────────────────┘
```

## 🔍 FAQ Rápido

**P: Posso exportar múltiplas páginas de uma vez?**
R: Atualmente não, mas está planejado. Por ora, exporte uma por vez.

**P: O que acontece se eu importar uma página com slug existente?**
R: O sistema detecta o conflito e pede confirmação para substituir.

**P: Quantas versões são mantidas?**
R: Até 50 versões por página. Versões antigas são limpas automaticamente.

**P: Posso deletar versões antigas?**
R: Sim, exceto a versão atual. Mínimo de 2 versões deve ser mantido.

**P: O upload é seguro?**
R: Sim! Validação rigorosa, sanitização de dados e auditoria completa.

**P: Qual o tamanho máximo do arquivo?**
R: 10MB por arquivo.

**P: Posso editar o arquivo JSON antes de importar?**
R: Sim, mas cuidado! Mantenha a estrutura correta.

## ⚠️ Avisos Importantes

```
⚠️ SEMPRE faça backup antes de operações críticas
⚠️ NÃO edite arquivos JSON se não souber o que está fazendo
⚠️ VERIFIQUE a origem de arquivos antes de importar
⚠️ REVISE conflitos antes de confirmar sobrescrita
⚠️ GUARDE arquivos importantes em local seguro
```

## 🎓 Próximos Passos

1. ✅ Testar download de uma página
2. ✅ Testar upload da mesma página
3. ✅ Ver histórico de versões
4. ✅ Testar restauração de versão
5. ✅ Comparar duas versões

## 📞 Suporte

- **Documentação Completa:** Ver `SISTEMA-UPLOAD-DOWNLOAD-VERSOES.md`
- **Exemplos de Código:** Ver `/services/PageVersionService.ts`
- **Componentes UI:** Ver `/components/pages/`

---

**💡 Dica do Dia:**
Crie o hábito de exportar páginas importantes semanalmente. Isso garante backups sempre atualizados!

**Versão: 1.0.0**
