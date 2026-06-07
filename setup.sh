#!/usr/bin/env bash
# setup.sh - Configurador automatizado para o Meu Controle Financeiro 💰

# Exit immediately if any command fails
set -e

echo "================================================================="
echo "       Iniciando Inicialização do Meu Controle Financeiro 💰      "
echo "================================================================="

# Verificando a presença do Node / NPM do usuário
if ! command -v npm &> /dev/null; then
    echo "🛑 Erro: O utilitário 'npm' não foi detectado no seu terminal."
    echo "Por favor, faça o download e faça a instalação do Node.js (versão 18 ou superior) antes de continuar."
    exit 1
fi

echo "✔ Node.js e NPM detectados com sucesso!"
echo "-> Preparando diretórios locais e baixando dependências do arquivo package.json..."
npm install

echo "-> Validando linting e fazendo compilação de testes..."
npm run build

echo "📣 Sucesso absoluto! O seu web app de finanças pessoais foi compilado."
echo "================================================================="
echo "Para inicializar o servidor de desenvolvimento manualmente digite:"
echo "   npm run dev"
echo ""
echo "Iniciando servidor automático na porta 3000..."
echo "Acesse o site em http://localhost:3000 "
echo "================================================================="

# Execute dev server
npm run dev
