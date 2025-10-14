#!/bin/bash

# ============================================
# EXECUTE ESTE SCRIPT AGORA!
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 EXECUTANDO CORREÇÕES FINAIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Passo 1: Tornar scripts executáveis
echo "📌 Passo 1/4: Tornando scripts executáveis..."
chmod +x PROTEGER-REDIRECTS.sh
chmod +x DESPROTEGER-REDIRECTS.sh
echo "✅ Scripts executáveis"
echo ""

# Passo 2: Executar proteção
echo "📌 Passo 2/4: Protegendo arquivo _redirects..."
./PROTEGER-REDIRECTS.sh
echo ""

# Passo 3: Status do Git
echo "📌 Passo 3/4: Verificando mudanças..."
git status --short
echo ""

# Passo 4: Instruções finais
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PRÓXIMOS COMANDOS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  git add ."
echo "  git commit -m \"Fix: _redirects (6th time) + PageBuilder Edit icon\""
echo "  git push origin main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏳ Após o push, aguarde 2-3 minutos para deploy"
echo ""
echo "🧪 Depois teste:"
echo "   - https://cms-portal-two.vercel.app/"
echo "   - https://cms-portal-two.vercel.app/login"
echo "   - Editar páginas no admin"
echo ""
echo "✅ TUDO PRONTO PARA O PUSH!"
echo ""
