import express from 'express';
import pkg from 'body-parser';
import fetch from 'node-fetch'; // Importar node-fetch
const fs = require('fs');  // Para guardar el archivo localmente

const { json } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(json());

// Ruta para el webhook
app.post('/webhook', (req, res) => {
  const data = req.body;

  console.log('Datos recibidos desde Kizeo:', data);

  // Realizar la solicitud a la API de Kizeo cuando llegue el webhook
  fetchAppiKizeo()
    .then(kizeoData => {
      console.log('Datos obtenidos desde la API de Kizeo:', kizeoData);
      // Procesar los datos de Kizeo (guardar en base de datos, notificar, etc.)
      res.status(200).send('Webhook recibido correctamente');
    })
    .catch(error => {
      console.error('Error al obtener datos de Kizeo:', error);
      res.status(500).send('Error al procesar la solicitud');
    });
});

// Función para hacer la solicitud a la API de Kizeo
function fetchAppiKizeo() {
  const url = 'https://www.kizeoforms.com/rest/v3/forms/1038111/data/214107920/exports/1543015';
  const token = 'appi_kizeo_48ee84f9b7fe23279af7fdadf738c8982058bf44';

  return fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': token
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
      // Verificar si la respuesta es un archivo binario
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
        // Si la respuesta es un archivo Word, manejamos los datos binarios
        return response.buffer();  // Usar .buffer() para obtener los datos binarios
      } else {
        throw new Error('El archivo no es de tipo Word');
      }
    })
    .then(buffer => {
      // Guardar el archivo en el servidor o enviarlo al cliente
      const filePath = './documento_kizeo.docx';  // Ruta donde se guardará el archivo
      fs.writeFileSync(filePath, buffer);  // Guardar el archivo en el servidor
      console.log('Archivo Word descargado y guardado en:', filePath);
    })
    .catch(error => {
      console.error('Error al hacer la solicitud a Kizeo:', error);
      throw error;
    });
}


// Ruta de prueba
app.get("/index", (req, res) => {
  console.log("Funcionando");
  res.send("Funcionando");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
