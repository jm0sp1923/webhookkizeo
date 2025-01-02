# Usa una imagen base de Node.js
FROM node:18

# Instala las dependencias de Python y virtualenv
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Crea un directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos del proyecto al contenedor
COPY . .

# Crea un entorno virtual de Python y activa el entorno
RUN python3 -m venv /venv && \
    /venv/bin/pip install --upgrade pip && \
    /venv/bin/pip install -r requirements.txt

# Instala las dependencias de Node.js
RUN npm install

# Instala pm2 para gestionar el proceso de Node.js
RUN npm install -g pm2


# Comando para iniciar el servidor Express
CMD ["pm2", "start", "app.mjs", "--watch"]
