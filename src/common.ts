export function cleanData(data: any) {
    if(typeof data.sign === 'object') {
        data.signature = data.sign.compact;
    } else {
        data.signature = data.sign;
    }
    
    delete data.sign;
    return data;
}
