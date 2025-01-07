import express from 'express';
import axios from 'axios';
import multer from 'multer';
import XLSX from 'xlsx';
import clearText from '../utils/limpiarTexto.js';
const upload = multer({ dest: 'uploads/' }); // Manejar subida de archivos
const router = express.Router();

const api_key = process.env.KIZEO_API_KEY;

// Ruta para renderizar la vista de actualización
router.get('/updateListsView', async (req, res) => {
  try {
    res.render('updatelist'); // Renderizar la vista de actualización
  } catch (error) {
    console.error('Error al leer la carpeta uploads:', error);
    res.status(500).send('Error al cargar la página');
  }
});

// Ruta para actualizar listas
router.post('/updatelist', upload.single('excelFile'), async (req, res) => {
  try {
    const { listType, uploadOption, jsonData } = req.body;

    if (uploadOption === 'file' && req.file) {
      // Procesar archivo Excel
      const file = req.file;
      console.log('Archivo Excel recibido:', file);

      if (!file.mimetype.includes('spreadsheet')) {
        return res.status(400).json({ success: false, message: 'El archivo debe ser un archivo Excel válido' });
      }

      // Leer archivo Excel
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convertir celdas a JSON
      const jsonDataFromExcel = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Eliminar la primera fila (cabecera) y limpiar solo la columna 9
      const dataWithoutHeader = jsonDataFromExcel.slice(1);

      const formattedData = dataWithoutHeader.map(row => 
        row.map((cell, index) => {
          // Limpiar solo la columna 9 (índice 8 porque es 0-based)
          if (index === 8) {
            return clearText(cell || '');
          }
          // Mantener otras columnas sin cambios
          return cell || '';
        }).join('|')
      );

      const jsonBody = { items: formattedData };
      console.log('Datos procesados del Excel:', jsonBody);

      const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${listType}`;

      try {
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
    } else if (uploadOption === 'json' && jsonData) {
      // Procesar JSON directamente
      const jsonBody = { items: JSON.parse(jsonData) };
      console.log('Datos recibidos como JSON:', jsonBody);

      const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${listType}`;

      try {
        await axios.put(kizeoUrl, jsonBody, {
          headers: {
            Authorization: api_key,
          },
        });

        return res.json({ success: true, message: 'Lista actualizada correctamente desde JSON' });

      } catch (error) {
        console.error('Error al actualizar la lista con JSON:', error);
        return res.status(500).json({ success: false, message: 'Error al actualizar la lista con JSON' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Datos no válidos o faltantes' });
    }
  } catch (error) {
    console.error('Error general al actualizar la lista:', error);
    return res.status(500).json({ success: false, message: 'Error general al actualizar la lista' });
  }
});

export default router;
