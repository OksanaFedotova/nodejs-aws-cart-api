FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT 4000
EXPOSE 4000

CMD ["node", "dist/main.js"]