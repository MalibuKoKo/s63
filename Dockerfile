# https://github.com/docker-library/docs
# buildtime
# FROM public.ecr.aws/docker/library/node:18 AS builder
FROM arm64v8/node:18 AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY code/package*.json .
ENV PNPM_NO_VERIFY_STORE=true
# Désactiver la vérification des builds
RUN pnpm config set unsafe-builds true
# Pré-approuver les builds si nécessaire
RUN pnpm explain-builds && pnpm approve-builds || true
# Installer les dépendances
RUN pnpm install --no-frozen-lockfile

COPY code .
COPY package*.json .
CMD ["node","src/index.js"]

# FROM arm64v8/node:18 AS run
# WORKDIR /app
# COPY --from=builder /app/node_modules/ /app/node_modules/
# COPY code .
# COPY package*.json .
# CMD ["node","src/index.js"]