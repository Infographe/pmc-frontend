# Étape 1 : Build de l'application Angular
FROM node:20 AS build-stage
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Étape 2 : Serveur Nginx
FROM nginx:alpine AS runtime-stage
# Copier les fichiers du bon dossier "browser" dans nginx
COPY --from=build-stage /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
