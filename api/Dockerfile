FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js schema.graphql ./

USER node
EXPOSE 4000

CMD ["node", "server.js"]