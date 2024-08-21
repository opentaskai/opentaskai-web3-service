import { Payment, getNFT, NFT, LocalChain, getChain, opentaskai } from 'opentaskai-web3-jssdk';
import { APP_ENV, getRPC } from '../src/constants';
import { Wallet } from 'ethers';
console.log('app env:', APP_ENV.PORT);
export const signer = new Wallet(APP_ENV.SIGNER_PK);
export const clearer = new Wallet(APP_ENV.CLEARER_PK);

const _cacheSignerPayment: Record<number, Payment> = {};
export function getSignPayment(chainId: any): Payment {
    chainId = Number(chainId);
    if (!_cacheSignerPayment[chainId]) {
        const chain = getChain(chainId, getRPC(chainId));
        _cacheSignerPayment[chainId] = new Payment(chain);
        _cacheSignerPayment[chainId].setSigner(signer);
    }
    return _cacheSignerPayment[chainId];
}


const _cacheClearPayment: Record<number, Payment> = {};
export function getClearPayment(chainId: any): Payment {
    chainId = Number(chainId);
    if (!_cacheClearPayment[chainId]) {
        const chain = new LocalChain(chainId, getRPC(chainId));
        chain.connect(clearer);
        console.log('clearer:', clearer.address);
        _cacheClearPayment[chainId] = new Payment(chain);
        _cacheClearPayment[chainId].setSigner(clearer);
    }
    return _cacheClearPayment[chainId];
}

const _cacheAIGenesis: Record<number, NFT> = {};
export function getAiGenesis(chainId: any): NFT {
    chainId = Number(chainId);
    if (!_cacheAIGenesis[chainId]) {
        const chain = getChain(chainId, getRPC(chainId));
        const network = opentaskai.getNetworkMeta(chain.chainId);
        _cacheAIGenesis[chainId] = getNFT(chain, network.AIGenesis);
        _cacheAIGenesis[chainId].setSigner(signer);
    }
    return _cacheAIGenesis[chainId];
}

export { getChain, Payment };
