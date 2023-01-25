import { ModifyResult } from 'mongodb';
import { deptList, deptName, semester } from '../configs/config';
import { SectionQuotaDb, UserSubscriptionDb } from './dbInterface';

export interface User {
    userId: string;
    subscription: {
        semester: number;
        dept: deptName[];
        course: string[];
        section: number[];
    }[];
}

export class User {
    static async checkValidDept(dept: string): Promise<boolean> {
        return deptList.includes(dept);
    }
    static async checkValidCourse(course: string): Promise<boolean> {
        // course code have format `{dept} {code}`;
        return (
            (await SectionQuotaDb.getInstance().getCourseCount(
                semester,
                course
            )) > 0
        );
    }
    static async checkValidSection(sectionId: number): Promise<boolean> {
        return (
            (await SectionQuotaDb.getInstance().getSectionQuota(
                semester,
                sectionId
            )) != null
        );
    }

    //! validate argument before call
    static async addSubscription(
        userId: string,
        type: 'course',
        deptName: string
    ): Promise<ModifyResult<User>>;
    static async addSubscription(
        userId: string,
        type: 'dept',
        courseCode: string
    ): Promise<ModifyResult<User>>;
    static async addSubscription(
        userId: string,
        type: 'section',
        sectionId: number
    ): Promise<ModifyResult<User>>;
    static async addSubscription(
        userId: string,
        type: 'dept' | 'course' | 'section',
        str: string | number
    ) {
        if (type == 'dept') {
            return await this.#addSubscription_Dept(userId, str as string);
        } else if (type == 'course') {
            return await this.#addSubscription_Course(userId, str as string);
        } else {
            return await this.#addSubscription_Section(userId, str as number);
        }
    }
    static async #addSubscription_Dept(userId: string, deptName: string) {
        return await UserSubscriptionDb.getInstance().appendSubscription(
            'dept',
            semester,
            userId,
            deptName
        );
    }
    static async #addSubscription_Course(userId: string, courseCode: string) {
        return await UserSubscriptionDb.getInstance().appendSubscription(
            'course',
            semester,
            userId,
            courseCode
        );
    }
    static async #addSubscription_Section(userId: string, sectionId: number) {
        return await UserSubscriptionDb.getInstance().appendSubscription(
            'section',
            semester,
            userId,
            sectionId
        );
    }

    static async removeSubscription(
        userId: string,
        type: 'dept',
        deptName: string
    ): Promise<ModifyResult<User>>;
    static async removeSubscription(
        userId: string,
        type: 'course',
        courseCode: string
    ): Promise<ModifyResult<User>>;
    static async removeSubscription(
        userId: string,
        type: 'section',
        sectionId: number
    ): Promise<ModifyResult<User>>;
    static async removeSubscription(
        userId: string,
        type: 'dept' | 'course' | 'section',
        str: string | number
    ) {
        if (type == 'dept') {
            return await this.#removeSubscription_Dept(userId, str as string);
        } else if (type == 'course') {
            return await this.#removeSubscription_Course(userId, str as string);
        } else {
            return await this.#removeSubscription_Section(
                userId,
                str as number
            );
        }
    }
    static async #removeSubscription_Dept(userId: string, deptName: string) {
        return await UserSubscriptionDb.getInstance().removeSubscription(
            'dept',
            semester,
            userId,
            deptName
        );
    }
    static async #removeSubscription_Course(
        userId: string,
        courseCode: string
    ) {
        return await UserSubscriptionDb.getInstance().removeSubscription(
            'course',
            semester,
            userId,
            courseCode
        );
    }
    static async #removeSubscription_Section(
        userId: string,
        sectionId: number
    ) {
        return await UserSubscriptionDb.getInstance().removeSubscription(
            'section',
            semester,
            userId,
            sectionId
        );
    }
}
