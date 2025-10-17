# 🔄 Guia Rápido: Sincronização de Conteúdo

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Carregar JSON de Exemplo
```
Dashboard → Sincronização → Carregar Exemplo
```

### 2️⃣ Criar Nova Sincronização
```
Nova Sincronização → Cole JSON → Analisar JSON
```

### 3️⃣ Auto-mapear Campos
```
Aba Mapeamento → Auto-mapear → Criar Configuração
```

### 4️⃣ Sincronizar
```
Lista → Sincronizar Agora → Ver Resultado
```

---

## 📋 Exemplo Real: SharePoint → CMS

### JSON de Entrada (SharePoint):
```json
{
  "ID": 23,
  "Created": "2019-06-04T17:02:00Z",
  "Title": "Nova Política de Segurança",
  "CampoDataConteudo2": "2024-01-15T10:00:00Z",
  "CampoResumo2": "Resumo da política",
  "PublishingPageContent": "<p>Conteúdo completo</p>",
  "CampoExibirNaHome": true,
  "CategoriasId": 3
}
```

### Mapeamento Automático:
```
ID              → id
Created         → createdAt  
Title           → title
CampoResumo2    → excerpt
PublishingPageContent → content
CampoExibirNaHome → featured
CategoriasId    → categoryId
```

### Resultado no CMS:
✅ Página criada com todos os dados  
✅ Tipos convertidos automaticamente  
✅ Validações aplicadas  
✅ Pronto para publicar  

---

## 🎯 Tipos de Dados Detectados Automaticamente

| Campo SharePoint | Tipo Detectado | Exemplo |
|-----------------|----------------|---------|
| `ID` | lookup | `23` |
| `Created` | datetime | `2019-06-04T17:02:00Z` |
| `Title` | text | `"Meu Título"` |
| `CampoData*` | date/datetime | `2024-01-15T10:00:00Z` |
| `Campo*Email` | email | `user@example.com` |
| `CampoTelaCheia` | boolean | `true/false` |
| `PublishingPageContent` | richtext | `<p>HTML</p>` |
| `ListaUnidades*` | collection | `{"results": [1,2,3]}` |
| `TaxKeyword` | taxonomy | `{"results": [...]}` |

---

## 🔧 Cenários Comuns

### Cenário 1: Importação Única
```
1. Importar JSON → Analisar
2. Mapear campos
3. Destino: Criar novo
4. Sincronizar Agora
```

### Cenário 2: Atualização Periódica
```
1. Fonte: API REST
2. URL: https://api.exemplo.com/items
3. Mapear campos
4. Destino: ID específico
5. Sync Auto: 30 minutos
6. Habilitar
```

### Cenário 3: Múltiplas Fontes
```
1. Criar config "Notícias SharePoint"
2. Criar config "Produtos API"
3. Criar config "Eventos JSON"
4. Cada uma com mapeamento próprio
5. Todas sincronizando automaticamente
```

---

## 🛠️ Campos Personalizados

### Criar Grupo de Campos:
```
Campos Personalizados → Novo Grupo
```

**Exemplo: Dados de Evento**
- Nome: `Data de Início` (Tipo: datetime)
- Nome: `Data de Fim` (Tipo: datetime)
- Nome: `Local` (Tipo: text)
- Nome: `Vagas` (Tipo: number, Min: 0)
- Nome: `Inscrições Abertas` (Tipo: boolean)

**Aplicar a:** Páginas, Matérias

---

## 📊 Monitoramento

### Ver Histórico:
```
Sincronização → Selecionar Config → Aba Histórico
```

**Informações Disponíveis:**
- ✅ Todos os syncs executados
- ✅ Data/hora de cada um
- ✅ Sucesso ou falha
- ✅ Quantidade de registros
- ✅ Erros detalhados
- ✅ Mudanças aplicadas

### Último Resultado:
```
Sincronização → Selecionar Config → Aba Último Resultado
```

**Detalhes:**
- Registros processados: `1`
- Sucessos: `1`
- Falhas: `0`
- Mudanças: `Title: "Antigo" → "Novo"`

---

## ⚙️ Configurações Avançadas

### Sincronização Automática:
```
Aba Agendamento → Sync Automático: ON
Intervalo: 60 minutos
Habilitar: ON
```

### Regras de Transformação:
```typescript
// Exemplo: Converter título para maiúsculas
{
  field: 'Title',
  type: 'format',
  params: { format: 'uppercase' }
}

// Exemplo: Adicionar prefixo
{
  field: 'Title',
  type: 'prepend',
  params: { prefix: '[NOVO] ' }
}
```

---

## 🚨 Solução de Problemas

### Erro: "JSON inválido"
- Verifique sintaxe do JSON
- Use validador online (jsonlint.com)
- Remova vírgulas extras

### Erro: "Validation failed"
- Verifique campos obrigatórios
- Confira formato de datas
- Valide emails e URLs

### Erro: "Campo não encontrado"
- Revise mapeamento
- Verifique nomes internos
- Use auto-mapear

### Sync não executa automaticamente
- Verifique se está habilitado
- Confirme intervalo configurado
- Veja histórico para erros

---

## 💡 Dicas Pro

1. **Use Auto-mapear** primeiro, depois ajuste manualmente
2. **Preview sempre** antes de sincronizar
3. **Teste com 1 item** antes de importar todos
4. **Mantenha histórico** para auditoria
5. **Use grupos de campos** para organização
6. **Configure sync auto** para fontes dinâmicas
7. **Exporte configurações** como backup

---

## 📞 Comandos Rápidos

| Ação | Caminho |
|------|---------|
| Nova Sync | Dashboard → Sincronização → Nova |
| Executar Sync | Lista → Botão ▶️ |
| Ver Histórico | Lista → Selecionar → Aba Histórico |
| Pausar Auto | Lista → Botão ⏸️ |
| Editar Config | Lista → Botão ✏️ |
| Novo Grupo Campos | Campos Personalizados → Novo Grupo |
| Importar JSON | Sincronização → Importar Arquivo |

---

## ✅ Checklist de Sucesso

- [ ] JSON válido e analisado
- [ ] Todos os campos importantes mapeados
- [ ] Preview verificado
- [ ] Destino correto selecionado
- [ ] Primeira sincronização executada
- [ ] Resultado verificado (sem erros)
- [ ] Auto-sync configurado (se necessário)
- [ ] Histórico monitorado

---

**🎉 Pronto! Seu conteúdo está sincronizado.**

Para mais detalhes, veja: `SISTEMA-MAPEAMENTO-SINCRONIZACAO.md`
