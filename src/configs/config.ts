import { config } from 'dotenv';
config();
export const isProduction = process.env.NODE_ENV === 'production';
export const semester = 2220;
//
const channelIds = {
    cronLogs: [
        'REDACTED', // monitor.dev.cronlogs
        'REDACTED', // monitor.prod.cronlogs
    ],
} as const;
const categoryChIds = [
    '1057222816883294271', // production
    '1057222846230835200', // development
] as const;
// TODO generate by fetching from source

const ustChIds = {
    CENG: ['1057225052791251004', '1057225055253311518'],
    CIVL: ['1057225057824419880', '1057225060416487494'],
    COMP: ['1057225063000178698', '1057225065575481395'],
    DBAP: ['1057225068121436200', '1057225071116177458'],
    ECON: ['1057225073838260276', '1057225076891734056'],
    EESM: ['1057225079936782396', '1057225082856026172'],
    ELEC: ['1057225085284524054', '1057225088266670141'],
    ENGG: ['1057225090770669690', '1057225093249507328'],
    ENTR: ['1057225096651087942', '1057225099528392765'],
    ENVR: ['1057225102116278332', '1057225105039699988'],
    EVSM: ['1057225107749228544', '1057225110303559690'],
    GFIN: ['1057225113210208257', '1057225116037169192'],
    ISDN: ['1057225118620844112', '1057225121791750194'],
    ISOM: ['1057225125088460810', '1057225127575687178'],
    LIFS: ['1057225130083876874', '1057225132608864287'],
    MAFS: ['1057225135234494554', '1057225138317316168'],
    MARK: ['1057225140921962516', '1057225143614717972'],
    MASS: ['1057225146236145725', '1057225149675483186'],
    MGCS: ['1057225152800227348', '1057225155308437534'],
    PHYS: ['1057225157334290483', '1057225160744255498'],
    SBMT: ['1057225163378282516', '1057225166054227998'],
    SOSC: ['1057225168688255026', '1057225173482340362'],
    TEMG: ['1057225176091205642', '1057225178863632394'],
} as const;

// tracking will be in the same guild, but in different channels
const guildIds = {
    quotaTracker: '1057212105004175361',
} as const;

export type TChannelKey = keyof typeof channelIds;

export type TGuildKey = keyof typeof guildIds;

export const configs = {
    discord: {
        channelIds,
        guildIds,
        categoryChIds,
        ustChIds,
    },
    mongo: {
        uri: process.env.MONGO_URI!,
    },
    bot: {
        token: process.env.DISCORD_BOT_TOKEN!,
    },
};

export type TConfigs = typeof configs;
