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

RUN npx prisma generate --config prisma.config.ts
RUN npm run build && ls -laR dist || echo "Build failed or dist is empty"

EXPOSE 4000

CMD ["node", "dist/index.js"]
