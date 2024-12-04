import express from 'express';
import pkg from 'body-parser';
import fetch from 'node-fetch'; // Importar node-fetch

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
      'Authorization': token  // Enviar el token correctamente en la cabecera Authorization
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al hacer la solicitud: ${response.statusText}`);
      }
      return response.json();  // Parsear la respuesta JSON
    })
    .then(data => {
      console.log('Datos obtenidos desde la API de Kizeo:', data);
      return data;
    })
    .catch(error => {
      console.error('Error al hacer la solicitud a Kizeo:', error);
      throw error;  // Lanzar el error para que se pueda manejar en el controlador del webhook
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
