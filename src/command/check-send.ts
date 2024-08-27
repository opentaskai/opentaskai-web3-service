import mail from '../utils/email';
import {  CHAIN_IDS } from '../constants';
import { getTranscationCount } from '../services/metrics';

async function handle(_chainId: number) {
    const {CHECK_ENV, chainId, account, balance, latest, pending } = await getTranscationCount(_chainId);
    console.log({CHECK_ENV, chainId, account, latest, pending });
    const count = pending - latest;
    if (count > CHECK_ENV.SEND_PENDING && CHECK_ENV.EMAIL_RECEIVER) {
        const res = await mail.sendMail('OpenTaskAI no-reply@opentaskai.com', CHECK_ENV.EMAIL_RECEIVER, `${count} pending transactions`, 'There are too many transactions waiting to be processed and it is recommended that the cause of the problem be identified.', 'warning');
        console.log('sendMail res:', res);
    } else if (balance < 0.2) {
        const res = await mail.sendMail('OpenTaskAI no-reply@opentaskai.com', CHECK_ENV.EMAIL_RECEIVER, `balance is running low: ${balance}`, 'The balance is running low, please recharge in time!', 'warning');
        console.log('sendMail res:', res);
    }
}

async function main() {
    try {
        console.log('start...');
        for (let i=0; i<CHAIN_IDS.length; i++) {
            await handle(CHAIN_IDS[i]);
        }
        console.log('done');
    } catch (e: any) {
        console.error('except:', e);
        process.exit(1);
    }
}

main();
