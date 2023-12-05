import { ERR_CODE, errMsg } from './error';

export default class Result {
    static _code(code: number, data?: any) {
        const msg = errMsg(code);
        return { code: code, msg: msg, data };
    }

    static err(code: number, msg?: string, data?: any) {
        if (!msg) msg = errMsg(code);
        return { code: code, msg: msg, data };
    }

    static success(data: any = null) {
        if (data && data?._id) delete data._id;
        return Result._code(ERR_CODE.SUCCESS, data);
    }

    static success_extra(data: any) {
        if (data && data?._id) delete data._id;
        const msg = errMsg(ERR_CODE.SUCCESS);
        return { code: ERR_CODE.SUCCESS, msg, ...data };
    }

    static fail(msg?: string, data?: any) {
        if (!msg) msg = errMsg(ERR_CODE.FAIL);
        return { code: ERR_CODE.FAIL, msg, data };
    }

    static db(data = false) {
        return Result._code(ERR_CODE.DATABASE_ERROR, data);
    }

    static network(data = false) {
        return Result._code(ERR_CODE.NETWORK_ERROR, data);
    }

    static param(data = false) {
        return Result._code(ERR_CODE.PARAMETER_ERROR, data);
    }

    static no(data = false) {
        return Result._code(ERR_CODE.NOT_FOUND, data);
    }

    static existence(data = false) {
        return Result._code(ERR_CODE.EXISTENCE, data);
    }

    static unchanged(data = false) {
        return Result._code(ERR_CODE.NO_CHANGE, data);
    }

    static unknown(data = false) {
        return Result._code(ERR_CODE.UNKNOWN, data);
    }

    static badRequest(data = false) {
        return Result._code(ERR_CODE.BAD_REQUEST, data);
    }

    static unauthorized(data = false) {
        return Result._code(ERR_CODE.UNAUTHORIZED, data);
    }

    static forbidden(data = false) {
        return Result._code(ERR_CODE.FORBIDDEN, data);
    }

    static tooLarge(data = false) {
        return Result._code(ERR_CODE.PAYLOAD_TOO_LARGE, data);
    }

    static condition(data = false) {
        return Result._code(ERR_CODE.PRECONDITION_REQUIRED, data);
    }

    static exception(data = false) {
        return Result._code(ERR_CODE.EXCEPTION, data);
    }

    static timeout(data = false) {
        return Result._code(ERR_CODE.TIMEOUT, data);
    }

    static rateLimit(data = false) {
        return Result._code(ERR_CODE.RATE_LIMIT, data);
    }

    static tokenExpired(data = false) {
        return Result._code(ERR_CODE.TOKEN_EXPIRED, data);
    }

    static tokenInvalid(data = false) {
        return Result._code(ERR_CODE.TOKEN_INVALID, data);
    }

    static busy(data = false) {
        return Result._code(ERR_CODE.BUSY, data);
    }
}
