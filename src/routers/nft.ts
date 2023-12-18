import { Router } from 'express';
import Result from '../utils/result';
import { getAiOriginals } from '../web3';
import { cleanData } from '../common';
import { transactionService } from '../services/transaction';
import { getChainId } from '../utils/request';

const router: Router = Router();

router.post('/signAiOriginalsMintData', async (req: any, res) => {
    try {
        const { sn, expired } = req.body;
        const aiOriginals = getAiOriginals(getChainId(req));
        const data = await aiOriginals.signMintData(sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

export default router;
