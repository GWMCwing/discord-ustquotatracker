import { config } from 'dotenv';
config();
export const isProduction = process.env.NODE_ENV === 'production';
export const semester = 2230;
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
    '1063713485013405716', // production
    '1063716903757041715', // development
] as const;
// TODO generate by fetching from source

const ustChIds = {
    ACCT: ['1063720418080469054', '1063720422119583795'],
    BIBU: ['1063720425982533694', '1063720431145713674'],
    BIEN: ['1063720435801395250', '1063720440259944458'],
    CENG: ['1063720444722692176', '1063720449705513000'],
    CHEM: ['1063720454218596453', '1063720459012685874'],
    CIVL: ['1063720463374757908', '1063720467506139207'],
    COMP: ['1063720471624962108', '1063720475534045255'],
    CORE: ['1063720479665426433', '1063720484283351124'],
    CPEG: ['1063720488955822160', '1063720492952997960'],
    DASC: ['1063720496924999720', '1063720500959907860'],
    DSCT: ['1063720505019990026', '1063720508790689905'],
    ECON: ['1063720513790279690', '1063720517695180840'],
    ELEC: ['1063720521688158288', '1063720525723086958'],
    EMIA: ['1063720530181636166', '1063720534891831307'],
    ENEG: ['1063720539140665374', '1063720543729238057'],
    ENGG: ['1063720548628176956', '1063720557436215367'],
    ENTR: ['1063720561785720852', '1063720565896118323'],
    ENVR: ['1063720570111410237', '1063720573982752819'],
    FINA: ['1063720578307076126', '1063720582316822558'],
    GBUS: ['1063720586171392030', '1063720590172766278'],
    GNED: ['1063720594392236102', '1063720598724956180'],
    HLTH: ['1063720602923454544', '1063720607046451281'],
    HUMA: ['1063720611081371648', '1063720615716081684'],
    IDPO: ['1063720619826499584', '1063720623890772088'],
    IEDA: ['1063720628013764668', '1063720632082251808'],
    IIMP: ['1063720636255572089', '1063720640269537280'],
    ISDN: ['1063720644765822986', '1063720649815760957'],
    ISOM: ['1063720654198808656', '1063720658502160404'],
    LABU: ['1063720662495133727', '1063720667431837716'],
    LANG: ['1063720671772942376', '1063720675950469120'],
    LIFS: ['1063720679855370320', '1063720684146130985'],
    MARK: ['1063720688998944809', '1063720693667221614'],
    MATH: ['1063720697815384104', '1063720701724479578'],
    MECH: ['1063720705641959456', '1063720710192775238'],
    MGMT: ['1063720714311573534', '1063720718266798080'],
    OCES: ['1063720722461118515', '1063720726613471242'],
    PHYS: ['1063720730619027476', '1063720735127912489'],
    PPOL: ['1063720740148494396', '1063720744808357959'],
    RMBI: ['1063720749539524648', '1063720754459451472'],
    SBMT: ['1063720758427254824', '1063720762365722706'],
    SCIE: ['1063720766392258572', '1063720770829819964'],
    SHSS: ['1063720774512431187', '1063720779008708648'],
    SOSC: ['1063720782934585415', '1063720787342786581'],
    SUST: ['1063720791759401053', '1063720795806892062'],
    TEMG: ['1063720799715991552', '1063720803616702554'],
    UROP: ['1063720807680987156', '1063720811623616634'],
    WBBA: ['1063720815926968330', '1063720820553298002'],
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
