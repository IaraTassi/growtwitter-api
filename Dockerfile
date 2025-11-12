# Usando imagem leve do Node
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /usr/src/app

# Copia dependências primeiro (para cache)
COPY package*.json ./

# Clean install
RUN npm ci

# Copia o restante do projeto
COPY . .

# Gera cliente Prisma
RUN npx prisma generate

# Copia e dá permissão ao entrypoint customizado
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expõe a porta padrão do app
EXPOSE 3000

# Usa JSON form para respeitar sinais e boas práticas Docker
ENTRYPOINT ["docker-entrypoint.sh"]
