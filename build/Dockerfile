# buildtime
FROM public.ecr.aws/docker/library/node:18 AS builder
WORKDIR /builder
COPY package*.json .
# RUN --mount=type=cache,target=/root/.npm,sharing=locked npm ci --prefer-offline
# COPY . .
# RUN npm run build
