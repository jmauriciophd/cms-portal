# 🌐 Análise de Viabilidade - Sistema Multisites

## 📋 Sumário Executivo

**Status**: ✅ **VIÁVEL** com modificações moderadas  
**Complexidade**: ⭐⭐⭐⭐ (Alta)  
**Tempo Estimado**: 40-60 horas de desenvolvimento  
**Impacto na Estrutura Atual**: Moderado a Alto

---

## 🎯 Conceito de Multisites

Um sistema multisite permite gerenciar múltiplos sites a partir de uma única instalação do CMS, compartilhando:
- Base de código
- Sistema de autenticação
- Recursos (imagens, arquivos)
- Usuários e permissões
- Infraestrutura

Cada site pode ter:
- Conteúdo independente
- Design/temas próprios
- Domínio próprio
- Configurações específicas

---

## ✅ Viabilidade Técnica

### Pontos Fortes do Sistema Atual

1. **Arquitetura Modular** ✅
   - Componentes bem separados
   - Serviços isolados
   - Fácil de estender

2. **Sistema de Armazenamento Flexível** ✅
   - Já usa localStorage com namespace
   - Fácil adicionar prefixo de site
   - StorageQuotaService já implementado

3. **Gestão de Conteúdo Robusta** ✅
   - Páginas hierárquicas
   - Artigos/matérias
   - Biblioteca de mídia
   - Menus configuráveis

4. **Sistema de Permissões RBAC** ✅
   - Já implementado
   - Pode ser estendido para multisites

5. **Separação Frontend/Backend** ✅
   - Componentes reutilizáveis
   - Services desacoplados

### Desafios Identificados

1. **localStorage como Backend** ⚠️
   - Limitação de 10MB por domínio
   - Difícil compartilhar entre sites
   - Não escala bem

2. **Ausência de Backend Real** ⚠️
   - Sem API centralizada
   - Sem banco de dados compartilhado
   - Difícil sincronizar entre sites

3. **Roteamento Atual** ⚠️
   - Baseado em React Router
   - Precisa suportar múltiplos domínios

4. **Gestão de Assets** ⚠️
   - Arquivos atualmente globais
   - Precisa isolamento por site

---

## 🏗️ Arquitetura Proposta

### Modelo 1: Multisite com Namespace (Mais Simples)

```
┌─────────────────────────────────────────┐
│         Portal CMS (Single Install)     │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ Site 1  │  │ Site 2  │  │ Site 3  │ │
│  ├─────────┤  ├─────────┤  ├─────────┤ │
│  │ Pages   │  │ Pages   │  │ Pages   │ │
│  │ Posts   │  │ Posts   │  │ Posts   │ │
│  │ Files   │  │ Files   │  │ Files   │ │
│  │ Menus   │  │ Menus   │  │ Menus   │ │
│  └─────────┘  └─────────┘  └─────────┘ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Shared Resources              │   │
│  │   - Users                       │   │
│  │   - Permissions                 │   │
│  │   - Global Settings             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

localStorage Structure:
- site-1-pages
- site-1-articles
- site-1-files
- site-2-pages
- site-2-articles
- site-2-files
- shared-users
- shared-settings
```

### Modelo 2: Multisite com Supabase (Mais Robusto)

```
┌─────────────────────────────────────────┐
│         Portal CMS (Frontend)           │
└─────────────┬───────────────────────────┘
              │
              │ API Calls
              │
┌─────────────▼───────────────────────────┐
│          Supabase Backend               │
├─────────────────────────────────────────┤
│                                         │
│  Tables:                                │
│  ┌────────────────────┐                 │
│  │ sites              │                 │
│  │ - id, name, domain │                 │
│  │ - settings, theme  │                 │
│  └────────────────────┘                 │
│                                         │
│  ┌────────────────────┐                 │
│  │ pages              │                 │
│  │ - id, site_id      │                 │
│  │ - title, content   │                 │
│  └────────────────────┘                 │
│                                         │
│  ┌────────────────────┐                 │
│  │ media              │                 │
│  │ - id, site_id      │                 │
│  │ - url, metadata    │                 │
│  └────────────────────┘                 │
│                                         │
│  Row Level Security (RLS)               │
│  - Isolamento por site                  │
│  - Permissões granulares                │
└─────────────────────────────────────────┘
```

---

## 🔧 Implementação Detalhada

### Fase 1: Estrutura Base (8-12h)

#### 1.1 Site Management Service

