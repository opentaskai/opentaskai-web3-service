import { getBase58Key, getKeypairFromBase58Key } from '../src/utils/solutil';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PaymentSol } from '../src/payment.sol';
import { APP_ENV } from '../src/constants';
import { uuid } from '../src/utils/util';
import * as spl from "@solana/spl-token";

describe('Utils', async () => {
    describe('base', async () => {
        const signer = getKeypairFromBase58Key(APP_ENV.SIGNER_SOL_PK);
        const payment: PaymentSol = new PaymentSol(signer);

        before(async () => {});

        after(async () => {});

        it('test', async () => {
            const data = await payment.signDepositData(
                uuid(), // destination account
                spl.NATIVE_MINT.toBase58(),
                LAMPORTS_PER_SOL,
                LAMPORTS_PER_SOL/10,
                uuid(),
                Date.now(),
                Keypair.generate().publicKey.toBase58(),
            );
            console.log('data', data);
        });
    });
});
