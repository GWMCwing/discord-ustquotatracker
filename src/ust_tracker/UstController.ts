import { configs, TConfigs } from '../configs/config';
import { UstHelper } from './UstHelper';
import { DbInterface } from '../database/dbInterface';
import { Bot } from '../bot/bot';

export class UstController {
    constructor() {}

    /**
     * Backend cron logic
     */
    public static async update() {
        console.log('Start Updating Course Quota...');
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
        const subjects: Array<keyof TConfigs['discord']['ustChIds']> =
            Object.keys(configs.discord.ustChIds) as unknown as Array<
                keyof TConfigs['discord']['ustChIds']
            >;
        //
        for (const subject of subjects) {
            // get data
            try {
                const data = await UstHelper.getData(
                    UstHelper.getSubjectUrl(subject)
                );
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
                        // console.log('Checking: ' + sectionQuota.courseCode);
                        const document = await DbInterface.getInstance()
                            .getSectionQuota(
                                UstHelper.semester,
                                sectionQuota.classId
                            )
                            .catch((err) => {
                                console.log(err);
                                return null;
                            });
                        if (document === null) {
                            // the classId is new
                            console.log(
                                'New Section: ',
                                sectionQuota.courseCode
                            );
                            await DbInterface.getInstance().insertSectionQuota(
                                sectionQuota
                            );
                            // tmp comment
                            logEntries.push(
                                `🥖 New Section - ${courseCode} - ${title} [${sectionQuota.section}(${sectionQuota.classId})] (${sectionQuota.quota}).`
                            );
                        } else {
                            const newDoc = await DbInterface.getInstance()
                                .updateSectionQuota(
                                    sectionQuota.classId,
                                    sectionQuota.quota
                                )
                                .catch((err) => {
                                    console.log(err);
                                    return null;
                                });
                            if (newDoc === null) continue;
                            if (
                                JSON.stringify(newDoc.value) ===
                                JSON.stringify(document)
                            ) {
                                continue;
                            }
                            // the classId is old and has changed quota
                            console.log('Update', sectionQuota.courseCode);
                            logEntries.push(
                                `🍕 Quota Changed: ${courseCode} - ${title} [${sectionQuota.section}(${sectionQuota.classId})] (${document.quota} -> ${sectionQuota.quota}).`
                            );
                        }
                    }
                }

                // send report to discord
                if (logEntries.length !== 0) {
                    const bot = Bot.getInstance();
                    const ch = await bot.getUstTextChannel(subject);
                    // prevents BOOM when first time,
                    let text = '';
                    let count = 0;
                    for (const entry of logEntries) {
                        text += `${entry}\n`;
                        count++;
                        if (text.length >= 1500) {
                            // await ch.send(text);
                            await bot.sendMessage(ch, text, subject, count);
                            text = '';
                            count = 0;
                        }
                    }
                    if (text.length !== 0) {
                        // await ch.send(text);
                        await bot.sendMessage(ch, text, subject, count);
                    }
                }
            } catch (err) {
                // ignore
            }
            console.log('Course Quota Updated...');
        }
    }
}
