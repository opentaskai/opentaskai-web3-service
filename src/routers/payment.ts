import { Router } from 'express';
import Result from '../utils/result';
import { payment } from '../web3';

const router: Router = Router();

router.post('/signDepositAndFreezeData', async (req: any, res) => {
    try {
        const { to, token, available, frozen, sn } = req.body;
        const data = await payment.signDepositAndFreezeData(to, token, available, frozen, sn);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signWithdrawWithDetail', async (req: any, res) => {
    try {
        const { to, token, available, frozen, sn } = req.body;
        const data = await payment.signWithdrawWithDetail(to, token, available, frozen, sn);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signFreezeData', async (req: any, res) => {
    try {
        const { token, amount, sn } = req.body;
        const data = await payment.signFreezeData(token, amount, sn);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signUnfreezeData', async (req: any, res) => {
    try {
        const { token, amount, sn } = req.body;
        const data = await payment.signFreezeData(token, amount, sn);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signTransferData', async (req: any, res) => {
    try {
        const { token, from, to, available, frozen, amount, fee, sn } = req.body;
        const data = await payment.signTransferData(token, from, to, available, frozen, amount, fee, sn);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signCancelData', async (req: any, res) => {
    try {
        const { userA, userB, sn } = req.body;
        const data = await payment.signCancelData(userA, userB, sn);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

export default router;
