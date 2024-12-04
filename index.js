const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Ruta para el webhook
app.post('/webhook/kizeo', (req, res) => {
  const data = req.body;

  console.log('Datos recibidos desde Kizeo:', data);

  // Procesar los datos aquí (guardarlos en una base de datos, enviar notificaciones, etc.)

  res.status(200).send('Webhook recibido correctamente');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
