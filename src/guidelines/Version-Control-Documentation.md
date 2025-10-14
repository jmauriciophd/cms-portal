# Documentação - Sistema de Controle de Versão e Histórico

## Visão Geral

Sistema completo de versionamento, histórico de alterações e operações avançadas de arquivos com funcionalidades de rollback, comparação de versões e controle de edição simultânea.

---

## 1. Funcionalidades Principais

### 1.1 Histórico de Alterações
- ✅ Registro automático de todas as alterações
- ✅ Metadados completos (autor, data, hora, descrição)
- ✅ Detecção automática de campos modificados
- ✅ Armazenamento completo de cada versão

### 1.2 Rollback/Restauração
- ✅ Restaurar qualquer versão anterior com um clique
- ✅ Backup automático antes de restaurar
- ✅ Confirmação de segurança
- ✅ Histórico preservado após rollback

### 1.3 Comparação de Versões
- ✅ Comparar duas versões lado a lado
- ✅ Visualização de diferenças campo por campo
- ✅ Destaque visual de alterações
- ✅ Exportação de versões específicas

### 1.4 Controle de Edição
- ✅ Lock de edição (evita edições simultâneas)
- ✅ Indicação visual de quem está editando
- ✅ Timeout automático de locks
- ✅ Liberação manual de locks

### 1.5 Operações de Arquivos
- ✅ Copiar arquivos/pastas
- ✅ Mover arquivos/pastas
- ✅ Renomear arquivos/pastas
- ✅ Excluir com confirmação
- ✅ Preview de operações

---

## 2. Estrutura de Dados

### 2.1 Versão (Version)

```typescript
interface Version {
  id: string;                    // ID único da versão
  entityId: string;              // ID da entidade versionada
  entityType: string;            // Tipo: file, page, article, etc.
  versionNumber: number;         // Número sequencial da versão
  data: any;                     // Snapshot completo dos dados
  description: string;           // Descrição da alteração
  author: string;                // Nome do autor
  authorId: string;              // ID do autor
  createdAt: string;            // Data/hora de criação
  changes?: Array<{             // Alterações detectadas
    field: string;              // Campo alterado
    oldValue: any;              // Valor anterior
    newValue: any;              // Novo valor
  }>;
}
```

**Exemplo:**
```json
{
  "id": "version-1728912345678",
  "entityId": "file-123",
  "entityType": "file",
  "versionNumber": 5,
  "data": {
    "name": "relatorio-2024.pdf",
    "path": "/documentos/relatorio-2024.pdf",
    "size": 524288
  },
  "description": "Atualização do relatório anual",
  "author": "João Silva",
  "authorId": "user-1",
  "createdAt": "2025-10-14T15:30:00.000Z",
  "changes": [
    {
      "field": "size",
      "oldValue": 512000,
      "newValue": 524288
    }
  ]
}
```

### 2.2 Lock de Edição (EditLock)

```typescript
interface EditLock {
  entityId: string;              // ID da entidade bloqueada
  entityType: string;            // Tipo da entidade
  userId: string;                // ID do usuário que bloqueou
  userName: string;              // Nome do usuário
  lockedAt: string;             // Quando foi bloqueado
}
```

**Exemplo:**
```json
{
  "entityId": "file-123",
  "entityType": "file",
  "userId": "user-1",
  "userName": "João Silva",
  "lockedAt": "2025-10-14T15:30:00.000Z"
}
```

---

## 3. Uso do Sistema

### 3.1 Criar Nova Versão

```typescript
import { useVersionControl } from '../version/VersionManager';

const { createVersion } = useVersionControl(entityId, 'file', currentUser);

// Criar versão ao salvar alterações
const handleSave = (data: any) => {
  createVersion(data, 'Descrição da alteração');
  // ... salvar dados
};
```

**Fluxo:**
1. Usuário faz alterações
2. Clica em "Salvar"
3. Sistema cria automaticamente uma versão
4. Versão é armazenada no localStorage
5. Usuário recebe confirmação

### 3.2 Visualizar Histórico

**No FileManager:**
1. Clique com botão direito no arquivo
2. Selecione "Histórico"
3. Visualize todas as versões
4. Veja detalhes de cada alteração

