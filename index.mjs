import express from 'express';
import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Definir __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT;

const formData = {
  formId: '1022053',
  recordId: '214256685',
  exportId: '1540559'
};

// Middleware para manejar JSON
app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/webhook', async (req, res) => {
  try {
    const response = await fetch(`https://forms.kizeo.com/rest/v3/forms/${formData.formId}/data/${formData.recordId}/exports/${formData.exportId}/pdf`, {
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

    const filePath = path.join(__dirname, 'uploads', fileName);
    await writeFile(filePath, buffer);

    console.log(`PDF descargado exitosamente como ${fileName}`);
    res.status(200).json({ message: 'Archivo PDF descargado exitosamente', fileName });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'main' });
});

app.get('/index', (req, res) => {
  res.status(200).json({ message: 'index' });
});

app.listen(port, () => {
  console.log(`Servidor webhook escuchando en http://localhost:${port}`);
});
