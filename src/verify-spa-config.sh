#!/bin/bash

# Script de Verificação de Configuração SPA para Vercel
# Verifica se todos os arquivos necessários estão corretos

echo "🔍 Verificando Configuração SPA para Vercel..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# Função para verificar arquivo
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ ENCONTRADO:${NC} $description"
        echo "   📄 $file"
    else
        echo -e "${RED}❌ FALTANDO:${NC} $description"
        echo "   📄 $file"
        ((ERRORS++))
    fi
}

# Função para verificar conteúdo
check_content() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if [ -f "$file" ]; then
        if grep -q "$pattern" "$file"; then
            echo -e "${GREEN}✅ CORRETO:${NC} $description"
        else
            echo -e "${RED}❌ ERRO:${NC} $description não encontrado em $file"
            ((ERRORS++))
        fi
    fi
}

# Função para verificar se _redirects é um arquivo (não pasta)
check_redirects_is_file() {
    if [ -f "public/_redirects" ]; then
        echo -e "${GREEN}✅ CORRETO:${NC} _redirects é um arquivo"
    elif [ -d "public/_redirects" ]; then
        echo -e "${RED}❌ ERRO CRÍTICO:${NC} _redirects é uma PASTA (deveria ser arquivo)"
        echo "   🔧 Execute: rm -rf public/_redirects && echo '/*    /index.html   200' > public/_redirects"
        ((ERRORS++))
    else
        echo -e "${RED}❌ FALTANDO:${NC} _redirects não existe"
        ((ERRORS++))
    fi
}

# Verificar estrutura básica
echo "📁 Verificando Estrutura de Arquivos:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "vercel.json" "Configuração principal do Vercel"
check_redirects_is_file
check_file "public/404.html" "Fallback para rotas não encontradas"
check_file "App.tsx" "Arquivo principal do React"
echo ""

# Verificar conteúdo do vercel.json
echo "📝 Verificando Conteúdo do vercel.json:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_content "vercel.json" "rewrites" "Configuração de rewrites"
check_content "vercel.json" "source.*destination" "Regra de rewrite"
check_content "vercel.json" "index.html" "Redirect para index.html"
echo ""

# Verificar conteúdo do _redirects
echo "📝 Verificando Conteúdo do _redirects:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "public/_redirects" ]; then
    CONTENT=$(cat public/_redirects)
    if [ "$CONTENT" = "/*    /index.html   200" ]; then
        echo -e "${GREEN}✅ PERFEITO:${NC} Conteúdo correto"
        echo "   $CONTENT"
    else
        echo -e "${YELLOW}⚠️  ATENÇÃO:${NC} Conteúdo pode estar incorreto:"
        echo "   Atual: $CONTENT"
        echo "   Esperado: /*    /index.html   200"
    fi
fi
echo ""

# Verificar React Router
echo "⚛️  Verificando React Router:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_content "App.tsx" "BrowserRouter" "BrowserRouter (não HashRouter)"
check_content "App.tsx" "Routes" "Componente Routes"
check_content "App.tsx" 'path="/"' "Rota raiz /"
check_content "App.tsx" 'path="\*"' "Catch-all route *"
echo ""

# Verificar package.json
echo "📦 Verificando package.json:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_content "package.json" "react-router-dom" "React Router instalado"
check_content "package.json" "build" "Script de build"
echo ""

# Verificar .gitignore
echo "🚫 Verificando .gitignore:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ".gitignore" ]; then
    if grep -q "dist" ".gitignore"; then
        echo -e "${GREEN}✅ CORRETO:${NC} dist/ está no .gitignore"
    else
        echo -e "${YELLOW}⚠️  ATENÇÃO:${NC} Adicione 'dist/' ao .gitignore"
    fi
else
    echo -e "${YELLOW}⚠️  ATENÇÃO:${NC} .gitignore não encontrado"
fi
echo ""

# Verificar se há arquivos .tsx dentro de _redirects
echo "🔍 Verificando Arquivos Incorretos em _redirects:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "public/_redirects" ]; then
    TSX_FILES=$(find public/_redirects -name "*.tsx" 2>/dev/null | wc -l)
    if [ "$TSX_FILES" -gt 0 ]; then
        echo -e "${RED}❌ ERRO CRÍTICO:${NC} Encontrados $TSX_FILES arquivos .tsx dentro de _redirects/"
        echo "   🔧 Corrija com: rm -rf public/_redirects && echo '/*    /index.html   200' > public/_redirects"
        ((ERRORS++))
    fi
else
    echo -e "${GREEN}✅ OK:${NC} Nenhum problema encontrado"
fi
echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TUDO CERTO!${NC} Configuração SPA está correta! 🎉"
    echo ""
    echo "Próximos passos:"
    echo "  1. git add ."
    echo "  2. git commit -m 'fix: configurar rewrites para SPA'"
    echo "  3. git push origin main"
    echo ""
    echo "Após o deploy, teste:"
    echo "  https://cms-portal-five.vercel.app/admin"
else
    echo -e "${RED}❌ ENCONTRADOS $ERRORS ERRO(S)${NC}"
    echo ""
    echo "Corrija os erros acima antes de fazer deploy."
    echo ""
    
    # Comandos de correção automática
    echo "🔧 CORREÇÃO AUTOMÁTICA DISPONÍVEL:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Execute este comando para corrigir automaticamente:"
    echo ""
    echo "  rm -rf public/_redirects && echo '/*    /index.html   200' > public/_redirects"
    echo ""
fi

exit $ERRORS
