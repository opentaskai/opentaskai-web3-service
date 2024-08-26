import { getClearPayment } from '../web3';
import { CHECK_ENV } from '../constants';

export async function getTranscationCount(chainId: number) {
    const payment = getClearPayment(chainId);
    const account =  await payment.chain.getAccount();
    const latest = await payment.chain.getTransactionCount(account);
    const pending = await payment.chain.getTransactionCount(account, 'pending');
    return {
        CHECK_ENV,
        chainId,
        account,
        latest,
        pending
    };
}