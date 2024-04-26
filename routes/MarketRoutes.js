import express from 'express';

import {
    getPearTokenRanking,
    runDistributeReward,
} from '../controllers/MarketController.js';

const router = express.Router();

router.post("/rank", getPearTokenRanking);
router.post("/reward", runDistributeReward);

export default router;


