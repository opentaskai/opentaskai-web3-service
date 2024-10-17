import { BN } from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";
import {
  PublicKey, Keypair
} from "@solana/web3.js";
import { bytes32Buffer, signMessageForEd25519, uint8ArrayToHexString, hexStringToUint8Array } from "./utils/solutil";

export class PaymentSol {
    constructor(
      public readonly signer: Keypair
    ) {
        this.signer = signer;
    }

    async signBindAccountData() {
      //todo
    }

    async signReplaceAccountData() {
      //todo
    }

    async signDepositData(
        to: string, // destination account
        token: string,
        amount: string | number,
        frozen: string | number,
        sn: string,
        expired: string | number,
        payer: string,
        payerTokenAccount?: string
    ): Promise<any> {
        const payerPubkey = new PublicKey(payer);
        const mint = new PublicKey(token);
        const accountBuffer = bytes32Buffer(to);
        const snBuffer = bytes32Buffer(sn);
        
        let tokenAccount = payerPubkey;
        if(payerTokenAccount) {
            tokenAccount = new PublicKey(payerTokenAccount);
        } else {
            if (mint.toBase58() !== "So11111111111111111111111111111111111111112") {
                tokenAccount = await spl.getAssociatedTokenAddress(
                    mint,
                    payerPubkey
                );
            }
        }

        const message = Buffer.concat([
          snBuffer,
          accountBuffer,
          new BN(amount).toArrayLike(Buffer, 'le', 8),
          new BN(frozen).toArrayLike(Buffer, 'le', 8),
          new BN(expired).toArrayLike(Buffer, 'le', 8),
          payerPubkey.toBuffer(),
          mint.toBuffer(),
          tokenAccount.toBuffer(),  
        ]);
        
        const signature = signMessageForEd25519(message, this.signer);
        console.log('signature', signature);
        const sign = uint8ArrayToHexString(signature);
        const signBuffer = hexStringToUint8Array(sign);
        console.log('signBuffer', signBuffer);
        return { to, token, amount, frozen, sn, expired, sign };
    }
    
    async signWithdraw(
        from: string, // sender's account number
        to: string, // destination wallet
        token: string,
        available: string | number,
        frozen: string | number,
        sn: string,
        expired: string | number
    ): Promise<any> {
        
        // return { from, to, token, available, frozen, sn, expired, sign };
    }

    async signFreezeData(
        account: string,
        token: string,
        amount: string | number,
        sn: string,
        expired: string | number
    ): Promise<any> {
        
        // return { account, token, amount, sn, expired, sign };
    }

    async signUnFreezeData (
        account: string,
        token: string,
        amount: (string | number),
        fee: (string | number),
        sn: string,
        expired: (string | number),
    ): Promise<any> {
        
        // return {account, token, amount, fee, sn, expired, sign};
    }

    async signTransferData(
        out: string, // destination wallet, no withdrawals are allowed if the address is zero.
        token: string,
        from: string, // source account
        to: string, // destination account
        available: string | number,
        frozen: string | number,
        amount: string | number,
        fee: string | number,
        paid: (string | number),
        excessFee: (string | number),
        sn: string,
        expired: string | number,
    ): Promise<any> {
        // return { out, token, from, to, available, frozen, amount, fee, paid, excessFee, sn, expired, sign };
    }

}