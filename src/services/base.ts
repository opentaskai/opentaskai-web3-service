import { mongodb } from '../db/mongo';
import { ObjectId, Collection, FindOneAndReplaceOptions, FindOneAndUpdateOptions, ReturnDocument } from 'mongodb';
import { Document } from 'bson';
import { IBaseService, PageResult, CursorResult } from '../typing';
import lodash from 'lodash';
import { toBase64, fromBase64 } from 'js-base64';
import { uuid } from '../utils/util';
import DataUtil from '../utils/datautil';
import { AppError, ERR_CODE } from '../utils/error';

export { PageResult, CursorResult };

export class BaseService implements IBaseService {
    table: string;
    unique_fields: string[] = [];
    field_for_trash: string = '';
    field_for_create_time: any = 'createdAt';
    field_for_update_time: any = 'updatedAt';
    fields: Record<string, any> = {};
    db: Collection<Document>;
    constructor(_col: string, _unique_fields: string[] = [], _field_for_trash?: any, _create_time?: any, _update_time?: any) {
        this.table = _col;
        this.unique_fields = _unique_fields;
        this.field_for_trash = _field_for_trash ?? '';
        if (_create_time) {
            this.field_for_create_time = _create_time;
        }
        if (_update_time) {
            this.field_for_update_time = _update_time;
        }
        this.db = mongodb.dba.collection(this.table);
        this.initFields();
    }

    initFields() {
        if (!Object.keys(this.fields).length) return;
        if (this.field_for_trash) {
            this.fields[this.field_for_trash] = 'boolean';
        }
        if (this.field_for_create_time) {
            this.fields[this.field_for_create_time] = 'string';
        }
        if (this.field_for_update_time) {
            this.fields[this.field_for_update_time] = 'string';
        }
    }

    async createUniqueIndex(): Promise<any> {
        let indexes: any = await this.indexInformation();

        // console.debug('index_information:', indexes);
        // console.debug('unique_fields:', this.unique_fields);
        let created = false;
        for (let i = 0; i < this.unique_fields.length; i++) {
            let f = this.unique_fields[i];
            if (f.indexOf(',') == -1) {
                const uname = 'u_idx_' + f;
                if (!indexes[uname]) {
                    const keys: any = {};
                    keys[f] = 1;
                    // console.debug('createIndex keys:', keys);
                    await mongodb.dba.createIndex(this.table, keys, { unique: true, name: uname });
                    created = true;
                }
            } else {
                f = f.replace(' ', '');
                const uname = 'u_idx_' + f.replace(',', '_');
                if (!indexes[uname]) {
                    const keys: any = {};
                    const f_arr = f.split(',');
                    for (let k of f_arr) {
                        keys[k] = 1;
                    }
                    // console.debug('createIndex keys:', keys);
                    await mongodb.dba.createIndex(this.table, keys, { unique: true, name: uname });
                    created = true;
                }
            }
        }

        if (created) {
            indexes = await this.indexInformation();
        }
        return indexes;
    }

    async createIndex(): Promise<any> {
        return {};
    }

    async indexInformation(): Promise<Document> {
        try {
            return await mongodb.dba.indexInformation(this.table);
        } catch (e: any) {
            return {};
        }
    }

    dataCleaning(data: any): Record<string, any> {
        return DataUtil.filterObject(data, this.fields);
    }

    fillDefaultData(data: any = {}): Record<string, any> {
        for (let i = 0; i < this.unique_fields.length; i++) {
            let f = this.unique_fields[i];
            if (f.indexOf(',') == -1) {
                if (data[f] === undefined) {
                    data[f] = uuid();
                }
            }
        }

        if (this.field_for_create_time && !data[this.field_for_create_time]) data[this.field_for_create_time] = new Date().toISOString();
        if (this.field_for_update_time) data[this.field_for_update_time] = new Date().toISOString();

        return data;
    }

    async getQueryByUnique(data: any, strict = true) {
        if (data['_id'] !== undefined && typeof data['_id'] === 'string') return { _id: new ObjectId(data['_id']) };

        for (let i = 0; i < this.unique_fields.length; i++) {
            let f = this.unique_fields[i];
            const query: any = {};
            if (f.indexOf(',') === -1) {
                query[f] = data[f];
                if (data[f] !== undefined) return query;
            } else {
                f = f.replace(' ', '');
                const f_arr = f.split(',');
                for (let k of f_arr) {
                    if (data[k] !== undefined) query[k] = data[k];
                }
                if (Object.keys(query).length) return query;
            }
        }
        if (strict && !data) throw new AppError(ERR_CODE.PARAMETER_ERROR);
        // console.debug('getQueryByUnique:', data);
        return data;
    }

