import {
    ActivityType,
    ChannelType,
    Client,
    IntentsBitField,
    TextChannel,
} from 'discord.js';
import { exit } from 'process';
import { createInterface } from 'readline';
import { configs, isProduction, TConfigs } from '../configs/config';
//
const dateTimeFormatter = new Intl.DateTimeFormat([], {
    timeZone: 'Asia/Hong_Kong',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});
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
    }
    //
    public async getChannel(channelId: string) {
        return this.client.channels.fetch(channelId, {
            force: true,
        });
    }

    public async getChannelCategory(channelId: string) {
        const channel = await this.getChannel(channelId);
        if (channel?.type !== ChannelType.GuildCategory) {
            throw new Error(
                'Channel does not exists or is not of type GUILD_CATEGORY'
            );
        }
        return channel;
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
            const category = await this.getChannelCategory(categoryChIds[i]);
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
                    console.log('Aborted.');
                    exit();
                }
            }
        );

        const categoryChIds = configs.discord.categoryChIds;
        for (let i = 0; i < 2; i++) {
            const category = await this.getChannelCategory(categoryChIds[i]);
            const channels = category.children.cache;
            channels.forEach((channel) => channel.delete());
        }
    }

    /**
     * Maybe find a way to remove such duplication?
     */
    public async getUstTextChannel(
        subjectKey: keyof TConfigs['discord']['ustChIds']
    ): Promise<TextChannel> {
        const channelId =
            configs.discord.ustChIds[subjectKey][isProduction ? 0 : 1];
        const channel = await this.getChannel(channelId);
        if (!channel) {
            throw new Error('Channel ID corresponds to nothing.');
        }
        if (!(channel instanceof TextChannel)) {
            throw new Error(
                `Requested is not instance of text channel, actual: ${typeof channel}`
            );
        }
        if (channel.type !== ChannelType.GuildText) {
            throw new Error('Requested channel type of not GUILD_TEXT.');
        }
        return channel;
    }
}
