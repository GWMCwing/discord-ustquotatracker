import { configs, deptName, TConfigs } from '../configs/config';
import { UstHelper } from './UstHelper';
import { SectionQuotaDb } from '../database/dbInterface';
import { Bot } from '../bot/bot';
import { SectionQuota } from './SectionQuota';
import { CLL } from '../logging/consoleLogging';

// TODO logging handler for all corn job and errors, to discord or console
// TODO separate into smaller functions

const threadName = 'UST-Controller';
export class UstController {
    constructor() {}

    static async sendLog(subject: deptName, logEntries: string[]) {
        const bot = Bot.getInstance();
        const ch = await bot.getUstTextChannel(subject);
        // prevents BOOM when first time,
        let text = '';
        let count = 0;
        for (const entry of logEntries) {
            text += `${entry}\n`;
            count++;
            if (text.length >= 1500) {
                await bot.sendMessage(ch, text, subject, count);
                text = '';
                count = 0;
            }
        }
        if (text.length !== 0) {
            await bot.sendMessage(ch, text, subject, count);
        }
        return true;
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
    static async updateSubject(subject: deptName) {
        const data = await UstHelper.getData(UstHelper.getSubjectUrl(subject));
        const logEntries: string[] = [];

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
                if (str) logEntries.push(str);
            }
        }

        // send report to discord
        if (logEntries.length !== 0) {
            await this.sendLog(subject, logEntries);
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
