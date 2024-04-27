const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { embedErr } = require('../util/Embeds');

const choices = [
    { name: 'Rock', emoji: '🪨', beats: 'Scissors' },
    { name: 'Paper', emoji: '📃', beats: 'Rock' },
    { name: 'Scissors', emoji: '✂️', beats: 'Paper' },
];

const command = {
    name: 'rps',
    description: 'Play a game of Rock, Paper, Scissors!',
    options: [
        {
            name: 'user',
            description: 'The user you want to play with.',
            type: 6,
            required: true,
        }
    ],
    run: async (interaction) => {
        const user = interaction.options.getUser('user');

        if (interaction.user.id === user.id || user.bot) {
            return interaction.reply({
                embeds: [embedErr('You cannot play with yourself, or with a bot.')],
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        const embed = new EmbedBuilder()
            .setTitle('Rock, Paper, Scissors!')
            .setDescription`${user}, you have been challenged by ${interaction.user}.`
            .setColor('DarkGreen');

        const row = new ActionRowBuilder()
            .addComponents(
                choices.map((choice) => {
                    return new ButtonBuilder()
                        .setCustomId(choice.name)
                        .setLabel(choice.name)
                        .setStyle(2)
                        .setEmoji(choice.emoji);
                }),
            );

        const reply = await interaction.editReply({
            content: `\`${user.username}\`, pick one of the buttons below to start.`,
            embeds: [embed],
            components: [row],
        });

        const userCollector = reply.createMessageComponentCollector({ time: 30000 });
        
        userCollector.on('collect', async (i) => {
            if (i.user.id !== user.id) {
                return await i.reply({ embeds: embedErr`It's not your turn right now.`, ephemeral: true });
            }

            await i.deferUpdate();
            const userChoice = choices.find((choice) => choice.name === i.customId);

            embed.setDescription`It's currently ${interaction.user}'s turn.`;

            await i.editReply({
                content: `\`${interaction.user.username}\`, it's your turn to choose.`,
                embeds: [embed],
            });

            const authorCollector = reply.createMessageComponentCollector({ time: 30000 });

            authorCollector.on('collect', async (j) => {
                if (j.user.id !== interaction.user.id) {
                    return await j.reply({ embeds: embedErr`It's not your turn right now.`, ephemeral: true });
                }

                await j.deferUpdate();
                const authorChoice = choices.find((choice) => choice.name === j.customId);

                let result = 'Nobody won, it was a tie!';

                if (userChoice.beats === authorChoice.name || authorChoice.beats === userChoice.name) {
                    result = (userChoice.beats === authorChoice.name) ? `${user} is the winner!` : `${interaction.user} is the winner!`;
                }

                const userPicked = `${user} picked ${userChoice.name} ${userChoice.emoji}`;
                const authorPicked = `${interaction.user} picked ${authorChoice.name} ${authorChoice.emoji}`;

                embed.setDescription`${userPicked}\n${authorPicked}`;
                await j.editReply({ content: result, embeds: [embed] });
            });

            authorCollector.on('end', () => {
                if (!authorCollector.collected.size) {
                    reply.edit({
                        content: 'Game ended.',
                        embeds: [embedErr`${user} didn't respond in time.`]
                    });
                }
            });
        });

        userCollector.on('end', () => {
            if (!userCollector.collected.size) {
                reply.edit({
                    content: 'Game ended.',
                    embeds: [embedErr`${user} didn't respond in time.`]
                });
            }
        });
    }
};

module.exports = command;
