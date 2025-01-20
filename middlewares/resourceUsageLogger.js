import pidusage from 'pidusage'; // Importa la librería pidusage
import logger from "../utils/logger.js"; // Importa el logger

// Middleware para medir el tiempo de respuesta y el uso de recursos
const resourceUsageLogger = (req, res, next) => {
  const start = Date.now(); // Guarda el tiempo de inicio

  // Escucha cuando la respuesta termine
  res.on('finish', async () => {
    const duration = Date.now() - start; // Calcula la duración
    const pid = process.pid; // Obtiene el ID del proceso de Node.js

    // Obtiene información de uso de recursos del proceso
    try {
      const stats = await pidusage(pid);
      const cpuUsage = stats.cpu; // Uso de CPU en porcentaje
      const memoryUsage = stats.memory / 1024 / 1024; // Uso de memoria en MB

      logger.info(`Solicitud a ${req.originalUrl} - ${res.statusCode} - ${duration}ms - CPU: ${cpuUsage.toFixed(2)}% - Memoria: ${memoryUsage.toFixed(2)}MB`);
    } catch (error) {
      logger.error(`Error obteniendo estadísticas de recursos: ${error.message}`);
    }
  });

  next(); // Llama al siguiente middleware o ruta
};

export default resourceUsageLogger;
