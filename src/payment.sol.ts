import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  PublicKey, Keypair
} from "@solana/web3.js";
import { bytes32Buffer, getSignStringForEd25519, uint8ArrayToHexString, hexStringToUint8Array } from "./utils/solutil";
import { APP_ENV } from "./constants";

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
                tokenAccount = await getAssociatedTokenAddress(
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
        
        const sign = getSignStringForEd25519(message, this.signer);
        return { to, token, amount, frozen, sn, expired, sign };
    }
    
    async signWithdraw(
        from: string, // sender's account number
        to: string, // destination wallet
        token: string,
        available: string | number,
        frozen: string | number,
        sn: string,
        expired: string | number,
        payer: string,
    ): Promise<any> {
        const payerPubkey = new PublicKey(payer);
        const mint = new PublicKey(token);
        const fromBuffer = bytes32Buffer(from);
        const toPubkey = new PublicKey(to);
        const snBuffer = bytes32Buffer(sn);

        const message = Buffer.concat([
          snBuffer,
          fromBuffer,
          new BN(available).toArrayLike(Buffer, 'le', 8),
          new BN(frozen).toArrayLike(Buffer, 'le', 8),
          new BN(expired).toArrayLike(Buffer, 'le', 8),
          payerPubkey.toBuffer(),
          mint.toBuffer(),
          toPubkey.toBuffer(),
        ]);

        const sign = getSignStringForEd25519(message, this.signer);
        return { from, to, token, available, frozen, sn, expired, sign };
    }

    async signFreezeData(
        account: string,
        token: string,
        amount: string | number,
        sn: string,
        expired: string | number,
        payer: string,
    ): Promise<any> {
        const payerPubkey = new PublicKey(payer);
        const mint = new PublicKey(token);
        const accountBuffer = bytes32Buffer(account);
        const snBuffer = bytes32Buffer(sn);

        const message = Buffer.concat([
          snBuffer,
          accountBuffer,
          new BN(amount).toArrayLike(Buffer, 'le', 8),
          new BN(expired).toArrayLike(Buffer, 'le', 8),
          payerPubkey.toBuffer(),
          mint.toBuffer(),
        ]);
        const sign = getSignStringForEd25519(message, this.signer);
        return { account, token, amount, sn, expired, sign };
    }

    async signUnFreezeData (
        account: string,
        token: string,
        amount: (string | number),
        fee: (string | number),
        sn: string,
        expired: (string | number),
        payer: string,
    ): Promise<any> {
        const payerPubkey = new PublicKey(payer);
        const mint = new PublicKey(token);
        const accountBuffer = bytes32Buffer(account);
        const snBuffer = bytes32Buffer(sn);

        const message = Buffer.concat([
          snBuffer,
          accountBuffer,
          new BN(amount).toArrayLike(Buffer, 'le', 8),
          new BN(fee).toArrayLike(Buffer, 'le', 8),
          new BN(expired).toArrayLike(Buffer, 'le', 8),
          payerPubkey.toBuffer(),
          mint.toBuffer(),
        ]);
        const sign = getSignStringForEd25519(message, this.signer);
        return {account, token, amount, fee, sn, expired, sign};
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
        payer: string,
    ): Promise<any> {
      return await this.signSettleData(out, token, from, to, available, frozen, amount, fee, paid, excessFee, sn, expired, payer);
    }

    async signTransferDealData(
        out: string, // destination wallet, no withdrawals are allowed if the address is zero.
        token: string,
        from: string, // source account
        to: string, // destination account
        amount: string | number,
        fee: string | number,
        sn: string,
        expired: string | number,
        payer: string,
    ): Promise<any> {
        const snBuffer = bytes32Buffer(sn);
        const fromBuffer = bytes32Buffer(from);
        const toBuffer = bytes32Buffer(to);
        const outPubkey = new PublicKey(out);
        const mint = new PublicKey(token);
        const payerPubkey = new PublicKey(payer);
        const feeUserPubkey = new PublicKey(APP_ENV.FEE_USER_SOL_PK);
        const message = Buffer.concat([
            snBuffer,
            fromBuffer,
            toBuffer,
            new BN(amount).toArrayLike(Buffer, 'le', 8),
            new BN(fee).toArrayLike(Buffer, 'le', 8),
            new BN(expired).toArrayLike(Buffer, 'le', 8), 
            payerPubkey.toBuffer(),
            mint.toBuffer(),
            outPubkey.toBuffer(),
            feeUserPubkey.toBuffer(),
        ]);
        const sign = getSignStringForEd25519(message, this.signer);
        return { out, token, from, to, amount, fee, sn, expired, sign };
    }

    async signSettleData(
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
        payer: string,
    ): Promise<any> {
        const snBuffer = bytes32Buffer(sn);
        const fromBuffer = bytes32Buffer(from);
        const toBuffer = bytes32Buffer(to);
        const outPubkey = new PublicKey(out);
        const mint = new PublicKey(token);
        const payerPubkey = new PublicKey(payer);
        const feeUserPubkey = new PublicKey(APP_ENV.FEE_USER_SOL_PK);
        const deal = new SettlementData(fromBuffer, toBuffer, new BN(available), new BN(frozen), new BN(amount), new BN(fee), new BN(paid), new BN(excessFee));
        
        const message = Buffer.concat([
          snBuffer,
          deal.toBytes(),
          new BN(expired).toArrayLike(Buffer, 'le', 8),
          payerPubkey.toBuffer(),
          mint.toBuffer(),
          outPubkey.toBuffer(),
          feeUserPubkey.toBuffer(),
        ]);
        const sign = getSignStringForEd25519(message, this.signer);
        return { out, token, from, to, available, frozen, amount, fee, paid, excessFee, sn, expired, sign };
    }

}


export class SettlementData {
  from: Buffer;
  to: Buffer;
  available: BN;
  frozen: BN;
  amount: BN;
  fee: BN;
  paid: BN;
  excessFee: BN;

  constructor(
    from: Buffer,
    to: Buffer,
    available: BN,
    frozen: BN,
    amount: BN,
    fee: BN,
    paid: BN,
    excessFee: BN
  ) {
    this.from = from;
    this.to = to;
    this.available = available;
    this.frozen = frozen;
    this.amount = amount;
    this.fee = fee;
    this.paid = paid;
    this.excessFee = excessFee;
  }

  toBytes(): Buffer {
    return Buffer.concat([
      this.from,
      this.to,
      this.available.toArrayLike(Buffer, 'le', 8),
      this.frozen.toArrayLike(Buffer, 'le', 8),
      this.amount.toArrayLike(Buffer, 'le', 8),
      this.fee.toArrayLike(Buffer, 'le', 8),
      this.paid.toArrayLike(Buffer, 'le', 8),
      this.excessFee.toArrayLike(Buffer, 'le', 8),
    ]);
  }
}