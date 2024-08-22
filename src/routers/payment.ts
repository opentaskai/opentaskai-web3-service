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
import { BigNumber as EthBigNumber } from 'ethers';
import moment from 'moment';

const router: Router = Router();

function signPayment(req: any) {
    const chainId = getChainId(req);
    return getSignPayment(chainId);
}

router.post('/signBindAccountData', async (req: any, res) => {
    try {
        console.log(req.originalUrl, req.body);
        const { account, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await signPayment(req).signBindAccountData(account, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signReplaceAccountData', async (req: any, res) => {
    try {
        console.log(req.originalUrl, req.body);
        const { account, wallet, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await signPayment(req).signReplaceAccountData(account, wallet, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signDepositData', async (req: any, res) => {
    try {
        console.log(req.originalUrl, req.body);
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
        console.log(req.originalUrl, req.body);
        const { from, to, token, available, frozen, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await signPayment(req).signWithdraw(from, to, token, available, frozen, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signFreezeData', async (req: any, res) => {
    try {
        console.log(req.originalUrl, req.body);
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
        const { account, token, amount, fee, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await signPayment(req).signUnFreezeData(account, token, amount, fee, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signTransferData', async (req: any, res) => {
    try {
        console.log(req.originalUrl, req.body);
        const { out, token, from, to, available, frozen, amount, fee, paid, excessFee, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await signPayment(req).signTransferData(out, token, from, to, available, frozen, amount, fee, paid, excessFee, sn, expired);
        cleanData(data);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/signCancelData', async (req: any, res) => {
    try {
        console.log(req.originalUrl, req.body);
        const { userA, userB, sn, expired } = req.body;
        await transactionService.checkSN(sn);
        const data = await signPayment(req).signCancelData(userA, userB, sn, expired);
        res.send(Result.success(data));
    } catch (error: any) {
        res.send(Result.fail(error.message));
    }
});

router.post('/send', async (req: any, res) => {
    console.log(req.originalUrl, req.body);
    const { sn } = req.body;
    const transaction: any = await transactionService.get(sn);
    if (!transaction) {
        return res.send(Result.badRequest('invalid sn, ' +  sn));
    }
    if (transaction.status === TransactionStatus.success) {
        return res.send(Result.badRequest('already handle, sn: ' +  sn));
    }

    const lossTime = moment.utc().diff(moment.utc(transaction.updatedAt), 's');
    const retryEpoch = await configService.getValue('TransactionRetryEpoch', 300);
    if (transaction.status === TransactionStatus.processing && lossTime < retryEpoch) {
        return res.send(Result.badRequest('busy, wait ' +  (300 - lossTime) + ' seconds to retry.'));
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
    console.log('chainId:', payment.chain.chainId);

    let pay:any = null;
    const expired = await configService.getSignatureExpired();
    let transferRate = await configService.getValue('transferRate', 0);
    if (transaction.input && Object.keys(transaction.input).includes('hasFee') && !transaction.input.hasFee) {
        transferRate = 0;
    }
    transferRate = await configService.getValue('transferRate', 0);
    if (transaction.type === TransactionTypes.refundCompletion) {
        const token = await tokenService.get(transaction.channelId, paidTransaction.channelArgs._token);
        if (!token) {
            return res.send(Result.badRequest('invalid token, sn' +  sn));
        }
        if (transaction.input && transaction.input?.hasFee === false) transferRate = 0;
        const amount = common.bignumber.bnWithDecimals(transaction.amount, token.decimals);
        const fee = BigNumber(amount).multipliedBy(transferRate).toFixed();
        const param = await signPayment.signUnFreezeData(order.owner, paidTransaction.channelArgs._token, amount, fee, transaction.sn, expired);
        console.debug('transfer unfreeze:', param);
        pay = payment.unfreeze(param.account, param.token, param.amount, param.fee, param.sn, param.expired, param.sign.compact);
    } else if([TransactionTypes.normalCompletion, TransactionTypes.partialCompletion].includes(transaction.type)) {
        const token = await tokenService.get(transaction.channelId, paidTransaction.channelArgs._token);
        if (!token) {
            return res.send(Result.badRequest('invalid token, sn' +  sn));
        }
        const paid = common.bignumber.bnWithDecimals(order.paidAmount, token.decimals);
        const frozen = common.bignumber.bnWithDecimals(transaction.amount, token.decimals);
        const fee = BigNumber(frozen).multipliedBy(transferRate);
        const excessFee = '0';
        const amount = BigNumber(frozen).minus(fee);
        const param = await signPayment.signTransferData(
            payment.chain.getNativeAddr(), 
            token.address, 
            order.owner,
            order.projectOwner,
            '0',
            frozen,
            amount.toFixed(),
            fee.toFixed(),
            paid,
            excessFee,
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
            fee: param.fee,
            paid: param.paid,
            excessFee: param.excessFee
        }
        console.debug('transfer deal:', param);
        pay = payment.transfer(param.out, deal, param.sn, param.expired, param.sign.compact);
    } else {
        return res.send(Result.badRequest('bad type, sn: ' +  sn));
    }
    
    const gas = await pay.estimateGas();
    const gasLimit = gas.add(10000);
    const price = await payment.chain.getGasPrice();
    const gasPrice = EthBigNumber.from(price).mul(120).div(100);
    console.log('gas:', gasLimit, gasPrice);
    const result = await pay.transact({gasLimit, gasPrice});
    console.log('tx hash:', result.hash);
    // const receipt = await result.wait();
    // console.log('receipt:', receipt);
    const data = await transactionService.findOneAndUpdate({ sn, status: { $ne: TransactionStatus.success }}, { channelTx: result.hash, status: TransactionStatus.processing });
    return res.send(Result.success(data));
});


export default router;
