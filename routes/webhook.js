import express from 'express';
import fetch from 'node-fetch';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
const router = express.Router();

dotenv.config();
const uploadsDir = path.join(process.cwd(), 'uploads');
const site_url = process.env.SITE_URL;
const destinationFolder = process.env.DESTINATION_FOLDER;

function ejecutarSubidaSharePoint(siteUrl, destinationFolder, fileName) {
  console.log("Iniciando ejecución del script Python...");
  console.log("Site URL:", siteUrl);
  console.log("Destination Folder:", destinationFolder);
  console.log("File Name:", fileName);
  

  const pythonProcess = spawn("python", [
    "subirArchivo.py",
    siteUrl,
    destinationFolder,
    fileName,

  ]);

  pythonProcess.stdout.on("data", (data) => {
    console.log("Respuesta del script Python:", data.toString());
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error("Error del script Python:", data.toString());
  });

  pythonProcess.on("close", (code) => {
    console.log(`Script Python finalizado con código: ${code}`);
  });
}




router.post('/webhook', async (req, res) => {
  let exportId;
  const { id: dataId, data: { form_id: formId } } = req.body;

  try {
    const response = await fetch(`https://www.kizeoforms.com/rest/v3/forms/${formId}/exports`, {
      method: 'GET',
      headers: { Authorization: process.env.KIZEO_API_KEY }
    });

    const data = await response.json();
    if (data.status === 'ok' && data.exports.length > 0) {
      exportId = data.exports[0].id;
      console.log('Export ID:', exportId);
    } else {
      return res.status(400).json({ error: 'No se encontraron exportaciones o el estado no es "ok".' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener el exportId' });
  }

  try {
    const response = await fetch(`https://forms.kizeo.com/rest/v3/forms/${formId}/data/${dataId}/exports/${exportId}/pdf`, {
      method: 'GET',
      headers: { Authorization: process.env.KIZEO_API_KEY }
    });

    if (!response.ok) throw new Error(`Error al obtener el PDF: ${response.statusText}`);

    const fileName = response.headers.get('x-filename-custom').replace(/[^a-zA-Z0-9._-]/g, '');
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    ejecutarSubidaSharePoint(site_url, destinationFolder, fileName);

    res.status(200).json({ message: 'Archivo PDF descargado exitosamente', fileName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
