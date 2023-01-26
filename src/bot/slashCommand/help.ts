import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';

export const helpCommand = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Information for how to use'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const embed = new EmbedBuilder()
            .setTitle(
                'Enter /sub or /unsub to receive or do not receive notification of a category:'
            )
            .setDescription(
                `- If you want to receive notification of all COMP courses\n-- Enter: /sub department COMP\n\n- If you want to receive notification of all MATH 1013 sections.\n-- Enter: /sub course MATH 1013\n\n- If you want to receive notification of section with section id 2009. (which is COMP2211 L1)\n-- Enter: /sub section 2009\n\n--Note--\n- Autocomplete can help to type faster.\n- The input is NOT case sensitive.\n- Remember do not block this bot or you will not receive any message.\n- DM <@355900098875621376> if you need any help`
            )
            .setColor(0x00ffff)
            .setTimestamp();
        if (!interaction.user.dmChannel) await interaction.user.createDM();
        await interaction.user.dmChannel!.send({
            content: 'Usage of Quota Tracker',
            embeds: [embed],
        });
        interaction.editReply('Please check your dm~');
    },
};
