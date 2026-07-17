FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci 2>/dev/null || npm install

COPY . .

RUN npm run build

RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 appuser
USER appuser

EXPOSE 3001

CMD ["node", "dist/index.js"]
