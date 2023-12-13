import dotenv from 'dotenv';
dotenv.config();

function toBool(_val: any, _def: boolean) {
    if (_val !== undefined) {
        _val = String(_val).toLowerCase();
        if (_val === 'true') {
            return true;
        }
    }

    return _def;
}

export type APP_ENV_MONGODB_TYPE = {
    HOST: string;
    PORT: string;
    DB: string;
    USER: string;
    PASSWORD: string;
    SSLCA: string | undefined;
    AUTH_SOURCE: string | undefined;
};

export type APP_ENV_TYPE = {
    PORT: string;
    WEB_SESSION_KEY: string;
    JWT_SECRET_KEY: string;
    JWT_EXPIRED: string;
    MONGODB: APP_ENV_MONGODB_TYPE;
    CHAIN_ID: number;
    SIGNER_PK: string;
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
        HOST: process.env.MONGODB_HOST + '',
        PORT: process.env?.MONGODB_PORT + '' || '27017',
        DB: process.env.MONGODB_DB + '',
        USER: process.env.MONGODB_USER + '',
        PASSWORD: process.env.MONGODB_PASSWORD + '',
        SSLCA: process.env?.MONGODB_SSLCA,
        AUTH_SOURCE: process.env?.MONGODB_AUTH_SOURCE
    },
    CHAIN_ID: process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 56,
    SIGNER_PK: process.env.SIGNER_PK ?? '',
    CHAIN_RPC: process.env.CHAIN_RPC ?? '',
    IP_WHITE_LIST: process.env.IP_WHITE_LIST ? process.env.IP_WHITE_LIST.split(',') : ['127.0.0.1', '::1'],
    IS_CHECK_SN: toBool(process.env.IS_CHECK_SN, true)
};

export enum TRANS_CHANNEL {
    LOCAL = 'local',
    WEB3 = 'web3',
    PAYPAL = 'paypal'
}
