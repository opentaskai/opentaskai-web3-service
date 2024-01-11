import { Router } from 'express';
import Result from '../utils/result';
import { getPayment } from '../web3';
import { cleanData } from '../common';
import { transactionService } from '../services/transaction';
import { getChainId } from '../utils/request';

const router: Router = Router();

function paymentIns(req: any) {
    const chainId = getChainId(req);
    return getPayment(chainId);
}

router.post('/signBindAccountData', async (req: any, res) => {
    try {
        const { account, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signBindAccountData(account, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signDepositData', async (req: any, res) => {
    try {
        const { to, token, amount, frozen, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signDepositData(to, token, amount, frozen, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signWithdraw', async (req: any, res) => {
    try {
        const { to, token, available, frozen, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signWithdraw(to, token, available, frozen, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signFreezeData', async (req: any, res) => {
    try {
        const { account, token, amount, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signFreezeData(account, token, amount, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signUnfreezeData', async (req: any, res) => {
    try {
        const { account, token, amount, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signFreezeData(account, token, amount, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signTransferData', async (req: any, res) => {
    try {
        const { out, token, from, to, available, frozen, amount, fee, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signTransferData(out, token, from, to, available, frozen, amount, fee, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signCancelData', async (req: any, res) => {
    try {
        const { userA, userB, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signCancelData(userA, userB, sn, expired);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

export default router;
