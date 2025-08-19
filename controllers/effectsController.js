import { getEffects, addEffect, overwriteAllEffects, deleteEffectById } from '../services/effectsService.js';

export async function listEffects(req, res) {
  try { res.json(await getEffects()); }
  catch (err) { console.error(err); res.status(500).json({ error:'Failed to retrieve effects' }); }
}

export async function createEffect(req, res) {
  try { res.status(201).json(await addEffect(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
}

export async function replaceEffects(req, res) {
  try { await overwriteAllEffects(Array.isArray(req.body) ? req.body : []); res.json({ ok:true }); }
  catch (err) { res.status(400).json({ error: err.message }); }
}

export async function removeEffect(req, res) {
  try { await deleteEffectById(req.params.id); res.json({ ok:true }); }
  catch (err) { res.status(400).json({ error: err.message }); }
}

export default { listEffects, createEffect, replaceEffects, removeEffect };
