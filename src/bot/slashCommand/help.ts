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
                '1. Type **/sub**\n' +
                    '2. To receive notification related to all `COMP` course (a `department`)\n    -Select `/sub department`\n    -Enter `COMP`\n' +
                    '2. To receive notification related to `COMP 2211` (a `course`)\n    -Select `/sub course`\n    -Enter `COMP2211`\n' +
                    '2. To receive notification related to `ACCT 1610 L1` (a `section`)\n    -Select `/sub section`\n    -Enter the section code `1031`\n' +
                    '3. Send the message/command\n' +
                    '4. Check your subscription list with </list:1068084588091555981>\n\n' +
                    '--Note--\n- For more info please visit <#1068074144350077029>\n- Autocomplete can help to type faster.\n- The input is NOT case sensitive.\n' +
                    '- Remember do not block this bot or you will not receive any message.\n' +
                    '- DM <@355900098875621376> if you need any help\n- Test your dm with </testdm:1068098645506936893>\n\n' +
                    'Command List:\n' +
                    '</help:1068084588091555980> </list:1068084588091555981> </sub:1068019623204753470> </unsub:1068039180963295263> </testdm:1068098645506936893>'
            )
            .setColor(0x00ffff)
            .setTimestamp();
        if (!interaction.user.dmChannel) await interaction.user.createDM();
        await interaction.user.dmChannel!.send({
            content: 'Usage of Quota Tracker',
            embeds: [embed],
        });
        interaction.editReply(
            'Please check your dm~. If you do not receive the follow up message in dm, please contact <@355900098875621376>'
        );
    },
};
