FROM node:20.18.1-alpine3.21 as build 
WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend .
RUN npx ng build --configuration production

FROM node:20.18.1-alpine3.21 as server
WORKDIR /app
COPY ./backend/package*.json ./
RUN npm install
COPY ./backend .
COPY --from=build /app/dist/moviemate_admin/browser ./public
COPY ./backend .
EXPOSE 3000
CMD [ "node", "server.js" ]