```typescript
// /services/MultisiteService.ts

export interface Site {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  theme: {
    primaryColor: string;
    logo?: string;
    favicon?: string;
  };
  settings: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  createdAt: string;
  updatedAt: string;
}

class MultisiteService {
  private currentSiteId: string | null = null;
  
  // Gestão de sites
  createSite(data: Partial<Site>): Site;
  getSites(): Site[];
  getSiteById(id: string): Site | null;
  updateSite(id: string, data: Partial<Site>): void;
  deleteSite(id: string): void;
  
  // Contexto atual
  setCurrentSite(siteId: string): void;
  getCurrentSite(): Site | null;
  getCurrentSiteId(): string | null;
  
  // Namespace para localStorage
  getStorageKey(key: string): string {
    const siteId = this.getCurrentSiteId();
    return siteId ? `site-${siteId}-${key}` : key;
  }
}
```

#### 1.2 Storage Wrapper

```typescript
// /services/MultisiteStorageService.ts

class MultisiteStorageService {
  constructor(private multisiteService: MultisiteService) {}
  
  setItem(key: string, value: string): void {
    const namespacedKey = this.multisiteService.getStorageKey(key);
    StorageQuotaService.setItem(namespacedKey, value);
  }
  
  getItem(key: string): string | null {
    const namespacedKey = this.multisiteService.getStorageKey(key);
    return localStorage.getItem(namespacedKey);
  }
  
  removeItem(key: string): void {
    const namespacedKey = this.multisiteService.getStorageKey(key);
    localStorage.removeItem(namespacedKey);
  }
}
```

### Fase 2: Componentes de Interface (10-15h)

#### 2.1 Site Switcher

```typescript
// /components/multisite/SiteSwitcher.tsx

export function SiteSwitcher() {
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Globe className="w-4 h-4 mr-2" />
          {currentSite?.name || 'Selecione um site'}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {sites.map(site => (
          <DropdownMenuItem
            key={site.id}
            onClick={() => switchSite(site.id)}
          >
            {site.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={openSiteManager}>
          <Settings className="w-4 h-4 mr-2" />
          Gerenciar Sites
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### 2.2 Site Manager

```typescript
// /components/multisite/SiteManager.tsx

