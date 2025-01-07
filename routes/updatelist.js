import express from 'express';

const router = express.Router();

// Define the GET endpoint
router.get('/updateListsView', async (req, res) => {
    try {
      // Leer los nombres de los archivos en la carpeta 'uploads'
      res.render('updatelist'); // Enviar los nombres de los archivos a la vista
    } catch (error) {
      console.error('Error al leer la carpeta uploads:', error);
      res.status(500).send('Error al cargar la página');
    }
  });

export default router;