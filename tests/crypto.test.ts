import { md5, sha256 } from '../src/utils/crypto';

describe('crypto', async () => {
    describe('base', async () => {
        let res: any;

        before(async () => {});

        after(async () => {});

        it('md5', async () => {
            res = md5('123456');
            console.log(res);
            res = sha256('123456');
            console.log(res);
            res = sha256('8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92 mocha --timeout 1000000 --require ts-node/register');
            console.log(res);
        });
    });
});
