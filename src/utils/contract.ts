import { ethers, BigNumber } from 'ethers';

export function hexToBytes32(val: string) {
    if (val.substring(0, 2) !== '0x') val = '0x' + val;
    return ethers.utils.hexZeroPad(val, 32);
}

export function bytes32ToHex(val: string, has0x: boolean = false, len=32) {
    if (val.substring(0, 2) !== '0x') val = '0x' + val;
    let res = ethers.utils.hexStripZeros(val);
    if (!has0x) res = res.substring(2);
    if (len && res.length < len) {
        res = res.padStart(32, '0');
    }
    return res;
}

export function bigNumberJsonToString(value: any) {
    if (typeof value === 'object' && Object.keys(value).indexOf('_isBigNumber') !== -1 && Object.keys(value).indexOf('_hex') !== -1) {
        return BigNumber.from(value._hex).toString();
    } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            value[i] = bigNumberJsonToString(value[i]);
        }
    }
    return value;
}

export function formatLogArgs(args: any, format: any) {
    const result: any = {};
    let i = 0;
    for(const k in format) {
        if(format[k] === 'bytes32') {
            result[k] = bytes32ToHex(args[i]);
        } else if(format[k] === 'address') {
            result[k] = args[i].toLowerCase();
        } else if(typeof format[k] === 'object' && format[k] !== null) {
            result[k] = formatLogArgs(args[i], format[k]);
        } else {
            result[k] = args[i].toString();
        }
        i++;
    }
    return result;
}