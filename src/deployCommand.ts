import {
    REST,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    Routes,
} from 'discord.js';
import { getCommandCollection } from './bot/slashCommand';
import { config } from 'dotenv';
import { CLL } from './logging/consoleLogging';
config();

const threadName = 'DeployCommand';

const commandCollection = getCommandCollection();
const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
commandCollection.forEach((commandObj) => {
    commands.push(commandObj.data.toJSON());
});
const rest = new REST({ version: '10' }).setToken(
    process.env.DISCORD_BOT_TOKEN as string
);

(async () => {
    try {
        CLL.log(
            threadName,
            'Start',
            `Started refreshing ${commands.length} application (/) commands.`
        );
        const data = (await rest.put(
            Routes.applicationCommands(process.env.DISCORD_BOT_ID as string),
            { body: commands }
        )) as string[];
        CLL.log(
            threadName,
            'Success',
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (err) {
        CLL.error(threadName, 'Error', err as string);
    }
})();
