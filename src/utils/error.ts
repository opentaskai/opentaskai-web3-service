import { CustomError } from 'ts-custom-error';
import { capitalize } from './util';

export enum ERR_CODE {
    SUCCESS = 0,
    FAIL = 1,
    DATABASE_ERROR = 2,
    NETWORK_ERROR = 3,
    PARAMETER_ERROR = 4,
    NOT_FOUND = 5,
    EXISTENCE = 6,
    NO_CHANGE = 7,
    BUSY = 8,
    UNKNOWN = 9,
    VERSION_ERROR = 10,
    TOKEN_EXPIRED = 11,
    TOKEN_INVALID = 12,
    NO_PROVIDER = 20,
    INVALID_PROVIDER = 21,
    INSUFFICIENT_FUND = 22,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    PAYLOAD_TOO_LARGE = 413,
    PRECONDITION_REQUIRED = 428,
    EXCEPTION = 500,
    TIMEOUT = 504,
    RATE_LIMIT = 429
}

let ERR_MSG: Record<number, string> = {};
export function errMsg(code?: number) {
    if (!code) code = 0;
    if (!Object.keys(ERR_MSG).length) {
        ERR_MSG = {};
        const _errs: any = ERR_CODE;
        for (let k in _errs) {
            ERR_MSG[_errs[k]] = k;
        }
    }
    return capitalize(ERR_MSG[code]).replace(/_/g, ' ');
}
export class AppError extends CustomError {
    public code: any = ERR_CODE.FAIL;
    public constructor(code?: number, message?: string) {
        if (!message) message = errMsg(code);
        super(message);
        if (code === undefined) this.code = ERR_CODE.FAIL;
        else this.code = code;
    }
}

export class AppErrorMsg extends CustomError {
    code = ERR_CODE.FAIL;
    public constructor(message: string) {
        super(message);
    }
}
