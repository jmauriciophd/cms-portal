# Documentação - Tratamento de Erros e Validação

## Visão Geral

Sistema completo de tratamento de erros com mensagens em português, validação detalhada e feedback amigável ao usuário.

---

## 1. Princípios de Tratamento de Erros

### 1.1 Diretrizes Gerais

✅ **Sempre em Português:**
- Todas as mensagens de erro devem ser em português
- Usar linguagem clara e objetiva
- Evitar jargão técnico quando possível

✅ **Mensagens Descritivas:**
- Indicar exatamente qual é o problema
- Sugerir como resolver quando aplicável
- Incluir contexto (número do campo, posição, etc.)

✅ **Feedback Visual:**
- Usar toast notifications para feedbacks temporários
- Exibir erros inline próximos ao campo com problema
- Cores adequadas (vermelho para erro, verde para sucesso)

### 1.2 Categorias de Mensagens

```typescript
// Sucesso (Verde)
toast.success('Operação realizada com sucesso!');

// Erro (Vermelho)
toast.error('Ocorreu um erro ao processar');

// Informação (Azul)
toast.info('Informação importante');

// Aviso (Amarelo)
toast.warning('Atenção: verifique os dados');
```

---

## 2. Tratamento de Erros JSON

### 2.1 Implementação Robusta

```typescript
const handleImportJson = () => {
  try {
    setImportError('');
    
    // 1. Limpar whitespace
    const cleanedJson = importJson.trim();
    
    if (!cleanedJson) {
      setImportError('Por favor, cole um JSON válido');
      return;
    }

    // 2. Tentar parsear com tratamento específico
    let parsed;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch (parseError: any) {
      // Mensagens específicas por tipo de erro
      if (parseError.message.includes('Unexpected token')) {
        setImportError('JSON malformado. Verifique se há vírgulas, chaves ou colchetes faltando.');
      } else if (parseError.message.includes('Unexpected end')) {
        setImportError('JSON incompleto. Verifique se todas as chaves e colchetes foram fechados.');
      } else if (parseError.message.includes('Unexpected non-whitespace')) {
        setImportError('Há caracteres extras após o JSON. Verifique se copiou apenas o conteúdo JSON válido.');
      } else {
        setImportError(`Erro ao interpretar JSON: ${parseError.message}`);
      }
      return;
    }

    // 3. Validar estrutura
    validateStructure(parsed);
    
  } catch (error: any) {
    console.error('Erro ao importar:', error);
    setImportError(`Erro inesperado: ${error.message || 'Erro desconhecido'}`);
  }
};
```

### 2.2 Tipos Comuns de Erro JSON

| Erro Original | Mensagem em Português | Causa Provável |
|---------------|----------------------|----------------|
| `Unexpected token` | JSON malformado. Verifique vírgulas, chaves ou colchetes. | Sintaxe JSON inválida |
| `Unexpected end` | JSON incompleto. Feche todas as chaves e colchetes. | JSON cortado/incompleto |
| `Unexpected non-whitespace character` | Há caracteres extras após o JSON. | Texto após o JSON válido |
| `Unexpected string` | Falta uma vírgula ou chave. | Vírgula faltando entre propriedades |

### 2.3 Exemplo de Validação Completa

