export enum TransactionTypes {
    deposit = 'deposit', 
    withdrawal = 'withdrawal',
    purchase = 'purchase', 
    cancelTransaction = 'cancelTransaction', 
    freezeDeposit = 'freezeDeposit', 
    unfreezeDeposit = 'unfreezeDeposit', 
    normalCompletion = 'normalCompletion',
    negotiatedCompletion = 'negotiatedCompletion', 
    defaultedCompletion = 'defaultedCompletion',
    refundCompletion = 'refundCompletion',
    refund = 'refund'
}

export enum TransactionStatus {
    pending = 'pending',
    processing = 'processing',
    success = 'success',
    fail = 'fail',
    cancel = 'cancel'
}

export enum TRANS_CHANNEL {
    LOCAL = 'local',
    WEB3 = 'web3',
    PAYPAL = 'paypal'
}
