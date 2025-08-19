import express from 'express';
import { listEffects, createEffect, replaceEffects, removeEffect } from '../controllers/effectsController.js';

const router = express.Router();
router.get('/', listEffects);
router.post('/', createEffect);
router.put('/', replaceEffects);
router.delete('/:id', removeEffect);

export default router;
