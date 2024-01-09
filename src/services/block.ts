import { BaseService } from './base';
import { getChain } from '../web3';
import { BigNumber, BigNumberish } from 'ethers';

export class BlockService extends BaseService {
    async getBlockTime(chainId: any, blockNumber: BigNumberish) {
        chainId = Number(chainId);
        const chain = getChain(chainId);
        blockNumber = BigNumber.from(blockNumber).toNumber();
        let data: any = await this.findOne({ number: blockNumber, chainId });
        if (!data) {
            data = await chain.getBlock(blockNumber);
            data.chainId = chainId;
            data.created_at = new Date(data.timestamp * 1000).toISOString();

            if (data?.gasLimit) data.gasLimit = BigNumber.from(data.gasLimit).toString();

            if (data?.gasUsed) data.gasUsed = BigNumber.from(data.gasUsed).toString();

            if (data?.baseFeePerGas) data.baseFeePerGas = BigNumber.from(data.baseFeePerGas).toString();

            if (data?._difficulty) data._difficulty = BigNumber.from(data._difficulty).toString();
            try {
                await this.save(data);
            } catch (e) {
                console.warn('block existence', blockNumber, chainId);
            }
        }
        return data.created_at;
    }
}

export const blockService = new BlockService('block', ['number,chainId']);
