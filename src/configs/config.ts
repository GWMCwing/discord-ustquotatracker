import { config } from 'dotenv';
config();
export const isProduction = process.env.NODE_ENV === 'production';
export const semester = 2240;
//
export type UserNotificationType = 'dept' | 'course' | 'section';
//
const channelIds = {
    cronLogs: [
        'REDACTED', // monitor.dev.cronlogs
        'REDACTED', // monitor.prod.cronlogs
    ],
} as const;
const categoryChIds = [
    '1098439177244262562', // production
    '1063716903757041715', // development
] as const;
// TODO generate by fetching from source

const ustChIds = {
    ACCT: ['1098440320095637524', '1098440322108903477'],
    CENG: ['1098440324105388132', '1098440326198349926'],
    CHEM: ['1098440328509390928', '1098440330908553226'],
    CIVL: ['1098440333458669618', '1098440335744569394'],
    COMP: ['1098440337741070428', '1098440339414597724'],
    CORE: ['1098440342065385525', '1098440344011538432'],
    ECON: ['1098440346028998666', '1098440347874500640'],
    ENEG: ['1098440350353330187', '1098440352781836329'],
    ENGG: ['1098440355172593774', '1098440357303296070'],
    ENTR: ['1098440359605964851', '1098440361640218644'],
    HUMA: ['1098440363955466350', '1098440366044221461'],
    ISDN: ['1098440368212684830', '1098440370225946726'],
    ISOM: ['1098440372830601287', '1098440375577870457'],
    LABU: ['1098440378220286002', '1098440380527165530'],
    LANG: ['1098440383005995070', '1098440385602261002'],
    LIFS: ['1098440387921727498', '1098440389888835634'],
    MARK: ['1098440392040521790', '1098440394120888381'],
    MATH: ['1098440396209672292', '1098440398201950208'],
    MECH: ['1098440400106172456', '1098440402090078318'],
    OCES: ['1098440404342411316', '1098440406208888884'],
    PHYS: ['1098440408553504778', '1098440410872946728'],
    SBMT: ['1098440412911382658', '1098440415121772604'],
    SOSC: ['1098440417231511685', '1098440419022475285'],
    UROP: ['1098440421492928633', '1098440423682347078'],
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
export type deptName = keyof TConfigs['discord']['ustChIds'];
export const deptList = Object.keys(configs['discord']['ustChIds']);
