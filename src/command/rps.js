const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { embedDefault, embedErr } = require('../util/Embeds');

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
        let user = interaction.options.get('user').user;

        if (interaction.user.id === user.id || user.bot) {
            return interaction.reply({
                embeds: [embedErr('You cannot play with yourself, or with a bot.')],
                ephemeral: true,
            });
        }

        const startGame = async (rematch, rematchUser) => {
            if (rematch === true) {
                if (user === rematchUser) {
                    user = interaction.user;
                }

                if (interaction.user === rematchUser) {
                    user = interaction.options.get('user').user;
                }
            } else {
                await interaction.deferReply();
            }

            const iUser = rematch === true ? rematchUser : interaction.user;
            const embed = embedDefault(`${user}, you have been challenged ${rematch ? 'for a rematch' : ''} by ${iUser}.`, iUser);
            const userTurn = interaction.user === user ? interaction.options.get('user').user : interaction.user;

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
                content: `${user}, pick one of the buttons below to accept or decline.`,
                embeds: [embed],
                components: [initialRow],
            });

            const filter = (i) => i.user.id === user.id;
            const zFilter = (i) => i.user.id === userTurn.id;

            const i = await initialReply.awaitMessageComponent({ filter, time: 30000 })
                .catch(async () => {
                    await interaction.editReply({
                        embeds: [embedErr("The following user didn't accept in time.")],
                    });
                });

            if (!i) return;

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

                const j = await reply.awaitMessageComponent({ zFilter, time: 30000 })
                    .catch(async () => {
                        return await interaction.editReply({
                            content: 'Game over.',
                            embeds: [embedErr(`${user} didn't choose in time.`)],
                            components: [],
                        });
                    });

                const userChoice = choices.find((choice) => choice.name === j.customId);
                await j.deferUpdate();

                embed.setDescription(`It's currently ${userTurn}'s turn.`);

                await j.editReply({
                    content: `${userTurn}, it's your turn to choose.`,
                    embeds: [embed],
                });

                const k = await reply.awaitMessageComponent({ filter: zFilter, time: 30000 })
                    .catch(async () => {
                        return await interaction.editReply({
                            content: 'Game over.',
                            embeds: [embedErr(`${interaction.user} didn't choose in time.`)],
                            components: [],
                        });
                    });

                const authorChoice = choices.find((choice) => choice.name === k.customId);
                await k.deferUpdate();

                let result = 'Nobody won, it was a tie!';

                if (userChoice.beats === authorChoice.name || authorChoice.beats === userChoice.name) {
                    result = (userChoice.beats === authorChoice.name) ? `${user} is the winner!` : `${interaction.user} is the winner!`;
                }

                const userPicked = `${user} picked ${userChoice.name} ${userChoice.emoji}`;
                const authorPicked = `${interaction.user} picked ${authorChoice.name} ${authorChoice.emoji}`;

                embed.setDescription(`${userPicked}\n${authorPicked}`);

                const rematchRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('rematch')
                            .setLabel('Rematch')
                            .setStyle(3),
                        new ButtonBuilder()
                            .setCustomId('end')
                            .setLabel('End')
                            .setStyle(4),
                    );

                await k.editReply({
                    content: result,
                    embeds: [embed],
                    components: [rematchRow],
                });

                const l = await reply.awaitMessageComponent({ time: 30000 }).catch(async () => {
                    await interaction.editReply({
                        components: [],
                        embeds: [embedErr('No more inputs were collected.')],
                    });
                });

                if (l && l.customId === 'rematch') {
                    l.deferUpdate();
                    startGame(true, l.user);
                } else if (l && l.customId === 'end') {
                    await l.deferUpdate();

                    return await i.editReply({
                        content: '',
                        embeds: [embedErr('The following user has ended the match.')],
                        components: [],
                    });
                }
            } else {
                return await i.editReply({
                    content: '',
                    embeds: [embedErr('The following user has declined the request.')],
                    components: [],
                });
            }
        };

        startGame(false, user);
    }
};

module.exports = command;
