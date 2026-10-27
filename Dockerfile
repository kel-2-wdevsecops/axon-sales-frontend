# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.21.0

################################################################################
# Tahap build: `tsc -b && vite build` dijalankan di dalam Alpine. dist/ dan
# node_modules dari host tidak pernah dipakai (.dockerignore), karena binari
# esbuild/rollup untuk OS lain membuat build gagal.
FROM docker.io/library/node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .
RUN npm run build

################################################################################
# Tahap final: hanya file statis + nginx. Tanpa Node, tanpa source code.
# nginx-unprivileged berjalan sebagai user 101 (bukan root) di port 8080.
# Nama lengkap docker.io/... supaya juga bisa di-build dengan Podman. Di-pin
# ke digest; Dependabot tidak menaikkannya, naikkan manual (gerbang
# Trivy di build.yml yang mengingatkan kalau tertinggal).
FROM docker.io/nginxinc/nginx-unprivileged:1.30.5-alpine@sha256:ed04ec1ff34502c339ee5c3ae3f855442398edc1d05591e2b98981dcbbd20b1e

# Template diproses envsubst oleh entrypoint image saat container start dan
# menimpa default.conf bawaan (lihat nginx/default.conf.template).
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Default untuk server: BE di network uts-net (lihat compose.yaml).
ENV API_UPSTREAM=http://devsecops_be:3008
# Entrypoint image mengekspor NGINX_LOCAL_RESOLVERS dari /etc/resolv.conf
# (DNS Docker), dipakai `resolver` di nginx/default.conf.template.
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

EXPOSE 8080
