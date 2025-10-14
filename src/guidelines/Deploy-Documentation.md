# Documentação - Deploy do Portal CMS

## Visão Geral

Guia completo para fazer deploy do Portal CMS em diferentes plataformas, com foco especial em Vercel.

---

## 🚀 Deploy na Vercel

### Problema Comum: 404 em Rotas

**Sintoma:**
- `https://seu-site.vercel.app/` funciona ✅
- `https://seu-site.vercel.app/login` retorna 404 ❌
- `https://seu-site.vercel.app/admin` retorna 404 ❌

**Causa:**
A Vercel tenta encontrar arquivos físicos para cada rota. Como o app é uma SPA (Single Page Application), todas as rotas devem ser tratadas pelo React Router no client-side.

**Solução:**
Criar arquivo `vercel.json` na raiz do projeto.

---

### Arquivo vercel.json

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ]
}
```

**O que faz:**
- **rewrites**: Todas as requisições são redirecionadas para `index.html`
- **routes**: Qualquer URL sem extensão de arquivo retorna o `index.html` com status 200
- React Router então processa a rota no navegador

---

### Passo a Passo - Deploy na Vercel

#### 1. Preparar o Projeto

```bash
# Garantir que vercel.json existe na raiz
# (já criado automaticamente pelo sistema)

# Verificar estrutura
ls -la
# Deve mostrar:
# - vercel.json
# - package.json
# - src/ ou componentes
```

#### 2. Fazer Commit

```bash
git add vercel.json
git commit -m "Add Vercel configuration for SPA routing"
git push origin main
```

#### 3. Deploy Automático

Se o projeto já está conectado à Vercel:
- Vercel detecta o push
- Rebuild automático
- Deploy com nova configuração

#### 4. Deploy Manual (alternativa)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

#### 5. Verificar

Após o deploy, testar todas as rotas:

```
✅ https://cms-portal-two.vercel.app/
✅ https://cms-portal-two.vercel.app/login
✅ https://cms-portal-two.vercel.app/admin
✅ https://cms-portal-two.vercel.app/dashboard
```

---

## 🔧 Configurações Adicionais para Vercel

### Build Settings

No painel da Vercel, configurar:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Variáveis de Ambiente

Se usar variáveis de ambiente:

```bash
# No painel Vercel → Settings → Environment Variables
VITE_API_URL=https://api.exemplo.com
VITE_APP_NAME=Portal CMS
```

No código:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Headers Customizados (opcional)

Adicionar em `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🌐 Deploy em Outras Plataformas

### Netlify

**Arquivo:** `public/_redirects`
```
/*    /index.html   200
```

**ou netlify.toml:**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deploy:**
```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

### GitHub Pages

**Adicionar em `vite.config.ts`:**
```typescript
export default defineConfig({
  base: '/nome-do-repositorio/',
  // ... resto da config
})
```

**Arquivo `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Nota:** GitHub Pages pode ter limitações para SPAs. Considere Vercel ou Netlify.

---

### Cloudflare Pages

**Criar `_redirects` em `public/`:**
```
/*    /index.html   200
```

**Build Settings:**
```
Build command: npm run build
Build output directory: dist
```

---

### AWS S3 + CloudFront

**1. Build do projeto:**
```bash
npm run build
```

**2. Upload para S3:**
```bash
aws s3 sync dist/ s3://seu-bucket --delete
```

**3. Configurar CloudFront:**
- Error Pages: 404 → /index.html (200)
- Error Pages: 403 → /index.html (200)

---

## 📦 Otimizações para Produção

### 1. Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
  },
});
```

### 2. Lazy Loading de Rotas

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const LoginForm = lazy(() => import('./components/auth/LoginForm'));

function App() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
```

### 3. Comprimir Assets

```bash
# Instalar plugin
npm install vite-plugin-compression -D
```

```typescript
// vite.config.ts
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
});
```

---

## 🔍 Troubleshooting

### Problema: 404 em Rotas

**Sintomas:**
- Página inicial funciona
- Outras rotas retornam 404
- Refresh na página dá erro

**Solução:**
```bash
# Verificar se vercel.json existe
cat vercel.json

# Se não existir, criar
echo '{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}' > vercel.json

# Commit e push
git add vercel.json
git commit -m "Fix SPA routing"
git push
```

---

### Problema: Build Falha

