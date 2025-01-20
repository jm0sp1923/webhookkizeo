// logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Nivel mínimo de logs a registrar
  format: winston.format.combine(
    winston.format.timestamp(), // Agrega una marca de tiempo
    winston.format.json() // Formato JSON para los logs
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log' }), // Guardar logs en archivo
    new winston.transports.Console({ format: winston.format.simple() }) // También mostrar logs en la consola
  ]
});

export default logger;
