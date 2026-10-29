FROM node:20-alpine
WORKDIR /app
COPY node_modules ./node_modules
COPY package.json server.js ./
COPY certs ./certs
EXPOSE 8443
CMD ["node", "server.js"]
