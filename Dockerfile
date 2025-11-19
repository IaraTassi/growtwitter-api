FROM node:20-alpine AS base

# Diretório onde ficará a app dentro do container
WORKDIR /app

# Copia apenas os arquivos essenciais primeiro (melhor cache)
COPY package*.json ./
COPY prisma ./prisma

# Instala dependências (inclui Prisma Client)
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Gera Prisma Client compilado para produção
RUN npx prisma generate

# Build da aplicação (gera dist/)
RUN npm run build

# Expõe a porta usada pela aplicação (Render ignora mas é boa prática)
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