**Interface exibe:**
- Número da versão
- Descrição
- Autor
- Data/hora
- Campos alterados
- Status (atual/anterior)

### 3.3 Restaurar Versão

```typescript
const restoreVersion = (version: Version) => {
  // 1. Criar backup da versão atual
  createVersion(currentData, `Backup antes de restaurar v${version.versionNumber}`);
  
  // 2. Restaurar dados da versão selecionada
  updateEntity(version.data);
  
  // 3. Notificar usuário
  toast.success(`Restaurado para versão ${version.versionNumber}`);
};
```

**Passos:**
1. Abra o histórico
2. Selecione a versão desejada
3. Clique em "Restaurar"
4. Confirme a ação
5. Versão atual vira backup
6. Dados são restaurados

### 3.4 Comparar Versões

```typescript
const compareVersions = (v1: Version, v2: Version) => {
  const changes = calculateChanges(v2.data, v1.data);
  // Exibe diferenças lado a lado
};
```

**Interface:**
```
┌─────────────────────────────────────────────┐
│ Versão 5          |  Versão 3               │
├─────────────────────────────────────────────┤
│ Campo: size       |  Campo: size            │
│ Valor: 524288     |  Valor: 512000          │
│                   |                         │
│ Campo: name       |  Campo: name            │
│ Valor: rel...     |  Valor: rel... (igual)  │
└─────────────────────────────────────────────┘
```

### 3.5 Controle de Lock

```typescript
import { useEditLock } from '../version/VersionManager';

const { isLocked, lockedBy, acquireLock, releaseLock } = useEditLock(
  entityId,
  'file',
  currentUser
);

useEffect(() => {
  if (!isLocked) {
    acquireLock(); // Adquirir lock ao abrir
  }
  
  return () => {
    releaseLock(); // Liberar lock ao fechar
  };
}, []);
```

**Comportamento:**
- Lock é criado ao abrir para edição
- Atualizado a cada 5 segundos
- Expira automaticamente após 5 minutos
- Liberado ao fechar/salvar

**Indicação Visual:**
```
🔒 João Silva está editando este arquivo
   (bloqueado há 2 minutos)
```

---

## 4. Operações de Arquivos

### 4.1 Copiar Arquivo/Pasta

```typescript
<CopyFileDialog
  file={selectedFile}
  allFiles={files}
  onComplete={() => {
    // Arquivo copiado com sucesso
    loadFiles();
  }}
  onCancel={() => {
    // Cancelado
  }}
/>
```

**Interface:**
1. Seleciona pasta de destino
2. Define novo nome
3. Preview do caminho final
4. Confirma operação

**Exemplo:**
```
Original:  /documentos/relatorio.pdf
Destino:   /backup/
Novo Nome: relatorio-copia.pdf
Resultado: /backup/relatorio-copia.pdf
```

### 4.2 Mover Arquivo/Pasta

```typescript
<MoveFileDialog
  file={selectedFile}
  allFiles={files}
  onComplete={() => {
    // Arquivo movido
  }}
  onCancel={() => {}}
/>
```

**Diferença para Copiar:**
- Arquivo original é removido
- Apenas localização muda
- Nome pode ser mantido ou alterado

**Exemplo:**
```
De:   /documentos/relatorio.pdf
Para: /arquivo/2024/relatorio.pdf
```

### 4.3 Renomear Arquivo/Pasta

```typescript
<RenameFileDialog
  file={selectedFile}
  allFiles={files}
  onComplete={() => {
    // Renomeado
  }}
  onCancel={() => {}}
/>
```

**Validações:**
- Nome não pode estar vazio
- Não pode ter caracteres especiais perigosos
- Não pode sobrescrever arquivo existente

**Exemplo:**
```
Antes: relatorio.pdf
Depois: relatorio-2024-final.pdf
```

### 4.4 Excluir Arquivo/Pasta

```typescript
<DeleteFileDialog
  file={selectedFile}
  allFiles={files}
  onComplete={() => {
    // Excluído
  }}
  onCancel={() => {}}
/>
```

**Segurança:**
- Confirmação obrigatória
- Para pastas: digitar "EXCLUIR"
- Mostra quantidade de itens afetados
- Aviso de ação irreversível

