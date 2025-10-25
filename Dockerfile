# Usando imagem leve do Node
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas package.json e package-lock.json para instalar dependências
COPY package*.json ./

# Instala dependências do projeto
RUN npm install

# Copia todo o restante do código
COPY . .

# Expõe a porta que o app vai rodar
EXPOSE 3000

# Comando para rodar o app
# Ajuste conforme seu script: "dev" (ts-node) ou "start" (node compilado)
CMD ["npm", "run", "dev"]
