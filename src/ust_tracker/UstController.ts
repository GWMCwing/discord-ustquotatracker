import { configs, deptName, semester, TConfigs } from '../configs/config';
import { UstHelper } from './UstHelper';
import { SectionQuotaDb, UserSubscriptionDb } from '../database/dbInterface';
import { Bot } from '../bot/bot';
import { SectionQuota } from './SectionQuota';
import { CLL } from '../logging/consoleLogging';

// TODO logging handler for all corn job and errors, to discord or console
// TODO separate into smaller functions

const threadName = 'UST-Controller';

type logEntry = {
    courseCode: string;
    section: number;
    log: string;
};

//courseCode:{sectionId:log}
type NotificationMap = Map<string, Map<number, string>>;
//userId:{sectionId:log}
type UserNotificationMap = Map<string, Map<number, string>>;
export class UstController {
    constructor() {}
    static generateNotification(logEntries: logEntry[]): NotificationMap {
        const notificationMap: NotificationMap = new Map();
        for (let i = 0; i < logEntries.length; i++) {
            const entry = logEntries[i];
            if (!notificationMap.get(entry.courseCode)) {
                notificationMap.set(entry.courseCode, new Map());
            }
            notificationMap
                .get(entry.courseCode)
                ?.set(entry.section, entry.log);
        }
        return notificationMap;
    }
    static async generateUserNotification(
        userNotificationMap: UserNotificationMap,
        dept: deptName,
        courseCode: string,
        sectionCode: number,
        log: string
    ) {
        const userDb = UserSubscriptionDb.getInstance();
        const userDept_Cursor = userDb.getUser_Dept(semester, dept);
        const userCourse_Cursor = userDb.getUser_Course(semester, courseCode);
        const userSection_Cursor = userDb.getUser_Section(
            semester,
            sectionCode
        );
        await userDept_Cursor.forEach((user) => {
            let userM = userNotificationMap.get(user.userId);
            if (!userM) userNotificationMap.set(user.userId, new Map());
            userNotificationMap.get(user.userId)?.set(sectionCode, log);
        });
        await userCourse_Cursor.forEach((user) => {
            let userM = userNotificationMap.get(user.userId);
            if (!userM) userNotificationMap.set(user.userId, new Map());
            userNotificationMap.get(user.userId)?.set(sectionCode, log);
        });
        await userSection_Cursor.forEach((user) => {
            let userM = userNotificationMap.get(user.userId);
            if (!userM) userNotificationMap.set(user.userId, new Map());
            userNotificationMap.get(user.userId)?.set(sectionCode, log);
        });
        // console.log(JSON.stringify(userNotificationMap, null, 2));
        return userNotificationMap;
    }
    static async sendToChannel_UserNotification(
        bot: Bot,
        dept: deptName,
        notificationMap: NotificationMap,
        userNotificationMap: UserNotificationMap
    ) {
        const userNotificationPromise: Promise<any>[] = [];
        let text = '';
        let count = 0;
        const ch = await bot.getUstTextChannel(dept);
        // rate limit is handled by discord js, do NOT await for messages, as it might thread block
        for (let [courseCode, sectionEntry] of notificationMap) {
            for (let [sectionCode, log] of sectionEntry) {
                userNotificationPromise.push(
                    this.generateUserNotification(
                        userNotificationMap,
                        dept,
                        courseCode,
                        sectionCode,
                        log
                    )
                );
                text += `${log}\n`;
                count++;
                if (text.length >= 1500) {
                    bot.sendMessage_channel(ch, text, dept, count);
                    text = '';
                    count = 0;
                }
            }
        }
        if (text.length !== 0) {
            bot.sendMessage_channel(ch, text, dept, count);
        }
        await Promise.allSettled(userNotificationPromise);
    }
    static async sendToUser(
        bot: Bot,
        dept: deptName,
        userNotificationMap: UserNotificationMap
    ) {
        // console.log('send to user');
        // console.log(JSON.stringify(userNotificationMap, null, 2));
        let text = '';
        let count = 0;
        for (let [userId, sectionEntry] of userNotificationMap) {
            for (let [sectionCode, log] of sectionEntry) {
                text += `${log}\n`;
                count++;
                if (text.length >= 1500) {
                    bot.sendMessage_User(userId, dept, text, count).catch(
                        (err) => {
                            console.error(err);
                        }
                    );
                    text = '';
                    count = 0;
                }
            }
            if (text.length !== 0) {
                bot.sendMessage_User(userId, dept, text, count).catch((err) => {
                    console.error(err);
                });
                text = '';
                count = 0;
            }
        }
    }
    static async sendLog_dev(dept: deptName, logEntries: logEntry[]) {
        const bot = Bot.getInstance();
        const notificationMap = this.generateNotification(logEntries);
        let userNotificationMap: UserNotificationMap = new Map();
        await this.sendToChannel_UserNotification(
            bot,
            dept,
            notificationMap,
            userNotificationMap
        );
        // send message to user
        await this.sendToUser(bot, dept, userNotificationMap);
    }
    static async sendLog(dept: deptName, logEntries: logEntry[]) {
        const bot = Bot.getInstance();
        const notificationMap = this.generateNotification(logEntries);
        let userNotificationMap: UserNotificationMap = new Map();
        await this.sendToChannel_UserNotification(
            bot,
            dept,
            notificationMap,
            userNotificationMap
        );
        // send message to user
        await this.sendToUser(bot, dept, userNotificationMap);
    }

