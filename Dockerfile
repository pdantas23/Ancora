# Estágio 1: Build do Frontend (React)
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Estágio 2: Backend (Node + TS)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Copia o build do front para onde o backend espera (conforme seu index.ts)
COPY --from=client-build /app/client/dist ./dist

EXPOSE 3001
CMD ["npm", "start"]