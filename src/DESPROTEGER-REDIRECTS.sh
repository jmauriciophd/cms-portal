#!/bin/bash

# Script para DESPROTEGER o arquivo _redirects (se necessário)
# Use apenas em EMERGÊNCIAS!

echo "⚠️  DESPROTEGENDO arquivo _redirects..."
echo ""
echo "ATENÇÃO: Você tem certeza que precisa editar este arquivo?"
echo "Na maioria dos casos, NÃO é necessário!"
echo ""
read -p "Digite 'SIM' para continuar: " confirmacao

if [ "$confirmacao" != "SIM" ]; then
    echo "❌ Operação cancelada"
    exit 1
fi

chmod 644 public/_redirects
echo "✅ Arquivo desprotegido (pode editar)"
echo ""
echo "⚠️  Após editar, execute:"
echo "  ./PROTEGER-REDIRECTS.sh"
echo ""
