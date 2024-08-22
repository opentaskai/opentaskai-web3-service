import mail from '../utils/email';
import { getClearPayment } from '../web3';
import { APP_ENV, CHECK_SEND_PENDING } from '../constants';

async function handle() {
    const payment = getClearPayment(APP_ENV.CHAIN_ID);
    const account =  await payment.chain.getAccount();
    const latest = await payment.chain.getTransactionCount(account);
    const pending = await payment.chain.getTransactionCount(account, 'pending');
    console.log({
        chainId: APP_ENV.CHAIN_ID,
        account,
        latest,
        pending
    });
    
    const count = pending - latest;
    if (count > CHECK_SEND_PENDING) {
        const res = await mail.sendMail('OpenTaskAI no-reply@opentaskai.com', 'tercel.yi@gmail.com', `${count} pending transactions`, 'There are too many transactions waiting to be processed and it is recommended that the cause of the problem be identified.', 'warning');
        console.log('sendMail res:', res);
    }
}

async function main() {
    try {
        console.log('start...');
        await handle();
        console.log('done');
    } catch (e: any) {
        console.error('except:', e);
        process.exit(1);
    }
}

main();
