import express from 'express';
import { createHash, findPoolFromHash, findHashFromPool } from '../controllers/HashController.js';

const router = express.Router();

router.post("/create", createHash);
router.get("/find/:id", findPoolFromHash);
router.post("/hash/:id", findHashFromPool);

export default router;


