import { readEffects, writeEffects } from '../models/effectsModel.js';

export function validateEffect(effect) {
  if (!effect || typeof effect !== 'object') return { ok:false, error:'Effect must be an object' };
  if (typeof effect.title !== 'string' || !effect.title.trim()) return { ok:false, error:'Title is required' };
  return { ok:true };
}

export async function getEffects() { return await readEffects(); }

export async function addEffect(effect) {
  const v = validateEffect(effect);
  if (!v.ok) throw new Error(v.error);
  const effects = await readEffects();
  effects.unshift(effect);
  await writeEffects(effects);
  return effect;
}

export async function overwriteAllEffects(effects) {
  if (!Array.isArray(effects)) throw new Error('Effects payload must be an array');
  await writeEffects(effects);
}

export async function deleteEffectById(id) {
  const effects = await readEffects();
  await writeEffects(effects.filter(e => e.id !== id));
}

export default { validateEffect, getEffects, addEffect, overwriteAllEffects, deleteEffectById };
