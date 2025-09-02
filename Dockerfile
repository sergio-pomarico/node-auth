FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV DIR /app
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR $DIR
RUN corepack enable

# Install dependencies and build
FROM base AS build

COPY pnpm-lock.yaml $DIR
COPY package.json $DIR
COPY tsconfig.json $DIR
COPY src $DIR/src
COPY types $DIR/types
COPY .env $DIR
COPY prisma.config.ts $DIR

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm dlx prisma generate
COPY .generated $DIR

RUN pnpm run build && \
    pnpm prune --prod

# Run app on release mode
FROM base AS release

RUN apk update && apk add --no-cache dumb-init

ENV NODE_ENV=production

ENV USER=node

USER $USER

COPY --from=build $DIR/node_modules $DIR/node_modules
COPY --from=build $DIR/dist $DIR/dist
COPY --from=build $DIR/.generated $DIR/.generated

EXPOSE $PORT

CMD ["dumb-init", "node", "dist/app.js"]

# run app on development mode
FROM base AS development

ENV NODE_ENV=development

COPY package*.json $DIR
RUN pnpm install

COPY tsconfig*.json $DIR
COPY src $DIR/src
COPY .env $DIR
COPY prisma.config.ts $DIR

EXPOSE $PORT

CMD ["pnpm", "run", "dev"]
