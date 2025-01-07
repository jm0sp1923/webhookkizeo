import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import webhookRoutes from './routes/webhook.js';
import indexRoutes from './routes/index.js';
import updatelistRoutes from './routes/updatelist.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use('/utils', express.static(path.join(__dirname, 'utils')));

// Usar las rutas
app.use(webhookRoutes);
app.use(indexRoutes);
app.use(updatelistRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});