```typescript
// Validação de lista customizada
const validateCustomList = (data: any): string | null => {
  // Validar tipo do objeto
  if (!data || typeof data !== 'object') {
    return 'O JSON deve ser um objeto válido';
  }

  // Validar campo obrigatório: name
  if (!data.name || typeof data.name !== 'string') {
    return 'Campo "name" (nome) é obrigatório e deve ser texto';
  }

  // Validar campo obrigatório: type
  if (!data.type || typeof data.type !== 'string') {
    return 'Campo "type" (tipo) é obrigatório e deve ser texto';
  }

  // Validar valores permitidos
  const validTypes = ['ministers', 'units', 'team', 'locations', 'custom'];
  if (!validTypes.includes(data.type)) {
    return `Tipo "${data.type}" inválido. Tipos válidos: ${validTypes.join(', ')}`;
  }

  // Validar array de fields
  if (!data.fields || !Array.isArray(data.fields)) {
    return 'Campo "fields" (campos) é obrigatório e deve ser uma lista';
  }

  if (data.fields.length === 0) {
    return 'A lista deve ter pelo menos um campo';
  }

  // Validar cada field individualmente
  for (let i = 0; i < data.fields.length; i++) {
    const field = data.fields[i];
    
    if (!field.name || typeof field.name !== 'string') {
      return `Campo ${i + 1}: "name" (nome) é obrigatório e deve ser texto`;
    }

    if (!field.type || typeof field.type !== 'string') {
      return `Campo ${i + 1}: "type" (tipo) é obrigatório e deve ser texto`;
    }

    const validFieldTypes = ['text', 'number', 'email', 'phone', 'url', 'textarea'];
    if (!validFieldTypes.includes(field.type)) {
      return `Campo ${i + 1}: tipo "${field.type}" inválido. Tipos válidos: ${validFieldTypes.join(', ')}`;
    }

    if (typeof field.required !== 'boolean') {
      return `Campo ${i + 1}: "required" (obrigatório) deve ser true ou false`;
    }
  }

  return null; // Sem erros
};
```

---

## 3. Validação de Campos

### 3.1 Campos de Texto

```typescript
// Nome de lista/menu
if (!name.trim()) {
  toast.error('Digite um nome para a lista');
  return;
}

// Nome duplicado
if (lists.some(l => l.name.toLowerCase() === name.toLowerCase())) {
  toast.error('Já existe uma lista com este nome');
  return;
}
```

### 3.2 Campos Numéricos

```typescript
// Validar número positivo
if (isNaN(value) || value <= 0) {
  setError('O valor deve ser um número maior que zero');
  return;
}

// Validar intervalo
if (value < min || value > max) {
  setError(`O valor deve estar entre ${min} e ${max}`);
  return;
}
```

### 3.3 Campos de Email

```typescript
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    setError('Digite um email válido');
    return false;
  }
  return true;
};
```

### 3.4 Campos de URL

```typescript
const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    setError('Digite uma URL válida (ex: https://exemplo.com)');
    return false;
  }
};
```

---

## 4. Validação de Formulários

### 4.1 Validação Inline

```tsx
<Input
  value={name}
  onChange={(e) => {
    setName(e.target.value);
    // Limpar erro ao digitar
    if (nameError) setNameError('');
  }}
  className={nameError ? 'border-red-500' : ''}
/>
{nameError && (
  <p className="text-sm text-red-600 mt-1">{nameError}</p>
)}
```

### 4.2 Validação no Submit

```typescript
const handleSubmit = () => {
  // Limpar erros anteriores
  setErrors({});
  
  const newErrors: { [key: string]: string } = {};
  
  // Validar cada campo
  if (!name.trim()) {
    newErrors.name = 'Nome é obrigatório';
  }
  
  if (!email.trim()) {
    newErrors.email = 'Email é obrigatório';
  } else if (!validateEmail(email)) {
    newErrors.email = 'Email inválido';
  }
  
  // Se houver erros, não submeter
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    toast.error('Corrija os erros antes de continuar');
    return;
  }
  
  // Processar formulário
  saveData();
};
```

---

## 5. Mensagens de Sucesso

### 5.1 Operações CRUD

```typescript
// Create
toast.success('Lista criada com sucesso!');

// Read/Load
toast.info('Dados carregados');

// Update
toast.success('Lista atualizada com sucesso!');

// Delete
toast.success('Lista excluída com sucesso!');
```

### 5.2 Operações de Arquivo

```typescript
// Upload
toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);

// Download
toast.success('Download iniciado');

// Export
toast.success('Menu exportado com sucesso!');

// Import
toast.success('Menu importado com sucesso!');
```

### 5.3 Operações de Cópia

