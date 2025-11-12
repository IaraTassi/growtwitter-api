#!/bin/sh
set -e

echo "🚀 Iniciando entrypoint para ambiente: $NODE_ENV"

DB_HOST="db"
if [ "$NODE_ENV" = "test" ]; then
  DB_HOST="db-test"
fi

until nc -z -w5 $DB_HOST 5432; do
  echo "⏳ Aguardando banco de dados em $DB_HOST:5432..."
  sleep 2
done

echo "✅ Banco de dados disponível!"

case "$NODE_ENV" in
  "test")
    echo "🧪 Rodando ambiente de testes..."
    npx prisma migrate deploy
    npm run test:integration
    ;;
  "production")
    echo "🏭 Rodando produção..."
    npx prisma migrate deploy
    npm run build
    npm run start
    ;;
  *)
    echo "💻 Rodando ambiente de desenvolvimento..."
    npx prisma migrate dev --name init
    npm run dev
    ;;
esac
