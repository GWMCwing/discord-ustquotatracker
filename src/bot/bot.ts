import {
  ActivityType,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  IntentsBitField,
  NewsChannel,
  TextChannel,
} from 'discord.js';
import { exit } from 'process';
import { createInterface } from 'readline';
import { configs, deptName, isProduction, semester, TConfigs } from '../configs/config';
import { CLL } from '../logging/consoleLogging';
import { getCommandCollection } from './slashCommand';
//
// TODO: add type predicate for supported channels
const dateTimeFormatter = new Intl.DateTimeFormat([], {
  timeZone: 'Asia/Hong_Kong',
  hour12: false,
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});
const threadName = 'Bot';
//
export class Bot {
  static instance = new Bot();
  private command = getCommandCollection();
  private client = new Client({
    intents: [
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.GuildMessageReactions,
      IntentsBitField.Flags.GuildEmojisAndStickers,
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildPresences,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.DirectMessages,
      IntentsBitField.Flags.DirectMessageTyping,
    ],
  });
  constructor() {
    if (Bot.instance) {
      return Bot.instance;
    }
  }
  static getInstance() {
    return Bot.instance;
  }
  // initialization
  updatePresence() {
    this.client.user!.setActivity({
      type: ActivityType.Watching,
      name: 'Last Updated: ' + dateTimeFormatter.format(new Date()),
    });
  }
  handleInteraction() {
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const command = this.command.get(interaction.commandName);
      if (!command) {
        CLL.error(threadName, 'Command', 'Command not found', interaction.commandName);
        return;
      }
      try {
        await command.execute(interaction);
      } catch (err) {
        CLL.error(threadName, 'Interaction', err as string);
        await interaction.followUp({
          content: 'There was an error while executing this command. Please try again ',
          ephemeral: true,
        });
      }
    });
  }
  //
  async startup_dev() {
    await this.client.login(configs.bot.token);
    this.client.once('ready', async () => {
      // this.client.user!.setActivity({
      //     type: ActivityType.Watching,
      //     name: 'Initializing...',
      // });
    });
    this.handleInteraction();
    CLL.log(threadName, 'startup', 'Bot is ready');
  }
  async startup() {
    await this.client.login(configs.bot.token);
    this.client.once('ready', async () => {
      this.client.user!.setActivity({
        type: ActivityType.Watching,
        name: 'Initializing...',
      });
    });
    this.handleInteraction();
    CLL.log(threadName, 'startup', 'Bot is ready');
  }
  async stop() {
    this.client.destroy();
  }
  //
  public async getChannel(channelId: string) {
    return this.client.channels.fetch(channelId);
  }
  public async getChannelList(
    channelIdPairList: readonly [readonly [string, string], readonly [string, string]],
    isProduction: boolean
  ) {
    const channels = await Promise.all(
      channelIdPairList.map((channelIdPair) => this.getChannel(channelIdPair[isProduction ? 0 : 1]))
    );
    return channels;
  }

  public async getCategoryChannel(categoryId: string) {
    const CategoryChannel = await this.getChannel(categoryId);
    if (CategoryChannel?.type !== ChannelType.GuildCategory) {
      throw new Error('Channel does not exists or is not of type GUILD_CATEGORY');
    }
    return CategoryChannel;
  }
  /**
   * For initial config use
   */
  public async createUstQuotaDevProdChannelPair(subjectKey: string): Promise<[prod: TextChannel, dev: TextChannel][]> {
    const categoryChIdsPair = configs.discord.categoryChIds;
    const channels: [TextChannel, TextChannel][] = [];
    // for (const categoryChIds of categoryChIdsPair) {
    // TODO: merge into one config for each guild
    for (let i = 0; i < categoryChIdsPair.length; i++) {
      const categoryChIds = categoryChIdsPair[i];
      const guild = await this.client.guilds.fetch(configs.discord.guildIds[i]);
      const channelPair = [];
      for (let j = 0; j < 2; j++) {
        const category = await this.getCategoryChannel(categoryChIds[j]);
        channelPair.push(
          await guild.channels.create<ChannelType.GuildText>({
            name: subjectKey,
            parent: category,
            type: ChannelType.GuildText,
          })
        );
      }
      channels.push(channelPair as any);
    }
    return channels;
  }

  public async massDeleteChannel() {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Are you sure you want to delete all channels? (y/n)', async (answer) => {
      if (answer !== 'y') {
        CLL.log(threadName, 'abortion', 'Aborted.');
        exit();
      }
    });

    const categoryChIdsPair = configs.discord.categoryChIds;
    for (const categoryChIds of categoryChIdsPair) {
      for (let i = 0; i < 2; i++) {
        const category = await this.getCategoryChannel(categoryChIds[i]);
        const channels = category.children.cache;
        channels.forEach((channel) => channel.delete());
      }
    }
  }

  /**
   * Maybe find a way to remove such duplication?
   */
  public async getUstTextChannel(
    subjectKey: keyof TConfigs['discord']['ustChIds']
  ): Promise<TextChannel[] | NewsChannel[]> {
    const channelListPair = configs.discord.ustChIds[subjectKey];
    const channelList = await this.getChannelList(channelListPair, isProduction);
    for (const channel of channelList) {
      if (!channel) {
        throw new Error('Channel ID corresponds to nothing.');
      }
      if (!(channel instanceof TextChannel) && !(channel instanceof NewsChannel)) {
        throw new Error(`Requested is not instance of text/news channel, actual: ${typeof channel}`);
      }
      if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
        throw new Error('Requested channel type of not GUILD_TEXT/Announcement.');
      }
    }
    return channelList as TextChannel[] | NewsChannel[];
  }
  buildEmbedMessage(dept: deptName, message: string) {
    return new EmbedBuilder()
      .setTitle('Department Page')
      .setURL(`https://w5.ab.ust.hk/wcq/cgi-bin/${semester}/subject/${dept}`)
      .setDescription(message)
      .setTimestamp();
  }
  public async sendMessage_channel(channel: TextChannel | NewsChannel, message: string, dept: deptName, count: number) {
    let embed = this.buildEmbedMessage(dept, message);
    channel
      .send({
        content: `${dept} ${count} Section Quota Updated`,
        embeds: [embed],
      })
      .catch((err) => {
        CLL.error(threadName, 'Send-Message', err);
      });
  }
  public async sendMessage_User(userId: string, dept: deptName, message: string, count: number) {
    console.log('Try to send to user: ', userId, 'with message: ', message);
    let embed = this.buildEmbedMessage(dept, message);
    const user = await this.client.users.fetch(userId).catch((err) => {
      console.log(err);
      return null;
    });
    if (!user) return false;
    if (!user.dmChannel) await user.createDM();
    user
      .dmChannel!.send({
        content: `${dept} ${count} Section Quota Updated`,
        embeds: [embed],
      })
      .catch((err) => {
        CLL.error(threadName, 'Send-Message', err);
      });
  }
}
// const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

// await lib.discord.channels['@0.3.2'].messages.create({
//   "channel_id": `${context.params.event.channel_id}`,
//   "content": `DEPT x Course Quota Updated`,
//   "tts": false,
//   "embeds": [
//     {
//       "type": "rich",
//       "title": `Deptartment Page`,
//       "description": `DEPT1\nDEPT2\nDEPT3`,
//       "color": 0x00FFFF,
//       "url": `Course link`
//     }
//   ]
// });
