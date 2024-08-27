import { getClearPayment } from '../web3';
import { CHECK_ENV } from '../constants';
import { BigNumber } from 'bignumber.js';

export async function getTranscationCount(chainId: number) {
    const payment = getClearPayment(chainId);
    const account =  await payment.chain.getAccount();
    const latest = await payment.chain.getTransactionCount(account);
    const pending = await payment.chain.getTransactionCount(account, 'pending');
    const amount = await payment.chain.getBalance();
    const balance = BigNumber(amount).shiftedBy(-18).toNumber();
    return {
        CHECK_ENV,
        chainId,
        account,
        balance,
        latest,
        pending
    };
}