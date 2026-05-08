FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 2024
CMD ["npx", "@langchain/langgraph-cli", "dev", "--env-file", ".env", "--host", "0.0.0.0"]