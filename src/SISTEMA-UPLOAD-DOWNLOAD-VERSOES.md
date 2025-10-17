# 📦 Sistema de Upload/Download e Versionamento de Páginas

## 📋 Visão Geral

Sistema completo de gerenciamento de páginas com funcionalidades avançadas de importação, exportação e controle de versões. Implementado com segurança robusta, validações completas e interface intuitiva.

## ✨ Funcionalidades Implementadas

### 1. **Download/Exportação de Páginas** 📥
- Exportação de páginas individuais em formato JSON
- Exportação em lote de múltiplas páginas
- Metadados completos incluídos (versão, autor, checksum)
- Formato de arquivo padronizado e documentado
- Nome de arquivo seguro e descritivo

### 2. **Upload/Importação de Páginas** 📤
- Importação via drag & drop ou seleção de arquivo
- Validação rigorosa de formato e estrutura
- Detecção automática de conflitos
- Diálogo de confirmação para sobrescrita
- Sanitização completa de dados

### 3. **Controle de Versões** 🔄
- Versionamento automático em cada salvamento
- Histórico completo com até 50 versões por página
- Comparação visual entre versões
- Restauração de qualquer versão anterior
- Exclusão seletiva de versões antigas

### 4. **Histórico Visual** 📊
- Interface moderna e intuitiva
- Timeline de alterações
- Detalhes completos de cada versão
- Estatísticas de uso e tamanho
- Busca e filtros de versões

## 🏗️ Arquitetura do Sistema

### Componentes Principais

```
/services/
  └── PageVersionService.ts          # Serviço central de versionamento

/components/pages/
  ├── PageManager.tsx                 # Gerenciador principal (atualizado)
  ├── PageUploadDialog.tsx            # Dialog de upload
  └── PageVersionHistory.tsx          # Histórico de versões

/components/common/
  └── ContextMenu.tsx                 # Menu atualizado com download
```

### Fluxo de Dados

```
┌─────────────────────────┐
│   PageManager (UI)      │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│  PageVersionService     │ ← Serviço Central
└───────────┬─────────────┘
            │
            ├─→ localStorage (pages)
            ├─→ localStorage (page_versions)
            ├─→ AuditService
            └─→ SecurityService
```

## 📖 Guia de Uso

### 🔽 Baixar uma Página

**Método 1: Menu de Contexto**
1. Botão direito na página
2. Clicar em "Baixar"
3. Arquivo `.json` será baixado automaticamente

**Método 2: Menu Dropdown**
1. Clicar nos 3 pontos (⋮) na página
2. Selecionar "Baixar"
3. Arquivo será exportado

**Formato do Arquivo Exportado:**
```json
{
  "version": "1.0.0",
  "exportedAt": "2025-10-17T10:30:00.000Z",
  "exportedBy": "João Silva",
  "page": {
    "id": "page_123",
    "title": "Minha Página",
    "slug": "minha-pagina",
    "content": "<h1>...</h1>",
    "status": "published",
    "createdAt": "2025-10-15T10:00:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z",
    ...
  },
  "metadata": {
    "originalId": "page_123",
    "versionNumber": 5,
    "checksum": "a3b2c1d4"
  }
}
```

### 🔼 Fazer Upload de uma Página

**Passo 1:** Clicar no botão "Importar" na toolbar

**Passo 2:** Arrastar arquivo `.json` ou clicar para selecionar

**Passo 3:** Aguardar processamento e validação

**Casos Possíveis:**

#### ✅ Caso 1: Página Nova (Sem Conflito)
```
1. Arquivo é validado
2. Dados são sanitizados
3. Nova página é criada
4. Versão inicial é gerada
5. Sucesso! ✓
```

#### ⚠️ Caso 2: Conflito Detectado (Slug Existente)
```
1. Arquivo é validado
2. Conflito detectado
3. Dialog de confirmação aparece
4. Usuário escolhe:
   a) Cancelar → Nada acontece
   b) Substituir → Continua no Caso 3
```

#### 🔄 Caso 3: Sobrescrita de Página Existente
```
1. Versão atual é salva no histórico (backup)
2. Conteúdo é substituído pelo importado
3. Nova versão é criada
4. Registro de auditoria
5. Sucesso! ✓
```

