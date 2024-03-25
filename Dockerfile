# Etapa de construcción
FROM node:18-alpine as build-step

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos necesarios
COPY package.json .
COPY package-lock.json .

# Instalar dependencias
RUN npm install

# Copiar todos los archivos del proyecto
COPY . .

# Construir la aplicación
RUN npm run build --configuration=production

# Etapa de producción
FROM nginx:1.17.1-alpine

# Copiar los archivos construidos de Angular en el directorio de Nginx
COPY --from=build-step /app/dist/medplaya-chat/browser /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80
