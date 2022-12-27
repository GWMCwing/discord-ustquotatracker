import axios from 'axios';
import { load } from 'cheerio';
import { TextChannel } from 'discord.js';
import { Bot } from './bot/bot';

init();

async function init() {
    const bot = new Bot();
    bot.startup();
    const channelMap = await createAllChannel(bot);
    console.log(Object.fromEntries(channelMap));
}

async function getDeptList() {
    const url = 'https://w5.ab.ust.hk/wcq/cgi-bin/';
    const { data } = await axios.get(url);
    const $ = load(data);
    const deptList: string[] = [];
    $('#navigator > div.depts > a').each((i, element) => {
        deptList.push($(element).text().toUpperCase());
    });
    return deptList;
}
async function createAllChannel(bot: Bot) {
    const deptList = await getDeptList();
    // const deptList = ['COMP'];
    const channelMap = new Map<string, string[]>();
    for (const dept of deptList) {
        const channels = await bot.createUstQuotaDevProdChannelPair(dept);
        channelMap.set(
            dept,
            channels.map((c) => c.id)
        );
    }
    return channelMap;
}