    async count(where: {}): Promise<number> {
        return await mongodb.dba.collection(this.table).countDocuments(where);
    }

    async countWithAggregate(_condition: any[]): Promise<number> {
        const condition = [..._condition];
        condition.push({ $count: 'count' });
        // console.debug('countWithAggregate condition', JSON.stringify(condition));
        const res: any = await mongodb.dba.collection(this.table).aggregate(condition).toArray();
        if (res && res.length > 0) {
            return res[0].count;
        }
        return 0;
    }

    async findByUnique(data: any = {}, sort: any = { _id: 1 }): Promise<any> {
        const query = await this.getQueryByUnique(data);
        return await this.findOne(query, sort);
    }

    async findOne(where: {}, sort: any = { _id: 1 }): Promise<any> {
        return await this._findOne(where, sort);
    }

    async _findOne(where: any, sort: any = { _id: 1 }): Promise<any> {
        if (!where || !Object.keys(where).length) throw new Error('no where');
        if (where?._id && typeof where._id === 'string') where._id = new ObjectId(where._id);
        try {
            if (where?._id) {
                return await mongodb.dba.collection(this.table).findOne(where);
            } else {
                const result = await mongodb.dba.collection(this.table).find(where).sort(sort).limit(1).toArray();
                if (result.length > 0) {
                    return result[0];
                } else {
                    return null;
                }
            }
        } catch (e) {
            console.error('_findOne except:', this.table, where);
            throw e;
        }
    }

    async findAll(where: {}, sort: any = { _id: -1 }): Promise<any[]> {
        // console.debug('findAll', this.table, where);
        return await mongodb.dba.collection(this.table).find(where).sort(sort).toArray();
    }

    async insertOne(data: any): Promise<any> {
        if (!data || (typeof data === 'object' && !Object.keys(data).length)) return data;
        data = this.fillDefaultData(data);
        if (data?._id) delete data._id;
        data = this.dataCleaning(data);
        // console.debug('insertOne after dataCleaning:', this.table, data);

        await mongodb.dba.collection(this.table).insertOne(data);
        // console.debug('insertOne', this.table, data);
        return data;
    }

    async insertMany(data: any[]): Promise<any> {
        if (this.field_for_create_time || this.field_for_update_time) {
            data = data.filter((d: any) => {
                if (typeof d === 'object' && Object.keys(d).length) return d;
            });
            data = data.map((d: any) => {
                d = this.fillDefaultData(d);
                d = this.dataCleaning(d);
                if (this.field_for_create_time && !d[this.field_for_create_time]) d[this.field_for_create_time] = new Date().toISOString();
                if (this.field_for_update_time) d[this.field_for_update_time] = new Date().toISOString();
                return d;
            });
        }
        await mongodb.dba.collection(this.table).insertMany(data);
        return data;
    }

    async modifyOne(data: any, where: any): Promise<any> {
        if (!Object.keys(where).length) throw new Error('modifyOne need where');
        if (Object.keys(data).includes('_id')) delete data._id;
        data = this.dataCleaning(data);
        delete data[this.field_for_create_time];
        if (this.field_for_update_time) data[this.field_for_update_time] = new Date().toISOString();
        await mongodb.dba.collection(this.table).updateOne(where, { $set: data });
        // console.debug('modifyOne', this.table, data, where);
        return data;
    }

    async modifyOneByUnique(data: any): Promise<any> {
        const query = await this.getQueryByUnique(data);
        return await this.modifyOne(data, query);
    }

    async modifyMany(data: any, where: any): Promise<any> {
        if (!Object.keys(where).length) throw new Error('modifyMany need where');
        if (Object.keys(data).includes('_id')) delete data._id;
        data = this.dataCleaning(data);
        delete data[this.field_for_create_time];
        if (this.field_for_update_time) data[this.field_for_update_time] = new Date().toISOString();
        const res = await mongodb.dba.collection(this.table).updateMany(where, { $set: data });
        // console.debug('modifyMany', this.table, data, where, res);
        return res;
    }

    async updateOne(where: any, data: any): Promise<any> {
        if (!Object.keys(where).length) throw new Error('updateOne need where');
        if (!data?.$inc && !data?.set && Object.keys(data).length) {
            data = { $set: data };
        }
        if (data?.$set) {
            data.$set = this.dataCleaning(data.$set);
            if (this.field_for_update_time) data.$set[this.field_for_update_time] = new Date().toISOString();
        }

        await mongodb.dba.collection(this.table).updateOne(where, data);
        // console.debug('updateOne', this.table, where, data);
        return data;
    }

