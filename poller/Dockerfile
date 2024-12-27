FROM node:20.18.1-alpine3.21 as build 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc
CMD [ "node", "dist/main.js" ]