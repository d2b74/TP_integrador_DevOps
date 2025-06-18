# Imagen base liviana
FROM node:20

# Directorio de trabajo
WORKDIR /app

# Copiamos archivos necesarios
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Exponemos el puerto que usa la app
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