**Sintomas:**
```
Error: Cannot find module 'react-router-dom'
```

**Solução:**
```bash
# Verificar package.json
cat package.json

# Garantir que tem react-router-dom
npm install react-router-dom

# Commit
git add package.json package-lock.json
git commit -m "Add react-router-dom"
git push
```

---

### Problema: Assets não Carregam

**Sintomas:**
- Página branca
- Console mostra erros 404 para .js/.css

**Solução 1 - Base Path:**
```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // Garantir que é '/' para Vercel
});
```

**Solução 2 - Rebuild:**
```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build

# Testar local
npm run preview
```

---

### Problema: localStorage Não Persiste

**Sintomas:**
- Login funciona mas após refresh perde sessão
- Dados desaparecem

**Causa:**
- Cookies/localStorage bloqueados
- Modo privado/anônimo
- Configuração do navegador

**Solução:**
```typescript
// Verificar disponibilidade
function isLocalStorageAvailable() {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
}

// Usar fallback
const storage = isLocalStorageAvailable() 
  ? localStorage 
  : new Map(); // Fallback em memória
```

---

## 📊 Checklist de Deploy

### Pré-Deploy

- [ ] `vercel.json` criado
- [ ] Todas as dependências em `package.json`
- [ ] Build local funciona (`npm run build`)
- [ ] Preview local funciona (`npm run preview`)
- [ ] Todas as rotas testadas
- [ ] Console sem erros críticos

### Deploy

- [ ] Commit das alterações
- [ ] Push para repositório
- [ ] Vercel faz rebuild
- [ ] Build completa com sucesso
- [ ] Deploy finalizado

### Pós-Deploy

- [ ] Testar `/` (home)
- [ ] Testar `/login`
- [ ] Testar `/admin`
- [ ] Fazer login funciona
- [ ] Dashboard carrega
- [ ] Logout funciona
- [ ] Refresh nas páginas funciona
- [ ] Links diretos funcionam

---

## 🎯 URLs Finais

### Produção (Vercel)
```
Site Público:  https://cms-portal-two.vercel.app/
Login:         https://cms-portal-two.vercel.app/login
Dashboard:     https://cms-portal-two.vercel.app/admin
```

### Desenvolvimento Local
```
Site Público:  http://localhost:5173/
Login:         http://localhost:5173/login  
Dashboard:     http://localhost:5173/admin
```

---

## 🔐 Segurança em Produção

### 1. HTTPS

Vercel fornece HTTPS automático ✅

### 2. Variáveis Sensíveis

```bash
# NUNCA commitar no código:
# ❌ const API_KEY = 'abc123';

# SEMPRE usar variáveis de ambiente:
# ✅ const API_KEY = import.meta.env.VITE_API_KEY;
```

### 3. Headers de Segurança

Já configurados em `vercel.json`:
- X-Content-Type-Options
- X-Frame-Options  
- X-XSS-Protection

### 4. Rate Limiting

Para APIs, adicionar:
```typescript
// Limitar tentativas de login
const loginAttempts = new Map();

function checkRateLimit(ip: string) {
  const attempts = loginAttempts.get(ip) || 0;
  if (attempts > 5) {
    throw new Error('Muitas tentativas. Tente novamente em 15 minutos.');
  }
  loginAttempts.set(ip, attempts + 1);
}
```

---

## 📈 Monitoramento

### Vercel Analytics

Habilitar no painel Vercel:
- Pageviews
- Performance
- Web Vitals

### Google Analytics (opcional)

```typescript
// Em App.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  
  useEffect(() => {
    // Track pageview
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname,
      });
    }
  }, [location]);
  
  // ...
}
```

---

## ✅ Resumo

### Para Corrigir 404 na Vercel:

1. **Criar `vercel.json` na raiz** (já criado ✅)
2. **Fazer commit:**
   ```bash
   git add vercel.json
   git commit -m "Add Vercel SPA configuration"
   git push
   ```
3. **Aguardar rebuild automático**
4. **Testar todas as rotas**

### Resultado Esperado:

```
✅ https://cms-portal-two.vercel.app/
✅ https://cms-portal-two.vercel.app/login
✅ https://cms-portal-two.vercel.app/admin
✅ https://cms-portal-two.vercel.app/dashboard
```

Todas as rotas agora funcionam perfeitamente! 🚀
