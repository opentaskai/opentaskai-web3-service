import { Payment, LocalChain } from 'opentaskai-web3-jssdk';
import { APP_ENV } from '../src/constants';
import { Wallet } from 'ethers';
console.log('app env:', APP_ENV);
const signer = new Wallet(APP_ENV.SIGNER_PK);
export const chain = new LocalChain(APP_ENV.CHAIN_ID, APP_ENV.CHAIN_RPC);
export const payment = new Payment(chain);
payment.setSigner(signer);