**Exemplo Pasta:**
```
⚠️ Atenção!
Você está prestes a excluir:
  /documentos/2023

Esta pasta contém 45 itens que também serão excluídos.

Digite "EXCLUIR" para confirmar: ________
```

---

## 5. Integração com Componentes

### 5.1 FileManager

```typescript
// Estado
const [operationFile, setOperationFile] = useState<FileItem | null>(null);
const [operationType, setOperationType] = useState<'copy' | 'move' | 'rename' | 'delete' | 'history' | null>(null);

// Menu de ações
<DropdownMenuItem onClick={() => {
  setOperationFile(item);
  setOperationType('history');
}}>
  <History className="w-4 h-4 mr-2" />
  Histórico
</DropdownMenuItem>

// Dialog de histórico
{operationFile && operationType === 'history' && (
  <VersionManager
    entityId={operationFile.id}
    entityType="file"
    currentData={operationFile}
    currentUser={currentUser}
    onRestore={(version) => {
      // Restaurar
    }}
  />
)}
```

### 5.2 ArticleManager

```typescript
const { createVersion } = useVersionControl(article.id, 'article', currentUser);

const handleSave = () => {
  createVersion(formData, 'Atualização do artigo');
  // ... salvar artigo
};
```

### 5.3 PageManager

```typescript
const handlePublish = () => {
  createVersion(pageData, 'Página publicada');
  // ... publicar página
};
```

---

## 6. Armazenamento

### 6.1 LocalStorage - Versões

```typescript
// Estrutura
{
  "versions": [
    {
      "id": "version-1",
      "entityId": "file-123",
      "entityType": "file",
      "versionNumber": 1,
      "data": {...},
      "description": "Versão inicial",
      "author": "João",
      "authorId": "user-1",
      "createdAt": "2025-10-14T10:00:00.000Z"
    },
    // ... mais versões
  ]
}
```

### 6.2 LocalStorage - Locks

```typescript
{
  "editLocks": [
    {
      "entityId": "file-123",
      "entityType": "file",
      "userId": "user-1",
      "userName": "João Silva",
      "lockedAt": "2025-10-14T15:30:00.000Z"
    },
    // ... mais locks
  ]
}
```

---

## 7. Casos de Uso

### 7.1 Reverter Alteração Acidental

**Cenário:** Usuário editou arquivo errado

```
1. Usuário abre FileManager
2. Localiza arquivo modificado
3. Clica em "Histórico"
4. Vê última versão antes da alteração
5. Clica em "Restaurar"
6. Sistema cria backup da versão atual
7. Restaura dados da versão anterior
8. Arquivo volta ao estado correto
```

### 7.2 Comparar Mudanças

**Cenário:** Verificar o que mudou entre versões

```
1. Abre histórico do arquivo
2. Seleciona "Comparar"
3. Escolhe v5 (atual) e v3 (anterior)
4. Clica em "Comparar"
5. Visualiza diferenças:
   - Campo "size": 512KB → 524KB
   - Campo "name": igual
   - Campo "path": igual
```

### 7.3 Evitar Conflito de Edição

**Cenário:** Dois usuários querem editar simultaneamente

```
Usuário A:
1. Abre arquivo para editar
2. Sistema adquire lock
3. Faz alterações

Usuário B (tenta abrir mesmo arquivo):
4. Sistema detecta lock
5. Mostra aviso:
   "🔒 João Silva está editando este arquivo"
6. Usuário B aguarda ou edita outro arquivo

Usuário A:
7. Salva e fecha
8. Lock é liberado
9. Usuário B pode editar agora
```

### 7.4 Organizar Arquivos

**Cenário:** Reorganizar estrutura de pastas

```
1. Usuário seleciona múltiplos arquivos
2. Clica em "Mover"
3. Seleciona pasta de destino
4. Preview mostra novo caminho
5. Confirma operação
6. Sistema move todos os arquivos
7. Estrutura é reorganizada
```

### 7.5 Backup Antes de Modificar

**Cenário:** Criar backup antes de alteração importante

```
1. Usuário vai fazer alteração crítica
2. Sistema automaticamente:
   - Cria versão da estado atual
   - Descrição: "Backup antes de alterar X"
   - Salva no histórico
3. Usuário faz alterações
4. Se der errado:
   - Pode restaurar backup
   - Sem perda de dados
```

