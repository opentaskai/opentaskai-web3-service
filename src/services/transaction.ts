import { BaseService } from './base';
import { APP_ENV } from '../constants';

export class TransactionService extends BaseService {
    initFields() {
        this.fields = {
            sn: 'string',
            type: 'string',
            amount: 'number',
            owner: 'string',
            channel_id: 'string',
            channel_tx: 'string',
            data: 'any',
            status: 'string'
        };
        super.initFields();
    }

    async checkSN(sn: string) {
        console.log('APP_ENV.IS_CHECK_SN:', APP_ENV.IS_CHECK_SN);
        if (!APP_ENV.IS_CHECK_SN) {
            return true;
        }
        const res = await this.findByUnique({ sn });
        if (!res) {
            throw new Error('invalid sn');
        }
        return true;
    }
}

export const transactionService = new TransactionService('transaction', ['sn']);
