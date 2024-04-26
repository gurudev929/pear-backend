import express from 'express';
import { 
    getSettingValue, 
    setSettingValue,
} from '../controllers/SettingController.js';

const router = express.Router();

router.post("/get", getSettingValue);
router.post("/set", setSettingValue);

export default router;


