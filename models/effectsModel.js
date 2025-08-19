import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDataPath = path.join(__dirname, '..', 'data', 'effects.json');
const DATA_FILE = process.env.DATA_FILE || defaultDataPath;

let cache = null;

export async function readEffects() {
  if (cache) return cache;
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    cache = JSON.parse(data);
    if (!Array.isArray(cache)) cache = [];
  } catch {
    cache = [];
  }
  return cache;
}

export async function writeEffects(effects) {
  cache = Array.isArray(effects) ? effects : [];
  const json = JSON.stringify(cache, null, 2);
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, json);
}

export default { readEffects, writeEffects };
