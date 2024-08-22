import assert from 'assert';
import mail from '../src/utils/email';
import { EMAIL_ENV } from '../src/constants';

describe('Email', async () => {
    describe('base', async () => {
        let res: any;

        before(async () => {
            console.log('before');
        });

        after(async () => {
            console.log('before');
        });

        it('send email', async () => {
            res = await mail.sendMail('OpenTaskAI no-reply@opentaskai.com', 'tercel.yi@gmail.com', 'OpenTaskAI Verify Code', Math.random().toString().substr(2, 6), 'register');
            console.log('res::', res);
        });
    });
});
