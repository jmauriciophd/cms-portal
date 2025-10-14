# 🚀 Guia Rápido de Deploy - Portal CMS

## ⚠️ Problema: 404 na Vercel

Se você está vendo **404 Not Found** ao acessar rotas como `/login` ou `/admin` na Vercel, siga os passos abaixo:

---

## ✅ Solução

### 1. Verificar Arquivos de Configuração

O arquivo `vercel.json` já foi criado na raiz do projeto com a configuração correta:

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

### 2. Fazer Deploy

```bash
# Adicionar o arquivo ao git
git add vercel.json

# Commit
git commit -m "Add Vercel configuration for SPA routing"

# Push para o repositório
git push origin main
```

### 3. Aguardar Rebuild

A Vercel detectará o push e fará rebuild automático do projeto.

### 4. Testar

Após o deploy, todas as rotas devem funcionar:

- ✅ `https://cms-portal-two.vercel.app/`
- ✅ `https://cms-portal-two.vercel.app/login`
- ✅ `https://cms-portal-two.vercel.app/admin`
- ✅ `https://cms-portal-two.vercel.app/dashboard`

---

## 🔍 Por que isso é necessário?

O Portal CMS é uma **SPA (Single Page Application)** que usa **React Router** para navegação client-side.

Quando você acessa `https://seu-site.vercel.app/login` diretamente:

1. **Sem `vercel.json`:**
   - Vercel procura arquivo físico `/login`
   - Não encontra → retorna **404**

2. **Com `vercel.json`:**
   - Vercel retorna `index.html` para qualquer rota
   - React Router processa a rota `/login`
   - Página carrega corretamente ✅

---

## 🎯 URLs do Sistema

### Produção
```
Home:      https://cms-portal-two.vercel.app/
Login:     https://cms-portal-two.vercel.app/login
Dashboard: https://cms-portal-two.vercel.app/admin
```

### Desenvolvimento Local
```
Home:      http://localhost:5173/
Login:     http://localhost:5173/login
Dashboard: http://localhost:5173/admin
```

---

## 🔐 Credenciais Padrão

### Administrador
```
Email: admin@portal.com
Senha: admin123
```

### Editor
```
Email: editor@portal.com
Senha: editor123
```

---

## 📦 Comandos Úteis

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Abrir navegador em http://localhost:5173
```

### Build e Preview
```bash
# Fazer build de produção
npm run build

# Preview do build (simula produção)
npm run preview
```

### Deploy Manual (Vercel CLI)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 🛠️ Troubleshooting

### Problema: Ainda vejo 404 após push

**Solução:**
1. Verificar se o commit foi feito corretamente:
   ```bash
   git log -1
   ```
2. Verificar se o push foi bem-sucedido:
   ```bash
   git status
   ```
3. Verificar o painel da Vercel se o rebuild foi acionado
4. Limpar cache do navegador (Ctrl+Shift+R)

### Problema: Build falha na Vercel

**Solução:**
1. Verificar logs de build no painel da Vercel
2. Garantir que `package.json` tem todas as dependências:
   ```bash
   npm install react-router-dom
   ```
3. Fazer commit das mudanças:
   ```bash
   git add package.json package-lock.json
   git commit -m "Update dependencies"
   git push
   ```

### Problema: Página em branco

**Solução:**
1. Abrir DevTools (F12)
2. Verificar console para erros
3. Verificar Network tab para arquivos 404
4. Rebuild local:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   npm run preview
   ```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `/guidelines/Deploy-Documentation.md` - Deploy completo
- `/guidelines/Routing-Documentation.md` - Sistema de rotas
- `/guidelines/Guidelines.md` - Documentação geral do sistema

---

## ✅ Checklist de Deploy

- [ ] `vercel.json` existe na raiz do projeto
- [ ] Commit feito com sucesso
- [ ] Push para repositório concluído
- [ ] Vercel iniciou rebuild
- [ ] Build completou sem erros
- [ ] Todas as rotas testadas
- [ ] Login funciona
- [ ] Dashboard carrega

---

## 🎉 Pronto!

Após seguir esses passos, seu Portal CMS estará funcionando perfeitamente na Vercel com todas as rotas acessíveis!

**Acesse:** `https://cms-portal-two.vercel.app/login`

Qualquer dúvida, consulte a documentação completa em `/guidelines/`.
