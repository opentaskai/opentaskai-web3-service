import { BaseService } from './base';

export class ConfigService extends BaseService {
    async setValue(key: string, value: string | number) {
        await super.save({ key, value }, { key });
    }

    async getValue(key: string, defaultValue: any = undefined): Promise<any> {
        const res = await super.findOne({ key });
        if (res) {
            return res.value;
        }
        return defaultValue;
    }

    async getSignatureExpired(): Promise<any> {
        const res = await super.findOne({ key: 'signatureExpired' });
        return Date.now() + res?.value || 0;
    }
}

export const configService = new ConfigService('config', ['key']);
