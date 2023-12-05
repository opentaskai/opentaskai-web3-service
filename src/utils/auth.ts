import jwt from 'jsonwebtoken';
import { APP_ENV } from '../constants';

export const getToken = (data: Record<string, any>, expiresIn: string | number = APP_ENV.JWT_EXPIRED): string => {
    const authorization = jwt.sign(
        {
            data
        },
        APP_ENV.JWT_SECRET_KEY,
        {
            expiresIn: expiresIn
        }
    );
    return `Bearer ${authorization}`;
};

export const getUerInfoByToken = (authorization: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const auth = (authorization ?? '').split(' ');
        authorization = auth.length > 1 ? auth[1] : auth[0];
        jwt.verify(authorization, APP_ENV.JWT_SECRET_KEY, async (err: any, decode: any) => {
            if (err) {
                resolve({ verify: false });
            } else {
                resolve({ verify: true, ...decode.data });
            }
        });
    });
};

export const verifyToken = (authorization: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        jwt.verify(authorization, APP_ENV.JWT_SECRET_KEY, async (err: any, decode: any) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

export const getUerInfoByRequest = async (req: any): Promise<any> => {
    let { authorization } = req.headers;
    if (!authorization) {
        authorization = req.cookies['Authorization'];
    }

    return getUerInfoByToken(authorization);
};
