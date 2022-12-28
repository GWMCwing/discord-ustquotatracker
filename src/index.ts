// only for simple implementation, Injection and decorator are dropped
import { configs } from './configs/config';
import { Bot } from './bot/bot';
import { MongoClient } from 'mongodb';
import { DbInterface } from './database/dbInterface';
import { CronJob } from 'cron';
import { UstController } from './ust_tracker/UstController';

startup();

async function startup() {
    console.log(`Starting up... as ${process.env.NODE_ENV}`);
    console.log('Connecting to database...');
    const dbClient = new MongoClient(configs.mongo.uri);
    const dbInterface = new DbInterface(dbClient);
    console.log('Login to Discord...');
    const bot = new Bot();
    await bot.startup();
    console.log('Starting cron job...');
    await UstController.update();
    Bot.getInstance().updatePresence();
    startCornJob();
}

function startCornJob() {
    const timeZone = 'Asia/Hong_Kong';
    new CronJob({
        cronTime: '*/5 * * * *',
        onTick: async () => {
            console.log('Cron job ticked.');
            await UstController.update();
            Bot.getInstance().updatePresence();
            console.log('Cron job done.');
        },
        timeZone,
    }).start();
}
