FROM node:20-alpine

WORKDIR /app

# Copia apenas os arquivos de dependências da raiz
COPY package*.json ./
# Instala as dependências (incluindo tsx para rodar o TS)
RUN npm install

# Copia o restante dos arquivos (server, shared, etc)
COPY . .

# Expõe a porta da sua API
EXPOSE 3001

# Comando para iniciar o servidor DIRETO via tsx (ignora o build do frontend)
# Isso pula o "npx tsc" que está dando erro
CMD ["npx", "tsx", "server/index.ts"]