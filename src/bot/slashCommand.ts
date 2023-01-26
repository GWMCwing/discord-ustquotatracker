import {
    ChatInputCommandInteraction,
    Client,
    Collection,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { registerSubscription } from './slashCommand/subscribe';
import { unRegisterSubscription } from './slashCommand/unsubscribe';

type slashCommandType = {
    data: SlashCommandSubcommandsOnlyBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<any>;
};

export function getCommandCollection(): Collection<string, slashCommandType> {
    const command = new Collection<string, slashCommandType>();
    command.set(registerSubscription.data.name, registerSubscription);
    command.set(unRegisterSubscription.data.name, unRegisterSubscription);
    return command;
}
