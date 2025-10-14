# Documentação - Sistema de Rotas

## Visão Geral

O Portal CMS utiliza **React Router DOM** para gerenciar navegação entre diferentes áreas do sistema.

---

## 🌐 Rotas Disponíveis

### 1. **Rota Pública** - `/`

**URL:** `http://localhost:5173/` ou `https://seu-dominio.com/`

**Descrição:** Site público para visitantes

**Características:**
- ✅ Acessível sem login
- ✅ Mostra notícias publicadas
- ✅ Mostra páginas públicas
- ✅ Menu de navegação
- ✅ Busca de notícias
- ❌ **SEM** botão "Área Administrativa"
- ❌ **SEM** botão de login

**Conteúdo:**
```
- Header com logo
- Menu lateral
- Últimas notícias em grid
- Rodapé
```

---

### 2. **Rota de Login** - `/login`

**URL:** `http://localhost:5173/login` ou `https://seu-dominio.com/login`

**Descrição:** Tela de autenticação para administradores e editores

**Características:**
- ✅ Acesso direto via URL
- ✅ Formulário de login
- ✅ Validação de credenciais
- ✅ Autenticação 2FA (se configurado)
- ✅ Redirecionamento automático após login

**Comportamento:**
```typescript
// Se usuário já está autenticado
if (localStorage.getItem('authToken')) {
  navigate('/admin'); // Redireciona para dashboard
}

// Após login bem-sucedido
onLogin(user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem('authToken', token);
  navigate('/admin');
}
```

**Credenciais Padrão:**
```
Administrador:
  Email: admin@portal.com
  Senha: admin123

Editor:
  Email: editor@portal.com
  Senha: editor123
```

---

### 3. **Rota do Dashboard** - `/admin` ou `/dashboard`

**URL:** 
- `http://localhost:5173/admin` 
- `http://localhost:5173/dashboard`

**Descrição:** Área administrativa completa do CMS

**Características:**
- 🔒 **Protegida** - Requer autenticação
- ✅ Controle total do sistema
- ✅ Todas as funcionalidades do CMS

**Redirecionamento:**
```typescript
// Se não autenticado
if (!localStorage.getItem('authToken')) {
  navigate('/login'); // Redireciona para login
}
```

**Funcionalidades:**
```
Dashboard
├── Matérias
├── Páginas  
├── Arquivos
├── Menu
├── Listas
├── Snippets
├── Links
├── Templates
├── Usuários (Admin)
└── Configurações (Admin)
```

---

## 🔐 Proteção de Rotas

### ProtectedRoute Component

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('currentUser');
  const token = localStorage.getItem('authToken');
  
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

**Como funciona:**
1. Verifica se existe token de autenticação
2. Se não existe → Redireciona para `/login`
3. Se existe → Renderiza o componente protegido

**Uso:**
```tsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 🚀 Fluxo de Navegação

### Cenário 1: Visitante

```
┌─────────────────────────────────────┐
│ Usuário acessa: /                   │
│                                     │
│ ↓                                   │
│                                     │
│ PublicSite                          │
│ - Ver notícias                      │
│ - Navegar páginas                   │
│ - Buscar conteúdo                   │
│                                     │
│ SEM botão de login visível          │
└─────────────────────────────────────┘
```

### Cenário 2: Administrador - Login

```
┌─────────────────────────────────────┐
│ Admin digita: /login                │
│                                     │
│ ↓                                   │
│                                     │
│ LoginForm                           │
│ - Digite email                      │
│ - Digite senha                      │
│ - Clica "Entrar"                    │
│                                     │
│ ↓                                   │
│                                     │
│ Validação OK                        │
│ - Salva token                       │
│ - Salva usuário                     │
│                                     │
│ ↓                                   │
│                                     │
│ navigate('/admin')                  │
│                                     │
│ ↓                                   │
│                                     │
│ Dashboard CMS                       │
└─────────────────────────────────────┘
```

### Cenário 3: Tentativa de Acesso Direto

```
┌─────────────────────────────────────┐
│ Usuário NÃO autenticado             │
│ Tenta acessar: /admin               │
│                                     │
│ ↓                                   │
│                                     │
│ ProtectedRoute verifica             │
│ Token existe? NÃO                   │
│                                     │
│ ↓                                   │
│                                     │
│ <Navigate to="/login" />            │
│                                     │
│ ↓                                   │
│                                     │
│ LoginForm                           │
│ (Usuário precisa fazer login)       │
└─────────────────────────────────────┘
```

### Cenário 4: Logout

```
┌─────────────────────────────────────┐
│ Admin logado em /admin              │
│                                     │
│ ↓                                   │
│                                     │
│ Clica botão "Sair"                  │
│                                     │
│ ↓                                   │
│                                     │
│ handleLogout()                      │
│ - Remove token                      │
│ - Remove usuário                    │
│ - navigate('/login')                │
│                                     │
│ ↓                                   │
│                                     │
│ LoginForm                           │
│ (Precisa fazer login novamente)     │
└─────────────────────────────────────┘
```

---

## 📋 Estrutura das Rotas

```tsx
<BrowserRouter>
  <Routes>
    {/* PÚBLICA */}
    <Route path="/" element={<PublicSite />} />
    
    {/* LOGIN */}
    <Route path="/login" element={<LoginPage />} />
    
    {/* ADMIN - PROTEGIDA */}
    <Route 
      path="/admin" 
      element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } 
    />
    
    {/* ALTERNATIVA */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } 
    />
    
    {/* 404 */}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
