# Estágio de Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Compila o TS (ajuste se o seu script for diferente)
RUN npx tsc

# Estágio de Execução
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
# Se você tiver um .env, o Easypanel injetará as variáveis, 
# então não precisamos copiar o arquivo físico obrigatoriamente.

EXPOSE 3001
CMD ["node", "dist/index.js"]