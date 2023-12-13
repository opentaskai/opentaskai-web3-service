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

router.post('/signDepositAndFreezeData', async (req: any, res) => {
    try {
        const { to, token, available, frozen, sn } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signDepositAndFreezeData(to, token, available, frozen, sn);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signWithdrawWithDetail', async (req: any, res) => {
    try {
        const { to, token, available, frozen, sn } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signWithdrawWithDetail(to, token, available, frozen, sn);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signFreezeData', async (req: any, res) => {
    try {
        const { token, amount, sn } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signFreezeData(token, amount, sn);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signUnfreezeData', async (req: any, res) => {
    try {
        const { token, amount, sn } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signFreezeData(token, amount, sn);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signTransferData', async (req: any, res) => {
    try {
        const { token, from, to, available, frozen, amount, fee, sn } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signTransferData(token, from, to, available, frozen, amount, fee, sn);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signCancelData', async (req: any, res) => {
    try {
        const { userA, userB, sn } = req.body;
        await transactionService.checkSN(sn);
        const data = await paymentIns(req).signCancelData(userA, userB, sn);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

export default router;