---

## 8. Detecção de Mudanças

### 8.1 Algoritmo

```typescript
const calculateChanges = (oldData: any, newData: any) => {
  const changes = [];
  const keys = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData || {})
  ]);
  
  keys.forEach(key => {
    const oldValue = oldData?.[key];
    const newValue = newData?.[key];
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue,
        newValue
      });
    }
  });
  
  return changes;
};
```

### 8.2 Exemplo de Detecção

**Dados Antigos:**
```json
{
  "name": "relatorio.pdf",
  "size": 512000,
  "path": "/documentos/relatorio.pdf"
}
```

**Dados Novos:**
```json
{
  "name": "relatorio-2024.pdf",
  "size": 524288,
  "path": "/documentos/relatorio-2024.pdf"
}
```

**Mudanças Detectadas:**
```json
[
  {
    "field": "name",
    "oldValue": "relatorio.pdf",
    "newValue": "relatorio-2024.pdf"
  },
  {
    "field": "size",
    "oldValue": 512000,
    "newValue": 524288
  },
  {
    "field": "path",
    "oldValue": "/documentos/relatorio.pdf",
    "newValue": "/documentos/relatorio-2024.pdf"
  }
]
```

---

## 9. Configurações e Limites

### 9.1 Limites de Versionamento

```typescript
const VERSION_LIMITS = {
  maxVersionsPerEntity: 50,      // Máximo de versões por entidade
  autoCleanupAfterDays: 90,      // Limpar versões antigas após 90 dias
  keepMinVersions: 10            // Manter no mínimo 10 versões
};
```

### 9.2 Limites de Lock

```typescript
const LOCK_SETTINGS = {
  lockTimeout: 5,                // Minutos até expirar
  updateInterval: 5000,          // Atualizar a cada 5 segundos
  warningTime: 1                 // Avisar 1 minuto antes de expirar
};
```

### 9.3 Tipos Suportados

```typescript
type SupportedEntityTypes = 
  | 'file'      // Arquivos
  | 'page'      // Páginas
  | 'article'   // Artigos/Matérias
  | 'menu'      // Menus
  | 'list'      // Listas personalizadas
  | 'snippet';  // Snippets
```

---

## 10. Segurança e Validações

### 10.1 Validações de Operações

```typescript
// Copiar
- ✓ Pasta destino existe
- ✓ Nome não está vazio
- ✓ Não sobrescreve arquivo existente
- ✓ Permissões do usuário

// Mover
- ✓ Não mover para dentro de si mesmo (pastas)
- ✓ Destino é válido
- ✓ Não quebra referências

// Renomear
- ✓ Nome válido (sem caracteres perigosos)
- ✓ Não duplica nomes
- ✓ Extensão preservada (para arquivos)

// Excluir
- ✓ Confirmação obrigatória
- ✓ Verificação de dependências
- ✓ Não excluir arquivos bloqueados
```

### 10.2 Proteções

```typescript
// Lock de edição
- Previne edições simultâneas
- Timeout automático
- Liberação em caso de erro

// Versionamento
- Backup automático antes de restaurar
- Histórico preservado
- Não permite perda de dados

// Operações
- Confirmação para ações destrutivas
- Preview antes de executar
- Rollback em caso de erro
```

---

## 11. Performance

### 11.1 Otimizações

```typescript
// Lazy loading de versões
- Carregar apenas versões recentes por padrão
- Carregar mais sob demanda

// Compressão de dados
- Comprimir snapshots grandes
- Armazenar apenas diferenças (deltas)

// Cache
- Cachear versões acessadas recentemente
- Limpar cache periodicamente
```

### 11.2 Limpeza Automática

```typescript
const cleanupOldVersions = () => {
  const versions = getAllVersions();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  
  versions.forEach(group => {
    // Manter últimas 10 versões sempre
    const keep = group.slice(0, 10);
    
    // Das restantes, manter apenas < 90 dias
    const old = group.slice(10).filter(v => 
      new Date(v.createdAt) > cutoffDate
    );
    
    saveVersions([...keep, ...old]);
  });
};
```

