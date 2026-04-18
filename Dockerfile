FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache --virtual .build-deps python3 make g++

COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

RUN apk del .build-deps

COPY . .

RUN mkdir -p /app/database

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "server.js"]
