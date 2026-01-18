# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; \
  fi

COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM nginx:alpine

# Fly expects the app to listen on 8080
EXPOSE 8080

# Replace default nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
