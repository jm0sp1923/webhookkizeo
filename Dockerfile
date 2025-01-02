# Etapa 1: Imagen base de Python para instalar dependencias
FROM python:3.9-slim AS python-deps

# Establece el directorio de trabajo
WORKDIR /app

# Copia y instala las dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Etapa 2: Imagen base de Node.js para el servidor Express
FROM node:18-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios para el servidor Express
COPY package.json package-lock.json ./
RUN npm install

# Copia el código del proyecto
COPY . .

# Copia las dependencias de Python desde la etapa anterior
COPY --from=python-deps /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages

# Expone el puerto del servidor
EXPOSE 3000

# Comando para ejecutar el servidor Express
CMD ["npm", "start"]
