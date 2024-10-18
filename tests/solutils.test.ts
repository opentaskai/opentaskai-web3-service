import { bytes32Buffer, getBase58Key, getKeypairFromBase58Key, signMessageForEd25519, uint8ArrayToHexString, hexStringToUint8Array } from '../src/utils/solutil';
import { Keypair } from '@solana/web3.js';
import { BN } from "@coral-xyz/anchor";
import assert from 'assert';

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

            const message = Buffer.concat([
                bytes32Buffer('12345678901234567890123456789012'),
                new BN(1000000).toArrayLike(Buffer, 'le', 8),
                keypair.publicKey.toBuffer(),
            ]);
            const signature = signMessageForEd25519(message, keypair);
            console.log('signature', signature);
            const signString = uint8ArrayToHexString(signature);
            const signatureBuffer = hexStringToUint8Array(signString);
            console.log('signatureBuffer', signatureBuffer);

            assert.strictEqual(signature.toString(), signatureBuffer.toString(), 'sign does not match'); 
        });
    });
});
