###
# Builder
###
FROM docker.io/node:20-slim AS builder

USER 0
RUN apt-get update && apt-get install -y \
  g++ \
  gcc \
  make \
  python3 \
  build-essential \
  libffi-dev \
  && rm -rf /var/lib/apt/lists/*

# RUN yarn config set strict-ssl false
# ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN yarn global add node-gyp

WORKDIR /app
COPY yarn.lock package.json ./
COPY ./packages/common/package.json ./packages/common/
COPY ./packages/frontend/package.json ./packages/frontend/
COPY ./packages/backend/package.json ./packages/backend/

# 依存関係をインストール
RUN yarn install --frozen-lockfile

# ソースコードをコピー
COPY . .

# ビルド
RUN yarn build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN rm -rf node_modules
RUN yarn install --frozen-lockfile

###
# Runner
###
FROM docker.io/node:20-slim AS runner

USER 0
RUN apt-get update && apt-get install -y  \
  curl \
  tini \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app /app

USER 1000
ENV URL=http://0.0.0.0
ENV PORT=3000
ENV NODE_ENV=${NODE_ENV}

EXPOSE 3000
EXPOSE 3001

ENTRYPOINT [ "/usr/bin/tini", "--" ]
CMD [ "yarn", "start" ]
