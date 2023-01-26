import {
    ChatInputCommandInteraction,
    Collection,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { getSubscribe } from './slashCommand/getSubscribe';
import { helpCommand } from './slashCommand/help';
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
    command.set(helpCommand.data.name, helpCommand);
    command.set(getSubscribe.data.name, getSubscribe);
    return command;
}
