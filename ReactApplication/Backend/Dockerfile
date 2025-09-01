#------------------------------------------------------------------------------

#   Back-end

FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 5000

CMD ["node", "src/server.js"]
