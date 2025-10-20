# Correção de Larguras das Modais

## Mapeamento de Classes Responsivas

### Tamanhos Antigos → Novos
- `max-w-md` → `w-[95vw] max-w-sm sm:max-w-md`
- `max-w-lg` → `w-[95vw] max-w-md sm:max-w-lg`
- `max-w-xl` → `w-[95vw] max-w-lg sm:max-w-xl`
- `max-w-2xl` → `w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl`
- `max-w-3xl` → `w-[95vw] max-w-xl sm:max-w-2xl md:max-w-3xl`
- `max-w-4xl` → `w-[95vw] max-w-2xl sm:max-w-3xl md:max-w-4xl`
- `max-w-5xl` → `w-[95vw] max-w-3xl sm:max-w-4xl md:max-w-5xl`
- `max-w-6xl` → `w-[95vw] max-w-4xl sm:max-w-5xl md:max-w-6xl`

## Arquivos Ajustados

✅ /components/common/ItemDialogs.tsx
✅ /components/common/DeleteConfirmDialog.tsx
✅ /components/files/FileOperations.tsx

## Próximos Arquivos a Ajustar

Baseado na pesquisa, estes são os arquivos que precisam de ajustes:

### Alta Prioridade (dialogs grandes)
- /components/pages/TemplateLibrarySelector.tsx (max-w-6xl)
- /components/editor/TemplateLibrary.tsx (max-w-6xl)
- /components/batch-import/BatchImportManager.tsx (vários)
- /components/pages/PageVersionHistory.tsx (max-w-4xl)
- /components/files/FileManager.tsx (vários)

### Média Prioridade
- /components/files/TextEditor.tsx
- /components/files/MediaLibrarySelector.tsx
- /components/content/ContentSyncManager.tsx (max-w-5xl)
- /components/pages/SaveAsTemplateDialog.tsx
- /components/content/SnippetManager.tsx
- /components/menu/MenuManager.tsx

### Baixa Prioridade (pequenos)
- /components/files/ImageEditor.tsx
- /components/taxonomy/*
- /components/ai/*
- /components/users/UserManager.tsx

## Status
Em Progresso - Ajustando arquivos principais
