import express from 'express';
import pkg from 'body-parser';
import fetch from 'node-fetch'; // Importar node-fetch
import fs from 'fs';

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
  fetchApiKizeo()
    .then(() => {
      console.log('Datos obtenidos y procesados correctamente');
      res.status(200).send('Webhook recibido correctamente');
    })
    .catch(error => {
      console.error('Error al obtener o procesar datos de Kizeo:', error);
      res.status(500).send('Error al procesar la solicitud');
    });
});

// Función para hacer la solicitud a la API de Kizeo
async function fetchApiKizeo() {
  const url = 'https://www.kizeoforms.com/rest/v3/forms/1038111/data/214107920/exports/1543015/pdf';
  const token = 'appi_kizeo_48ee84f9b7fe23279af7fdadf738c8982058bf44';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }

    // Verificar si el tipo de contenido es un archivo Word
    const contentType = response.headers.get('content-type');
    console.log('Tipo de contenido recibido:', contentType);

    if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      const data = await response.buffer();  // Obtener los datos binarios del archivo
      saveWordFile(data);  // Guardar el archivo en el servidor
    } else {
      const text = await response.text();  // Obtener la respuesta como texto si no es Word
      console.error('Respuesta de Kizeo:', text);
      throw new Error('La respuesta de Kizeo no es un archivo Word');
    }
  } catch (error) {
    console.error('Error al hacer la solicitud a Kizeo:', error);
    throw error;
  }
}

// Función para guardar el archivo Word
function saveWordFile(data) {
  const filePath = './documento_kizeo.docx';
  fs.writeFileSync(filePath, data);  // Guardar el archivo en el servidor
  console.log('Archivo Word descargado y guardado en:', filePath);
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
