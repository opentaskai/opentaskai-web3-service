import { constants, common } from 'opentaskai-web3-jssdk';
import { chain, payment } from '../src/web3';
import { uuid } from '../src/utils/util';

describe('Web3', async () => {
    describe('base', async () => {
        let res: any;

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
            const to = payment.address;
            const token = chain.getTokenAddr('USDT');
            console.log('usdt', token);
            const available = common.bignumber.bnWithDecimals(2, 6);
            const frozen = common.bignumber.bnWithDecimals(1, 6);
            const sn = uuid();
            const data = await payment.signDepositAndFreezeData(to, token, available, frozen, sn);
            console.log('getBalance:', data);
        });
    });
});
