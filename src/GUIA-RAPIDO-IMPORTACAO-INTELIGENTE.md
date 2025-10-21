# Guia Rápido - Importação Inteligente de Arquivos

## Como Usar

### 1. Acessar a Ferramenta

No **Gerenciamento de Arquivos**, clique no botão:
```
✨ Import Inteligente
```

### 2. Selecionar Nível de Otimização

Antes de fazer upload, escolha o nível:

| Nível | Quando Usar | Efeito |
|-------|-------------|--------|
| **Nenhuma** | Arquivos já otimizados | Apenas análise e validação |
| **Leve** | Arquivos delicados | Remove comentários, formatação básica |
| **Média** ⭐ | Uso geral (padrão) | Otimização balanceada, bons resultados |
| **Agressiva** | Máxima compressão | Minificação total, tamanho mínimo |

### 3. Fazer Upload

**Opção A: Clique**
- Clique na área de upload
- Selecione um ou mais arquivos

**Opção B: Drag & Drop**
- Arraste arquivos para a área
- Solte para iniciar processamento

### 4. Acompanhar Processamento

Para cada arquivo, você verá:

```
📄 meu-arquivo.html
   Página HTML • 1920x1080
   
   [Progress Bar] 85%
   
   ✅ Otimizado 45%  🛡️ Validado  Score: 92%
   
   📁 /pages/meu-arquivo.html  [Revisar?]
   
   [👁️ Preview]  [⚙️ Detalhes]
```

### 5. Revisar Resultados

#### Status Visual

- ✅ **Verde** = Pronto para importar
- ⚠️ **Amarelo** = Avisos (pode importar)
- ❌ **Vermelho** = Erro crítico (não pode importar)
- 🔄 **Azul** = Processando...

#### Badges

- **Otimizado 45%** = Arquivo reduzido em 45%
- **Validado** = Passou em todas as verificações
- **Score: 92%** = Pontuação de qualidade
- **Revisar** = Baixa confiança, revisar destino

### 6. Ajustar Destino (se necessário)

Cada arquivo mostra o caminho sugerido:
```
📁 /pages/meu-arquivo.html
```

Se quiser mudar:
- Clique no campo de caminho
- Digite o novo destino
- Ex: `/noticias/2024/artigo.html`

### 7. Visualizar Preview

Clique em **👁️ Preview** para ver:

- **HTML:** Página renderizada
- **Imagem:** Visualização da imagem
- **JSON:** Dados formatados
- **Código:** Syntax highlighted

### 8. Ver Detalhes Completos

Clique em **⚙️ Detalhes** para ver 3 abas:

#### Tab Análise
- Categoria detectada
- Tipo MIME
- Tamanho original
- Características específicas
- Confiança da detecção

#### Tab Otimização
- Status (otimizado ou não)
- Tamanho original vs final
- Redução percentual
- Otimizações aplicadas
- Logs de processamento

#### Tab Validação
- Status geral
- Score de qualidade
- Verificações realizadas:
  - ✅ Tamanho OK
  - ✅ Tipo válido
  - ✅ Estrutura HTML válida
  - etc.
- Avisos e sugestões

### 9. Importar Arquivos

Quando estiver satisfeito:

1. Revise os arquivos prontos (✅ verde)
2. Clique em **Download (3)** no rodapé
   - O número indica quantos serão importados
3. Confirme a importação

### 10. Resultado

Após importação:
- ✅ Toast de sucesso
- 📊 Estatística de redução total
- 🔗 Links automáticos criados
- 📂 Arquivos organizados nas pastas

---

## Exemplos Práticos

### Exemplo 1: Importar Página HTML

1. Selecione nível **Média**
2. Upload de `sobre-nos.html`
3. Sistema detecta:
   - Categoria: Página HTML
   - Destino: `/pages/sobre-nos.html`
   - Otimização: Remove comentários, minifica CSS inline
4. Preview mostra página renderizada
5. Importar → Arquivo salvo e link criado

### Exemplo 2: Galeria de Fotos

1. Selecione nível **Nenhuma** (imagens já otimizadas)
2. Upload de 10 imagens JPG
3. Sistema detecta:
   - Categoria: Imagem
   - Destino: `/media/images/`
   - Validação: Dimensões OK
4. Ajuste individual de destino se necessário
5. Importar todas de uma vez

### Exemplo 3: Assets CSS/JS

1. Selecione nível **Agressiva**
2. Upload de `style.css` e `app.js`
3. Sistema detecta:
   - CSS → `/assets/styles/style.css`
   - JS → `/assets/scripts/app.js`
   - Otimização: Minificação completa
4. Verificar redução (geralmente 40-60%)
5. Importar

### Exemplo 4: Dados JSON

