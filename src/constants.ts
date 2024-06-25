import dotenv from 'dotenv';
dotenv.config();

function toBool(_val: any, _def: boolean) {
    if (_val !== undefined) {
        _val = String(_val).toLowerCase();
        if (_val === 'true') {
            return true;
        } else {
            return false;
        }
    }

    return _def;
}

export type APP_ENV_MONGODB_TYPE = {
    URL: string;
    SSLCA: string | undefined;
};

export type APP_ENV_TYPE = {
    PORT: string;
    WEB_SESSION_KEY: string;
    JWT_SECRET_KEY: string;
    JWT_EXPIRED: string;
    MONGODB: APP_ENV_MONGODB_TYPE;
    CHAIN_ID: number;
    SIGNER_PK: string;
    CLEARER_PK: string;
    CHAIN_RPC: string;
    IP_WHITE_LIST: string[];
    IS_CHECK_SN: boolean;
};

export const APP_ENV: APP_ENV_TYPE = {
    PORT: process.env.PORT + '',
    WEB_SESSION_KEY: process.env.WEB_SESSION_KEY ?? 'opentaskai_Web3API_session',
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY + '',
    JWT_EXPIRED: process.env.JWT_EXPIRED + '',
    MONGODB: {
        URL: process.env.MONGODB_URL ?? 'mongodb://127.0.0.1:27017',
        SSLCA: process.env?.MONGODB_SSLCA
    },
    CHAIN_ID: process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 56,
    SIGNER_PK: process.env.SIGNER_PK ?? '',
    CLEARER_PK: process.env.CLEARER_PK ?? '',
    CHAIN_RPC: process.env.CHAIN_RPC ?? '',
    IP_WHITE_LIST: process.env.IP_WHITE_LIST ? process.env.IP_WHITE_LIST.split(',') : ['127.0.0.1', '::1'],
    IS_CHECK_SN: toBool(process.env.IS_CHECK_SN, true)
};

export enum TRANS_CHANNEL {
    LOCAL = 'local',
    WEB3 = 'web3',
    PAYPAL = 'paypal'
}
