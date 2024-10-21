import { getBase58Key, getKeypairFromBase58Key } from '../src/utils/solutil';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { APP_ENV, getRPC } from '../src/constants';
import { PaymentSol } from '../src/payment.sol';
import { uuid } from '../src/utils/util';
import * as spl from "@solana/spl-token";

describe('Payment Sol', async () => {
    describe('base', async () => {
        let payment: PaymentSol;
        before(async () => {
            payment = new PaymentSol(getRPC('soldevnet'));
        });

        after(async () => {});

        it('test signDepositData', async () => {
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

        it('test settle', async () => {
            const amount = 1000000;
            const fee = 10000;
            const freeze = amount + fee;
            const tx = await payment.settle(
                'GkqBR5Dx3JpKKmojcbQ8jefUn1N4VmkpdwDVuqLyWkwu',
                spl.NATIVE_MINT.toBase58(),
                '00000000000000000000000000000002',
                '00000000000000000000000000000004',
                0,
                freeze,
                amount,
                fee,
                freeze,
                0,
                uuid(),
                Date.now(),
            );
            console.log('tx', tx);
        });
    });
});
