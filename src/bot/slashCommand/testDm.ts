import { EmbedBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const testDmCommand = {
    data: new SlashCommandBuilder()
        .setName('testdm')
        .setDescription('Test if notification can be sent to dm'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const embed = new EmbedBuilder()
            .setTitle('Test Message')
            .setDescription('This is also a test message')
            .setColor(0x00ffff)
            .setTimestamp();
        if (!interaction.user.dmChannel) await interaction.user.createDM();
        await interaction.user.dmChannel!.send({
            content: 'This is the test message',
            embeds: [embed],
        });
        interaction.editReply(
            'Please check your dm. If you did not receive the dm, please contact: <@355900098875621376>'
        );
    },
};