</BrowserRouter>
```

---

## 🔧 Componentes Principais

### 1. LoginPage

```typescript
function LoginPage() {
  const navigate = useNavigate();

  // Se já autenticado, vai para dashboard
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/admin', { replace: true });
    }
  }, []);

  const handleLogin = (user: any) => {
    // Salva autenticação
    // Redireciona para /admin
    navigate('/admin');
  };

  return <LoginForm onLogin={handleLogin} />;
}
```

### 2. AdminDashboard

```typescript
function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/login', { replace: true });
    } else {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
}
```

---

## 🎯 URLs em Produção

### Desenvolvimento Local
```
Site Público:  http://localhost:5173/
Login:         http://localhost:5173/login
Dashboard:     http://localhost:5173/admin
```

### Produção
```
Site Público:  https://portal.gov.br/
Login:         https://portal.gov.br/login
Dashboard:     https://portal.gov.br/admin
```

---

## 🛡️ Segurança

### 1. Token de Autenticação

```typescript
// Salvo no localStorage
localStorage.setItem('authToken', token);

// Verificado em toda rota protegida
const token = localStorage.getItem('authToken');
if (!token) {
  navigate('/login');
}
```

### 2. Dados do Usuário

```typescript
// Armazenamento
const user = { id, name, email, role };
localStorage.setItem('currentUser', JSON.stringify(user));

// Recuperação
const storedUser = localStorage.getItem('currentUser');
const user = JSON.parse(storedUser);
```

### 3. Logout

```typescript
const handleLogout = () => {
  // Limpa TODOS os dados de autenticação
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
  
  // Redireciona para login
  navigate('/login');
};
```

---

## 🔄 Redirecionamentos Automáticos

### 1. Usuário já autenticado tenta acessar `/login`

```typescript
// Em LoginPage
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    navigate('/admin', { replace: true });
  }
}, []);
```

### 2. Usuário não autenticado tenta acessar `/admin`

```typescript
// Em ProtectedRoute
if (!token) {
  return <Navigate to="/login" replace />;
}
```

### 3. Rota não encontrada

```typescript
// Rota catch-all
<Route path="*" element={<Navigate to="/" />} />
```

---

## 📱 Navegação Programática

### useNavigate Hook

```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  // Navegar para outra rota
  navigate('/admin');
  
  // Navegar e substituir histórico
  navigate('/login', { replace: true });
  
  // Voltar
  navigate(-1);
}
```

### Exemplos de Uso

```typescript
// Após salvar matéria
const handleSave = () => {
  // salvar...
  navigate('/admin'); // Volta para dashboard
};

// Botão de voltar
<Button onClick={() => navigate(-1)}>
  Voltar
</Button>

// Link customizado
<div onClick={() => navigate('/admin/pages')}>
  Ir para Páginas
</div>
```

---

## 🎨 Customização de Rotas

### Adicionar Nova Rota

```typescript
// 1. Adicionar no Routes
<Route path="/minha-rota" element={<MeuComponente />} />

// 2. Se precisar proteção
<Route 
  path="/minha-rota" 
  element={
    <ProtectedRoute>
      <MeuComponente />
    </ProtectedRoute>
  } 
/>
```

### Rotas com Parâmetros

```typescript
// Definir rota
<Route path="/artigo/:id" element={<ArtigoDetalhes />} />

// No componente
import { useParams } from 'react-router-dom';

function ArtigoDetalhes() {
  const { id } = useParams();
  // Usar o ID...
}

// Navegar
navigate(`/artigo/${articleId}`);
```

---

## 📊 Diagrama Completo

```
┌──────────────────────────────────────────────────────────┐
│                    React Router                          │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │     /      │  │   /login   │  │  /admin          │  │
│  │            │  │            │  │  /dashboard      │  │
│  │  PUBLIC    │  │   LOGIN    │  │                  │  │
│  │  SITE      │  │   FORM     │  │  DASHBOARD       │  │
│  │            │  │            │  │  (Protected)     │  │
│  │  ✓ Open   │  │  ✓ Open   │  │  🔒 Auth Req    │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
│                                                          │
│                    ↓ Navigation ↓                        │
│                                                          │
│         ┌──────────────────────────────┐                │
│         │   ProtectedRoute Check       │                │
│         │                              │                │
│         │   Token exists?              │                │
│         │   ├─ Yes → Render Component  │                │
│         │   └─ No  → Navigate /login   │                │
│         └──────────────────────────────┘                │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Resumo

### URLs Principais

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Site público sem login |
| `/login` | Público | Tela de autenticação |
| `/admin` | Protegido | Dashboard administrativo |
| `/dashboard` | Protegido | Alternativa para dashboard |

### Fluxo Simplificado

1. **Visitante**: Acessa `/` → Vê site público
2. **Admin**: Digita `/login` → Faz login → Vai para `/admin`
3. **Logout**: Clica "Sair" → Vai para `/login`
4. **Segurança**: Tenta `/admin` sem login → Redirecionado para `/login`

### Características

✅ Site público **SEM** botão de login visível
✅ Login acessível diretamente via `/login`
✅ Dashboard protegido com autenticação
✅ Redirecionamentos automáticos inteligentes
✅ Rotas 404 redirecionam para home
✅ URLs limpas e profissionais
