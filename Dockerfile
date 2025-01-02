# Usa una imagen base de Node.js
FROM node:18

# Instala las dependencias de Python y virtualenv (si realmente necesitas Python)
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && python3 -m venv /venv && \
    /venv/bin/pip install --upgrade pip && \
    /venv/bin/pip install -r requirements.txt

# Crea un directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos del proyecto al contenedor
COPY . .


# Instala las dependencias de Node.js
RUN npm install

# Expone el puerto que la aplicación usa (Render espera el uso de la variable PORT)
EXPOSE 8000

# Usa una variable de entorno para asegurarte de que se use el puerto dinámico en Render
ENV PORT=8000

# Define el comando de inicio de la aplicación
CMD ["npm", "start"]