export function SiteManager() {
  const [sites, setSites] = useState<Site[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Gerenciamento de Sites</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Site
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map(site => (
          <Card key={site.id}>
            <CardHeader>
              <CardTitle>{site.name}</CardTitle>
              <CardDescription>{site.domain}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                {site.status}
              </Badge>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">Editar</Button>
                <Button variant="outline" size="sm">Configurar</Button>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Fase 3: Migração de Serviços (12-18h)

#### 3.1 Atualizar Todos os Services

Exemplo com PageManager:

```typescript
// Antes:
const pages = JSON.parse(localStorage.getItem('pages') || '[]');

// Depois:
const pages = JSON.parse(
  multisiteStorage.getItem('pages') || '[]'
);
```

**Arquivos a Modificar**:
- ✅ PageManager.tsx
- ✅ ArticleEditor.tsx
- ✅ FileManager.tsx
- ✅ MenuManager.tsx
- ✅ TemplateManager.tsx
- ✅ SnippetManager.tsx
- ✅ CustomListManager.tsx
- ✅ TaxonomyManager.tsx
- ✅ LinkManager.tsx
- ✅ HierarchicalBuilderDemo.tsx

#### 3.2 Context Provider

```typescript
// /components/multisite/MultisiteContext.tsx

interface MultisiteContextValue {
  currentSite: Site | null;
  sites: Site[];
  switchSite: (siteId: string) => void;
  storage: MultisiteStorageService;
}

export const MultisiteContext = createContext<MultisiteContextValue | null>(null);

export function MultisiteProvider({ children }: { children: React.ReactNode }) {
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  
  const storage = useMemo(
    () => new MultisiteStorageService(multisiteService),
    [currentSite]
  );
  
  return (
    <MultisiteContext.Provider value={{ currentSite, sites, switchSite, storage }}>
      {children}
    </MultisiteContext.Provider>
  );
}

export function useMultisite() {
  const context = useContext(MultisiteContext);
  if (!context) throw new Error('useMultisite must be used within MultisiteProvider');
  return context;
}
```

### Fase 4: Compartilhamento de Recursos (6-10h)

#### 4.1 Biblioteca de Mídia Global

```typescript
// Opção para compartilhar arquivos entre sites
interface MediaSettings {
  shareLibrary: boolean; // Compartilhar biblioteca entre sites
  isolatedFolders: boolean; // Pastas isoladas por site
}

// Se shareLibrary = true:
// - /shared/images/
// - /site-1/images/
// - /site-2/images/
```

#### 4.2 Templates Globais

```typescript
// Templates podem ser:
// - Global (disponível para todos os sites)
// - Site-specific (apenas para um site)

interface Template {
  id: string;
  name: string;
  scope: 'global' | 'site';
  siteId?: string; // Apenas se scope = 'site'
  // ...
}
```

### Fase 5: Roteamento e Domínios (4-8h)

#### 5.1 Detecção Automática de Site

```typescript
// /utils/siteDetection.ts

export function detectSiteFromDomain(): string | null {
  const hostname = window.location.hostname;
  
  // Mapeamento de domínios
  const domainMap: Record<string, string> = {
    'site1.com': 'site-1',
    'site2.com': 'site-2',
    'localhost:3000': 'site-1', // Default para desenvolvimento
  };
  
  return domainMap[hostname] || null;
}

export function detectSiteFromPath(): string | null {
  // URL: /sites/site-1/...
  const match = window.location.pathname.match(/^\/sites\/([^\/]+)/);
  return match ? match[1] : null;
}

// Uso no App.tsx:
useEffect(() => {
  const siteId = detectSiteFromDomain() || detectSiteFromPath() || 'default';
  multisiteService.setCurrentSite(siteId);
}, []);
```

#### 5.2 Rotas Públicas por Site

```typescript
// App.tsx
<Route path="/sites/:siteId" element={<PublicSiteWrapper />}>
  <Route index element={<PublicHome />} />
  <Route path="page/:slug" element={<PublicPage />} />
  <Route path="article/:slug" element={<PublicArticle />} />
</Route>

// PublicSiteWrapper.tsx
function PublicSiteWrapper() {
  const { siteId } = useParams();
  
  useEffect(() => {
    if (siteId) {
      multisiteService.setCurrentSite(siteId);
    }
  }, [siteId]);
  
  return <Outlet />;
}
```

---

## 📊 Impactos na Estrutura Atual

### Arquivos que Precisam Modificação

#### Alta Prioridade (Obrigatórios)
1. **App.tsx** - Adicionar MultisiteProvider
2. **Dashboard.tsx** - Adicionar SiteSwitcher
3. **Todos os Services** - Usar MultisiteStorage
4. **Todos os Managers** - Usar contexto multisite

#### Média Prioridade (Importantes)
1. **PublicSite.tsx** - Suportar múltiplos sites
2. **FileManager.tsx** - Isolamento de arquivos
3. **MenuManager.tsx** - Menus por site
4. **TemplateManager.tsx** - Templates globais/site

#### Baixa Prioridade (Opcionais)
1. **SEOHead.tsx** - Meta tags por site
2. **SecurityMonitor.tsx** - Auditoria por site
3. **DashboardHome.tsx** - Stats por site

### Novos Arquivos Necessários

```
/services/
  MultisiteService.ts          ✨ Novo
  MultisiteStorageService.ts   ✨ Novo

/components/multisite/
  MultisiteContext.tsx          ✨ Novo
  MultisiteProvider.tsx         ✨ Novo
  SiteSwitcher.tsx             ✨ Novo
  SiteManager.tsx              ✨ Novo
  SiteSettings.tsx             ✨ Novo
  SiteCreationWizard.tsx       ✨ Novo

/utils/
  siteDetection.ts             ✨ Novo
  multisiteHelpers.ts          ✨ Novo

/types/
  multisite.ts                 ✨ Novo
```

---

## ⚠️ Limitações e Desafios

### 1. localStorage Limits

**Problema**: 10MB por domínio  
**Solução**:
- Implementar limpeza automática
- Migrar para IndexedDB (100MB+)
- Ou migrar para Supabase (ilimitado)

### 2. Compartilhamento de Recursos

**Problema**: Difícil compartilhar entre sites em localStorage  
**Solução**:
- Duplicar recursos necessários
- Ou implementar "biblioteca global"

### 3. Performance

**Problema**: Carregar múltiplos sites aumenta uso de memória  
**Solução**:
- Lazy loading de sites
- Cache inteligente
- Paginação de conteúdo

### 4. Sincronização

**Problema**: Mudanças em um site não refletem em outros  
**Solução**:
- Eventos customizados
- Recarregar ao trocar de site
- Ou usar backend real

---

## 🎯 Recomendações

### Abordagem Incremental (Recomendada)

#### Fase 1: MVP (2-3 semanas)
- ✅ Criar MultisiteService básico
- ✅ Implementar SiteSwitcher
- ✅ Migrar 3-4 componentes principais
- ✅ Testar com 2 sites

#### Fase 2: Expansão (2-3 semanas)
- ✅ Migrar todos os componentes
- ✅ Implementar compartilhamento de recursos
- ✅ Adicionar Site Manager completo
- ✅ Suporte a domínios customizados

#### Fase 3: Otimização (1-2 semanas)
- ✅ Migrar para IndexedDB ou Supabase
- ✅ Implementar cache
- ✅ Otimizar performance
- ✅ Adicionar analytics por site

### Abordagem Big Bang (Não Recomendada)

❌ Implementar tudo de uma vez
- Alto risco
- Muitos bugs potenciais
- Difícil rollback

---

## 💡 Alternativas

### Opção A: Multisite Completo (Descrito acima)
**Prós**: Gestão unificada, economia de recursos  
**Contras**: Complexidade alta, refatoração massiva

### Opção B: Múltiplas Instalações
**Prós**: Isolamento total, sem modificação  
**Contras**: Manutenção duplicada, custos maiores

### Opção C: Multisite Light (Namespaces apenas)
**Prós**: Implementação simples, baixo impacto  
**Contras**: Funcionalidades limitadas

---

## 📈 Benefícios vs Custos

### Benefícios
- ✅ Gestão centralizada de múltiplos sites
- ✅ Compartilhamento de usuários e permissões
- ✅ Economia de infraestrutura
- ✅ Reutilização de templates e componentes
- ✅ Atualizações simultâneas
- ✅ Analytics consolidado

### Custos
- ⚠️ 40-60 horas de desenvolvimento
- ⚠️ Refatoração de código existente
- ⚠️ Testes extensivos necessários
- ⚠️ Possível migração de dados
- ⚠️ Documentação atualizada
- ⚠️ Treinamento de usuários

---

## 🚀 Roadmap Sugerido

### Sprint 1 (1 semana)
- [ ] Criar MultisiteService
- [ ] Criar MultisiteStorageService
- [ ] Criar MultisiteContext
- [ ] Implementar SiteSwitcher básico

### Sprint 2 (1 semana)
- [ ] Criar SiteManager
- [ ] Migrar PageManager
- [ ] Migrar FileManager
- [ ] Testes básicos

### Sprint 3 (1 semana)
- [ ] Migrar ArticleEditor
- [ ] Migrar MenuManager
- [ ] Migrar TemplateManager
- [ ] Testes de integração

### Sprint 4 (1 semana)
- [ ] Migrar componentes restantes
- [ ] Implementar compartilhamento de recursos
- [ ] Otimizações de performance
- [ ] Documentação

### Sprint 5 (1 semana)
- [ ] Suporte a domínios
- [ ] Site público por site
- [ ] Testes end-to-end
- [ ] Deploy

---

## 📚 Documentação Necessária

1. **Guia de Migração** - Como migrar dados existentes
2. **API Reference** - MultisiteService e relacionados
3. **User Guide** - Como criar e gerenciar sites
4. **Developer Guide** - Como desenvolver para multisite
5. **Troubleshooting** - Problemas comuns

---

## ✅ Conclusão

### Viabilidade: ✅ VIÁVEL

O sistema atual possui uma arquitetura que **permite** a implementação de multisites com modificações moderadas. A abordagem recomendada é:

1. **Usar Namespaces para MVP** (2-3 semanas)
   - Baixo risco
   - Funcionalidade básica
   - Validar conceito

2. **Migrar para Backend Real** (futuro)
   - Supabase ou similar
   - Maior escalabilidade
   - Melhor performance

### Próximos Passos Imediatos

1. ✅ Criar MultisiteService (Fase 1)
2. ✅ Implementar SiteSwitcher
3. ✅ Testar com 2 sites
4. ✅ Coletar feedback
5. ✅ Decidir sobre expansão completa

### ROI Esperado

- **Desenvolvimento**: 40-60 horas
- **Benefício**: Gestão de N sites com 1 instalação
- **Break-even**: A partir de 3+ sites
- **Recomendação**: ⭐⭐⭐⭐ (4/5)

---

**Documento preparado em**: 18/10/2025  
**Versão**: 1.0  
**Status**: Análise Completa  
**Próxima Revisão**: Após implementação do MVP
