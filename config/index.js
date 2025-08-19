import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PORT = process.env.PORT || 3000;
export const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'effects.json');
