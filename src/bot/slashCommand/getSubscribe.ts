import { EmbedBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { semester } from '../../configs/config';
import { UserSubscriptionDb } from '../../database/dbInterface';

export const getSubscribe = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Information for how to use'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const user = await UserSubscriptionDb.getInstance().getUser(
            interaction.user.id
        );
        if (!user) {
            interaction.editReply(
                'There is no record of subscription for this semester'
            );
            return;
        }
        const semesterEntry = user.subscription.find((v) => {
            return v.semester == semester;
        });
        let deptStr = semesterEntry?.dept?.length
            ? semesterEntry.dept.join(', ')
            : '';
        let courseStr = semesterEntry?.course?.length
            ? semesterEntry.course.join(', ')
            : '';
        let sectionStr = semesterEntry?.section?.length
            ? semesterEntry.section.join(', ')
            : '';
        if (
            deptStr.length === 0 &&
            courseStr.length === 0 &&
            sectionStr.length === 0
        ) {
            interaction.editReply(
                'There is no record of subscription for this semester'
            );
            return;
        }
        const description = `Department: ${deptStr}\nCourse: ${courseStr}\nSection: ${sectionStr}`;
        if (description.length >= 1500) {
            //
            let embed = new EmbedBuilder()
                .setTitle('List of Subscribed: Dept')
                .setDescription(`Department: ${deptStr}`)
                .setColor(0x00ffff)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            embed = new EmbedBuilder()
                .setTitle('List of Subscribed: Course')
                .setDescription(`Department: ${courseStr}`)
                .setColor(0x00ffff)
                .setTimestamp();
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            embed = new EmbedBuilder()
                .setTitle('List of Subscribed: Section')
                .setDescription(`Department: ${sectionStr}`)
                .setColor(0x00ffff)
                .setTimestamp();
            await interaction.followUp({ embeds: [embed], ephemeral: true });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('List of Subscribed:')
                .setDescription(
                    `Department: ${deptStr}\nCourse: ${courseStr}\nSection: ${sectionStr}`
                )
                .setColor(0x00ffff)
                .setTimestamp();
            interaction.editReply({ embeds: [embed] });
        }
    },
};
