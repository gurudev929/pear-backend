import express from 'express';
import { 
    createBlacklist, 
    deleteBlacklist, 
    getAllBlacklist, 
    getBlacklistOne 
} from '../controllers/BlacklistController.js';

const router = express.Router();

router.get("/", getAllBlacklist);
router.post("/check", getBlacklistOne);
router.post("/create", createBlacklist);
router.post("/delete", deleteBlacklist);

export default router;


