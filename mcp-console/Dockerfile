# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

ARG VITE_OLLAMA_URL=http://localhost:11434
ENV VITE_OLLAMA_URL=$VITE_OLLAMA_URL

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
