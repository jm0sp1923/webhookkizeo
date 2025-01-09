import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import cleanText from '../utils/limpiarTexto.js'; 
// Configurar multer para subir archivos
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Obtener la ruta correcta sin doble C:\
const __dirname = path.resolve(); // Usar path.resolve() para obtener la ruta absoluta correctamente

// Crear la ruta para el directorio 'downloads' correctamente
const downloadsDir = path.join(__dirname, 'downloads'); // Usar path.join para asegurar que no haya problemas de concatenación

// Asegurarse de que el directorio 'downloads' exista
if (!fs.existsSync(downloadsDir)) {
    console.log('Creando la carpeta "downloads"...');
    fs.mkdirSync(downloadsDir, { recursive: true }); // Crear la carpeta si no existe
}

// Ruta para renderizar la vista
router.get('/changeExcelToJson', (req, res) => {
    res.render('viewChangeExcelToJson');
});

// Endpoint para procesar el archivo Excel
router.post('/upload-excel', upload.single('excelFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
    }

    const file = req.file;
    console.log('Archivo Excel recibido:', file);

    if (!file.mimetype.includes('spreadsheet')) {
        return res.status(400).json({ success: false, message: 'El archivo debe ser un archivo Excel válido' });
    }

    // Leer el archivo Excel
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertir las celdas a JSON
    const jsonDataFromExcel = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Eliminar la primera fila (cabecera) y limpiar solo la columna 9
    const dataWithoutHeader = jsonDataFromExcel.slice(1);

    const formattedData = dataWithoutHeader.map(row => 
        row.map((cell, index) => {
            // Limpiar solo la columna 9 (índice 8 porque es 0-based)
            if (index === 8) {
                // Asegurarse de que la celda sea un string antes de usar trim()
                return cleanText(cell || ''); // Limpiar la 9ª columna
            }
            // Mantener otras columnas sin cambios
            return cell || '';
        }).join('|')  // Unir las columnas con un separador (opcional)
    );

    const jsonBody = { items: formattedData };
    console.log('Datos procesados del Excel:', jsonBody);

    // Crear la ruta del archivo para guardar el JSON
    const jsonFilePath = path.join(downloadsDir, 'archivo_convertido.json');

    // Guardar los datos JSON en el archivo
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonBody, null, 2));

    // Devolver la URL de descarga del archivo JSON
    res.json({
        success: true,
        message: 'Archivo procesado correctamente',
        downloadUrl: `/downloads/archivo_convertido.json`, // Esta URL puede ser usada en el frontend
    });
});

export default router;
