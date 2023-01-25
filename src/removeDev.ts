import { Bot } from './bot/bot';
import { createInterface } from 'readline';
import { CLL } from './logging/consoleLogging';
const threadName = 'RemoveDev';
async function init() {
    const bot = new Bot();
    await bot.startup();
    let rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Input channel Category Id: ', async function (id: string) {
        let cate = await bot.getCategoryChannel(id).catch((r) => {
            CLL.log(threadName, 'init', 'Id missmatch');
            return null;
        });
        if (cate) {
            cate.children.cache.each((channel) => {
                channel.delete();
            });
            CLL.log(threadName, 'init', 'Category deleted');
        } else {
            CLL.log(threadName, 'init', 'Category not found');
        }
    });
}
init();
