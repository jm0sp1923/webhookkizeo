import express from 'express';


const router = express.Router();

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
