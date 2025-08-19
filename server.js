import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import effectsRoutes from './routes/effectsRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import { PORT } from './config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.use('/api/effects', effectsRoutes);

app.use(errorHandler);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

export default app;
