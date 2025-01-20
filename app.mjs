import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import morgan from 'morgan';
// Importar rutas
import webhookRoutes from './routes/webhook.js';
import indexRoutes from './routes/index.js';
import updatelistRoutes from './routes/updatelist.js';
import apilist from './routes/apiList.js';
import fucionarExcel from './routes/fucionarExcel.js';
import responseTimeLogger from './middlewares/responseTimeLogger .js';
import resourceUsageLogger from './middlewares/resourceUsageLogger.js'; 

// Importar configuración de logger
import logger from './utils/logger.js'; // Importar el logger de Winston

// Configuración de variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(responseTimeLogger);
app.use(resourceUsageLogger);

// Configuración de logs usando Morgan y Winston
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Configuración del motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Middlewares globales
app.use(express.json({ limit: '50mb' })); // Ajusta el límite según sea necesario
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.status(200).render('200');
});

// Rutas
app.use(webhookRoutes);
app.use(indexRoutes);
app.use(updatelistRoutes);
app.use(apilist);
app.use(fucionarExcel);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('404');
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  logger.error(`Error en la ruta ${req.url}: ${err.message}`, { stack: err.stack });
  res.status(500).json({ message: 'Error en el servidor' });
});

// Iniciar el servidor
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  logger.info(`Server is running on port ${port}`);
});
