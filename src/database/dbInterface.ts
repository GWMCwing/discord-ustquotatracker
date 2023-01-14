import { MongoClient, Db, Collection } from 'mongodb';
import { SectionQuota } from '../ust_tracker/SectionQuota';
// database interface is re-written into Mongodb equivalent
abstract class DbInterfaceBase {
    abstract insertSectionQuota(sectionQuota: SectionQuota): Promise<any>;
    abstract updateSectionQuota(classId: number, quota: number): Promise<any>;
    abstract getSectionQuota(semester: number, classId: number): Promise<any>;
}
export class DbInterface implements DbInterfaceBase {
    static instance: DbInterface | null = null;
    private dbClient: MongoClient;
    private db: Db;
    private collection: Collection;
    static getInstance() {
        if (DbInterface.instance === null) {
            throw new Error('DbInterface not initialized.');
        }
        return DbInterface.instance;
    }
    constructor(dbClient: MongoClient) {
        this.dbClient = dbClient;
        this.db = this.dbClient.db('ust_tracker');
        this.collection = this.db.collection('section_quota');
        DbInterface.instance = this;
    }
    async insertSectionQuota(sectionQuota: SectionQuota) {
        // const model = this.mongoResource.sectionQuotaModel;
        // return model.create(sectionQuota);
        console.log('inserting: ', sectionQuota.classId);
        return await this.collection.insertOne(sectionQuota);
    }

    async updateSectionQuota(classId: number, quota: number) {
        // const model = this.mongoResource.sectionQuotaModel;
        // return model.findOneAndUpdate({ classId }, { $set: { quota } }).exec();

        return await this.collection.findOneAndUpdate(
            { classId: classId },
            { $set: { quota: quota } },
            {
                returnDocument: 'after',
            }
        );
    }

    async getSectionQuota(semester: number, classId: number) {
        // const model = this.mongoResource.sectionQuotaModel;
        // return model.findOne({ classId, semester }).exec();
        return await this.collection.findOne({
            classId: classId,
            semester: semester,
        });
    }
}
