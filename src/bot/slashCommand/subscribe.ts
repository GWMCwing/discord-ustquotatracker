import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { User } from '../../database/user';
import { CLL } from '../../logging/consoleLogging';

export const registerSubscription = {
    data: new SlashCommandBuilder()
        .setName('sub')
        .setDescription('Subscribe to a notification')
        .addSubcommand((option) =>
            option
                .setName('department')
                .setDescription('Subscribe to department notification')
                .addStringOption((option) =>
                    option
                        .setName('department')
                        .setDescription('Input the name of the department')
                        .setRequired(true)
                )
        )
        .addSubcommand((option) =>
            option
                .setName('course')
                .setDescription('Subscribe to course notification')
                .addStringOption((option) =>
                    option
                        .setName('course')
                        .setDescription('Input the name of the course')
                        .setRequired(true)
                )
        )
        .addSubcommand((option) =>
            option
                .setName('section')
                .setDescription('Subscribe to section notification')
                .addIntegerOption((option) =>
                    option
                        .setName('section')
                        .setDescription('Input the name of the section')
                        .setRequired(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const category = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        if (category === 'department') {
            //
            const deptString = interaction.options.getString(
                'department',
                true
            );
            const parsedDeptString = await User.validateDept(deptString);
            if (parsedDeptString) {
                const result = await User.addSubscription(
                    userId,
                    'dept',
                    parsedDeptString
                ).catch((err) => {
                    CLL.error('SlashCommand', 'DB Error', err);
                    return null;
                });
                if (result)
                    interaction.editReply(
                        `Department ${parsedDeptString} has been subscribed.`
                    );
                else {
                    interaction.editReply(
                        `Failed to subscribe to section. Please try again`
                    );
                }
            } else {
                interaction.editReply(
                    'Unknown Department, please send this command again with a valid input.'
                );
            }
        } else if (category === 'course') {
            const courseString = interaction.options.getString('course', true);
            const parsedCourseString = await User.validateCourse(courseString);
            if (parsedCourseString) {
                const result = await User.addSubscription(
                    userId,
                    'course',
                    parsedCourseString
                ).catch((err) => {
                    CLL.error('SlashCommand', 'DB Error', err);
                    return null;
                });
                if (result)
                    interaction.editReply(
                        `Course ${parsedCourseString} has been subscribed.`
                    );
                else {
                    interaction.editReply(
                        `Failed to subscribe to course. Please try again`
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
                const result = await User.addSubscription(
                    userId,
                    'section',
                    parsedSectionNumber
                ).catch((err) => {
                    CLL.error('SlashCommand', 'DB Error', err);
                    return null;
                });
                if (result)
                    interaction.editReply(
                        `Section ${parsedSectionNumber} has been subscribed.`
                    );
                else {
                    interaction.editReply(
                        `Failed to subscribe to section. Please try again`
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
