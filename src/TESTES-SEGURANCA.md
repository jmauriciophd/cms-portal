# 🧪 PLANO DE TESTES DE SEGURANÇA

## ✅ STATUS: SISTEMA DE SEGURANÇA IMPLEMENTADO!

### **Arquivos Criados:**
1. ✅ `/services/SecurityService.ts` - Validação, sanitização, rate limiting (700 linhas)
2. ✅ `/services/AuditService.ts` - Sistema de auditoria completo (500 linhas)
3. ✅ `/services/CSRFService.ts` - Proteção CSRF (200 linhas)
4. ✅ `/components/security/SecurityMonitor.tsx` - Interface de monitoramento (600 linhas)
5. ✅ `/components/dashboard/Dashboard.tsx` - Integrado menu "Segurança"
6. ✅ `/guidelines/Security-System-Documentation.md` - Documentação completa
7. ✅ `/public/_redirects` - Corrigido (21ª vez!)

**Total:** ~2.000 linhas de código + documentação!

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### **1. AUTENTICAÇÃO** ✅
- Validação de senha forte (8+ chars, maiúscula, minúscula, número, especial)
- Hash de senha (SHA-256)
- Medidor de força da senha (score 0-7)
- Auditoria de login/logout

### **2. AUTORIZAÇÃO (RBAC)** ✅
- Sistema já existente mantido
- Integrado com auditoria
- Verificação de permissões em todas as ações
- Acesso negado registrado em logs

### **3. VALIDAÇÃO E SANITIZAÇÃO** ✅
- **XSS Protection**: Remove scripts, iframes, event handlers
- **SQL Injection**: Escapa caracteres perigosos
- **HTML Sanitization**: DOMPurify integration
- **Email Validation**: Regex + caracteres perigosos
- **Password Validation**: Força, complexidade
- **Slug Validation**: Apenas [a-z0-9-]
- **File Name Validation**: Bloqueia .exe, .bat, .php, etc
- **JSON Validation**: Sintaxe + tamanho (máx 1MB)
- **Object Validation**: Schema-based com regras customizadas
- **Path Traversal Prevention**: Bloqueia ../

### **4. PROTEÇÃO CSRF** ✅
- Geração de tokens únicos (64 chars)
- Validade de 1 hora
- One-time use (previne replay attacks)
- Suporte a formulários e headers
- Validação automática em requisições POST/PUT/DELETE
- Limpeza automática de tokens expirados

### **5. RATE LIMITING** ✅
- **Janela deslizante** (sliding window)
- **Configuração flexível**:
  - maxAttempts: Número máximo de tentativas
  - windowMs: Janela de tempo
  - blockDurationMs: Duração do bloqueio (opcional)
- **Bloqueio automático** após exceder limite
- **Desbloquear manual** (admin)
- **Limpeza automática** de registros antigos
- **Estatísticas** em tempo real

### **6. AUDITORIA** ✅
- **40+ tipos de eventos** rastreados
- **Severidade automática** (low, medium, high, critical)
- **Filtros avançados**:
  - Data (início/fim)
  - Usuário
  - Ação
  - Tipo de recurso
  - Status (success/failure/warning)
  - Severidade
  - Busca textual
- **Estatísticas completas**:
  - Por ação
  - Por usuário
  - Por status
  - Por severidade
  - Por tipo de recurso
- **Relatórios**:
  - Timeline (atividade por dia)
  - Top usuários
  - Top ações
  - Incidentes de segurança
- **Exportação JSON**
- **Retenção de 90 dias**
- **Alertas automáticos**:
  - Múltiplas falhas de login (3+ em 5 min)
  - Ações críticas fora do horário (22h-6h)
- **Diff automático** (compara valores old/new)

### **7. MONITOR DE SEGURANÇA** ✅
- **Interface completa** em Dashboard → Segurança
- **4 cards de estatísticas**:
  - Total de logs
  - Rate limits
  - Tokens CSRF
  - Severidade
- **4 abas**:
  - Visão Geral (activity, top actions, manutenção)
  - Auditoria (tabela completa, busca, filtros)
  - Bloqueados (IPs/usuários bloqueados)
  - Críticos (eventos de alta severidade)
- **Ações**:
  - Limpar rate limits
  - Limpar logs antigos
  - Limpar tokens CSRF
  - Exportar auditoria
  - Desbloquear usuários/IPs
- **Auto-refresh** (30 segundos)

---

## 🧪 PLANO DE TESTES

### **TESTE 1: Validação de Senha** ⚠️ (A implementar)

**Objetivo:** Verificar validação de senha forte

**Passos:**

1. Tentar senha fraca: `123`
   ```
   Esperado: {
     valid: false,
     errors: [
       "Senha deve ter no mínimo 8 caracteres",
       "Senha deve conter pelo menos uma letra maiúscula",
       "Senha deve conter pelo menos uma letra minúscula",
       "Senha deve conter pelo menos um caractere especial"
     ]
   }
   ```

