import { getBase58Key, getKeypairFromBase58Key } from '../src/utils/solutil';
import { Keypair } from '@solana/web3.js';

describe('Utils', async () => {
    describe('base', async () => {
        let res: any;

        before(async () => {});

        after(async () => {});

        it('test', async () => {
            let keypair = Keypair.generate();
            let secretKey = getBase58Key(keypair);
            console.log('secretKey', secretKey);
            let keypair2 = getKeypairFromBase58Key(secretKey);
            console.log('keypair', keypair.publicKey.toBase58());
            console.log('keypair2', keypair2.publicKey.toBase58()); 
        });
    });
});
