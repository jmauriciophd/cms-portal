# Conexão entre Templates e Criação de Páginas - CORRIGIDA ✅

## Problema Identificado

Os templates criados no **TemplateManager** não estavam aparecendo como opções no dropdown de seleção de template durante a criação/edição de páginas. O dropdown tinha valores hardcoded:
- Padrão
- Largura Total  
- Sidebar Esquerda
- Sidebar Direita

## Solução Implementada

### 1. PageEditor.tsx - Correções Aplicadas

**Importações Adicionadas:**
```typescript
import type { Template } from '../templates/TemplateManager';
```

**Estado Adicionado:**
```typescript
const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
```

**useEffect para Carregar Templates:**
```typescript
useEffect(() => {
  const loadTemplates = () => {
    const stored = localStorage.getItem('templates');
    if (stored) {
      try {
        const allTemplates: Template[] = JSON.parse(stored);
        // Filtrar apenas templates do tipo 'page'
        const pageTemplates = allTemplates.filter(t => t.type === 'page');
        setAvailableTemplates(pageTemplates);
      } catch (error) {
        console.error('Erro ao carregar templates:', error);
      }
    }
  };

  loadTemplates();

  // Listener para atualizar quando templates mudarem
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'templates') {
      loadTemplates();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

**Dropdown Atualizado:**
```typescript
<Select
  value={formData.template || 'default'}
  onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="default">Padrão</SelectItem>
    {availableTemplates.map((template) => (
      <SelectItem key={template.id} value={template.id}>
        {template.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Descrição do Template Selecionado:**
```typescript
{formData.template && formData.template !== 'default' && (
  <p className="text-xs text-gray-500 mt-2">
    {availableTemplates.find(t => t.id === formData.template)?.description || 'Template selecionado'}
  </p>
)}
```

## Como Funciona Agora

### 1. Criação de Templates (TemplateManager)

1. Acesse a aba **"Templates"** no menu lateral
2. Clique em **"Novo Template"**
3. Defina:
   - Nome do template
   - Descrição
   - **Tipo: Página** (importante!)
4. Crie o layout usando o editor visual
5. Salve o template

O template fica armazenado no `localStorage` com a chave `templates`.

### 2. Uso dos Templates (PageEditor)

1. Acesse **"Páginas"** → **"Nova Página"** ou edite uma existente
2. Na sidebar direita, aba **"Publicação"**
3. No campo **"TEMPLATE"**, agora aparecerão:
   - **Padrão** (opção default)
   - Todos os templates do tipo 'page' criados no TemplateManager

4. Ao selecionar um template:
   - O ID do template é salvo no campo `template` da página
   - A descrição do template aparece abaixo do dropdown
   - O template pode ser aplicado para definir a estrutura da página

### 3. Atualização em Tempo Real

- Se você criar um novo template em outra aba, o listener de Storage Events detecta e atualiza a lista automaticamente
- Não precisa recarregar a página

## Templates Padrão Disponíveis

O sistema já vem com templates pré-configurados do tipo 'page':

1. **Landing Page**
   - Página de destino completa
   - Hero section + Grid de recursos
   
2. **Página Sobre**
   - Página institucional
   - Layout com imagem e texto lado a lado

## Tipos de Templates

O TemplateManager suporta 5 tipos:

- **page**: Templates para páginas (aparecem no PageEditor)
- **article**: Templates para artigos (aparecem no ArticleEditor via UnifiedEditor)
- **header**: Templates de cabeçalho (estrutura fixa)
- **footer**: Templates de rodapé (estrutura fixa)
- **custom**: Templates personalizados

## Integração com UnifiedEditor (Artigos)

Os artigos **JÁ ESTAVAM CORRETAMENTE INTEGRADOS** através do **UnifiedEditor**:

### Fluxo de Artigos:
```
ArticleManager → UnifiedEditor → TemplateSelector → TemplateManager
```

**Como funciona:**
1. Ao criar/editar um artigo no **ArticleManager**, o sistema abre o **UnifiedEditor**
2. O UnifiedEditor automaticamente exibe o **TemplateSelector** quando não há conteúdo inicial
3. O TemplateSelector carrega templates do tipo **'article'** do TemplateManager
4. Ao selecionar um template, seus componentes são aplicados automaticamente
5. O usuário pode então editar e personalizar o conteúdo

**Código relevante (ArticleManager.tsx, linha 305):**
```typescript
<UnifiedEditor
  type="article"  // Define que deve buscar templates de artigo
  initialTitle={editingArticle?.title || ''}
  initialSlug={editingArticle?.slug || ''}
  initialComponents={editingArticle?.components || []}
  // ... outras props
/>
```

### Diferenças entre Páginas e Artigos

| Aspecto | Páginas | Artigos |
|---------|---------|---------|
| Editor | PageEditor (simples) | UnifiedEditor (avançado) |
| Template Selector | Dropdown na sidebar | Modal automático ao criar |
| Aplicação do Template | Manual (seleciona ID) | Automática (aplica componentes) |
| Tipos de Template | 'page' | 'article' |
| Quando Aparece | Sidebar direita, aba Publicação | Ao criar novo artigo vazio |

## Melhorias Futuras Possíveis

### 1. Aplicação Automática do Template no PageEditor
Atualmente, o PageEditor apenas salva o ID do template selecionado no campo `template` da página. Uma melhoria seria aplicar automaticamente os componentes do template, similar ao que o UnifiedEditor faz:

```typescript
const handleTemplateChange = (templateId: string) => {
  if (templateId !== 'default') {
    const template = availableTemplates.find(t => t.id === templateId);
    if (template && template.components) {
      // Aplicar componentes do template à página
      setFormData(prev => ({
        ...prev,
        template: templateId,
        // Potencialmente adicionar/sobrescrever components
      }));
      toast.success(`Template "${template.name}" aplicado!`);
    }
  } else {
    setFormData(prev => ({ ...prev, template: templateId }));
  }
};
```

**Nota:** Isso exigiria que o PageEditor suportasse um sistema de componentes visual similar ao UnifiedEditor.

### 2. Preview Visual do Template
Mostrar miniatura ou preview do template no dropdown:

```typescript
<SelectContent>
  <SelectItem value="default">
    <div className="flex items-center gap-2">
      <FileText className="w-4 h-4" />
      <span>Padrão</span>
    </div>
  </SelectItem>
  {availableTemplates.map((template) => (
    <SelectItem key={template.id} value={template.id}>
      <div className="flex items-center gap-2">
        {template.thumbnail && (
          <img src={template.thumbnail} className="w-8 h-8 rounded" />
        )}
        <div>
          <div>{template.name}</div>
          <div className="text-xs text-gray-500">{template.components.length} componentes</div>
        </div>
      </div>
    </SelectItem>
  ))}
</SelectContent>
```

### 3. Botão "Aplicar Template"
Adicionar botão separado para aplicar o template apenas quando o usuário quiser:

```typescript
<div className="flex gap-2 mt-2">
  <Button
    variant="outline"
    size="sm"
    onClick={() => applySelectedTemplate()}
    disabled={!formData.template || formData.template === 'default'}
  >
    <Layout className="w-4 h-4 mr-2" />
    Aplicar Template
  </Button>
</div>
```

### 4. Categorização Avançada
Adicionar sub-categorias aos templates:
- Páginas → Landing Pages, Institucionais, E-commerce, Blog
- Artigos → Notícias, Tutoriais, Reviews, Entrevistas

### 5. Importação/Exportação de Templates
Compartilhar templates entre instalações do CMS

## Arquivos Modificados

- ✅ `/components/pages/PageEditor.tsx` - Conectado ao TemplateManager
- ✅ `/components/templates/TemplateManager.tsx` - Sistema já existente
- ✅ `/components/editor/UnifiedEditor.tsx` - Já utilizava TemplateSelector
- ✅ `/components/editor/TemplateSelector.tsx` - Já integrado

## Testando a Funcionalidade

### Teste 1: Criar Template de Página
1. Acesse **Templates** no menu lateral
2. Clique em **"Novo Template"**
3. Preencha:
   - **Nome**: "Página de Serviços"
   - **Descrição**: "Template para páginas de apresentação de serviços"
   - **Tipo**: Selecione **"Página"** (importante!)
4. Clique em **"Criar Template"**
5. No editor visual, adicione alguns componentes:
   - Hero Section
   - Grid com cards de serviços
   - Call to Action
6. Clique em **"Salvar Template"**

### Teste 2: Usar Template em Nova Página
1. Acesse **Páginas** no menu lateral
2. Clique em **"Nova Página"**
3. Preencha:
   - **Título**: "Nossos Serviços"
   - **Slug**: Gerado automaticamente como "nossos-servicos"
4. Na **sidebar direita**, aba **"Publicação"**
5. No campo **"TEMPLATE"**, você deve ver:
   - ✅ **Padrão** (opção default)
   - ✅ **Página de Serviços** (o template que você criou)
6. Selecione **"Página de Serviços"**
7. ✅ A descrição "Template para páginas de apresentação de serviços" aparece abaixo
8. Salve a página

### Teste 3: Verificar Templates de Artigo
1. Acesse **Matérias** no menu lateral
2. Clique em **"Nova Matéria"**
3. Um modal de **seleção de templates** deve aparecer automaticamente
4. Você deve ver templates do tipo **'article'** disponíveis:
   - ✅ Artigo Básico
   - ✅ Artigo Destaque
   - ✅ Artigo Multimídia (se foi criado)
5. Selecione um template
6. ✅ Os componentes do template são aplicados automaticamente
7. Você pode editar e personalizar o conteúdo

### Teste 4: Atualização em Tempo Real
1. Abra duas abas do navegador
2. **Aba 1**: Abra **Páginas → Nova Página** (deixe aberta no dropdown de templates)
3. **Aba 2**: Acesse **Templates → Novo Template**
4. Crie um novo template do tipo **Página**:
   - Nome: "Landing Page Promocional"
   - Tipo: Página
5. Salve o template na **Aba 2**
6. Volte para a **Aba 1**
7. ✅ O novo template **"Landing Page Promocional"** deve aparecer na lista
   - Se não aparecer, recarregue a página (o listener de Storage Events funciona entre abas diferentes)

### Teste 5: Edição de Página com Template
1. Crie uma página com template aplicado
2. Salve a página
3. Edite a página novamente
4. ✅ O template selecionado anteriormente deve estar selecionado no dropdown
5. ✅ A descrição do template deve ser exibida

## Troubleshooting

### Problema: Templates não aparecem no dropdown

**Causa 1**: Templates foram criados com tipo errado
- **Solução**: Verifique no TemplateManager se o template tem `type: 'page'`
- Apenas templates do tipo 'page' aparecem no PageEditor

**Causa 2**: localStorage vazio
- **Solução**: Crie ao menos um template de página no TemplateManager
- Os templates padrão são criados automaticamente na primeira vez

**Causa 3**: Erro no localStorage
- **Solução**: Abra o Console do navegador (F12)
- Execute: `localStorage.getItem('templates')`
- Verifique se há dados válidos em JSON

### Problema: Descrição do template não aparece

**Causa**: Template não tem campo `description`
- **Solução**: Edite o template no TemplateManager e adicione uma descrição

### Problema: Template selecionado não é aplicado à página

**Comportamento Esperado**: Atualmente, o PageEditor apenas salva o ID do template selecionado no campo `template` da página. Ele NÃO aplica automaticamente os componentes do template.

**Motivo**: O PageEditor usa um editor de rich text simples, não um editor visual de componentes como o UnifiedEditor.

**Solução Atual**: Use o campo `template` para referência e organização. Para aplicar templates visualmente, use:
- **Artigos**: Já aplicam templates automaticamente via UnifiedEditor
- **Páginas**: Considere migrar para o UnifiedEditor ou PageBuilder para suporte a templates visuais

### Problema: Novo template criado não aparece em página já aberta

**Causa**: A página foi aberta antes do template ser criado
- **Solução 1**: Recarregue a página do PageEditor
- **Solução 2**: Abra/feche o editor novamente
- **Nota**: O listener de Storage Events funciona melhor entre abas diferentes

### Debug: Verificar templates carregados

Execute no Console do navegador:

```javascript
// Ver todos os templates
console.log(JSON.parse(localStorage.getItem('templates')));

// Ver apenas templates de página
const templates = JSON.parse(localStorage.getItem('templates'));
console.log(templates.filter(t => t.type === 'page'));

// Contar templates por tipo
const templates = JSON.parse(localStorage.getItem('templates'));
const counts = templates.reduce((acc, t) => {
  acc[t.type] = (acc[t.type] || 0) + 1;
  return acc;
}, {});
console.log('Templates por tipo:', counts);
```

## Estrutura de Dados

### Template no localStorage

```json
{
  "id": "template-page-landing",
  "name": "Landing Page",
  "description": "Página de destino completa",
  "type": "page",
  "locked": false,
  "category": "content",
  "components": [
    {
      "id": "comp-1",
      "type": "hero",
      "props": { "title": "Bem-vindo" },
      "styles": {}
    }
  ],
  "createdAt": "2025-10-17T...",
  "updatedAt": "2025-10-17T..."
}
```

### Página com Template

```json
{
  "id": "page-123",
  "title": "Minha Página",
  "slug": "minha-pagina",
  "content": "<p>Conteúdo...</p>",
  "template": "template-page-landing",
  "status": "published",
  "createdAt": "2025-10-17T...",
  "updatedAt": "2025-10-17T..."
}
```

---

**Status**: ✅ Implementado e Funcionando
**Data**: 17/10/2025
**Componentes Atualizados**: 1 arquivo (`/components/pages/PageEditor.tsx`)
**Impacto**: Sistema de templates agora totalmente conectado ao fluxo de criação de páginas
**Compatibilidade**: Funciona com templates existentes criados no TemplateManager
**Próxima Sugestão**: Migrar PageEditor para usar sistema visual de componentes (UnifiedEditor/PageBuilder)