2. Tentar senha média: `Senha123`
   ```
   Esperado: {
     valid: false,
     errors: ["Senha deve conter pelo menos um caractere especial"]
   }
   ```

3. Tentar senha forte: `MyP@ssw0rd123!`
   ```
   Esperado: {
     valid: true,
     errors: []
   }
   ```

4. Verificar força da senha:
   ```javascript
   const strength = SecurityService.getPasswordStrength('MyP@ssw0rd123!');
   console.log(strength);
   // Esperado: { score: 6-7, label: 'Forte' ou 'Muito Forte' }
   ```

---

### **TESTE 2: Proteção XSS** ⚠️ (A implementar)

**Objetivo:** Verificar sanitização contra XSS

**Passos:**

1. Abrir console (F12)

2. Testar sanitização de string:
   ```javascript
   const malicious = '<script>alert("XSS")</script>Hello World';
   const safe = SecurityService.sanitizeString(malicious);
   console.log('Input:', malicious);
   console.log('Output:', safe);
   // Esperado: "Hello World" (sem <script>)
   ```

3. Testar sanitização de HTML:
   ```javascript
   const html = '<p>Texto</p><script>alert("XSS")</script><iframe src="evil"></iframe>';
   const safeHTML = SecurityService.sanitizeHTML(html);
   console.log('Input:', html);
   console.log('Output:', safeHTML);
   // Esperado: "<p>Texto</p>" (sem script/iframe)
   ```

4. Testar em formulário:
   - Ir para Dashboard → Páginas → Nova Página
   - No título, colar: `<script>alert('XSS')</script>Minha Página`
   - Salvar
   - Verificar se título salvo é apenas "Minha Página"
   - Verificar auditoria (Dashboard → Segurança → Auditoria)

---

### **TESTE 3: Rate Limiting** ⚠️ (A implementar)

**Objetivo:** Verificar bloqueio por excesso de tentativas

**Passos:**

1. Abrir console (F12)

2. Simular tentativas de login:
   ```javascript
   // Configurar limite: 3 tentativas em 1 minuto
   const config = {
     maxAttempts: 3,
     windowMs: 60000,
     blockDurationMs: 300000 // 5 minutos
   };

   // Tentativa 1
   let status = SecurityService.checkRateLimit('test@email.com', 'login', config);
   console.log('Tentativa 1:', status);
   // Esperado: { allowed: true, remaining: 2, blocked: false }

   // Tentativa 2
   status = SecurityService.checkRateLimit('test@email.com', 'login', config);
   console.log('Tentativa 2:', status);
   // Esperado: { allowed: true, remaining: 1, blocked: false }

   // Tentativa 3
   status = SecurityService.checkRateLimit('test@email.com', 'login', config);
   console.log('Tentativa 3:', status);
   // Esperado: { allowed: true, remaining: 0, blocked: false }

   // Tentativa 4 (BLOQUEADA)
   status = SecurityService.checkRateLimit('test@email.com', 'login', config);
   console.log('Tentativa 4:', status);
   // Esperado: { allowed: false, remaining: 0, blocked: false/true }
   ```

3. Verificar bloqueio:
   - Ir para Dashboard → Segurança → Bloqueados
   - Verificar se `test@email.com` aparece na lista
   - Clicar em "Desbloquear"
   - Verificar se foi removido da lista

4. Verificar auditoria:
   - Dashboard → Segurança → Auditoria
   - Procurar por eventos `security.rate_limit_exceeded`

---

### **TESTE 4: Proteção CSRF** ⚠️ (A implementar)

**Objetivo:** Verificar tokens CSRF em formulários

**Passos:**

1. Abrir console (F12)

2. Gerar token:
   ```javascript
   const token = CSRFService.generateToken('test-form');
   console.log('Token gerado:', token);
   // Verificar: token.token, token.expiresAt, token.used === false
   ```

3. Validar token válido:
   ```javascript
   const valid = CSRFService.validateToken(token.token, 'test-form');
   console.log('Token válido?', valid);
   // Esperado: true
   ```

4. Tentar usar novamente (replay attack):
   ```javascript
   const reused = CSRFService.validateToken(token.token, 'test-form');
   console.log('Token reutilizado?', reused);
   // Esperado: false (token já foi usado)
   ```

5. Verificar estatísticas:
   ```javascript
   const stats = CSRFService.getStats();
   console.log('Stats:', stats);
   // Verificar: total, active, expired, used
   ```

---

### **TESTE 5: Auditoria** ⚠️ (A implementar)

**Objetivo:** Verificar registro de ações

**Passos:**

