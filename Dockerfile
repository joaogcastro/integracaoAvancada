# Dockerfile

# Use a imagem base do Node.js
FROM node:14

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos de configuração da API para o container
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm install

# Copie o restante dos arquivos da sua aplicação para o container
COPY . .

# Copie o diretório public para dentro do container
COPY ./public /app/public

# Exponha a porta que o seu app vai rodar
EXPOSE 4000

# Defina o comando de inicialização do container
CMD ["node", "index.js"]
