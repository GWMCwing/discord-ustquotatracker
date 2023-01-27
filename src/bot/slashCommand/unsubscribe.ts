import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { User } from '../../database/user';
import { CLL } from '../../logging/consoleLogging';

export const unRegisterSubscription = {
    data: new SlashCommandBuilder()
        .setName('unsub')
        .setDescription('unSubscribe to a notification')
        .addSubcommand((option) =>
            option
                .setName('department')
                .setDescription('unSubscribe to department notification')
                .addStringOption((option) =>
                    option
                        .setName('department')
                        .setDescription(
                            'Input the name of the department. e.g. COMP'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((option) =>
            option
                .setName('course')
                .setDescription('unSubscribe to course notification')
                .addStringOption((option) =>
                    option
                        .setName('course')
                        .setDescription(
                            'Input the course code of the course. e.g. COMP 2211'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((option) =>
            option
                .setName('section')
                .setDescription('unSubscribe to section notification')
                .addIntegerOption((option) =>
                    option
                        .setName('section')
                        .setDescription(
                            'Input the section code of the section. e.g. For ACCT 1610 L1, enter 1031'
                        )
                        .setRequired(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const category = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        if (category === 'department') {
            //
            const deptString = interaction.options
                .getString('department', true)
                .trim()
                .toUpperCase();
            const parsedDeptString = await User.validateDept(deptString);
            if (parsedDeptString) {
                const result = await User.removeSubscription(
                    userId,
                    'dept',
                    parsedDeptString
                ).catch((err) => {
                    CLL.error('SlashCommand', 'DB Error', err);
                    return null;
                });
                if (result)
                    interaction.editReply(
                        `Department ${parsedDeptString} has been unsubscribed.`
                    );
                else {
                    interaction.editReply(
                        `Failed to unsubscribe to section. Please try again`
                    );
                }
            } else {
                interaction.editReply(
                    'Unknown Department, please send this command again with a valid input.'
                );
            }
        } else if (category === 'course') {
            const courseString = interaction.options
                .getString('course', true)
                .trim();
            const parsedCourseString = await User.validateCourse(courseString);
            if (parsedCourseString) {
                const result = await User.removeSubscription(
                    userId,
                    'course',
                    parsedCourseString
                ).catch((err) => {
                    CLL.error('SlashCommand', 'DB Error', err);
                    return null;
                });
                if (result)
                    interaction.editReply(
                        `Course ${parsedCourseString} has been unsubscribed.`
                    );
                else {
                    interaction.editReply(
                        `Failed to unsubscribe to course. Please try again`
                    );
                }
            } else {
                interaction.editReply(
                    'Unknown Course, please send this command again with a valid input.'
                );
            }
        } else if (category === 'section') {
            const sectionNumber = interaction.options.getInteger(
                'section',
                true
            );
            const parsedSectionNumber = await User.validateSection(
                sectionNumber
            );
            if (parsedSectionNumber) {
                const result = await User.removeSubscription(
                    userId,
                    'section',
                    parsedSectionNumber
                ).catch((err) => {
                    CLL.error('SlashCommand', 'DB Error', err);
                    return null;
                });
                if (result)
                    interaction.editReply(
                        `Section ${parsedSectionNumber} has been unsubscribed.`
                    );
                else {
                    interaction.editReply(
                        `Failed to unsubscribe to section. Please try again`
                    );
                }
            } else {
                interaction.editReply(
                    'Unknown Section, please send this command again with a valid input.'
                );
            }
        } else {
            await interaction.editReply(
                'Unknown category, please send this command again with a valid input.'
            );
        }
    },
};
