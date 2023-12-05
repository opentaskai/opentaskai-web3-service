import { Document } from 'bson';

export type PageResult = {
    total: number;
    pages: number;
    data: any[];
};

export type CursorResult = {
    next: any;
    previous: any;
    data: any[];
    total: number;
};

export interface IBaseService {
    table: string;
    field_for_create_time: string | undefined;
    field_for_update_time: string | undefined;

    createIndex(): Promise<Document>;

    indexInformation(): Promise<Document>;

    findOne(where: {}): Promise<any>;

    save(data: any, where?: {}): Promise<any>;

    insertOne(data: any): Promise<any>;

    insertMany(data: any[]): Promise<any>;

    modifyOne(data: any, where?: {}): Promise<any>;

    modifyMany(data: any, where?: {}): Promise<any>;

    updateOne(where: any, data: any): Promise<any>;

    updateMany(where: any, data: any): Promise<any>;

    findOneAndUpdate(where: any, data: any, options: any): Promise<any>;

    deleteOne(where: {}): Promise<any>;

    deleteMany(where: {}): Promise<any>;

    trashOne(where: {}): Promise<any>;

    trashMany(where: {}): Promise<any>;

    trashRecoveryOne(where: any): Promise<any>;

    trashRecoveryMany(where: any): Promise<any>;

    page(where?: {}, size?: number, page?: number): Promise<PageResult>;

    cursor(where?: {}, limit?: number, cursor?: any, sort?: any): Promise<CursorResult>;
}
