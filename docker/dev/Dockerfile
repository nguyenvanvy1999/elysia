FROM oven/bun AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install

# Development image, copy all the files and run the server
FROM base AS run
WORKDIR /app
# Copy files
COPY --from=deps /app/node_modules/ ./node_modules/
COPY public/ ./public/
COPY src/ ./src/
COPY .env* package.json tsconfig.json ./
# Set environment variables
ENV NODE_ENV=development
ENV PORT 3000
ENV HOSTNAME localhost
EXPOSE 3000
CMD bun run dev