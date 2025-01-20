import express from 'express';
import axios from 'axios';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs'; 
import changeExcelToJson from '../utils/changeExcelToJson.js'; 

dotenv.config();
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const api_key = process.env.KIZEO_API_KEY;

// Ruta para renderizar la vista de actualización
router.get('/updateListsView', async (req, res) => {
  try {
    res.render('viewUpdateList'); // Renderizar la vista de actualización
  } catch (error) {
    console.error('Error al leer la carpeta uploads:', error);
    res.status(500).send('Error al cargar la página');
  }
});

// Ruta para actualizar listas
router.post('/updatelist', upload.single('excelFile'), async (req, res) => {
  try {
    const { listType } = req.body;
    console.log('Datos recibidos:', req.body);

    // Procesar archivo Excel usando la función changeExcelToJson
    const file = req.file;
    console.log('Archivo Excel recibido:', file);

    if (!file.mimetype.includes('excel') && !file.mimetype.includes('spreadsheetml')) {
      return res.status(400).json({ success: false, message: 'El archivo debe ser un archivo Excel válido' });
    }

    // Usar la función changeExcelToJson para convertir el Excel a JSON
    const jsonBody = await changeExcelToJson(file);

    if (!jsonBody) {
      return res.status(400).json({ success: false, message: 'Error al procesar el archivo Excel' });
    }

    // Construir la URL de Kizeo con el tipo de lista
    const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${listType}`;

    try {
      // Actualizar la lista en Kizeo
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
  } catch (error) {
    console.error('Error general al actualizar la lista:', error);
    return res.status(500).json({ success: false, message: 'Error general al actualizar la lista' });
  }
});

export default router;
