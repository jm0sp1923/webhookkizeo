import express from 'express';
import axios from 'axios';
import multer from 'multer';
import { readFileSync } from 'fs'; // Importación correcta de fs para ESM
const upload = multer({ dest: 'uploads/' }); // Manejar subida de archivos
const router = express.Router();
import dotenv from 'dotenv';

dotenv.config();
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
router.post('/updatelist', upload.single('jsonFile'), async (req, res) => {
  try {
    const { listType } = req.body;
    console.log('Datos recibidos:', req.body);
   
      // Procesar archivo JSON
      const file = req.file;
      console.log('Archivo JSON recibido:', file);

      if (!file.mimetype.includes('json')) {
        return res.status(400).json({ success: false, message: 'El archivo debe ser un archivo JSON válido' });
      }

      // Leer archivo JSON
      const jsonData = readFileSync(file.path, 'utf-8');
      const jsonBody = JSON.parse(jsonData);
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
    } catch (error) {
      console.error('Error general al actualizar la lista:', error);
      return res.status(500).json({ success: false, message: 'Error general al actualizar la lista' });
    }
  }
 );

export default router;
