# buildtime
# FROM public.ecr.aws/docker/library/node:18 AS builder
FROM arm32v7/node:18 AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
# RUN npm ci
# RUN --mount=type=cache,target=/root/.npm,sharing=locked npm ci --prefer-offline
# COPY . .
# RUN npm run build
