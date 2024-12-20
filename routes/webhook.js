import express from 'express';
import fetch from 'node-fetch';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { ejecutarSubidaSharePoint } from '../utils/pythonUtils.js';
import { obtenExportId } from '../utils/kizeoUtils.js';
import dotenv from 'dotenv';
const router = express.Router();

dotenv.config();
const uploadsDir = path.join(process.cwd(), 'uploads');
const site_url = process.env.SITE_URL;
const destinationFolder = process.env.DESTINATION_FOLDER;



router.post('/webhook', async (req, res) => {
  
  const { id: dataId, data: { form_id: formId } } = req.body;
  console.log('Respuesta Webhook', req.body);
  try {
    const exportId = await obtenExportId(formId, process.env.KIZEO_API_KEY);
    console.log('Export ID obtenido:', exportId);
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
