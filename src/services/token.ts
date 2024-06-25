import { BaseService } from './base';

class TokenService extends BaseService {
    initFields() {
        this.fields = {
            chainId: String,
            address: String,
            symbol: String,
            name: String,
            standard: String,
            decimals: Number,
        };
        super.initFields();
    }

    async get(chainId: string|number, address: string) {
        chainId = Number(chainId);
        return await this.findByUnique({chainId, address});
    }
}

export const tokenService = new TokenService('token', ['chainId,address']);
