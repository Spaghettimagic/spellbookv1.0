import { getEffects, addEffect, overwriteAllEffects, deleteEffectById } from '../services/effectsService.js';

function handleError(res, status, err, message = err.message) {
  console.error(err);
  res.status(status).json({ error: message });
}

export async function listEffects(req, res) {
  try { res.json(await getEffects()); }
  catch (err) { handleError(res, 500, err, 'Failed to retrieve effects'); }
}

export async function createEffect(req, res) {
  try { res.status(201).json(await addEffect(req.body)); }
  catch (err) { handleError(res, 400, err); }
}

export async function replaceEffects(req, res) {
  try { await overwriteAllEffects(Array.isArray(req.body) ? req.body : []); res.json({ ok:true }); }
  catch (err) { handleError(res, 400, err); }
}

export async function removeEffect(req, res) {
  try { await deleteEffectById(req.params.id); res.json({ ok:true }); }
  catch (err) { handleError(res, 400, err); }
}

export default { listEffects, createEffect, replaceEffects, removeEffect };
