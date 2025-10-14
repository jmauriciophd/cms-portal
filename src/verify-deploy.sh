#!/bin/bash

echo "🔍 Verificando configuração para deploy na Vercel..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# 1. Verificar vercel.json
echo "1️⃣  Verificando vercel.json..."
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json encontrado${NC}"
else
    echo -e "${RED}❌ vercel.json NÃO encontrado${NC}"
    ((errors++))
fi

# 2. Verificar _redirects como ARQUIVO (não pasta)
echo ""
echo "2️⃣  Verificando public/_redirects..."
if [ -f "public/_redirects" ]; then
    echo -e "${GREEN}✅ public/_redirects é um arquivo (correto)${NC}"
elif [ -d "public/_redirects" ]; then
    echo -e "${RED}❌ public/_redirects é uma PASTA (incorreto!)${NC}"
    echo -e "${YELLOW}   Execute: rm -rf public/_redirects${NC}"
    ((errors++))
else
    echo -e "${YELLOW}⚠️  public/_redirects não encontrado (opcional)${NC}"
    ((warnings++))
fi

# 3. Verificar package.json
echo ""
echo "3️⃣  Verificando package.json..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json encontrado${NC}"
    
    # Verificar react-router-dom
    if grep -q "react-router-dom" package.json; then
        echo -e "${GREEN}✅ react-router-dom está nas dependências${NC}"
    else
        echo -e "${RED}❌ react-router-dom NÃO encontrado${NC}"
        echo -e "${YELLOW}   Execute: npm install react-router-dom${NC}"
        ((errors++))
    fi
else
    echo -e "${RED}❌ package.json NÃO encontrado${NC}"
    ((errors++))
fi

# 4. Verificar App.tsx com React Router
echo ""
echo "4️⃣  Verificando App.tsx..."
if [ -f "App.tsx" ]; then
    if grep -q "BrowserRouter" App.tsx; then
        echo -e "${GREEN}✅ App.tsx usa BrowserRouter${NC}"
    else
        echo -e "${RED}❌ App.tsx NÃO usa BrowserRouter${NC}"
        ((errors++))
    fi
else
    if [ -f "src/App.tsx" ]; then
        if grep -q "BrowserRouter" src/App.tsx; then
            echo -e "${GREEN}✅ src/App.tsx usa BrowserRouter${NC}"
        else
            echo -e "${RED}❌ src/App.tsx NÃO usa BrowserRouter${NC}"
            ((errors++))
        fi
    else
        echo -e "${RED}❌ App.tsx NÃO encontrado${NC}"
        ((errors++))
    fi
fi

# 5. Testar build
echo ""
echo "5️⃣  Testando build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build completou com sucesso${NC}"
else
    echo -e "${RED}❌ Build FALHOU${NC}"
    echo -e "${YELLOW}   Execute: npm run build (para ver os erros)${NC}"
    ((errors++))
fi

# 6. Verificar pasta dist
echo ""
echo "6️⃣  Verificando pasta dist..."
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Pasta dist/ existe${NC}"
    
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✅ dist/index.html existe${NC}"
    else
        echo -e "${RED}❌ dist/index.html NÃO encontrado${NC}"
        ((errors++))
    fi
else
    echo -e "${YELLOW}⚠️  Pasta dist/ não encontrada (rode npm run build)${NC}"
    ((warnings++))
fi

# Resumo
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}🎉 Tudo OK! Pronto para deploy!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  git add ."
    echo "  git commit -m \"Fix Vercel configuration\""
    echo "  git push origin main"
else
    echo -e "${RED}❌ Encontrados $errors erro(s)${NC}"
    echo -e "${YELLOW}⚠️  Encontrados $warnings aviso(s)${NC}"
    echo ""
    echo "Corrija os erros acima antes de fazer deploy."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
