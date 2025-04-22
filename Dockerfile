# https://github.com/docker-library/docs
# buildtime
# FROM public.ecr.aws/docker/library/node:18 AS builder
FROM arm64v8/node:18 AS builder
RUN apt update && apt install -y --no-install-recommends \
  libsndfile1-dev \
  libasound2-dev \
  alsa-utils \
  alsa-oss \
  alsa-tools \
  libasound2 \
  libasound2-plugins \
  pipewire-audio
WORKDIR /app
RUN npm install -g pnpm
COPY code/package*.json .
COPY code/pnpm-lock.yaml .
ENV PNPM_NO_VERIFY_STORE=true
# Désactiver la vérification des builds
RUN pnpm config set unsafe-builds true
# Pré-approuver les builds si nécessaire
RUN pnpm explain-builds && pnpm approve-builds || true
# Installer les dépendances
RUN pnpm install --no-frozen-lockfile

COPY code .
CMD ["node","src/index.js"]

# FROM arm64v8/node:18 AS run
# WORKDIR /app
# COPY --from=builder /app/node_modules/ /app/node_modules/
# COPY code .
# COPY package*.json .
# CMD ["node","src/index.js"]