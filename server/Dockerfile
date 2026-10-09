FROM node:22-alpine
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health >/dev/null 2>&1 || exit 1

CMD ["node", "index.js"]
