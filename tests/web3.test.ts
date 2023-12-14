import { constants, common } from 'opentaskai-web3-jssdk';
import { getChain, getAiOriginals, getPayment } from '../src/web3';
import { uuid } from '../src/utils/util';
import { APP_ENV } from '../src/constants';

describe('Web3', async () => {
    describe('base', async () => {
        let res: any;
        const chain = getChain(APP_ENV.CHAIN_ID);
        const payment = getPayment(chain);
        const aiOriginals = getAiOriginals(chain);
        const expired = Math.floor(Date.now() / 1000) + 300;

        before(async () => {
            console.log('chain id:', chain.chainId);
            console.log('payment address:', payment.address);
        });

        after(async () => {});

        it('getBalance', async () => {
            console.log('getBalance ...', constants.ZERO_ADDRESS);
            res = await payment.getBalance(constants.ZERO_ADDRESS + '');
            console.log('getBalance:', res);
        });

        it('signDepositAndFreezeData', async () => {
            const to = await chain.getAccount();
            const token = chain.getTokenAddr('USDT');
            console.log('usdt', token);
            const available = common.bignumber.bnWithDecimals(2, 6);
            const frozen = common.bignumber.bnWithDecimals(1, 6);
            const sn = uuid();
            const data = await payment.signDepositAndFreezeData(to, token, available, frozen, sn, expired);
            console.log('getBalance:', data);
        });

        it('signCancelData', async () => {
            const userA: any = {
                user: '0xBe46A6c57aB6d9272b5674C47fe587Dd3B5B54Db',
                token: chain.getTokenAddr('USDT'),
                amount: common.bignumber.bnWithDecimals(2, 18),
                fee: common.bignumber.bnWithDecimals(1, 18)
            };
            const userB: any = {
                user: await chain.getAccount(),
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
            const data = await aiOriginals.signMintData(sn, expired);
            console.log('signMintData:', data);
        });
    });
});
