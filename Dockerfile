# Multi-stage build for Vite React app and serve with nginx

# Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY .npmrc* ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Runner
FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
# Remove default config and use a simple config to serve SPA (fallback to index.html)
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