### 📜 Visualizar Histórico de Versões

**Abrir Histórico:**
1. Botão direito na página
2. Clicar em "Histórico"
3. Dialog com histórico completo abre

**Interface do Histórico:**

```
┌─────────────────────────────────────────┐
│  Histórico de Versões                   │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ v5 ● ATUAL                      │   │
│  │ Atualização manual              │   │
│  │ 👤 João Silva                   │   │
│  │ 🕐 2h atrás                     │   │
│  │ 3 campos alterados: title, ...  │   │
│  │                                 │   │
│  │ [Ver Detalhes] [Exportar]      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ v4                              │   │
│  │ Restaurado da versão 2          │   │
│  │ 👤 Maria Santos                 │   │
│  │ 1 dia atrás                     │   │
│  │ 5 campos alterados              │   │
│  │                                 │   │
│  │ [Ver] [Restaurar] [Exportar] [🗑]│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ...mais versões                        │
│                                         │
└─────────────────────────────────────────┘
```

### 🔄 Restaurar Versão Anterior

**Passo 1:** Abrir histórico de versões

**Passo 2:** Localizar versão desejada

**Passo 3:** Clicar em "Restaurar"

**Passo 4:** Confirmar ação

**O que acontece:**
```
1. Backup da versão atual é criado
2. Dados da versão selecionada são restaurados
3. Nova versão é gerada (marcada como restauração)
4. Página é atualizada
5. Auditoria registra a operação
```

### 🔍 Comparar Versões

**Passo 1:** Abrir histórico → Aba "Comparar"

**Passo 2:** Selecionar duas versões nos dropdowns

**Passo 3:** Clicar em "Comparar"

**Interface de Comparação:**

```
┌─────────────────────────────────────────────────────┐
│  Comparação: v5 vs v3                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────┬───────────────────┐         │
│  │ v5               │ v3               │         │
│  │ João Silva       │ Maria Santos     │         │
│  │ 17/10/2025 10:30│ 15/10/2025 14:20│         │
│  └───────────────────┴───────────────────┘         │
│                                                     │
│  Diferenças Detectadas:                            │
│                                                     │
│  ┌─────────────────────────────────────┐           │
│  │ Campo: title                        │           │
│  ├──────────────┬──────────────────────┤           │
│  │ v3:         │ v5:                  │           │
│  │ "Título"    │ "Novo Título"        │           │
│  └──────────────┴──────────────────────┘           │
│                                                     │
│  ┌─────────────────────────────────────┐           │
│  │ Campo: content                      │           │
│  ├──────────────┬──────────────────────┤           │
│  │ v3: <h1>... │ v5: <h1>...         │           │
│  └──────────────┴──────────────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 🗑️ Deletar Versão

**Requisitos:**
- ✅ Não pode ser a versão atual
- ✅ Deve manter pelo menos 2 versões
- ✅ Usuário deve ter permissão

**Processo:**
1. Abrir histórico
2. Localizar versão
3. Clicar no botão de lixeira
4. Confirmar exclusão
5. Versão é removida permanentemente

## 🔒 Segurança e Validações

### Validações de Upload

```javascript
// 1. Validação de Formato
✓ Arquivo deve ser .json
✓ Tamanho máximo: 10MB
✓ Estrutura JSON válida

// 2. Validação de Dados
✓ title (obrigatório, string)
✓ slug (obrigatório, string)
✓ content (obrigatório, string)
✓ status (draft | published | scheduled)

// 3. Sanitização
✓ Remoção de scripts maliciosos
✓ Normalização de slug
✓ Escape de caracteres especiais
```

### Proteções Implementadas

1. **Sanitização de Entrada**
   - Remoção de tags `<script>`
   - Normalização de slugs
   - Validação de tipos

2. **Controle de Versões**
   - Limite máximo de 50 versões
   - Limpeza automática de versões antigas
   - Checksums para integridade

3. **Auditoria Completa**
   - Log de todas as operações
   - Registro de autoria
   - Rastreamento de mudanças

4. **Backup Automático**
   - Backup antes de restaurações
   - Backup antes de sobrescritas
   - Impossível perder dados

## 📊 Estrutura de Dados

### PageData
```typescript
interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  folder?: string;
  template?: string;
  meta?: {
    robots?: string;
    description?: string;
    keywords?: string;
  };
  author?: string;
  authorId?: string;
}
```

### PageVersion
```typescript
interface PageVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  data: PageData;              // Snapshot completo
  description: string;
  author: string;
  authorId: string;
  createdAt: string;
  fileSize: number;
  checksum: string;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}
