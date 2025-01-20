import logger from "../utils/logger.js"; // Importa el logger

// Middleware para medir el tiempo de respuesta
const responseTimeLogger = (req, res, next) => {
  const start = Date.now(); // Guarda el tiempo de inicio

  // Escucha cuando la respuesta termine
  res.on('finish', () => {
    const duration = Date.now() - start; // Calcula la duración
    logger.info(`Solicitud a ${req.originalUrl} - ${res.statusCode} - ${duration}ms`); // Registra la URL, el código de estado y el tiempo
  });

  next(); // Llama al siguiente middleware o ruta
};

export default responseTimeLogger;
