import { BaseService } from './base';

class OrderService extends BaseService {
    initFields() {
        this.fields = {
            id: String,
            projectId: String,
            projectOwner: String,
            title: String,
            description: String,
            amount: Number,
            paidAmount: Number,
            clearedAmount: Number,
            status: String,
            paymentStatus: String,
            deliveryStatus: String,
            projectList: Object,
            owner: String,
            startDate: String,
            endDate: String,
            refundStatus: String,
            transactions: Object,
            isPerfectRequirements: Number,
            isEvaluation: Number,
            star: Number
        };
        super.initFields();
    }

    getPaidTransactions(transactions: Record<string, any>) {
        for (let k in transactions) {
            if (transactions[k].type && transactions[k].type.indexOf('purchase') === 0) {
                return transactions[k];
            }
        }
        return null;
    }
}

export const orderService = new OrderService('order', ['id']);
