import { uuid } from '../src/utils/util';
import { AppError, AppErrorMsg, ERR_CODE } from '../src/utils/error';

describe('Utils', async () => {
    describe('base', async () => {
        let res: any;

        before(async () => {});

        after(async () => {});

        it('uuid', async () => {
            res = [];
            for (let i = 0; i < 20; i++) {
                res.push(uuid());
            }
            console.log(res);
        });

        it('AppErrorMsg', async () => {
            try {
                throw new AppErrorMsg('test app error message');
            } catch (e: any) {
                console.debug('error code:', e?.code, 'error message: ', e.message);
            }
        });
        it('AppError', async () => {
            try {
                throw new AppError(32, 'error');
            } catch (e: any) {
                console.debug('error code:', e?.code, 'error message: ', e.message);
            }
        });
    });
});
