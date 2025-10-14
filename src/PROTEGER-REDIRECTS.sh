#!/bin/bash

# Script para PROTEGER o arquivo _redirects
# Execute ANTES de fazer qualquer commit!

echo "🔒 PROTEGENDO arquivo _redirects..."

# 1. Verificar se _redirects é um ARQUIVO (não pasta)
if [ -d "public/_redirects" ]; then
    echo "❌ ERRO: _redirects é uma PASTA! Corrigindo..."
    
    # Deletar pasta e conteúdo
    rm -rf public/_redirects
    
    # Recriar como arquivo
    echo "/*    /index.html   200" > public/_redirects
    
    echo "✅ _redirects recriado como ARQUIVO"
else
    echo "✅ _redirects é um arquivo (correto)"
fi

# 2. Verificar conteúdo
CONTENT=$(cat public/_redirects)
EXPECTED="/*    /index.html   200"

if [ "$CONTENT" != "$EXPECTED" ]; then
    echo "❌ ERRO: Conteúdo incorreto!"
    echo "   Encontrado: '$CONTENT'"
    echo "   Esperado:   '$EXPECTED'"
    echo ""
    echo "Corrigindo..."
    echo "/*    /index.html   200" > public/_redirects
    echo "✅ Conteúdo corrigido"
else
    echo "✅ Conteúdo correto"
fi

# 3. Marcar como somente leitura (PROTEGER)
chmod 444 public/_redirects
echo "✅ Arquivo protegido (somente leitura)"

# 4. Verificação final
echo ""
echo "📊 VERIFICAÇÃO FINAL:"
ls -la public/_redirects
echo ""
cat public/_redirects
echo ""

echo "✅ TUDO CERTO! Agora faça o commit:"
echo ""
echo "  git add ."
echo "  git commit -m \"Fix _redirects and PublicSite categories error\""
echo "  git push origin main"
echo ""
