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
  [
    '1098439177244262562', // production
    '1063716903757041715', // development
  ],
  [
    '1114165264314023996', // production 2
    '1114165323386589265', // development 2
  ],
] as const;
// TODO generate by fetching from source

const ustChIds = {
  ACCT: [
    ['1098440320095637524', '1098440322108903477'],
    ['1114182755023069204', '1114182757304774777'],
  ],
  BIEN: [
    ['1114184714870329395', '1114184858168729601'],
    ['1114182763919200316', '1114182766398017607'],
  ],
  CENG: [
    ['1098440324105388132', '1098440326198349926'],
    ['1114182768541319218', '1114182770256785480'],
  ],
  CHEM: [
    ['1098440328509390928', '1098440330908553226'],
    ['1114182772576227480', '1114182774551748739'],
  ],
  CIVL: [
    ['1098440333458669618', '1098440335744569394'],
    ['1114182776426606632', '1114182778620231750'],
  ],
  COMP: [
    ['1098440337741070428', '1098440339414597724'],
    ['1114182781233287258', '1114182783993126982'],
  ],
  CORE: [
    ['1098440342065385525', '1098440344011538432'],
    ['1114182787138863104', '1114182789659627590'],
  ],
  ECON: [
    ['1098440346028998666', '1098440347874500640'],
    ['1114182791844872213', '1114182795821068419'],
  ],
  EMIA: [
    ['1114185077627301978', '1114185142873882765'],
    ['1114182798178258964', '1114182800392859648'],
  ],
  ENEG: [
    ['1098440350353330187', '1098440352781836329'],
    ['1114182802519363686', '1114182805103071344'],
  ],
  ENGG: [
    ['1098440355172593774', '1098440357303296070'],
    ['1114182807376379935', '1114182809565798430'],
  ],
  ENTR: [
    ['1098440359605964851', '1098440361640218644'],
    ['1114182812048830536', '1114182814343106580'],
  ],
  HUMA: [
    ['1098440363955466350', '1098440366044221461'],
    ['1114182816700305418', '1114182819116232715'],
  ],
  IEDA: [
    ['1114185250545881099', '1114185320884355162'],
    ['1114182821976744086', '1114182825483190302'],
  ],
  ISDN: [
    ['1098440368212684830', '1098440370225946726'],
    ['1114182827441913948', '1114182829950107770'],
  ],
  ISOM: [
    ['1098440372830601287', '1098440375577870457'],
    ['1114182832114380882', '1114182834387693600'],
  ],
  LABU: [
    ['1098440378220286002', '1098440380527165530'],
    ['1114182837218840729', '1114182839899004960'],
  ],
  LANG: [
    ['1098440383005995070', '1098440385602261002'],
    ['1114182842004549642', '1114182844466601984'],
  ],
  LIFS: [
    ['1098440387921727498', '1098440389888835634'],
    ['1114182846987374723', '1114182849357172868'],
  ],
  MARK: [
    ['1098440392040521790', '1098440394120888381'],
    ['1114182851655647397', '1114182853987672194'],
  ],
  MATH: [
    ['1098440396209672292', '1098440398201950208'],
    ['1114182855996735588', '1114182858563661824'],
  ],
  MECH: [
    ['1098440400106172456', '1098440402090078318'],
    ['1114182860790833253', '1114182862724399116'],
  ],
  OCES: [
    ['1098440404342411316', '1098440406208888884'],
    ['1114182865303916594', '1114182867598188594'],
  ],
  PHYS: [
    ['1098440408553504778', '1098440410872946728'],
    ['1114182870475489401', '1114182872480362516'],
  ],
  SBMT: [
    ['1098440412911382658', '1098440415121772604'],
    ['1114182874388762734', '1114182876565614612'],
  ],
  SOSC: [
    ['1098440417231511685', '1098440419022475285'],
    ['1114182878113312779', '1114182880285954142'],
  ],
  TEMG: [
    ['1114185455781552148', '1114185530318536744'],
    ['1114182882756411453', '1114182884870324366'],
  ],
  UROP: [
    ['1098440421492928633', '1098440423682347078'],
    ['1114182886871023716', '1114182888896876594'],
  ],
} as const;

// tracking will be in the same guild, but in different channels
// const guildIds = {
//   quotaTracker: '1057212105004175361',
//   ustQuotaTracker: '940857138115387423',
// } as const;
const guildIds = ['1057212105004175361', '940857138115387423'] as const;

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