---

## 12. Troubleshooting

### Problema: Versões não aparecem
**Solução:** 
- Verifique se createVersion() está sendo chamado
- Verifique localStorage: `versions`
- Limpe cache e recarregue

### Problema: Lock não libera
**Solução:**
- Aguarde 5 minutos (timeout automático)
- Ou limpe manualmente: `localStorage.removeItem('editLocks')`

### Problema: Restauração não funciona
**Solução:**
- Verifique se a versão existe
- Verifique permissões do usuário
- Veja console para erros

### Problema: Comparação mostra tudo diferente
**Solução:**
- Campos podem ter sido renomeados
- Estrutura de dados mudou
- Use Export para analisar JSON

---

## 13. Boas Práticas

### 13.1 Descrições de Versão

✅ **Fazer:**
```
"Correção de erro no cálculo"
"Atualização de dados de 2024"
"Reorganização da estrutura"
```

❌ **Evitar:**
```
"alteração"
"update"
"aaa"
```

### 13.2 Quando Criar Versões

✅ **Criar em:**
- Salvamento de alterações
- Antes de operações destrutivas
- Publicação de conteúdo
- Mudanças significativas

❌ **Não criar em:**
- Cada tecla digitada
- Auto-save muito frequente
- Alterações triviais

### 13.3 Gerenciamento de Locks

✅ **Fazer:**
- Adquirir lock ao abrir
- Liberar lock ao fechar
- Atualizar periodicamente
- Respeitar locks de outros

❌ **Evitar:**
- Manter lock indefinidamente
- Forçar remoção de locks ativos
- Editar sem adquirir lock

---

## 14. Exemplos de Código

### 14.1 Implementação Completa em Componente

```typescript
import { useVersionControl, useEditLock } from '../version/VersionManager';

export function MyComponent() {
  const [data, setData] = useState({});
  const currentUser = { id: '1', name: 'João' };
  
  // Version control
  const { createVersion } = useVersionControl('entity-123', 'file', currentUser);
  
  // Edit lock
  const { isLocked, lockedBy, acquireLock, releaseLock } = useEditLock(
    'entity-123',
    'file',
    currentUser
  );
  
  useEffect(() => {
    acquireLock();
    return () => releaseLock();
  }, []);
  
  const handleSave = () => {
    createVersion(data, 'Descrição da alteração');
    // ... salvar
  };
  
  if (isLocked) {
    return (
      <Alert>
        🔒 {lockedBy.userName} está editando este item
      </Alert>
    );
  }
  
  return (
    // ... componente
  );
}
```

### 14.2 Modal de Histórico

```typescript
{showHistory && (
  <Dialog open={true} onOpenChange={() => setShowHistory(false)}>
    <DialogContent className="max-w-5xl">
      <VersionManager
        entityId={selectedItem.id}
        entityType="file"
        currentData={selectedItem}
        currentUser={currentUser}
        onRestore={(version) => {
          const restored = version.data;
          updateItem(restored);
          setShowHistory(false);
        }}
        onClose={() => setShowHistory(false)}
      />
    </DialogContent>
  </Dialog>
)}
```

---

## 15. Roadmap Futuro

### Funcionalidades Planejadas

- [ ] Versionamento em nuvem (sync com servidor)
- [ ] Branches (ramificações de versões)
- [ ] Merge de versões
- [ ] Diff visual mais avançado
- [ ] Tags em versões importantes
- [ ] Exportação de histórico completo
- [ ] Estatísticas de uso
- [ ] Auditoria completa
- [ ] Permissões granulares
- [ ] API de versionamento

---

## 16. Conclusão

O sistema de controle de versão oferece:

✅ **Segurança:** Backup automático, rollback fácil
✅ **Rastreabilidade:** Histórico completo de alterações
✅ **Colaboração:** Controle de edições simultâneas
✅ **Flexibilidade:** Suporte a múltiplos tipos de entidades
✅ **Usabilidade:** Interface intuitiva e clara
✅ **Confiabilidade:** Validações e proteções robustas

Este sistema garante que nenhuma alteração seja perdida e que todas as modificações sejam rastreáveis e reversíveis, proporcionando segurança e confiança ao gerenciar conteúdo do portal.
