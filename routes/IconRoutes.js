import express from 'express';
import { createIcon, getIcon } from '../controllers/IconController.js';

const router = express.Router();

router.post("/create", createIcon);
router.get("/:id", getIcon);

export default router;


