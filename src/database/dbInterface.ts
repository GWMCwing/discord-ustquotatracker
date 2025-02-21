import {
    MongoClient,
    Db,
    Collection,
    FindCursor,
    WithId,
    Document,
    ModifyResult,
} from 'mongodb';
import { SectionQuota } from '../ust_tracker/SectionQuota';
import { deptName, semester, UserNotificationType } from '../configs/config';
import { CLL } from '../logging/consoleLogging';
import { createEmptyUser, User } from './user';
// database interface is re-written into Mongodb equivalent
const threadName = 'Database';
export class SectionQuotaDb {
    static instance: SectionQuotaDb | null = null;
    private dbClient: MongoClient;
    private db: Db;
    private collection: Collection<SectionQuota>;
    static getInstance() {
        if (this.instance === null) {
            throw new Error('DbInterface not initialized.');
        }
        return this.instance;
    }
    constructor(dbClient: MongoClient) {
        this.dbClient = dbClient;
        this.db = this.dbClient.db(
            'ust_tracker' + (process.env.NODE_ENV != 'production' ? '_dev' : '')
        );
        this.collection = this.db.collection('section_quota');
        SectionQuotaDb.instance = this;
    }
    async insertSectionQuota(sectionQuota: SectionQuota) {
        // const model = this.mongoResource.sectionQuotaModel;
        // return model.create(sectionQuota);
        CLL.log(
            threadName,
            'InsertSection',
            `inserting: ${sectionQuota.classId}`
        );
        return await this.collection.insertOne(sectionQuota);
    }

    async updateSectionQuota(classId: number, quota: number) {
        // const model = this.mongoResource.sectionQuotaModel;
        // return model.findOneAndUpdate({ classId }, { $set: { quota } }).exec();

        return await this.collection.findOneAndUpdate(
            { classId: classId, semester: semester },
            { $set: { quota: quota } },
            {
                returnDocument: 'after',
            }
        );
    }

    getCourse(semester: number, course: string): FindCursor<WithId<Document>> {
        return this.collection.find({
            semester: semester,
            courseCode: course,
        });
    }
    async getCourseCount(semester: number, course: string): Promise<number> {
        return await this.collection.countDocuments({
            semester: semester,
            courseCode: course,
        });
    }

    async getSectionQuota(semester: number, classId: number) {
        // const model = this.mongoResource.sectionQuotaModel;
        // return model.findOne({ classId, semester }).exec();
        return await this.collection.findOne({
            semester: semester,
            classId: classId,
        });
    }
}

export class UserSubscriptionDb {
    static instance: UserSubscriptionDb | null = null;
    private dbClient: MongoClient;
    private db: Db;
    private collection: Collection<User>;
    static getInstance() {
        if (this.instance === null) {
            throw new Error('DbInterface not initialized.');
        }
        return this.instance;
    }
    constructor(dbClient: MongoClient) {
        this.dbClient = dbClient;
        this.db = this.dbClient.db(
            'ust_tracker' + (process.env.NODE_ENV != 'production' ? '_dev' : '')
        );
        this.collection = this.db.collection('userSubscription');
        UserSubscriptionDb.instance = this;
    }

    async createUser(semester: number, userId: string) {
        return this.collection.insertOne(createEmptyUser(semester, userId));
    }
    async getUser(userId: string) {
        return this.collection.findOne({ userId: userId });
    }
    async getUser_Semester(userId: string, semester: number) {
        return this.collection.findOne({
            userId: userId,
            'subscription.semester': semester,
        });
    }
    getUser_Dept(semester: number, dept: deptName): FindCursor<WithId<User>> {
        return this.collection.find({
            'subscription.semester': semester,
            'subscription.dept': {
                $in: [dept],
            },
        });
    }
    getUser_Course(semester: number, course: string): FindCursor<WithId<User>> {
        return this.collection.find({
            'subscription.semester': semester,
            'subscription.course': {
                $in: [course],
            },
        });
    }
    getUser_Section(
        semester: number,
        section: number
    ): FindCursor<WithId<User>> {
        return this.collection.find({
            'subscription.semester': semester,
            'subscription.section': {
                $in: [section],
            },
        });
    }
    async generateSemester(userId: string, semester: number) {
        return this.collection.updateOne(
            { userId: userId },
            {
                $push: {
                    subscription: {
                        semester: semester,
                        dept: [],
                        course: [],
                        section: [],
                    },
                },
            }
        );
    }

    async appendSubscription(
        type: 'dept',
        semester: number,
        userId: string,
        deptName: string
    ): Promise<ModifyResult<User>>; // TODO: deprecated in 5.0
    async appendSubscription(
        type: 'course',
        semester: number,
        userId: string,
        courseCode: string
    ): Promise<ModifyResult<User>>; // TODO: deprecated in 5.0
    async appendSubscription(
        type: 'section',
        semester: number,
        userId: string,
        sectionId: number
    ): Promise<ModifyResult<User>>; // TODO: deprecated in 5.0
    async appendSubscription(
        type: UserNotificationType,
        semester: number,
        userId: string,
        str: string | number
    ): Promise<ModifyResult<User>> {
        // check .ok for success
        const pushObject: Record<string, string | number> = {};
        pushObject[`subscription.$.${type}`] = str;
        return await this.collection.findOneAndUpdate(
            {
                'subscription.semester': semester,
                userId: userId,
            },
            {
                $addToSet: pushObject,
            },
            {
                returnDocument: 'after',
            }
        );
    }
    async removeSubscription(
        type: 'dept',
        semester: number,
        userId: string,
        course: string
    ): Promise<ModifyResult<User>>; // TODO: deprecated in 5.0
    async removeSubscription(
        type: 'course',
        semester: number,
        userId: string,
        course: string
    ): Promise<ModifyResult<User>>; // TODO: deprecated in 5.0
    async removeSubscription(
        type: 'section',
        semester: number,
        userId: string,
        course: number
    ): Promise<ModifyResult<User>>; // TODO: deprecated in 5.0
    async removeSubscription(
        type: UserNotificationType,
        semester: number,
        userId: string,
        course: string | number
    ): Promise<ModifyResult<User>> {
        // check .ok for success
        const pullObject: Record<string, string | number> = {};
        pullObject[`subscription.$.${type}`] = course;
        return await this.collection.findOneAndUpdate(
            {
                'subscription.semester': semester,
                userId: userId,
            },
            {
                $pull: pullObject,
            },
            {
                returnDocument: 'after',
            }
        );
    }
}
