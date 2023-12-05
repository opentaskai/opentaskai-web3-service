import { BaseService } from './base';

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
}

export const transactionService = new TransactionService('transaction', ['sn']);
