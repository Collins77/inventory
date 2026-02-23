FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm i

COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY tsconfig.json ./tsconfig.json
COPY src ./src

ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL="file:./data/prod.db"

RUN npx prisma generate --config prisma.config.ts
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node dist/index.js"]
