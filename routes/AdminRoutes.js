import express from 'express';
import { 
    createAdmin, 
    deleteAdmin, 
    getAllAdmin, 
    getAdminOne 
} from '../controllers/AdminController.js';

const router = express.Router();

router.get("/:id", getAllAdmin);
router.post("/check", getAdminOne);
router.post("/create", createAdmin);
router.post("/delete", deleteAdmin);

export default router;