```

### PageExport
```typescript
interface PageExport {
  version: string;             // Versão do formato (1.0.0)
  exportedAt: string;
  exportedBy: string;
  page: PageData;
  metadata: {
    originalId: string;
    versionNumber: number;
    checksum: string;
  };
}
```

## 🎯 Casos de Uso Reais

### Caso 1: Migração de Páginas entre Ambientes

```bash
# Desenvolvimento → Produção

1. Ambiente DEV:
   - Criar e testar página
   - Quando aprovada: Baixar página
   
2. Ambiente PROD:
   - Fazer upload da página
   - Se conflito: Substituir (backup automático)
   - Verificar no histórico
```

### Caso 2: Backup Manual Importante

```bash
1. Antes de edição importante:
   - Abrir página
   - Baixar versão atual
   - Guardar arquivo em local seguro
   
2. Fazer edições

3. Se algo der errado:
   - Upload do arquivo de backup
   - OU restaurar do histórico
```

### Caso 3: Recuperação de Conteúdo Deletado

```bash
1. Página foi deletada acidentalmente
2. Restaurar da lixeira (se recente)
3. OU:
   - Ter arquivo de backup exportado
   - Fazer upload do arquivo
   - Página é recriada
```

### Caso 4: Colaboração em Equipe

```bash
Usuário A:
1. Edita página
2. Exporta versão
3. Envia arquivo para Usuário B

Usuário B:
1. Recebe arquivo
2. Faz upload (cria nova versão)
3. Revisa alterações no histórico
4. Faz suas edições
5. Exporta e retorna para A
```

### Caso 5: Auditoria e Compliance

```bash
1. Rastrear quem fez alterações
   - Abrir histórico
   - Ver autor, data/hora de cada versão
   
2. Ver o que mudou
   - Comparar versões
   - Ver diff campo por campo
   
3. Exportar evidências
   - Baixar versões específicas
   - Documentar mudanças
```

## ⚙️ API do PageVersionService

### Exportação

```typescript
// Exportar página individual
PageVersionService.exportPage(pageId: string): void

// Exportar múltiplas páginas
PageVersionService.exportPages(pageIds: string[]): void
```

### Importação

```typescript
// Upload simples
const result = await PageVersionService.uploadPage(file: File): Promise<UploadResult>

// Upload com substituição
const result = await PageVersionService.uploadPageWithReplace(
  file: File,
  replaceExisting: boolean,
  existingPageId?: string
): Promise<UploadResult>
```

### Versionamento

```typescript
// Criar versão
const version = PageVersionService.createVersion(
  pageId: string,
  description: string
): PageVersion

// Obter histórico
const history = PageVersionService.getVersionHistory(
  pageId: string
): VersionHistoryEntry[]

// Restaurar versão
const result = PageVersionService.restoreVersion(
  pageId: string,
  versionId: string
): { page: PageData; newVersion: PageVersion }

// Deletar versão
const success = PageVersionService.deleteVersion(
  versionId: string
): boolean

// Comparar versões
const changes = PageVersionService.compareVersions(
  versionId1: string,
  versionId2: string
): Array<{ field: string; oldValue: any; newValue: any }>
```

### Utilitários

```typescript
// Estatísticas
const stats = PageVersionService.getStatistics(): {
  totalPages: number;
  totalVersions: number;
  averageVersionsPerPage: number;
  totalSize: number;
}

