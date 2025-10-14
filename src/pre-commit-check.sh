#!/bin/bash

# Script para verificar se _redirects é um arquivo antes do commit

echo "🔍 Verificando estrutura de arquivos..."

# Verificar se _redirects é um arquivo
if [ -d "public/_redirects" ]; then
    echo ""
    echo "❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌"
    echo "❌                                        ❌"
    echo "❌   ERRO: _redirects é uma PASTA!       ❌"
    echo "❌                                        ❌"
    echo "❌   Deveria ser um ARQUIVO!             ❌"
    echo "❌                                        ❌"
    echo "❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌"
    echo ""
    echo "📁 Conteúdo da pasta _redirects:"
    ls -la public/_redirects/
    echo ""
    echo "🔧 Para corrigir, execute:"
    echo ""
    echo "   rm -rf public/_redirects/"
    echo "   echo '/*    /index.html   200' > public/_redirects"
    echo ""
    echo "❌ COMMIT BLOQUEADO!"
    exit 1
fi

if [ -f "public/_redirects" ]; then
    echo "✅ public/_redirects é um arquivo (correto)"
    
    # Verificar conteúdo
    content=$(cat public/_redirects)
    expected="/*    /index.html   200"
    
    if [ "$content" = "$expected" ]; then
        echo "✅ Conteúdo do _redirects está correto"
    else
        echo "⚠️  Conteúdo do _redirects está diferente:"
        echo "   Esperado: $expected"
        echo "   Atual: $content"
        echo ""
        echo "Deseja continuar mesmo assim? (s/N)"
        read -r response
        if [[ ! "$response" =~ ^[Ss]$ ]]; then
            echo "❌ Commit cancelado"
            exit 1
        fi
    fi
else
    echo "⚠️  public/_redirects não existe (será criado no build)"
fi

# Verificar vercel.json
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json existe"
else
    echo "❌ vercel.json NÃO ENCONTRADO!"
    echo "❌ COMMIT BLOQUEADO!"
    exit 1
fi

echo ""
echo "✅ Tudo OK! Pode fazer commit."
exit 0
