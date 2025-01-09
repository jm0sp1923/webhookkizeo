import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';


dotenv.config();
// Token de autenticación
const token = process.env.KIZEO_API_KEY;


// Ruta para obtener las listas desde la API externa
router.get('/api/lists', async (req, res) => {
  try {

  
    const response = await fetch('https://www.kizeoforms.com/rest/v3/lists/', {
      method: 'GET',
      headers: {
        Authorization: token,
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener los datos de la API');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error en la API externa:', error);
    res.status(500).json({ error: error.message });
  }
});


export default router;
