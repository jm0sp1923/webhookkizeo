# Usa una imagen base de Node.js
FROM node:18

# Instala las dependencias de Python y virtualenv (si realmente necesitas Python)
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && python3 -m venv /venv && \
    /venv/bin/pip install --upgrade pip


RUN pip install Office365-REST-Python-Client

# Crea un directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos del proyecto al contenedor
COPY . .

# Verificar que 'requirements.txt' esté presente en el contenedor
RUN ls -l /usr/src/app

# Instalar las dependencias de Python
RUN /venv/bin/pip install -r requirements.txt

# Instala las dependencias de Node.js
RUN npm install

# Expone el puerto que la aplicación usa (Render espera el uso de la variable PORT)
EXPOSE 8000

# Usa una variable de entorno para asegurarte de que se use el puerto dinámico en Render
ENV PORT=8000

# Define el comando de inicio de la aplicación
CMD ["npm", "start"]
