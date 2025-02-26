# buildtime
# FROM public.ecr.aws/docker/library/node:18 AS builder
FROM arm32v7/node:18 AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package*.json .
ENV PNPM_NO_VERIFY_STORE=true
# Désactiver la vérification des builds
RUN pnpm config set unsafe-builds true
# Pré-approuver les builds si nécessaire
RUN pnpm explain-builds && pnpm approve-builds || true
# Installer les dépendances
RUN pnpm install --no-frozen-lockfile
# RUN npm install
# RUN npm ci
# RUN --mount=type=cache,target=/root/.npm,sharing=locked npm ci --prefer-offline
COPY . .
# RUN npm run build