    async updateMany(where: any, data: any): Promise<any> {
        if (!Object.keys(where).length) throw new Error('updateMany need where');
        if (!data?.$inc && !data?.set && Object.keys(data).length) {
            data = { $set: data };
        }
        if (data?.$set) {
            data.$set = this.dataCleaning(data.$set);
            if (this.field_for_update_time) data.$set[this.field_for_update_time] = new Date().toISOString();
        }

        const res = await mongodb.dba.collection(this.table).updateMany(where, data);
        // console.debug('updateMany', this.table, where, data, res);
        return res;
    }

    async save(data: any, where?: any): Promise<any> {
        let res: any = null;
        if (where && Object.keys(where).length) {
            res = await this._findOne(where);
        } else {
            where = await this.getQueryByUnique(data, false);
            res = await this.findOne(where);
        }

        if (res) {
            data = await this.modifyOne(data, where);
            data = { ...res, ...data };
        } else {
            data = await this.insertOne(data);
        }
        // console.debug('save', this.table, data, where);
        return data;
    }

    async findOneAndUpdate(where: any, data: any, options: FindOneAndUpdateOptions = { upsert: false }): Promise<any> {
        if (where?._id && typeof where._id === 'string') where._id = new ObjectId(where._id);
        let update: any = { $set: {} };
        if (!data.$set && !data.$inc) {
            if (!options.upsert && this.field_for_create_time && data[this.field_for_create_time]) delete data[this.field_for_create_time];
            update.$set = data;
        } else {
            update = data;
        }

        if (this.field_for_update_time) update.$set = { ...update.$set, [this.field_for_update_time]: new Date().toISOString() };
        Object.assign(options, { returnDocument: ReturnDocument.AFTER });

        const res: any = await mongodb.dba.collection(this.table).findOneAndUpdate(where, update, options);
        if (res.value) {
            return res.value;
        } else {
            throw new AppError(ERR_CODE.NOT_FOUND);
        }
    }

    async saveByExit(data: any, where?: any): Promise<any> {
        let res: any = null;
        if (where && Object.keys(where).length) {
            res = await this._findOne(where);
        } else {
            where = await this.getQueryByUnique(data);
            res = await this.findOne(where);
        }

        if (res && Object.keys(where).length) {
            data = await this.modifyOne(data, where);
            return { ...res, ...data };
        } else {
            throw new AppError(ERR_CODE.NOT_FOUND);
        }
    }

    async deleteOne(where: any): Promise<number> {
        if (where?._id && typeof where._id === 'string') where._id = new ObjectId(where._id);
        console.log('where', where);
        const res = await mongodb.dba.collection(this.table).deleteOne(where);
        if (res) {
            return res.deletedCount;
        }
        return 0;
    }

    async deleteMany(where: any): Promise<number> {
        if (where?._id && typeof where._id === 'string') where._id = new ObjectId(where._id);
        if (where?._id && Array.isArray(where._id))
            where._id = {
                $in: where._id.map((i: any) => {
                    return new ObjectId(i);
                })
            };

        const res = await mongodb.dba.collection(this.table).deleteMany(where);
        if (res) {
            return res.deletedCount;
        }
        return 0;
    }

    async trashOne(where: any): Promise<any> {
        const query = await this.getQueryByUnique(where);
        if (this.field_for_trash) return await this.modifyOne({ [this.field_for_trash]: true }, query);
        else {
            return await this.deleteOne(query);
        }
    }

    async trashMany(where: any): Promise<any> {
        if (this.field_for_trash) {
            return await this.modifyMany({ [this.field_for_trash]: true }, where);
        } else {
            return await this.deleteMany(where);
        }
    }

    async trashRecoveryOne(where: any): Promise<any> {
        const query = await this.getQueryByUnique(where);
        if (this.field_for_trash) {
            query[this.field_for_trash] = true;
            return await this.modifyOne({ [this.field_for_trash]: false }, query);
        }
        return false;
    }

    async trashRecoveryMany(where: any): Promise<any> {
        if (this.field_for_trash) {
            where[this.field_for_trash] = true;
            return await this.modifyMany({ [this.field_for_trash]: false }, where);
        }

        return false;
    }

    async aggregate(param: any[]) {
        console.debug('aggregate where', param);
        const res = mongodb.dba.collection(this.table).aggregate(param);
        return await res.toArray();
    }

    async page(where: any = {}, size = 10, page = 1, sort: any = { _id: -1 }, pipeline: any[] = []): Promise<PageResult> {
        if (pipeline && pipeline.length) {
            const condition: any = [{ $match: where }, ...pipeline];
            return await this.pageWithAggregate(condition, size, page, sort);
        } else {
            return await this.pageWithFind(where, size, page, sort);
        }
    }

