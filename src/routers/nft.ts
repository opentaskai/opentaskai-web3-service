import { Router } from 'express';
import Result from '../utils/result';
import { getAiOriginals } from '../web3';
import { cleanData } from '../common';
import { transactionService } from '../services/transaction';
import { getChainId } from '../utils/request';

const router: Router = Router();

router.post('/signMintData', async (req: any, res) => {
    try {
        const { sn } = req.body;
        await transactionService.checkSN(sn);
        const aiOriginals = getAiOriginals(getChainId(req));
        const data = await aiOriginals.signMintData(sn);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

export default router;
