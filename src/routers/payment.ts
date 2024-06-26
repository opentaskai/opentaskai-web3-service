import { Router } from 'express';
import Result from '../utils/result';
import { getSignPayment, getClearPayment } from '../web3';
import { cleanData } from '../common';
import { transactionService } from '../services/transaction';
import { orderService } from '../services/order';
import { configService } from '../services/config';
import { tokenService } from '../services/token';
import { getChainId } from '../utils/request';
import { TransactionTypes, TransactionStatus } from '../typings/transaction';
import { common } from 'opentaskai-web3-jssdk';
import { BigNumber } from 'bignumber.js';

const router: Router = Router();

function signPayment(req: any) {
    const chainId = getChainId(req);
    return getSignPayment(chainId);
}

router.post('/signBindAccountData', async (req: any, res) => {
    try {
        const { account, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await signPayment(req).signBindAccountData(account, sn, expired);
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
        const data = await signPayment(req).signDepositData(to, token, amount, frozen, sn, expired);
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
        const data = await signPayment(req).signWithdraw(to, token, available, frozen, sn, expired);
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
        const data = await signPayment(req).signFreezeData(account, token, amount, sn, expired);
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
        const data = await signPayment(req).signFreezeData(account, token, amount, sn, expired);
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
        const data = await signPayment(req).signTransferData(out, token, from, to, available, frozen, amount, fee, sn, expired);
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
        const data = await signPayment(req).signCancelData(userA, userB, sn, expired);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/send', async (req: any, res) => {
    console.log('send req.body:', req.body);
    const { sn } = req.body;
    const transaction: any = await transactionService.get(sn);
    if (!transaction) {
        return res.send(Result.badRequest('invalid sn, ' +  sn));
    }
    if (transaction.status === TransactionStatus.success) {
        return res.send(Result.badRequest('already handle, sn: ' +  sn));
    }

    if (!transaction.amount) {
        return res.send(Result.badRequest('no amount, sn:' +  sn));
    }

    const order = await orderService.findOne({id: transaction.orderId});
    if (!order) {
        return res.send(Result.badRequest('not found order, sn:' +  sn));
    }
    const paidTransaction = orderService.getPaidTransactions(order.transactions);
    // console.log('transaction:', transaction);
    // console.log('order:', order);
    // console.log('paidTransaction:', paidTransaction);
    const signPayment = getSignPayment(transaction.channelId);
    if (!signPayment) {
        return res.send(Result.badRequest('no sign payment, sn' +  sn));
    }
    const payment = getClearPayment(transaction.channelId);
    if (!payment) {
        return res.send(Result.badRequest('no clear payment, sn' +  sn));
    }

    let pay:any = null;
    const expired = await configService.getSignatureExpired();
    if (transaction.type === TransactionTypes.refundCompletion) {
        const token = await tokenService.get(transaction.channelId, paidTransaction.channelArgs._token);
        if (!token) {
            return res.send(Result.badRequest('invalid token, sn' +  sn));
        }
        const amount = common.bignumber.bnWithDecimals(transaction.amount, token.decimals);
        const param = await signPayment.signFreezeData(order.owner, paidTransaction.channelArgs._token, amount, transaction.sn, expired);
        pay = payment.unfreeze(param.account, param.token, param.amount, param.sn, param.expired, param.sign.compact);
    } else if([TransactionTypes.normalCompletion, TransactionTypes.defaultedCompletion, TransactionTypes.negotiatedCompletion].includes(transaction.type)) {
        const transferRate = await configService.getValue('transferRate', 1);
        const token = await tokenService.get(transaction.channelId, paidTransaction.channelArgs._token);
        if (!token) {
            return res.send(Result.badRequest('invalid token, sn' +  sn));
        }
        const frozen = common.bignumber.bnWithDecimals(transaction.amount, token.decimals);
        const amount = BigNumber(frozen).multipliedBy(transferRate);
        const fee = BigNumber(frozen).minus(amount);
        const param = await signPayment.signTransferData(
            payment.chain.getNativeAddr(), 
            token.address, 
            order.owner,
            order.projectOwner,
            '0',
            frozen,
            amount.toFixed(),
            fee.toFixed(),
            transaction.sn, 
            expired
        );
        const deal = {
            token: param.token,
            from: param.from,
            to: param.to,
            available: param.available,
            frozen: param.frozen,
            amount: param.amount,
            fee: param.fee
        }

        pay = payment.transfer(param.out, deal, param.sn, param.expired, param.sign.compact);
    } else {
        return res.send(Result.badRequest('bad type, sn: ' +  sn));
    }
    
    const gas = await pay.estimateGas();
    // console.log('gas:', gas);
    const result = await pay.transact();
    console.log('tx hash:', result.hash);
    // const result2 = await res.wait();
    const data = await transactionService.findOneAndUpdate({ sn, status: TransactionStatus.pending }, { channelTx: result.hash, status: TransactionStatus.processing });
    return res.send(Result.success(data));
});


export default router;