1. Criar uma página:
   - Dashboard → Páginas → Nova Página
   - Título: "Teste de Auditoria"
   - Slug: "teste-auditoria"
   - Salvar

2. Verificar log:
   - Dashboard → Segurança → Auditoria
   - Buscar por "Teste de Auditoria"
   - Verificar log `page.create` aparece
   - Verificar campos:
     - Usuário correto
     - Ação: `page.create`
     - Status: `success`
     - Severidade: `medium`

3. Editar página:
   - Alterar título para "Teste Editado"
   - Salvar

4. Verificar log de edição:
   - Dashboard → Segurança → Auditoria
   - Buscar por "Teste Editado"
   - Verificar log `page.update` aparece

5. Deletar página:
   - Excluir "Teste Editado"

6. Verificar log de deleção:
   - Dashboard → Segurança → Auditoria
   - Verificar log `page.delete` aparece
   - Severidade deve ser `high`

7. Exportar auditoria:
   - Dashboard → Segurança → Visão Geral
   - Clicar em "Exportar Auditoria"
   - Verificar se arquivo JSON foi baixado
   - Abrir arquivo e verificar estrutura

---

### **TESTE 6: Monitor de Segurança** ⚠️ (A implementar)

**Objetivo:** Verificar interface de monitoramento

**Passos:**

1. Acessar monitor:
   - Dashboard → Segurança

2. Verificar cards de estatísticas:
   - Total de Logs (deve ter valor > 0)
   - Rate Limits (registros ativos)
   - Tokens CSRF (ativos/expirados)
   - Severidade (distribuição)

3. Testar abas:
   - **Visão Geral**:
     - Atividade recente (10 últimos logs)
     - Ações mais comuns (top 10)
     - Botões de manutenção funcionam?
   
   - **Auditoria**:
     - Tabela completa de logs
     - Busca funciona?
     - Exportar funciona?
   
   - **Bloqueados**:
     - Lista de identifiers bloqueados
     - Desbloquear funciona?
   
   - **Críticos**:
     - Eventos de severidade high/critical
     - Destacados em vermelho?

4. Testar auto-refresh:
   - Deixar tela aberta
   - Criar uma página em outra aba
   - Aguardar 30 segundos
   - Verificar se novo log aparece automaticamente

5. Testar manutenção:
   - Clicar em "Limpar Rate Limits"
   - Verificar toast de sucesso
   - Verificar se estatísticas atualizaram
   
   - Clicar em "Limpar Logs Antigos"
   - Verificar quantos logs foram removidos
   
   - Clicar em "Limpar Tokens CSRF"
   - Verificar se tokens expirados foram removidos

---

### **TESTE 7: Validação de Arquivos** ⚠️ (A implementar)

**Objetivo:** Verificar bloqueio de arquivos perigosos

**Passos:**

1. Preparar arquivos de teste:
   - `test.png` (imagem válida)
   - `test.exe` (executável - deve ser bloqueado)
   - `test.php` (script - deve ser bloqueado)
   - `test.pdf` (PDF válido)

2. Tentar upload de `.exe`:
   - Dashboard → Arquivos → Upload
   - Selecionar `test.exe`
   - Esperado: Toast de erro "Extensão não permitida por segurança"

3. Tentar upload de `.php`:
   - Selecionar `test.php`
   - Esperado: Toast de erro "Extensão não permitida por segurança"

4. Upload de `.png`:
   - Selecionar `test.png`
   - Esperado: Upload bem-sucedido

5. Upload de `.pdf`:
   - Selecionar `test.pdf`
   - Esperado: Upload bem-sucedido

6. Verificar auditoria:
   - Dashboard → Segurança → Auditoria
   - Buscar por eventos `file.upload`
   - Verificar se uploads bem-sucedidos foram registrados

---

### **TESTE 8: SQL Injection** ⚠️ (A implementar)

**Objetivo:** Verificar proteção contra SQL injection

**Passos:**

1. Abrir console (F12)

2. Testar escape:
   ```javascript
   const malicious = "'; DROP TABLE users; --";
   const safe = SecurityService.escapeSQLString(malicious);
   console.log('Input:', malicious);
   console.log('Output:', safe);
   // Esperado: string sem ; DROP -- exec delete truncate
   ```

3. Testar em formulário de busca:
   - Dashboard → Páginas
   - No campo de busca, colar: `'; DROP TABLE pages; --`
   - Verificar se busca não quebra o sistema
   - Verificar se retorna resultados vazios ou erro tratado

---

### **TESTE 9: Permissões (RBAC)** ⚠️ (A implementar)

**Objetivo:** Verificar controle de acesso

**Passos:**

1. Fazer login como Admin:
   - Email: `admin@cms.com`
   - Senha: (senha configurada)

2. Verificar acesso total:
   - Dashboard → Usuários (deve acessar)
   - Dashboard → Segurança (deve acessar)
   - Dashboard → Configurações (deve acessar)

