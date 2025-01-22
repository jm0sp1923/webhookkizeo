import express from 'express';
import fetch from 'node-fetch';
import { ejecutarSubidaSharePoint } from '../utils/pythonExecuter.js';
import { obtenExportId } from '../utils/getExportId.js';
import dotenv from 'dotenv';
const router = express.Router();

dotenv.config();
const site_url = process.env.SITE_URL;

router.post('/webhook', async (req, res) => {
  const { id: dataId, data: { form_id: formId, fields } } = req.body;

  console.log(JSON.stringify(req.body, null, 2));

  try {
    const zona = fields?.zonas?.result?.value?.code;
    const diligencia = fields?.acta_de_diligencia?.result?.value;

    if (!zona) {
      throw new Error('Zona no encontrada en los datos recibidos.');
    }
    console.log('Zona extraída:', zona);

    if (!diligencia) {
      throw new Error('Diligencia no encontrada en los datos recibidos.');
    }
    console.log('Diligencia extraída:', diligencia);

    let destinationFolder;
    if (zona === 'Zona 1') {
      destinationFolder = process.env.DESTINATION_FOLDER_ZONA_1;
    } else if (zona === 'Zona 2') {
      destinationFolder = process.env.DESTINATION_FOLDER_ZONA_2;
    } else {
      throw new Error(`Zona desconocida: ${zona}. No se puede determinar la carpeta de destino.`);
    }

    const exportId = await obtenExportId(formId, process.env.KIZEO_API_KEY);
    console.log('Export ID obtenido:', exportId);

    const response = await fetch(`https://forms.kizeo.com/rest/v3/forms/${formId}/data/${dataId}/exports/${exportId}/pdf`, {
      method: 'GET',
      headers: { Authorization: process.env.KIZEO_API_KEY },
    });

    if (!response.ok) throw new Error(`Error al obtener el PDF: ${response.statusText}`);

    const fileName = response.headers.get('x-filename-custom').replace(/[^a-zA-Z0-9._-]/g, '');
    const buffer = Buffer.from(await response.arrayBuffer());

    // Subir a SharePoint y capturar la URL
    const uploadUrl = await ejecutarSubidaSharePoint(site_url, destinationFolder, diligencia, fileName, buffer);

    res.status(200).json({ message: 'Archivo PDF procesado y subido exitosamente', uploadUrl });
  } catch (error) {
    console.error('Error en el webhook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
