import express from 'express'; // Cambia a import
import axios from 'axios'; // Cambia a import
import multer from 'multer'; // Cambia a import

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
    console.log('Datos recibidos:', req.body); // Verifica los datos enviados
    const { listType,uploadOption, jsonData } = req.body;

    if (uploadOption === 'json') {
      try {
        // Limpiar el JSON de saltos de línea y espacios innecesarios
        const cleanedJsonData = jsonData.replace(/[\r\n]+/g, '').replace(/\s+/g, ' ').trim();

        // Intentar parsear el JSON limpio
        const jsonBody = JSON.parse(cleanedJsonData); // Intentar parsear el JSON
        console.log('JSON recibido:', jsonBody);

        const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${listType}`;

        // Hacer la solicitud POST a KizeoForms
        await axios.put(kizeoUrl, jsonBody, {
          headers: {
            Authorization: api_key
          },
        });

        // Responder con el resultado
        res.status(200).send('Lista actualizada correctamente');
      } catch (error) {
        console.error('Error al parsear el JSON:', error);
        res.status(400).send('JSON inválido');
      }
    } else if (uploadOption === 'file' && req.file) {
      // Procesar el archivo Excel aquí (puedes usar bibliotecas como 'xlsx' o 'exceljs' para leer el archivo)
      const file = req.file; // El archivo estará en req.file
      console.log('Archivo Excel recibido:', file);

      // Aquí puedes hacer algo con el archivo, como procesarlo y convertirlo en el formato esperado
      // Ejemplo de cuerpo de solicitud para Kizeo (esto depende de cómo proceses el archivo)
      const jsonBody = {
        items: [
          'Zona 1|elena.mendez@affi.net',
          'Zona 2|angelica.ramirez@affi.net',
          'Zona prueba|prueba@gmail.com',
        ],
      };

      const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${formId}`;

      // Hacer la solicitud POST a KizeoForms
      await axios.post(kizeoUrl, jsonBody, {
        headers: {
          Authorization: api_key // Asegúrate de usar la variable correcta
        },
      });

      // Responder con el resultado
      res.status(200).send('Lista actualizada correctamente');
    } else {
      res.status(400).send('Datos no válidos');
    }
  } catch (error) {
    console.error('Error al actualizar la lista:', error);
    res.status(500).send('Error al actualizar la lista');
  }
});

export default router;
