import { BN, Program, Idl, AnchorProvider, setProvider, Wallet } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import {
  PublicKey, 
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Connection
} from "@solana/web3.js";
import { bytes32Buffer, getSignStringForEd25519, getEd25519Instruction, getKeypairFromBase58Key, uint8ArrayToHexString, hexStringToUint8Array } from "./utils/solutil";
import { APP_ENV, SOL_PAYMENT_ADDR } from "./constants";
import { Payment } from "./solana/payment.type";
import PaymentIDL from "./solana/payment.idl.json";

export const FEE_ACCOUNT_FILL = '00000000000000000000000000000001';
export const ZERO_ACCOUNT = new PublicKey(new Uint8Array(32).fill(0));

export class PaymentSol {
    private connection: Connection;
    signer: Keypair = getKeypairFromBase58Key(APP_ENV.SIGNER_SOL_PK);
    payerKeypair: Keypair = getKeypairFromBase58Key(APP_ENV.CLEARER_SOL_PK);
    program: any;
    constructor(endpoint: string) {
      console.log('payment sol constructor:', endpoint);
      console.log('signer:', this.signer.publicKey.toBase58());
      console.log('payerKeypair:', this.payerKeypair.publicKey.toBase58());
      this.connection = new Connection(endpoint);
      const provider = new AnchorProvider(this.connection, new Wallet(this.payerKeypair), {
          commitment: 'confirmed', // Set the desired commitment level
      });
      setProvider(provider);
      // console.log('provider:', provider);
      this.program = new Program(PaymentIDL as Idl, provider);
      console.log('program:', this.program);
    }

    async signBindAccountData(
        account: string,
        sn: string,
        expired: string | number,
        payer: string,
    ): Promise<any> {
      //todo
    }

    async signReplaceAccountData(
        account: string,
        wallet: string,
        sn: string,
        expired: string | number,
        payer: string,
    ): Promise<any> {
      //todo
    }

    async signCancelData(
        userA: TradeData,
        userB: TradeData,
        sn: string,
        expired: string | number,
        payer: string,
    ): Promise<any> {
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
        const feeUserPubkey = new PublicKey(APP_ENV.FEE_USER_SOL);
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
        const feeUserPubkey = new PublicKey(APP_ENV.FEE_USER_SOL);
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

    async settle(
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
    ) {
        const snBuffer = bytes32Buffer(sn);
        const fromBuffer = bytes32Buffer(from);
        const toBuffer = bytes32Buffer(to);
        const outPubkey = new PublicKey(out);
        const mint = new PublicKey(token);
        const feeUserPubkey = new PublicKey(APP_ENV.FEE_USER_SOL);
        const expiredAt = new BN(expired);
        const deal = new SettlementData(fromBuffer, toBuffer, new BN(available), new BN(frozen), new BN(amount), new BN(fee), new BN(paid), new BN(excessFee));
        console.log('deal', deal);
        const message = Buffer.concat([
          snBuffer,
          deal.toBytes(),
          new BN(expired).toArrayLike(Buffer, 'le', 8),
          this.payerKeypair.publicKey.toBuffer(),
          mint.toBuffer(),
          outPubkey.toBuffer(),
          feeUserPubkey.toBuffer(),
        ]);

        // Derive the payment state account PDA
        const [paymentStatePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("payment-state")],
          this.program.programId
        );

        console.log("Derived paymentStatePDA:", paymentStatePDA.toBase58());

        // Derive the from token account PDA
        const [fromTokenAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("user-token"), deal.from, mint.toBuffer()],
          this.program.programId
        );

        console.log("Derived fromTokenAccountPDA:", fromTokenAccountPDA.toBase58());

        // Derive the to token account PDA
        const [toTokenAccountPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user-token"), deal.to, mint.toBuffer()],
          this.program.programId
        );

        console.log("Derived toTokenAccountPDA:", toTokenAccountPDA.toBase58());

        // Derive the fee token account PDA
        const [feeTokenAccountPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user-token"), bytes32Buffer(FEE_ACCOUNT_FILL), mint.toBuffer()],
          this.program.programId
        );

        // Derive the program token account PDA
        const [programTokenPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("program-token"), mint.toBuffer()],
          this.program.programId
        );

        // Derive the record account PDA
        const [recordPubkey] = PublicKey.findProgramAddressSync(
          [Buffer.from("record"), snBuffer],
          this.program.programId
        );

        try {
          const {ed25519Instruction, signature} = getEd25519Instruction(message, this.signer);
          const tx = await this.program.methods
            .settle(snBuffer, deal, expiredAt, signature)
            .accounts({
              paymentState: paymentStatePDA,
              fromTokenAccount: fromTokenAccountPDA,
              toTokenAccount: toTokenAccountPDA,
              feeTokenAccount: feeTokenAccountPDA,
              user: this.payerKeypair.publicKey,
              mint: mint,
              out: outPubkey,
              feeUser: feeUserPubkey,
              programToken: programTokenPDA,
              record: recordPubkey,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              instructionSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
              rent: SYSVAR_RENT_PUBKEY,
            })
            .preInstructions([ed25519Instruction])
            .signers([this.payerKeypair])
            .rpc();

          console.log("Transaction signature:", tx);
          return tx;
        } catch (error) {
          console.error("Settlement Token Error details:", error);
          throw error;
        }
    }


    async deposit(
        to: string, // destination account
        token: string,
        amount: string | number,
        frozen: string | number,
        sn: string,
        expired: string | number,
        payer: string,
        payerTokenAccount?: string
    ): Promise<any> {
        const payerKeypair: Keypair = getKeypairFromBase58Key(payer);
        const payerPubkey = payerKeypair.publicKey;
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

        // Derive the payment state account PDA
        const [paymentStatePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("payment-state")],
          this.program.programId
        );

        // Derive the user token account PDA
        const [userAccountPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user-token"), accountBuffer, mint.toBuffer()],
          this.program.programId
        );

        // Derive the program token account PDA
        const [programTokenPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("program-token"), mint.toBuffer()],
          this.program.programId
        );

        // Derive the record account PDA
        const [recordPubkey] = PublicKey.findProgramAddressSync(
          [Buffer.from("record"), snBuffer],
          this.program.programId
        );
        
        const {ed25519Instruction, signature} = getEd25519Instruction(message, this.signer);
        console.log("Message for signing:", message.toString('hex'));

        try {
          // console.log('input parameters: ',  {user: payerKeypair.publicKey.toBase58(), token: mint, account:accountBuffer, amount: amount.toString(), frozen: frozen.toString(), sn: snBuffer, expiredAt, signature});
          const tx = await this.program.methods
          .deposit(snBuffer, accountBuffer, amount, frozen, new BN(expired), signature)
          .accounts({
            paymentState: paymentStatePDA,
            userTokenAccount: userAccountPDA,
            user: payerKeypair.publicKey,
            userToken: tokenAccount,
            programToken: programTokenPDA,
            mint: mint,
            record: recordPubkey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            instructionSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .preInstructions([ed25519Instruction])
          .signers([payerKeypair])
          .rpc();

          console.log("Transaction signature:", tx);
          return tx;
        } catch (error) {
          console.error("Deposits tokens Error details:", error);
          throw error;
        }
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

export type TradeData = {
  account: string;
  token: string;
  amount: string | number;
  fee: string | number;
};