// only for simple implementation, Injection and decorator are dropped
import { configs } from './configs/config';
import { Bot } from './bot/bot';
import { MongoClient } from 'mongodb';
import { DbInterface } from './database/dbInterface';
import { CronJob } from 'cron';
import { UstController } from './ust_tracker/UstController';

startup();

async function startup() {
    const dbClient = new DbInterface(new MongoClient(configs.mongo.uri));
    const bot = new Bot();
    await bot.startup();
    startCornJob();
}

function startCornJob() {
    const timeZone = 'Asia/Hong_Kong';
    new CronJob({
        cronTime: '*/5 * * * *',
        onTick: async () => {
            await UstController.update();
        },
        timeZone,
    }).start();
}
