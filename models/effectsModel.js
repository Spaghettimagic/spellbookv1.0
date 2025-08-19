import fs from 'fs/promises';
import path from 'path';
import { DATA_FILE } from '../config/index.js';

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
