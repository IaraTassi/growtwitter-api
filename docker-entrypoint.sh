#!/bin/sh
set -e

echo "🌍 Ambiente atual: $NODE_ENV"

if [ "$NODE_ENV" = "test" ]; then
  echo "🧪 Rodando em modo de teste..."
  npx prisma generate
  npm run test:docker

elif [ "$NODE_ENV" = "production" ]; then
  echo "🚀 Rodando em modo de PRODUÇÃO..."
  npm run build
  npx prisma migrate deploy
  npm start

else
  echo "⚙️ Rodando em modo de DESENVOLVIMENTO..."
  npx prisma generate
  npm run dev
fi