3. Fazer logout

4. Fazer login como Editor:
   - Email: `editor@cms.com`
   - Senha: (senha configurada)

5. Verificar acesso limitado:
   - Dashboard → Usuários (NÃO deve aparecer no menu)
   - Dashboard → Segurança (NÃO deve aparecer)
   - Dashboard → Configurações (NÃO deve aparecer)
   - Dashboard → Páginas (deve acessar)
   - Dashboard → Matérias (deve acessar)

6. Tentar ação não permitida:
   - Dashboard → Páginas
   - Criar página
   - Tentar deletar (se botão aparecer)
   - Esperado: Toast de erro "Você não tem permissão"

7. Verificar auditoria:
   - Fazer login como Admin novamente
   - Dashboard → Segurança → Auditoria
   - Buscar por eventos `security.access_denied`

---

### **TESTE 10: Performance** ⚠️ (A implementar)

**Objetivo:** Verificar impacto de segurança na performance

**Passos:**

1. Abrir console (F12) → Performance

2. Medir tempo de validação:
   ```javascript
   console.time('validate-100');
   for (let i = 0; i < 100; i++) {
     SecurityService.validatePassword('MyP@ssw0rd123!');
   }
   console.timeEnd('validate-100');
   // Esperado: < 100ms
   ```

3. Medir tempo de sanitização:
   ```javascript
   const html = '<p>Texto longo</p>'.repeat(100);
   console.time('sanitize-html');
   SecurityService.sanitizeHTML(html);
   console.timeEnd('sanitize-html');
   // Esperado: < 50ms
   ```

4. Medir tempo de auditoria:
   ```javascript
   console.time('audit-log');
   AuditService.log({
     userId: 'test',
     userName: 'Test',
     userRole: 'admin',
     action: 'page.create',
     resource: 'Test',
     resourceType: 'page',
     status: 'success'
   });
   console.timeEnd('audit-log');
   // Esperado: < 10ms
   ```

5. Verificar localStorage:
   - Abrir DevTools → Application → Local Storage
   - Verificar tamanhos:
     - `audit-logs`: < 5MB (10.000 logs)
     - `security-rate-limits`: < 1MB
     - `csrf-tokens`: < 100KB

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **Funcionalidades:**
- [ ] ✅ Validação de senha forte funciona
- [ ] ✅ Proteção XSS remove scripts
- [ ] ✅ Rate limiting bloqueia após limite
- [ ] ✅ Tokens CSRF validam corretamente
- [ ] ✅ Auditoria registra todas as ações
- [ ] ✅ Monitor de segurança exibe dados
- [ ] ✅ Validação de arquivos bloqueia extensões perigosas
- [ ] ✅ SQL injection é prevenido
- [ ] ✅ RBAC controla acesso
- [ ] ✅ Performance não é impactada

### **Interface:**
- [ ] ✅ Dashboard → Segurança acessível para admin
- [ ] ✅ Cards de estatísticas funcionam
- [ ] ✅ Abas (Visão Geral, Auditoria, Bloqueados, Críticos) funcionam
- [ ] ✅ Busca e filtros funcionam
- [ ] ✅ Exportação de logs funciona
- [ ] ✅ Desbloquear usuários funciona
- [ ] ✅ Auto-refresh funciona (30s)

### **Auditoria:**
- [ ] ✅ Login/Logout registrados
- [ ] ✅ Criação de página registrada
- [ ] ✅ Edição de página registrada
- [ ] ✅ Deleção de página registrada
- [ ] ✅ Upload de arquivo registrado
- [ ] ✅ Mudança de permissão registrada
- [ ] ✅ Acesso negado registrado
- [ ] ✅ Rate limit excedido registrado

### **Produção:**
- [ ] ⚠️ HTTPS configurado
- [ ] ⚠️ Headers de segurança (CSP, X-Frame-Options)
- [ ] ⚠️ localStorage encryption (se dados sensíveis)
- [ ] ⚠️ Backup de logs configurado
- [ ] ⚠️ Monitoramento em produção
- [ ] ⚠️ Alertas de segurança configurados

---

## 📊 RESUMO

**Sistema Implementado:**
- ✅ SecurityService (700 linhas)
- ✅ AuditService (500 linhas)
- ✅ CSRFService (200 linhas)
- ✅ SecurityMonitor (600 linhas)
- ✅ Documentação completa

**Testes Pendentes:**
- ⚠️ 10 testes de segurança a executar
- ⚠️ Validar checklist de produção
- ⚠️ Configurar HTTPS e headers

**Próximo Passo:**
1. Executar testes 1-10
2. Validar checklist
3. Configurar produção
4. Deploy!

**SISTEMA DE SEGURANÇA COMPLETO E PRONTO PARA TESTES! 🔒✨**