// Limpeza de versões antigas
const removed = PageVersionService.cleanOldVersions(
  keepLast: number = 10
): number
```

## 🔧 Configurações

### Limites Padrão

```typescript
const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,    // 10MB
  MAX_VERSIONS_PER_PAGE: 50,           // 50 versões
  CACHE_DURATION: 5 * 60 * 1000,       // 5 minutos
  EXPORT_VERSION: '1.0.0'              // Versão do formato
};
```

### Formato de Arquivo

- **Extensão:** `.json`
- **Encoding:** UTF-8
- **Formato:** JSON indentado (2 espaços)
- **Nome:** `page-{slug}-{data}.json`

## 📈 Estatísticas e Monitoramento

### Logs de Auditoria

Todas as operações geram logs:

```javascript
// Exemplos de eventos registrados:
- page_exported
- page_imported
- page_replaced_import
- page_version_created
- page_version_restored
- page_version_deleted
- versions_cleaned
```

### Métricas Disponíveis

```javascript
const stats = PageVersionService.getStatistics();
// {
//   totalPages: 45,
//   totalVersions: 230,
//   averageVersionsPerPage: 5.1,
//   totalSize: 4582912  // bytes
// }
```

## 🎓 Melhores Práticas

### ✅ Fazer

1. **Exportar regularmente páginas importantes**
   - Criar backups antes de mudanças grandes
   - Guardar arquivos em local seguro

2. **Usar descrições claras nas versões**
   - "Correção de typo no parágrafo 3"
   - "Adição de nova seção sobre produtos"

3. **Revisar histórico periodicamente**
   - Limpar versões antigas desnecessárias
   - Manter apenas versões relevantes

4. **Testar uploads em ambiente de desenvolvimento**
   - Validar formato antes de produção
   - Verificar conflitos potenciais

### ❌ Evitar

1. **Não confiar apenas em versões automáticas**
   - Fazer backups manuais importantes
   - Exportar antes de operações críticas

2. **Não deletar todas as versões antigas**
   - Manter pelo menos últimas 10
   - Versões importantes devem ser exportadas

3. **Não ignorar avisos de conflito**
   - Ler atentamente antes de substituir
   - Verificar se é realmente necessário

4. **Não fazer upload de arquivos não confiáveis**
   - Validar origem do arquivo
   - Verificar conteúdo antes de importar

## 🐛 Troubleshooting

### Erro: "Formato de arquivo inválido"
**Causa:** Arquivo não é JSON válido
**Solução:** Verificar se arquivo foi corrompido, baixar novamente

### Erro: "Arquivo muito grande"
**Causa:** Arquivo excede 10MB
**Solução:** Reduzir tamanho do conteúdo ou imagens

### Erro: "Campo obrigatório ausente"
**Causa:** Arquivo JSON não contém campos necessários
**Solução:** Verificar estrutura, usar template correto

### Erro: "Não é possível deletar versão atual"
**Causa:** Tentando deletar a versão em uso
**Solução:** Deletar apenas versões antigas

### Erro: "Deve manter pelo menos 2 versões"
**Causa:** Tentando deletar quando só há 2 versões
**Solução:** Criar nova versão antes de deletar

## 📝 Notas de Desenvolvimento

### Compatibilidade com Sistema Existente

- ✅ Não modifica estrutura de dados existente
- ✅ Adiciona apenas novos campos opcionais
- ✅ Mantém retrocompatibilidade
- ✅ Integração não-invasiva

### Extensibilidade

O sistema foi projetado para ser facilmente extensível:

```typescript
// Adicionar novos formatos de exportação
// Adicionar novos validadores
// Adicionar novos tipos de metadados
// Personalizar limites por tipo de usuário
```

## 🎉 Conclusão

O Sistema de Upload/Download e Versionamento de Páginas é uma solução completa, segura e escalável que adiciona funcionalidades enterprise ao CMS sem comprometer o sistema existente.

**Principais Benefícios:**
- ✅ Segurança de dados com backups automáticos
- ✅ Rastreabilidade completa de mudanças
- ✅ Flexibilidade para migração e colaboração
- ✅ Interface intuitiva e fácil de usar
- ✅ Auditoria completa para compliance

---

**Desenvolvido com ❤️ para o Portal CMS**
**Versão: 1.0.0**
**Data: Outubro 2025**
