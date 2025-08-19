import { readEffects, writeEffects } from '../models/effectsModel.js';
import AppError from '../utils/appError.js';
import { sanitizeString } from '../utils/sanitize.js';

export function validateEffect(effect) {
  if (!effect || typeof effect !== 'object') throw new AppError('Effect must be an object', 400);
  if (typeof effect.title !== 'string' || !effect.title.trim()) throw new AppError('Title is required', 400);
}

function sanitizeEffect(effect) {
  return { ...effect, title: sanitizeString(effect.title) };
}

export async function getEffects() {
  return await readEffects();
}

export async function addEffect(effect) {
  validateEffect(effect);
  const sanitized = sanitizeEffect(effect);
  const effects = await readEffects();
  effects.unshift(sanitized);
  await writeEffects(effects);
  return sanitized;
}

export async function overwriteAllEffects(effects) {
  if (!Array.isArray(effects)) throw new AppError('Effects payload must be an array', 400);
  const sanitized = effects.map((e) => {
    validateEffect(e);
    return sanitizeEffect(e);
  });
  await writeEffects(sanitized);
}

export async function deleteEffectById(id) {
  const effects = await readEffects();
  const filtered = effects.filter((e) => e.id !== id);
  await writeEffects(filtered);
}

export default { validateEffect, getEffects, addEffect, overwriteAllEffects, deleteEffectById };
