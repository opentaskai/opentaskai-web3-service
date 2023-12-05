import { mongodb } from '../src/db/mongo';
import assert from 'assert';
import { uuid } from '../src/utils/util';
import { transactionService } from '../src/services/transaction';
import { TRANS_CHANNEL } from '../src/constants';

describe('TransactionService Test', async () => {
    describe('base', async () => {
        let res: any;
        let data: any;

        before(async () => {
            console.log('before');
            res = await mongodb.connect();
        });

        after(async () => {
            mongodb.close();
        });

        it('test index', async () => {
            res = await transactionService.createUniqueIndex();
            console.log('createUniqueIndex result', res);
            res = await transactionService.indexInformation();
            console.log('indexInformation result', res);
        });

        it('test data', async () => {
            res = await transactionService.cursor({});
            console.log('list result', res);
        });
    });
});