1. Selecione nível **Média**
2. Upload de `config.json`
3. Sistema detecta:
   - Categoria: Dados
   - Destino: `/data/config.json`
   - Validação: JSON válido
4. Preview mostra dados formatados
5. Importar

---

## Dicas e Truques

### 💡 Quando Usar Cada Nível

**Nenhuma:**
- ✅ Imagens já comprimidas
- ✅ Código já minificado
- ✅ Apenas quer validação

**Leve:**
- ✅ HTML com formatação importante
- ✅ Código para debug
- ✅ Documentação

**Média (Recomendado):**
- ✅ Uso geral
- ✅ Páginas web
- ✅ Scripts e estilos
- ✅ Melhor custo-benefício

**Agressiva:**
- ✅ Produção/Deploy
- ✅ Necessita máxima otimização
- ✅ Arquivos grandes
- ⚠️ Pode dificultar debug

### 🎯 Interpretando Scores

| Score | Significado | Ação |
|-------|-------------|------|
| 90-100 | Excelente | Importar sem preocupação |
| 70-89 | Bom | Revisar avisos menores |
| 50-69 | Regular | Verificar problemas |
| 0-49 | Ruim | Corrigir erros antes |

### ⚠️ Avisos Comuns

**"Página sem DOCTYPE"**
- Não crítico para funcionamento
- Recomendado adicionar para padrões

**"Arquivo grande"**
- Considera otimizar mais
- Ou dividir em partes menores

**"Revisar pasta de destino"**
- Confiança < 70%
- Verificar se destino está correto

**"Possível erro de sintaxe"**
- Revisar código antes de importar
- Pode causar problemas

### 🚀 Fluxos Otimizados

**Importação Rápida:**
1. Nível Média → Upload → Importar
2. Para arquivos confiáveis e padrão

**Importação Cuidadosa:**
1. Nível escolhido → Upload
2. Revisar cada arquivo
3. Verificar previews
4. Ajustar destinos
5. Importar

**Importação em Massa:**
1. Organize arquivos antes
2. Upload de múltiplos arquivos
3. Sistema processa em paralelo
4. Revisão rápida de badges
5. Importação em lote

---

## Troubleshooting

### ❌ Erro "Arquivo muito grande"
- **Causa:** Arquivo > 10MB
- **Solução:** Reduzir tamanho ou dividir arquivo

### ⚠️ Aviso "Tipo não reconhecido"
- **Causa:** Extensão incomum
- **Solução:** Verificar se é tipo suportado, ajustar manualmente

### 🔄 Processamento Lento
- **Causa:** Muitos arquivos ou arquivos grandes
- **Solução:** Aguardar ou fazer em lotes menores

### ❌ Preview não carrega
- **Causa:** Tipo não suporta preview
- **Solução:** Ver detalhes ao invés de preview

### ⚠️ "Redução 0%"
- **Causa:** Arquivo já otimizado ou nível Nenhuma
- **Solução:** Normal, arquivo está ótimo assim

---

## Checklist Antes de Importar

- [ ] Nível de otimização adequado selecionado
- [ ] Todos os arquivos processados (sem 🔄)
- [ ] Nenhum erro crítico (❌)
- [ ] Destinos revisados e corretos
- [ ] Previews verificados (opcional)
- [ ] Pronto para importar!

---

## Atalhos e Recursos

### Seleção Múltipla
- Ctrl/Cmd + Click → Selecionar arquivos
- Shift + Click → Selecionar intervalo

### Ordenação
- Automática por status
- Erros primeiro, depois avisos, depois OK

### Filtros Visuais
- Badge "X prontos" → Quantos podem importar
- Badge "X com erro" → Quantos têm problemas

---

## Perguntas Frequentes

**P: Posso mudar o nível depois de fazer upload?**
R: Não. Selecione o nível antes. Se precisar mudar, feche e reabra.

**P: Arquivos são modificados permanentemente?**
R: Não. Original permanece intacto. Otimização é aplicada na cópia importada.

**P: Posso importar parcialmente?**
R: Sim! Apenas arquivos ✅ (prontos) serão importados.

**P: O que acontece com arquivos duplicados?**
R: Sistema avisa e sobrescreve com confirmação.

**P: Preview é seguro?**
R: Sim. HTML roda em iframe sandbox, isolado do sistema.

**P: Posso ver código otimizado antes de importar?**
R: Sim. No painel Detalhes → Tab Otimização → Logs.

---

## Suporte

Se encontrar problemas:
1. Verificar mensagens de erro/aviso
2. Consultar seção Troubleshooting
3. Ver logs detalhados no painel
4. Reportar bugs se necessário

---

**Versão:** 1.0
**Última Atualização:** 2024
