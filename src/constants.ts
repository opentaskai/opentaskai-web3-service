import dotenv from 'dotenv';
dotenv.config();

export type APP_ENV_TYPE = {
    PORT: string;
    WEB_SESSION_KEY: string;
    JWT_SECRET_KEY: string;
    JWT_EXPIRED: string;
    CHAIN_ID: number;
    SIGNER_PK: string;
    CHAIN_RPC: string;
    IP_WHITE_LIST: string[];
};

export const APP_ENV: APP_ENV_TYPE = {
    PORT: process.env.PORT + '',
    WEB_SESSION_KEY: process.env.WEB_SESSION_KEY ?? 'opentaskai_Web3API_session',
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY + '',
    JWT_EXPIRED: process.env.JWT_EXPIRED + '',
    CHAIN_ID: process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 56,
    SIGNER_PK: process.env.SIGNER_PK ?? '',
    CHAIN_RPC: process.env.CHAIN_RPC ?? '',
    IP_WHITE_LIST: process.env.IP_WHITE_LIST ? process.env.IP_WHITE_LIST.split(',') : ['127.0.0.1', '::1']
};
