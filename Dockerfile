# Usando imagem leve do Node
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copia dependências primeiro (para cache)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do projeto
COPY . .

# Gera cliente Prisma
RUN npx prisma generate

# Copia e dá permissão ao entrypoint customizado
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expõe a porta padrão do app
EXPOSE 3000

# Define variável padrão (pode ser sobrescrita no Compose ou Render)
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Usa JSON form para respeitar sinais e boas práticas Docker
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
