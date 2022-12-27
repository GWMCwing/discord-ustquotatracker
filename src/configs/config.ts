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
    '1057212159177797662', // production
    '1057212141012271174', // development
] as const;
// TODO generate by fetching from source

const ustChIds = {
    CENG: ['1057215233090912367', '1057215235695591454'],
    CIVL: ['1057215238082134097', '1057215240711974942'],
    COMP: ['1057215243195011103', '1057215245661241344'],
    DBAP: ['1057215248467230780', '1057215251294199859'],
    ECON: ['1057215254192472095', '1057215256738410596'],
    EESM: ['1057215259808636978', '1057215262396518480'],
    ELEC: ['1057215264942469140', '1057215267555512430'],
    ENGG: ['1057215270483144704', '1057215274308354048'],
    ENTR: ['1057215276933972038', '1057215279924523068'],
    ENVR: ['1057215282785026078', '1057215285347754014'],
    EVSM: ['1057215287763685466', '1057215290389303296'],
    GFIN: ['1057215292872331365', '1057215295326015498'],
    ISDN: ['1057215298383642714', '1057215300845699122'],
    ISOM: ['1057215303576191068', '1057215306734514176'],
    LIFS: ['1057215308974272554', '1057215312182915092'],
    MAFS: ['1057215315324457050', '1057215317899755551'],
    MARK: ['1057215320521199657', '1057215323008421948'],
    MASS: ['1057215325843771432', '1057215328922370108'],
    MGCS: ['1057215331510276156', '1057215334207213729'],
    PHYS: ['1057215337378095135', '1057215340490268682'],
    SBMT: ['1057215343325622453', '1057215346056114196'],
    SOSC: ['1057215348862103612', '1057215351391273041'],
    TEMG: ['1057215354163707935', '1057215356898390098'],
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
