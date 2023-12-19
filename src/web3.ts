import { Payment, getNFT, NFT, LocalChain, getChain, opentaskai } from 'opentaskai-web3-jssdk';
import { APP_ENV } from '../src/constants';
import { Wallet } from 'ethers';
console.log('app env:', APP_ENV);
export const signer = new Wallet(APP_ENV.SIGNER_PK);

const _cachePayment: Record<string, Payment> = {};
export function getPayment(chainId: any): Payment {
    if (!_cachePayment[chainId]) {
        const chain = getChain(chainId);
        _cachePayment[chainId] = new Payment(chain);
        _cachePayment[chainId].setSigner(signer);
    }
    return _cachePayment[chainId];
}

const _cacheAIGenesis: Record<string, NFT> = {};
export function getAiGenesis(chainId: any): NFT {
    if (!_cacheAIGenesis[chainId]) {
        const chain = getChain(chainId);
        const network = opentaskai.getNetworkMeta(chain.chainId);
        _cacheAIGenesis[chainId] = getNFT(chain, network.AIGenesis);
        _cacheAIGenesis[chainId].setSigner(signer);
    }
    return _cacheAIGenesis[chainId];
}

export { getChain };
