import express from 'express';
import fetch from 'node-fetch';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Definir __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const port = process.env.PORT || 3000;

// Middleware para manejar JSON
app.use(express.json());

// Usar la ruta del volumen montado '/uploads' en Railway
const uploadsDir = '/uploads'; // Ruta montada en Railway

// Middleware para servir archivos estáticos desde la ruta de uploads
app.use('/uploads', express.static(uploadsDir));

app.post('/webhook', async (req, res) => {
  console.log("Webhook recibido");
  const exportId = 0;
  const { id: dataId, data: { form_id: formId } } = req.body;
  console.log('Webhook recibido:', req.body);

  
  try {
    const response = await fetch(`https://www.kizeoforms.com/rest/v3/forms/${formId}/exports`, {
      method: 'GET',
      headers: {
        Authorization: process.env.KIZEO_API_KEY
      }
    });
  
    const data = await response.json(); // Convertir la respuesta a JSON
  
    if (data.status === 'ok' && data.exports.length > 0) {
      const exportId = data.exports[0].id;  // Obtener el exportId
      console.log('Export ID:', exportId);
  
      // Ahora puedes usar el exportId en el siguiente paso de tu flujo
    } else {
      console.log('No se encontraron exportaciones o el estado no es "ok".');
    }
  
  } catch (error) {
    console.error('Error al obtener el exportId:', error);
  }
  

  try {

    console.log('Form ID:', formId);
    console.log('Data ID:', dataId);
    console.log('Export ID:', exportId);


    const response = await fetch(`https://forms.kizeo.com/rest/v3/forms/${formId}/data/${dataId}/exports/${exportId}/pdf`, {
      method: 'GET',
      headers: {
        Authorization: process.env.KIZEO_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener el PDF: ${response.statusText}`);
    }

    const fileName = response.headers.get('x-filename-custom') || 'archivo.pdf';
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    // Crear el directorio '/uploads' si no existe
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log(`Directorio 'uploads' creado o ya existe`);
    } catch (err) {
      console.error('Error al crear directorio de uploads:', err);
      return res.status(500).json({ error: 'Error al crear directorio de uploads' });
    }

    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    console.log(`PDF descargado exitosamente como ${fileName}`);
    res.status(200).json({ message: 'Archivo PDF descargado exitosamente', fileName });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/index', (req, res) => {
  res.status(200).json({ message: 'index' });
});

app.listen(port, () => {
  console.log(`Servidor webhook escuchando en http://localhost:${port}`);
});
