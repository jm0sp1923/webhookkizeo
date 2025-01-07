import express from 'express';
import axios from 'axios';
import multer from 'multer';
import XLSX from 'xlsx';
import clearText from '../utils/limpiarTexto.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

const api_key = process.env.KIZEO_API_KEY;

// Función auxiliar para hacer la solicitud a la API
const updateKizeoList = async (listType, data) => {
  const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${listType}`;
  try {
    await axios.put(kizeoUrl, { items: data }, {
      headers: {
        Authorization: api_key,
      },
    });
    return { success: true };
  } catch (error) {
    console.error(`Error al actualizar la lista ${listType}:`, error);
    return { success: false, message: `Error al actualizar la lista ${listType}` };
  }
};

// Ruta para renderizar la vista de actualización
router.get('/updateListsView', async (req, res) => {
  try {
    res.render('updatelist');
  } catch (error) {
    console.error('Error al cargar la página de actualización:', error);
    res.status(500).send('Error al cargar la página');
  }
});

// Ruta para actualizar listas
router.post('/updatelist', upload.single('excelFile'), async (req, res) => {
  const { listType, uploadOption, jsonData } = req.body;

  if (uploadOption === 'file') {
    return handleFileUpload(req, res, listType);
  } else if (uploadOption === 'json' && jsonData) {
    return handleJsonUpload(req, res, listType, jsonData);
  } else {
    return res.status(400).json({ success: false, message: 'Datos no válidos o faltantes' });
  }
});

// Manejo de la subida de archivo Excel
const handleFileUpload = async (req, res, listType) => {
  const file = req.file;

  if (!file.mimetype.includes('spreadsheet')) {
    return res.status(400).json({ success: false, message: 'El archivo debe ser un archivo Excel válido' });
  }

  try {
    // Procesar el archivo Excel en lotes
    await processExcelFileInBatches(file, listType);
    return res.json({ success: true, message: 'Lista actualizada correctamente desde Excel' });
  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error);
    return res.status(500).json({ success: false, message: 'Error al procesar el archivo Excel' });
  }
};

// Procesar el archivo Excel en lotes
const processExcelFileInBatches = async (file, listType, batchSize = 1000) => {
  const workbook = XLSX.readFile(file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonDataFromExcel = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1); // Excluir cabecera

  // Dividir los datos en lotes más pequeños
  const batches = [];
  for (let i = 0; i < jsonDataFromExcel.length; i += batchSize) {
    batches.push(jsonDataFromExcel.slice(i, i + batchSize));
  }

  // Procesar cada lote de datos
  for (const batch of batches) {
    const formattedData = batch.map(row =>
      row.map((cell, index) => index === 8 ? clearText(cell || '') : cell || '').join('|')
    );

    const result = await updateKizeoList(listType, formattedData);
    if (!result.success) {
      throw new Error('Error al actualizar la lista en un lote');
    }
  }
};

// Manejo de la subida de datos JSON
const handleJsonUpload = async (req, res, listType, jsonData) => {
  try {
    const parsedData = JSON.parse(jsonData);
    const result = await updateKizeoList(listType, parsedData);
    return handleResult(res, result, 'JSON');
  } catch (error) {
    console.error('Error al procesar los datos JSON:', error);
    return res.status(500).json({ success: false, message: 'Error al procesar los datos JSON' });
  }
};

// Manejar el resultado de la actualización
const handleResult = (res, result, source) => {
  if (result.success) {
    return res.json({ success: true, message: `Lista actualizada correctamente desde ${source}` });
  } else {
    return res.status(500).json(result);
  }
};

export default router;
