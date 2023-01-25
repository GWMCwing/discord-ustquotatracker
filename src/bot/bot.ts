import {
    ActivityType,
    ChannelType,
    Client,
    EmbedBuilder,
    IntentsBitField,
    NewsChannel,
    TextChannel,
} from 'discord.js';
import { exit } from 'process';
import { createInterface } from 'readline';
import { configs, isProduction, semester, TConfigs } from '../configs/config';
import { CLL } from '../logging/consoleLogging';
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
    private client = new Client({
        intents: [
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMessageReactions,
            IntentsBitField.Flags.GuildEmojisAndStickers,
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildPresences,
            IntentsBitField.Flags.MessageContent,
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
    //
    async startup() {
        await this.client.login(configs.bot.token);
        this.client.once('ready', async () => {
            this.client.user!.setActivity({
                type: ActivityType.Watching,
                name: 'Initializing...',
            });
        });
        CLL.log(threadName, 'startup', 'Bot is ready');
    }
    async stop() {
        this.client.destroy();
    }
    //
    public async getChannel(channelId: string) {
        return this.client.channels.fetch(channelId);
    }

    public async getCategoryChannel(categoryId: string) {
        const CategoryChannel = await this.getChannel(categoryId);
        if (CategoryChannel?.type !== ChannelType.GuildCategory) {
            throw new Error(
                'Channel does not exists or is not of type GUILD_CATEGORY'
            );
        }
        return CategoryChannel;
    }
    /**
     * For initial config use
     */
    public async createUstQuotaDevProdChannelPair(
        subjectKey: string
    ): Promise<[prod: TextChannel, dev: TextChannel]> {
        const guild = await this.client.guilds.fetch(
            configs.discord.guildIds.quotaTracker
        );
        const categoryChIds = configs.discord.categoryChIds;
        const channels: [TextChannel, TextChannel] = [null, null] as any;
        for (let i = 0; i < 2; i++) {
            const category = await this.getCategoryChannel(categoryChIds[i]);
            channels[i] = await guild.channels.create<ChannelType.GuildText>({
                name: subjectKey,
                parent: category,
                type: ChannelType.GuildText,
            });
        }
        return channels;
    }

    public async massDeleteChannel() {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(
            'Are you sure you want to delete all channels? (y/n)',
            async (answer) => {
                if (answer !== 'y') {
                    CLL.log(threadName, 'abortion', 'Aborted.');
                    exit();
                }
            }
        );

        const categoryChIds = configs.discord.categoryChIds;
        for (let i = 0; i < 2; i++) {
            const category = await this.getCategoryChannel(categoryChIds[i]);
            const channels = category.children.cache;
            channels.forEach((channel) => channel.delete());
        }
    }

    /**
     * Maybe find a way to remove such duplication?
     */
    public async getUstTextChannel(
        subjectKey: keyof TConfigs['discord']['ustChIds']
    ): Promise<TextChannel | NewsChannel> {
        const channelId =
            configs.discord.ustChIds[subjectKey][isProduction ? 0 : 1];
        const channel = await this.getChannel(channelId);
        if (!channel) {
            throw new Error('Channel ID corresponds to nothing.');
        }
        if (
            !(channel instanceof TextChannel) &&
            !(channel instanceof NewsChannel)
        ) {
            throw new Error(
                `Requested is not instance of text/news channel, actual: ${typeof channel}`
            );
        }
        if (
            channel.type !== ChannelType.GuildText &&
            channel.type !== ChannelType.GuildAnnouncement
        ) {
            throw new Error(
                'Requested channel type of not GUILD_TEXT/Announcement.'
            );
        }
        return channel;
    }
    public async sendMessage(
        channel: TextChannel | NewsChannel,
        message: string,
        dept: string,
        count: number
    ) {
        let embed = new EmbedBuilder()
            .setTitle('Department Page')
            .setURL(
                `https://w5.ab.ust.hk/wcq/cgi-bin/${semester}/subject/${dept}`
            )
            .setDescription(message)
            .setTimestamp();
        channel
            .send({
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
