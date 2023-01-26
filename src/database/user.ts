import { ModifyResult } from 'mongodb';
import {
    deptList,
    deptName,
    semester,
    UserNotificationType,
} from '../configs/config';
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

export function createEmptyUser(semester: number, userId: string) {
    const user: User = {
        userId: userId,
        subscription: [
            {
                semester: semester,
                dept: [] as deptName[],
                course: [] as string[],
                section: [] as number[],
            },
        ],
    };
    return user;
}

export class User {
    static async validateDept(dept: string): Promise<string | null> {
        return deptList.includes(dept) ? dept : null;
    }
    static async validateCourse(courseStr: string): Promise<string | null> {
        // course code have format `{dept} {code}`;
        let i = 0;
        for (; courseStr[i] < '0' || courseStr[i] > '9'; i++) {}
        if (i == courseStr.length) return null;
        const dept = courseStr.substring(0, i).trim().toUpperCase();
        const code = courseStr.substring(i).trim();
        const courseCode = `${dept} ${code}`;
        if (
            (await SectionQuotaDb.getInstance().getCourseCount(
                semester,
                courseCode
            )) > 0
        )
            return courseCode;
        return null;
    }
    static async validateSection(sectionId: number): Promise<number | null> {
        return (await SectionQuotaDb.getInstance().getSectionQuota(
            semester,
            sectionId
        )) != null
            ? sectionId
            : null;
    }

    static async initializeUserStates(semester: number, userId: string) {
        const user = await UserSubscriptionDb.getInstance()
            .getUser(userId)
            .catch((err) => {
                return null;
            });
        if (!user) {
            await UserSubscriptionDb.getInstance().createUser(semester, userId);
        } else {
            // user exists check for semester
            const userSemester = await UserSubscriptionDb.getInstance()
                .getUserSemester(userId, semester)
                .catch((err) => {
                    return null;
                });
            if (!userSemester)
                await UserSubscriptionDb.getInstance().generateSemester(
                    userId,
                    semester
                );
        }
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
        type: UserNotificationType,
        str: string | number
    ) {
        await this.initializeUserStates(semester, userId);

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
        type: UserNotificationType,
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
