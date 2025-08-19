import { getEffects, addEffect, overwriteAllEffects, deleteEffectById } from '../services/effectsService.js';
import asyncHandler from '../middlewares/asyncHandler.js';

export const listEffects = asyncHandler(async (req, res) => {
  const effects = await getEffects();
  res.json(effects);
});

export const createEffect = asyncHandler(async (req, res) => {
  const effect = await addEffect(req.body);
  res.status(201).json(effect);
});

export const replaceEffects = asyncHandler(async (req, res) => {
  await overwriteAllEffects(Array.isArray(req.body) ? req.body : []);
  res.json({ ok: true });
});

export const removeEffect = asyncHandler(async (req, res) => {
  await deleteEffectById(req.params.id);
  res.json({ ok: true });
});

export default { listEffects, createEffect, replaceEffects, removeEffect };
