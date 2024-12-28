
import fetch from 'node-fetch';
import { ejecutarSubidaSharePoint } from '../utils/pythonUtils.js';
import { obtenExportId } from '../utils/kizeoUtils.js';
import dotenv from 'dotenv';
const router = express.Router();

dotenv.config();
const site_url = process.env.SITE_URL;

router.post('/webhook', async (req, res) => {
  const { id: dataId, data: { form_id: formId, fields } } = req.body;

  JSON.stringify(req.body, null, 2);

  try {
    // Extraer la zona desde la propiedad correcta   
    
    const zona = fields?.zonas?.result?.value?.code; // Accede a la propiedad 'zonas'
    const diligencia = fields?.acta_de_diligencia?.result?.value; // Accede a la propiedad 'diligencia'

    if (!zona) {
      throw new Error('Zona no encontrada en los datos recibidos.');
    }
    console.log('Zona extraída:', zona);

    if (!diligencia) {
      throw new Error('diligencia no encontrada en los datos recibidos.');
    }
    console.log('Diligencia extraída:', diligencia);

    // Determinar la carpeta de destino según la zona
    let destinationFolder;
    if (zona === 'Zona 1') {
      destinationFolder = process.env.DESTINATION_FOLDER_ZONA_1;
    } else if (zona === 'Zona 2') {
      destinationFolder = process.env.DESTINATION_FOLDER_ZONA_2;
    } else {
      throw new Error(`Zona desconocida: ${zona}. No se puede determinar la carpeta de destino.`);
    }

    destinationFolder = destinationFolder + '/' + diligencia;

    // Obtener exportId
    const exportId = await obtenExportId(formId, process.env.KIZEO_API_KEY);
    console.log('Export ID obtenido:', exportId);

    // Descargar el PDF
    const response = await fetch(`https://forms.kizeo.com/rest/v3/forms/${formId}/data/${dataId}/exports/${exportId}/pdf`, {
      method: 'GET',
      headers: { Authorization: process.env.KIZEO_API_KEY }
    });

    if (!response.ok) throw new Error(`Error al obtener el PDF: ${response.statusText}`);

    const fileName = response.headers.get('x-filename-custom').replace(/[^a-zA-Z0-9._-]/g, '');
    const buffer = Buffer.from(await response.arrayBuffer());

    // Subir a SharePoint directamente desde el buffer
    await ejecutarSubidaSharePoint(site_url, destinationFolder, fileName, buffer);

    res.status(200).json({ message: 'Archivo PDF procesado y subido exitosamente', fileName });
  } catch (error) {
    console.error('Error en el webhook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
