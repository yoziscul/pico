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
            .setDescription(`${user}, you have been challenged by ${interaction.user}.`)
            .setColor('DarkGreen');

        const initialRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Accept')
                    .setStyle(3),
                new ButtonBuilder()
                    .setCustomId('decline')
                    .setLabel('Decline')
                    .setStyle(4),
            );

        const initialReply = await interaction.editReply({
            content: `\`${user.username}\`, pick one of the buttons below to accept or decline.`,
            embeds: [embed],
            components: [initialRow],
        });

        const filter = (i) => i.user.id === user.id;
        const iFilter = (i) => i.user.id === interaction.user.id;

        const i = await initialReply.awaitMessageComponent({ filter, time: 30000 })
            .catch(async () => {
                await interaction.editReply({
                    content: 'Game over.',
                    embeds: [embedErr("The following user didn't accept in time.")]
                });
            });

        await i.deferUpdate();

        if (i.customId === 'accept') {
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

            const reply = await i.editReply({
                content: `${user}, it's your turn to choose.`,
                embeds: [embed],
                components: [row],
            });

            const j = await reply.awaitMessageComponent({ filter, time: 30000 });
            const userChoice = choices.find((choice) => choice.name === j.customId);
            await j.deferUpdate();

            embed.setDescription(`It's currently ${interaction.user}'s turn.`);

            await j.editReply({
                content: `${interaction.user}, it's your turn to choose.`,
                embeds: [embed],
            });

            const k = await reply.awaitMessageComponent({ filter: iFilter, time: 30000 });
            const authorChoice = choices.find((choice) => choice.name === k.customId);
            await k.deferUpdate();

            let result = 'Nobody won, it was a tie!';

            if (userChoice.beats === authorChoice.name || authorChoice.beats === userChoice.name) {
                result = (userChoice.beats === authorChoice.name) ? `${user} is the winner!` : `${interaction.user} is the winner!`;
            }

            const userPicked = `${user} picked ${userChoice.name} ${userChoice.emoji}`;
            const authorPicked = `${interaction.user} picked ${authorChoice.name} ${authorChoice.emoji}`;

            embed.setDescription(`${userPicked}\n${authorPicked}`);

            await k.editReply({
                content: result,
                embeds: [embed],
            });
        } else {
            return await i.editReply({
                content: 'Game over.',
                embeds: [embedErr('The following user has declined the request.')],
            });
        }
    }
};

module.exports = command;
