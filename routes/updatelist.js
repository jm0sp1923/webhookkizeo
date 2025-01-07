import express from 'express'; // Cambia a import
import axios from 'axios'; // Cambia a import
import multer from 'multer'; // Cambia a import
import XLSX from 'xlsx'; // Importar XLSX para leer archivos Excel

const upload = multer({ dest: 'uploads/' }); // Si estás usando Multer para manejar la subida de archivos
const router = express.Router();

const api_key = process.env.KIZEO_API_KEY;

router.get('/updateListsView', async (req, res) => {
  try {
    // Leer los nombres de los archivos en la carpeta 'uploads'
    res.render('updatelist'); // Enviar los nombres de los archivos a la vista
  } catch (error) {
    console.error('Error al leer la carpeta uploads:', error);
    res.status(500).send('Error al cargar la página');
  }
});

router.post('/updatelist', upload.single('excelFile'), async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const { listType, uploadOption, jsonData } = req.body;

    if (uploadOption === 'json') {
      try {
        const cleanedJsonData = jsonData.replace(/[\r\n]+/g, '').replace(/\s+/g, ' ').trim();
        const jsonBody = JSON.parse(cleanedJsonData);
        console.log('JSON recibido:', jsonBody);

        const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${listType}`;

        await axios.put(kizeoUrl, jsonBody, {
          headers: {
            Authorization: api_key
          },
        });

        // Responder con un objeto JSON
        return res.json({ success: true, message: 'Lista actualizada correctamente' });

      } catch (error) {
        console.error('Error al actualizar la lista:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar la lista' });
      }
    } else if (uploadOption === 'file' && req.file) {
      const file = req.file;
      console.log('Archivo Excel recibido:', file);
      
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonDataFromExcel = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const dataWithoutHeader = jsonDataFromExcel.slice(1);
      const formattedData = dataWithoutHeader.map(row => row.join('|'));

      const jsonBody = {
        items: formattedData,
      };

      console.log('Datos procesados del Excel:', jsonBody);

      const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${listType}`;

      try {
        await axios.put(kizeoUrl, jsonBody, {
          headers: {
            Authorization: api_key
          },
        });

        return res.json({ success: true, message: 'Lista actualizada correctamente' });

      } catch (error) {
        console.error('Error al actualizar la lista:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar la lista' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Datos no válidos' });
    }
  } catch (error) {
    console.error('Error al actualizar la lista:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar la lista' });
  }
});


export default router;
