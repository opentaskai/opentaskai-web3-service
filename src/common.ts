export function cleanData(data: any) {
    data.signature = data.sign.compact;
    delete data.sign;
    return data;
}
