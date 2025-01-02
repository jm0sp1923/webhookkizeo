# Usa una imagen base
FROM node:18

# Instala las dependencias de Python y virtualenv
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Crea un directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos del proyecto al contenedor
COPY . .

# Crea un entorno virtual
RUN python3 -m venv /venv

# Activa el entorno virtual y instala las dependencias de Python
RUN /venv/bin/pip install -r requirements.txt

# Instala dependencias de node
RUN npm install

# Expón los puertos necesarios
EXPOSE 3000
EXPOSE 8000

# Comando para iniciar tu aplicación
CMD ["npm", "start"]
