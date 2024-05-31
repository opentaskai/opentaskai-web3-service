import { constants, common, getChain } from 'opentaskai-web3-jssdk';
import { getAiGenesis, getPayment } from '../src/web3';
import { uuid } from '../src/utils/util';
import { APP_ENV } from '../src/constants';

describe('Web3', async () => {
    describe('base', async () => {
        let res: any;
        const chain = getChain(APP_ENV.CHAIN_ID);
        const payment = getPayment(APP_ENV.CHAIN_ID);
        const nft = getAiGenesis(APP_ENV.CHAIN_ID);
        const expired = Math.floor(Date.now() / 1000) + 300;

        before(async () => {
            console.log('chain id:', APP_ENV.CHAIN_ID);
            console.log('payment address:', payment.address);
        });

        after(async () => {});

        it('getBalance', async () => {
            console.log('getBalance ...', constants.ZERO_ADDRESS);
            res = await payment.getBalance(constants.ZERO_ADDRESS + '');
            console.log('getBalance:', res);
        });

        it('signDepositData', async () => {
            const to = uuid();
            const token = chain.getTokenAddr('USDT');
            console.log('usdt', token);
            const available = common.bignumber.bnWithDecimals(2, 6);
            const frozen = common.bignumber.bnWithDecimals(1, 6);
            const sn = uuid();
            const data = await payment.signDepositData(to, token, available, frozen, sn, expired);
            console.log('getBalance:', data);
        });

        it('signCancelData', async () => {
            const userA: any = {
                account: '0xBe46A6c57aB6d9272b5674C47fe587Dd3B5B54Db',
                token: chain.getTokenAddr('USDT'),
                amount: common.bignumber.bnWithDecimals(2, 18),
                fee: common.bignumber.bnWithDecimals(1, 18)
            };
            const userB: any = {
                account: await chain.getAccount(),
                token: chain.getTokenAddr('USDT'),
                amount: common.bignumber.bnWithDecimals(2, 18),
                fee: common.bignumber.bnWithDecimals(1, 18)
            };
            const sn = uuid();
            const data = await payment.signCancelData(userA, userB, sn, expired);
            console.log('signCancelData:', data);
        });

        it('signMintData', async () => {
            const sn = uuid();
            const data = await nft.signMintData(sn, expired);
            console.log('signMintData:', data);
        });
    });
});
