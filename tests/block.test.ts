import { mongodb } from '../src/db/mongo';
import assert from 'assert';
import { blockService } from '../src/services/block';

describe('Block', async () => {
    describe('base', async () => {
        let res: any;

        before(async () => {
            console.log('before');
            await mongodb.connect();
        });

        after(async () => {
            mongodb.close();
        });

        it('creat index', async () => {
            res = await blockService.createUniqueIndex();
            console.log('createUniqueIndex result', res);
            res = await blockService.indexInformation();
            console.log('indexInformation result', res);
        });
    });
});