    static async updateSectionQuota(
        sectionQuota: SectionQuota,
        courseCode: string,
        title: string
    ): Promise<string | null> {
        // console.log('Checking: ' + sectionQuota.courseCode);
        const document = await SectionQuotaDb.getInstance()
            .getSectionQuota(UstHelper.semester, sectionQuota.classId)
            .catch((err) => {
                CLL.error(threadName, 'Section Update', err);
                return null;
            });
        //
        if (document === null) {
            // the classId is new
            CLL.log(
                threadName,
                'Section Update',
                `New Section: ${sectionQuota.courseCode}`
            );
            await SectionQuotaDb.getInstance().insertSectionQuota(sectionQuota);
            // tmp comment
            return `🥖 New Section - ${courseCode} - ${title} [${sectionQuota.section}(${sectionQuota.classId})] (${sectionQuota.quota}).`;
        }
        //
        // console.log('Updating');
        const newDoc = await SectionQuotaDb.getInstance()
            .updateSectionQuota(sectionQuota.classId, sectionQuota.quota)
            .catch((err) => {
                CLL.error(threadName, 'Section Update', err);
                return null;
            });
        if (newDoc === null) return null;
        if (JSON.stringify(newDoc.value) === JSON.stringify(document)) {
            return null;
        }
        // the classId is old and has changed quota
        CLL.log(threadName, 'Section Update', sectionQuota.courseCode);
        const changes = sectionQuota.quota - document.quota;
        return `🍕 Quota Changed: ${courseCode} - ${title} [${
            sectionQuota.section
        }(${sectionQuota.classId})] (${document.quota} -> ${
            sectionQuota.quota
        } (${changes > 0 ? '+' + changes : changes})).`;
    }
    static async updateSubject(dept: deptName) {
        const data = await UstHelper.getData(UstHelper.getSubjectUrl(dept));
        const logEntries: logEntry[] = [];

        // iterate each course
        for (const [courseCode, { title, sectionQuotas }] of [
            ...data.entries(),
        ]) {
            const isUG = +courseCode[5] <= 4;
            if (!isUG) {
                continue;
            }

            // iterate each sectionQuotas
            for (const sectionQuota of sectionQuotas) {
                const str = await this.updateSectionQuota(
                    sectionQuota,
                    courseCode,
                    title
                );
                if (str)
                    logEntries.push({
                        courseCode: courseCode,
                        section: sectionQuota.classId,
                        log: str,
                    });
            }
        }

        // send report to discord
        if (logEntries.length !== 0) {
            if (process.env.NODE_ENV != 'production') {
                await this.sendLog_dev(dept, logEntries);
            } else {
                await this.sendLog(dept, logEntries);
            }
        }
    }

    /**
     * Backend cron logic
     */
    public static async update() {
        CLL.log(threadName, 'Course Update', 'Start Updating Course Quota...');
        /** // commented due to repeated declaration of the string tuple
        const subjects: Array<keyof TConfigs['discord']['ustChIds']> = [
            'ACCT',
            'BIEN',
            'CHEM',
            'CIVL',
            'COMP',
            'ECON',
            'ELEC',
            'ENVR',
            'FINA',
            'HART',
            'HUMA',
            'IEDA',
            'ISOM',
            'LANG',
            'LIFS',
            'MARK',
            'MATH',
            'MECH',
            'MGMT',
            'OCES',
            'PHYS',
            'RMBI',
            'SOSC',
            'SUST',
        ];
        */
        const subjects: Array<deptName> = Object.keys(
            configs.discord.ustChIds
        ) as unknown as Array<deptName>;
        //
        for (const subject of subjects) {
            //? use Promise.allSettled ?
            await this.updateSubject(subject).catch((err) => {
                CLL.error(threadName, 'Update', err);
            });
            CLL.log(
                threadName,
                'Course Update',
                `${subject} Course Quota Updated...`
            );
        }
        CLL.log(threadName, 'Course Update', `Updated all courses`);
    }
}
