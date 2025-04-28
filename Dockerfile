FROM node:22-alpine AS base

ENV DIR /app
WORKDIR $DIR

# Install dependencies and build
FROM base AS build

COPY package*.json $DIR
COPY tsconfig*.json $DIR
COPY src $DIR/src

RUN npm ci

RUN npm run build && \
    npm prune --production

# Run app on release mode
FROM base AS release

RUN apk update && apk add --no-cache dumb-init

ENV NODE_ENV=production

ENV USER=node

USER $USER

COPY --from=build $DIR/node_modules $DIR/node_modules
COPY --from=build $DIR/dist $DIR/dist

EXPOSE $PORT

CMD ["dumb-init", "node", "dist/app.js"]

# run app on development mode
FROM base AS development

ENV NODE_ENV=development

COPY package*.json $DIR
RUN npm install

COPY tsconfig*.json $DIR
COPY src $DIR/src
COPY .env $DIR

EXPOSE $PORT

CMD ["npm", "run", "dev"]
