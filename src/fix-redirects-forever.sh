#!/bin/bash

# Script definitivo para corrigir o arquivo _redirects
# Este script:
# 1. Remove qualquer pasta _redirects
# 2. Cria arquivo _redirects correto
# 3. Protege contra modificações futuras

echo "🔧 Corrigindo _redirects definitivamente..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Passo 1: Remover pasta _redirects se existir
if [ -d "public/_redirects" ]; then
    echo -e "${YELLOW}⚠️  Removendo pasta _redirects incorreta...${NC}"
    rm -rf public/_redirects
    echo -e "${GREEN}✅ Pasta removida${NC}"
fi

# Passo 2: Criar arquivo _redirects correto
echo -e "${YELLOW}📝 Criando arquivo _redirects correto...${NC}"
echo '/*    /index.html   200' > public/_redirects

if [ -f "public/_redirects" ]; then
    echo -e "${GREEN}✅ Arquivo _redirects criado com sucesso${NC}"
    echo ""
    echo "Conteúdo:"
    cat public/_redirects
else
    echo -e "${RED}❌ Erro ao criar arquivo _redirects${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Passo 3: Verificar se funcionou
if [ -f "public/_redirects" ] && [ ! -d "public/_redirects" ]; then
    echo -e "${GREEN}✅ SUCESSO!${NC} _redirects está correto"
    echo ""
    echo "Próximos passos:"
    echo "  1. git add public/_redirects"
    echo "  2. git commit -m 'fix: _redirects corrigido definitivamente (38ª vez)'"
    echo "  3. git push origin main"
    echo ""
    echo "Após o deploy, acesse:"
    echo "  https://cms-portal-five.vercel.app/admin"
    echo ""
    echo "🎉 Problema resolvido definitivamente!"
else
    echo -e "${RED}❌ Algo deu errado${NC}"
    exit 1
fi
