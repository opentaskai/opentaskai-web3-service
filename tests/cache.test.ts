import { mongodb } from '../src/db/mongo';
import assert from 'assert';
import cacheService from '../src/services/cache';

describe('CacheService', async () => {
    let res: any;
    before(async () => {
        console.log('before');
        await mongodb.connect();
    });

    after(async () => {
        mongodb.close();
    });

    it('creat index', async () => {
        res = await cacheService.createUniqueIndex();
        console.log('createUniqueIndex result', res);
        res = await cacheService.indexInformation();
        console.log('indexInformation result', res);
    });

    it('update cache', async () => {
        await cacheService.cache('test', new Date().toISOString());
        res = await cacheService.cache('test');
        console.log('cache test', res);
    });
});
