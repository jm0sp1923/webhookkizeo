import express from 'express';


const router = express.Router();

router.get('/fucionarExcel', async (req, res) => {
  try {
    res.render('viewFucionarExcel'); 
  } catch (error) {
    res.status(500).send('Error al cargar la página');
  }
});

export default router;
