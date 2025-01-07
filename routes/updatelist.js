import express from 'express';
import axios from 'axios';
import multer from 'multer';
import XLSX from 'xlsx';

const upload = multer({ dest: 'uploads/' }); // Si estás usando Multer para manejar la subida de archivos
const router = express.Router();

const api_key = process.env.KIZEO_API_KEY;

// Función para limpiar texto: reemplazar saltos de línea, eliminar espacios adicionales y limpiar caracteres extraños
const cleanText = (text) => {
  if (text) {
    return text
      .toString()
      .replace(/[\r\n]+/g, ' ')  // Reemplazar saltos de línea por un solo espacio
      .replace(/\s+/g, ' ')      // Reemplazar espacios múltiples por un solo espacio
      .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres no alfanuméricos (opcional)
      .trim();                  // Eliminar espacios al principio y al final
  }
  return text;
};

// Ruta para cargar la vista de actualización
router.get('/updateListsView', async (req, res) => {
  try {
    res.render('updatelist'); // Renderizar la vista de actualización
  } catch (error) {
    console.error('Error al leer la carpeta uploads:', error);
    res.status(500).send('Error al cargar la página');
  }
});

// Ruta para actualizar las listas
router.post('/updatelist', upload.single('excelFile'), async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const { listType, uploadOption, jsonData } = req.body;

    // Caso cuando se sube un JSON
    if (uploadOption === 'json') {
      try {
        // Limpiar datos JSON
        const cleanedJsonData = cleanText(jsonData); // Usar la función cleanText para limpiar el JSON
        const jsonBody = JSON.parse(cleanedJsonData);
        console.log('JSON recibido:', jsonBody);

        const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${listType}`;

        // Realizar la solicitud PUT a la API de Kizeo
        await axios.put(kizeoUrl, jsonBody, {
          headers: {
            Authorization: api_key,
          },
        });

        return res.json({ success: true, message: 'Lista actualizada correctamente' });

      } catch (error) {
        console.error('Error al actualizar la lista con JSON:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar la lista con JSON' });
      }
    }
    
    // Caso cuando se sube un archivo Excel
    else if (uploadOption === 'file' && req.file) {
      const file = req.file;
      console.log('Archivo Excel recibido:', file);

      // Verificar si el archivo es Excel
      if (!file.mimetype.includes('spreadsheet')) {
        return res.status(400).json({ success: false, message: 'El archivo debe ser un archivo Excel válido' });
      }

      // Leer el archivo Excel
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convertir las celdas a JSON
      const jsonDataFromExcel = XLSX.utils.sheet_to_json(sheet, { header:  1});

      // Eliminar la primera fila (cabecera) y limpiar los datos
      const dataWithoutHeader = jsonDataFromExcel.slice(1);

      // Limpiar cada celda de la fila
      const formattedData = dataWithoutHeader.map(row => 
        row.map(cell => 
          cleanText(cell)  // Limpiar cada celda
        ).join('|')
      );

      const jsonBody = { items: formattedData };
      console.log('Datos procesados del Excel:', jsonBody);

      const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${listType}`;

      try {
        // Realizar la solicitud PUT a la API de Kizeo
        await axios.put(kizeoUrl, jsonBody, {
          headers: {
            Authorization: api_key,
          },
        });

        return res.json({ success: true, message: 'Lista actualizada correctamente desde Excel' });

      } catch (error) {
        console.error('Error al actualizar la lista con Excel:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar la lista con Excel' });
      }
    } 
    else {
      return res.status(400).json({ success: false, message: 'Datos no válidos' });
    }
  } catch (error) {
    console.error('Error general al actualizar la lista:', error);
    return res.status(500).json({ success: false, message: 'Error general al actualizar la lista' });
  }
});

export default router;
