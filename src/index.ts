// only for simple implementation, Injection and decorator are dropped
import { configs } from './configs/config';
import { Bot } from './bot/bot';
import { MongoClient } from 'mongodb';
import { DbInterface } from './database/dbInterface';
import { CronJob } from 'cron';
import { UstController } from './ust_tracker/UstController';
import { CLL } from './logging/consoleLogging';

const threadName = 'Main';

startup();

async function startup() {
    CLL.log(threadName, 'startup', `Starting up... as ${process.env.NODE_ENV}`);
    CLL.log(threadName, 'startup', 'Connecting to database...');
    const dbClient = new MongoClient(configs.mongo.uri);
    const dbInterface = new DbInterface(dbClient);
    CLL.log(threadName, 'startup', 'Login to Discord...');
    const bot = new Bot();
    await bot.startup();
    CLL.log(threadName, 'startup', 'Starting cron job...');
    await UstController.update();
    Bot.getInstance().updatePresence();
    startCornJob();
}

function startCornJob() {
    const timeZone = 'Asia/Hong_Kong';
    new CronJob({
        cronTime: '*/5 * * * *',
        onTick: async () => {
            CLL.log('Corn-Job', 'Start-Job', 'Cron job ticked.');
            await UstController.update();
            Bot.getInstance().updatePresence();
            CLL.log('Corn-Job', 'End-Job', 'Cron job done.');
        },
        timeZone,
    }).start();
}
