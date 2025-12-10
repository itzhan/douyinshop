FROM node:20-alpine
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN corepack enable \
  && if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
