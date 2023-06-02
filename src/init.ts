import axios from 'axios';
import { load } from 'cheerio';
import { TextChannel } from 'discord.js';
import { Bot } from './bot/bot';
import { writeFileSync } from 'fs';
import { CLL } from './logging/consoleLogging';
init();

const threadName = 'Init';

async function init() {
  const bot = new Bot();
  bot.startup();
  const channelMap = await createAllChannel(bot);
  const deptObj = Object.fromEntries(channelMap);
  CLL.log(threadName, 'json', JSON.stringify(deptObj, null, 2));
  writeFileSync('../deptList.json', JSON.stringify(deptObj, null, 2));
}

async function getDeptList() {
  const url = 'https://w5.ab.ust.hk/wcq/cgi-bin/';
  const { data } = await axios.get(url);
  const $ = load(data);
  const deptList: string[] = [];
  $('#navigator > div.depts > a').each((i, element) => {
    if (!$(element).hasClass('pg')) {
      deptList.push($(element).text().toUpperCase());
    }
  });
  return deptList;
}
async function createAllChannel(bot: Bot) {
  const deptList = await getDeptList();
  const channelMap = new Map<string, [string, string][]>();
  for (const dept of deptList) {
    CLL.log(threadName, 'Create-Channel', `Creating channel for ${dept}`);
    const channelsPair = await bot.createUstQuotaDevProdChannelPair(dept);
    channelMap.set(
      dept,
      //   channelsPair.map((c) => c.id)
      channelsPair.map((c) => [c[0].id, c[1].id])
    );
  }
  CLL.log(threadName, 'Create-Channel', 'All channels created.');
  return channelMap;
}