    async pageWithFind(where: any = {}, size = 10, page = 1, sort: any = { _id: -1 }): Promise<PageResult> {
        if (!Object.keys(where).length) where = {};
        if (where?.$and && !where.$and.length) {
            delete where.$and;
        }
        if (!size) size = 10;
        if (!page) page = 1;
        let data: any = [];
        const total: number = await this.count(where);
        const pages = Math.ceil(total / size);
        if (total === 0) return { total, pages, data };
        const skip = size * (page - 1);
        const sortKeys = Object.keys(sort);
        if (!sortKeys.includes('_id')) {
            if (sortKeys.length) {
                sort['_id'] = sort[sortKeys[0]];
            } else {
                sort['_id'] = -1;
            }
        }
        const cursor = mongodb.dba.collection(this.table).find(where).skip(skip).limit(size).sort(sort);
        data = await cursor.toArray();
        return { total, pages, data };
    }

    async pageWithAggregate(condition: any[] = [], limit = 10, page = 1, sort: any = { _id: -1 }): Promise<PageResult> {
        if (!limit) limit = 10;
        if (!page) page = 1;
        const totalCondition: any = [...condition];
        const sortKeys = Object.keys(sort ?? {});
        if (!sortKeys.includes('_id')) {
            if (sortKeys.length) {
                sort['_id'] = sort[sortKeys[0]];
            } else {
                sort['_id'] = -1;
            }
        }

        condition.push({ $sort: sort });
        condition.push({ $skip: (page - 1) * limit });
        condition.push({ $limit: limit });
        const cursor = mongodb.dba.collection(this.table).aggregate(condition, { allowDiskUse: true });
        const data = await cursor.toArray();

        const total: number = await this.countWithAggregate(totalCondition);
        const pages = Math.ceil(total / limit);
        return { total, pages, data };
    }

    async cursor(where: any, limit: number = 10, cursor: any = null, sort: any = null, unwind: any[] = [], predata: any[] = []): Promise<CursorResult> {
        if (where?.$and && !where.$and.length) {
            delete where.$and;
        }

        if (unwind.length || predata.length) {
            return await this._cursorWithAggregate(where, limit, cursor, sort, unwind, predata);
        } else {
            return await this._cursorWithFind(where, limit, cursor, sort);
        }
    }

    async _cursorWithFind(where: any = {}, limit: number = 10, cursor: any = null, sort: any = null): Promise<CursorResult> {
        if (sort === null) {
            sort = { _id: 1 };
        }

        const previousSort: any = {};
        for (let k in sort) {
            previousSort[k] = -1 * sort[k];
        }
        // console.debug('cursor: ', cursor, limit, sort);
        const hasAnd = Object.keys(where).includes('$and');
        let condition: any = { ...where };
        let direction = 'next';
        if (cursor) {
            const { cursorDirection, cursorWhere } = this._decodeCursor(cursor, sort);
            direction = cursorDirection;
            // console.debug('cursorWhere', cursorWhere, where);
            if (hasAnd) {
                condition.$and.push(cursorWhere);
            } else {
                condition = { $and: [cursorWhere, condition] };
            }
        }

        const sortKeys = Object.keys(sort);
        const originSort = { ...sort };
        if (!sortKeys.includes('_id')) {
            previousSort['_id'] = -1 * sort[sortKeys[0]];
            originSort['_id'] = originSort[sortKeys[0]];
        }
        const findSort = direction === 'previous' ? previousSort : originSort;
        // console.debug('_cursorWithFind where: ', limit, JSON.stringify(condition), findSort);
        const find = mongodb.dba.collection(this.table).find(condition);
        let data = await find
            .limit(limit + 1)
            .sort(findSort)
            .toArray();
        const hasMore = data.length > limit;
        if (hasMore) {
            data.pop();
        }
        if (direction === 'previous') {
            data = data.reverse();
        }
        const total: number = await this.count(where);
        let previous = null;
        let next = null;
        if (data && data.length) {
            if ((direction === 'previous' && cursor && hasMore) || (direction === 'next' && cursor)) {
                previous = this._encodeCursor(data[0], sort, 'previous');
            }

            if ((direction == 'next' && hasMore) || (direction == 'previous' && total > limit)) {
                next = this._encodeCursor(data[data.length - 1], sort, 'next');
            }
        }

        return { next, previous, data, total };
    }

