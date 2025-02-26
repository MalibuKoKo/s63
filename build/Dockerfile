# buildtime
# FROM public.ecr.aws/docker/library/node:18 AS builder
FROM arm32v7/node:18 AS builder
# RUN apt update && apt install -y sudo build-essential python3 node-gyp
WORKDIR /app
RUN npm install -g pnpm
COPY build/package*.json .
ENV PNPM_NO_VERIFY_STORE=true
# Désactiver la vérification des builds
RUN pnpm config set unsafe-builds true
# Pré-approuver les builds si nécessaire
RUN pnpm explain-builds && pnpm approve-builds || true
# Installer les dépendances
RUN pnpm install --no-frozen-lockfile

FROM arm32v7/node:18 AS run
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
RUN apt update && apt install -y sudo build-essential python3 node-gyp
WORKDIR /app
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY code .
RUN rm -f package.json yarn.lock binding.gyp
COPY build/package*.json .