```typescript
// Copiar para clipboard
navigator.clipboard.writeText(text)
  .then(() => {
    toast.success('URL copiada para a área de transferência!');
  })
  .catch(() => {
    toast.error('Não foi possível copiar. URL: ' + text);
  });

// Duplicar item
toast.success('Lista duplicada com sucesso!');
```

---

## 6. Tratamento de Erros Assíncronos

### 6.1 Promises

```typescript
const loadData = async () => {
  try {
    setLoading(true);
    const data = await fetchData();
    setData(data);
    toast.success('Dados carregados com sucesso!');
  } catch (error: any) {
    console.error('Erro ao carregar:', error);
    toast.error(`Erro ao carregar dados: ${error.message || 'Erro desconhecido'}`);
  } finally {
    setLoading(false);
  }
};
```

### 6.2 File Upload

```typescript
const handleFileUpload = async (files: FileList) => {
  const errors: string[] = [];
  const uploaded: File[] = [];
  
  for (const file of Array.from(files)) {
    try {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: tipo inválido`);
        continue;
      }
      
      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: arquivo muito grande`);
        continue;
      }
      
      await uploadFile(file);
      uploaded.push(file);
    } catch (error) {
      errors.push(`${file.name}: erro ao enviar`);
    }
  }
  
  // Feedback
  if (uploaded.length > 0) {
    toast.success(`${uploaded.length} arquivo(s) enviado(s)!`);
  }
  
  if (errors.length > 0) {
    toast.error(`Alguns arquivos não foram enviados:\n${errors.join('\n')}`);
  }
};
```

---

## 7. Mensagens Contextuais

### 7.1 Informações de Estado

```typescript
// Navegação
toast.info(`Navegando para: ${folder.path}`);

// Preview de URL
toast.info(`URL: /artigos/${article.slug}`);

// Agendamento
toast.success(`Publicação agendada para ${date.toLocaleDateString()}`);
```

### 7.2 Avisos

```typescript
// Limite de items
if (items.length >= MAX_ITEMS) {
  toast.warning(`Limite de ${MAX_ITEMS} itens atingido`);
}

// Dados não salvos
if (hasUnsavedChanges) {
  toast.warning('Você tem alterações não salvas');
}
```

---

## 8. Validação Recursiva

### 8.1 Menu Hierárquico

```typescript
const validateMenuItem = (
  item: any, 
  itemNumber: number, 
  path: string = ''
): string | null => {
  const prefix = path ? `${path}` : `Item ${itemNumber}`;

  // Validar item atual
  if (!item.title || typeof item.title !== 'string') {
    return `${prefix}: campo "title" é obrigatório`;
  }

  // Validar filhos recursivamente
  if (item.filhos !== null) {
    if (!Array.isArray(item.filhos)) {
      return `${prefix}: campo "filhos" deve ser null ou array`;
    }

    for (let i = 0; i < item.filhos.length; i++) {
      const childError = validateMenuItem(
        item.filhos[i], 
        i + 1, 
        `${prefix} → Filho ${i + 1}`
      );
      
      if (childError) {
        return childError;
      }
    }
  }

  return null;
};
```

### 8.2 Exemplo de Mensagem de Erro Recursiva

```
Item 1 → Filho 2 → Filho 1: campo "title" é obrigatório
```

Isso ajuda o usuário a localizar exatamente onde está o erro na hierarquia.

---

## 9. Boas Práticas

### 9.1 Console Logging

```typescript
try {
  // ... código
} catch (error: any) {
  // Log detalhado no console para debugging
  console.error('Erro ao importar lista:', error);
  
  // Mensagem amigável para o usuário
  toast.error(`Erro inesperado: ${error.message || 'Erro desconhecido'}`);
}
```

### 9.2 Fallbacks

```typescript
// Sempre fornecer valor padrão
const message = error.message || 'Erro desconhecido';
const items = data.items || [];
const name = user?.name || 'Usuário';
```

### 9.3 Limpeza de Estado

```typescript
const resetForm = () => {
  setName('');
  setEmail('');
  setErrors({});  // Limpar erros também!
  setImportError('');
};
```

---

