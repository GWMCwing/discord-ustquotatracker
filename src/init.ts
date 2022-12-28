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
        if(!($(element).hasClass('pg')) ){
            deptList.push($(element).text().toUpperCase());
        }
    });
    return deptList;
}
async function createAllChannel(bot: Bot) {
    const deptList = await getDeptList();
    const channelMap = new Map<string, string[]>();
    for (const dept of deptList) {
        console.log('Creating channel for ' + dept);
        const channels = await bot.createUstQuotaDevProdChannelPair(dept);
        channelMap.set(
            dept,
            channels.map((c) => c.id)
        );
    }
    console.log('All channels created.');
    return channelMap;
}
