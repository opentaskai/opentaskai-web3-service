import * as CryptoJS from 'crypto-js';

export function md5(val: string): string {
    return CryptoJS.MD5(val).toString();
}