## 10. Checklist de Implementação

### ✅ Para Cada Importação JSON:

- [ ] Trimmar whitespace antes de parsear
- [ ] Try-catch específico para JSON.parse
- [ ] Mensagens de erro específicas por tipo
- [ ] Validar tipo do objeto parseado
- [ ] Validar campos obrigatórios
- [ ] Validar tipos de dados
- [ ] Validar valores permitidos
- [ ] Validar arrays recursivamente
- [ ] Fornecer exemplo de JSON válido
- [ ] Exibir erro inline próximo ao textarea
- [ ] Log detalhado no console
- [ ] Mensagem amigável ao usuário

### ✅ Para Cada Formulário:

- [ ] Validação inline nos campos
- [ ] Limpeza de erros ao digitar
- [ ] Validação no submit
- [ ] Prevenir submit com erros
- [ ] Feedback visual (border vermelho)
- [ ] Mensagens de erro específicas
- [ ] Toast de sucesso ao salvar
- [ ] Loading state durante operação
- [ ] Desabilitar botão durante loading

### ✅ Para Cada Operação Assíncrona:

- [ ] Try-catch ao redor da operação
- [ ] Loading state (início e fim)
- [ ] Toast de sucesso
- [ ] Toast de erro com detalhes
- [ ] Log de erro no console
- [ ] Finally block para cleanup

---

## 11. Exemplos Completos

### 11.1 Import de Lista Customizada

```typescript
const handleImportList = () => {
  try {
    setImportError('');
    const cleanedJson = importJson.trim();
    
    if (!cleanedJson) {
      setImportError('Por favor, cole um JSON válido');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch (parseError: any) {
      if (parseError.message.includes('Unexpected token')) {
        setImportError('JSON malformado. Verifique vírgulas, chaves ou colchetes.');
      } else if (parseError.message.includes('Unexpected end')) {
        setImportError('JSON incompleto. Feche todas as chaves e colchetes.');
      } else if (parseError.message.includes('Unexpected non-whitespace')) {
        setImportError('Há caracteres extras após o JSON.');
      } else {
        setImportError(`Erro ao interpretar JSON: ${parseError.message}`);
      }
      return;
    }

    // Validação completa
    const validationError = validateCustomList(parsed);
    if (validationError) {
      setImportError(validationError);
      return;
    }

    // Importar
    importData(parsed);
    toast.success('Lista importada com sucesso!');
    
  } catch (error: any) {
    console.error('Erro ao importar:', error);
    setImportError(`Erro inesperado: ${error.message || 'Erro desconhecido'}`);
  }
};
```

### 11.2 Upload de Arquivo com Validação

```typescript
const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const newFiles: FileData[] = [];
  const errors: string[] = [];

  for (const file of Array.from(files)) {
    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: tipo não permitido`);
      continue;
    }

    // Validar tamanho
    if (file.size > MAX_SIZE) {
      errors.push(`${file.name}: máximo ${MAX_SIZE / 1024 / 1024}MB`);
      continue;
    }

    // Validar nome duplicado
    if (existingFiles.some(f => f.name === file.name)) {
      errors.push(`${file.name}: já existe`);
      continue;
    }

    newFiles.push(createFileData(file));
  }

  // Feedback
  if (newFiles.length > 0) {
    saveFiles([...existingFiles, ...newFiles]);
    toast.success(`${newFiles.length} arquivo(s) enviado(s)!`);
  }

  if (errors.length > 0) {
    toast.error(`Erros:\n${errors.join('\n')}`);
  }
};
```

---

## 12. Conclusão

Um bom tratamento de erros deve:

✅ **Prevenir** erros sempre que possível (validação)
✅ **Detectar** erros quando ocorrem (try-catch)
✅ **Comunicar** erros de forma clara (mensagens em português)
✅ **Recuperar** de erros graciosamente (fallbacks)
✅ **Registrar** erros para debugging (console.error)

Com essas práticas, o sistema oferece uma experiência de usuário profissional e resiliente, mesmo quando algo dá errado.