    async _cursorWithAggregate(where: any = {}, limit: number = 10, cursor: any = null, sort: any = null, unwind: any[] = [], predata: any[] = []): Promise<CursorResult> {
        const condition: any = [];
        const totalCondition: any = [];
        if (predata && predata.length) {
            condition.push(...predata);
            totalCondition.push(...predata);
        }
        if (sort === null) {
            sort = { _id: 1 };
        }

        const previousSort: any = {};
        for (let k in sort) {
            previousSort[k] = -1 * sort[k];
        }
        // console.debug('cursor: ', cursor, limit, sort);

        const hasAnd = Object.keys(where).includes('$and');
        let direction = 'next';
        const countWhere = { ...where };
        if (cursor) {
            const { cursorDirection, cursorWhere } = this._decodeCursor(cursor, sort);
            // console.debug('cursorWhere', cursorWhere);
            direction = cursorDirection;
            where = lodash.merge({}, cursorWhere, where);
            if (hasAnd) {
                where.$and.push(cursorWhere);
            } else {
                where = { $and: [cursorWhere, where] };
            }
        }
        // console.debug('where: ', JSON.stringify(where));
        if (Object.keys(where).length) {
            condition.push({ $match: where });
        }
        if (Object.keys(countWhere).length) {
            totalCondition.push({ $match: countWhere });
        }

        condition.push(...unwind);
        totalCondition.push(...unwind);
        // console.debug('condition', JSON.stringify(condition));
        const find = mongodb.dba.collection(this.table).aggregate(condition);
        const sortKeys = Object.keys(sort);
        const originSort = { ...sort };
        if (!sortKeys.includes('_id')) {
            previousSort['_id'] = -1 * sort[sortKeys[0]];
            originSort['_id'] = originSort[sortKeys[0]];
        }
        const findSort = direction === 'previous' ? previousSort : originSort;
        let data = await find
            .limit(limit + 1)
            .sort(findSort)
            .toArray();
        const hasMore = data.length > limit;
        if (hasMore) {
            data.pop();
        }
        if (direction === 'previous') {
            data = data.reverse();
        }
        const total: number = await this.countWithAggregate(totalCondition);

        let previous = null;
        let next = null;
        if (data && data.length) {
            if ((direction === 'previous' && cursor && hasMore) || (direction === 'next' && cursor)) {
                previous = this._encodeCursor(data[0], sort, 'previous');
            }

            if ((direction == 'next' && hasMore) || (direction == 'previous' && total > limit)) {
                next = this._encodeCursor(data[data.length - 1], sort, 'next');
            }
        }

        return { next, previous, data, total };
    }

    _generateCursorQuery(data: any, sort: any, direction: string) {
        const keys = Object.keys(sort);
        const where: any = {};

        const sortAsc = (sortValue: number) => {
            return (sortValue === -1 && direction === 'previous') || (sortValue === 1 && direction !== 'previous') || false;
        };

        if (keys.includes('_id')) {
            if (sortAsc(sort['_id'])) {
                where['_id'] = { $gt: data['_id'] };
            } else {
                where['_id'] = { $lt: data['_id'] };
            }
        } else {
            where['$or'] = [];
            const where1: any = {};
            for (let k in sort) {
                if (sortAsc(sort[k])) {
                    where1[k] = { $gt: data[k] };
                } else {
                    where1[k] = { $lt: data[k] };
                }
            }
            where['$or'].push(where1);

            const where2: any = {};
            for (let k in sort) {
                where2[k] = { $eq: data[k] };
            }
            if (sortAsc(sort[keys[0]])) {
                where2['_id'] = { $gt: data['_id'] };
            } else {
                where2['_id'] = { $lt: data['_id'] };
            }
            where['$or'].push(where2);
        }

        return where;
    }

    _encodeCursor(data: any, sort: any, direction: string) {
        // console.debug('_encodeCursor in:', sort, direction);
        const where: any = {};
        if (data?.['_id']) {
            where['_id'] = data['_id'].toString();
        }
        where['__cursor__'] = direction;
        for (let k in sort) {
            where[k] = data[k];
        }
        return toBase64(JSON.stringify(where));
    }

    _decodeCursor(cursor: any, sort: any = { _id: -1 }) {
        if (!cursor) return {};
        // console.debug('decode cursor in :', cursor, fromBase64(cursor));
        try {
            const data: any = JSON.parse(fromBase64(cursor));
            const direction = data['__cursor__'];
            // console.debug('decode cursor out :', data);
            if (Object.keys(data).includes('_id') && typeof data['_id'] === 'string') {
                data['_id'] = new ObjectId(data['_id']);
            }
            return {
                cursorDirection: direction,
                cursorWhere: this._generateCursorQuery(data, sort, direction)
            };
        } catch (e) {
            throw e;
        }
    }
}
