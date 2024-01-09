import { BaseService } from './base';

var _cache: Record<string, any> = {};

export class CacheService extends BaseService {
    async load(key: string, def?: any) {
        let res: any = await this.findOne({ key: key });
        // console.log('load', key, res, def);
        let val: any = '';
        if (!res && def !== undefined) {
            val = def;
        } else if (res) {
            val = res.val;
        }
        _cache[key] = val;
        return val;
    }

    async loadNumber(key: string, def?: number): Promise<number> {
        return Number(await this.load(key, def));
    }

    async loadString(key: string, def?: string): Promise<string> {
        return (await this.load(key, def)) + '';
    }

    async cache(key: string, val?: any) {
        if (val === undefined) {
            if (_cache[key]) {
                return _cache[key];
            }
            const res = await this.findOne({ key: key });
            if (res) {
                _cache[key] = res.val;
                val = _cache[key];
            }
        } else {
            await this.save({ key: key, val: val }, { key: key });
        }
        return val;
    }
}

export default new CacheService('cache', ['key']);
