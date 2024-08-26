import { Router } from 'express';
import Result from '../utils/result';
import {  CHAIN_IDS } from '../constants';
import { getTranscationCount } from '../services/metrics';


const router: Router = Router();

router.get('/check-send', async (req: any, res) => {
    const data = [];
    for (let i=0; i<CHAIN_IDS.length; i++) {
      const d = await getTranscationCount(CHAIN_IDS[i]);
      data.push(d);
    }
    res.send(Result.success(data));
});

export default router;
