import express from 'express';
import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000; // Puerto en el que se escuchará el webhook

// Middleware para manejar JSON
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const { formId, recordId, exportId } = req.body; // Aquí asumimos que la petición contiene estos parámetros

  try {
    const response = await fetch(`https://forms.kizeo.com/rest/v3/forms/${formId}/data/${recordId}/exports/${exportId}/pdf`, {
      method: 'GET',
      headers: {
        Authorization: 'appi_kizeo_48ee84f9b7fe23279af7fdadf738c8982058bf44'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener el PDF: ${response.statusText}`);
    }

    // Obtener el nombre del archivo desde los encabezados
    const fileName = response.headers.get('x-filename-custom') || 'archivo.pdf';

    // Convertir la respuesta a un buffer
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    // Guardar el archivo en el directorio 'uploads'
    const filePath = path.join(__dirname, 'uploads', fileName);
    await writeFile(filePath, buffer);

    console.log(`PDF descargado exitosamente como ${fileName}`);
    res.status(200).json({ message: 'Archivo PDF descargado exitosamente', fileName });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/index", async(req,res) =>{
  res.send("Funcionando")
})

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor webhook escuchando en http://localhost:${port}`);
});
