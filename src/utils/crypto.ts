import crypto from 'crypto';

export const md5 = (data: any) => {
    const hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest('hex');
};

export function sha256(data: any): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}
