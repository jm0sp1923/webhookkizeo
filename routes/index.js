import express from 'express';
import path from 'path';

const router = express.Router();
const uploadsDir = path.join(process.cwd(), 'uploads');

router.get('/', async (req, res) => {
  try {
    // Leer los nombres de los archivos en la carpeta 'uploads'
    res.render('index'); // Enviar los nombres de los archivos a la vista
  } catch (error) {
    console.error('Error al leer la carpeta uploads:', error);
    res.status(500).send('Error al cargar la página');
  }
});


router.get('/index', (req, res) => {
  res.status(200).json({ message: 'index' });
});

export default router;
