const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
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
    run: async (client, interaction) => {
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

        const row = new ActionRowBuilder()
            .addComponents(
                choices.map((choice) => {
                    return new ButtonBuilder()
                        .setCustomId(choice.name)
                        .setLabel(choice.name)
                        .setStyle(2)
                        .setEmoji(choice.emoji)
                }),
            );

        const reply = await interaction.editReply({
            content: `\`${user.username}\`, pick one of the buttons below to start.`,
            embeds: [embed],
            components: [row],
        });

        const userCollector = await reply.awaitMessageComponent({ time: 30000 })
            .catch(async () => {
                await reply.edit({
                    content: '',
                    embeds: [embedErr(`${user} didn't respond in time.`)],
                    components: [],
                });
            });

        if (!userCollector) return;

        const userChoice = choices.find(
            (choice) => choice.name === userCollector.customId,
        );

        await userCollector.reply({
            content: `You picked ${userChoice.name + userChoice.emoji}`,
            ephemeral: true,
        });

        embed.setDescription(`It's currently ${interaction.user}'s turn.`);

        await reply.edit({
            content: `\`${interaction.user.username}\`, it's your turn to choose.`,
            embeds: [embed],
        });

        const authorCollector = await reply.awaitMessageComponent({ time: 30000 })
            .catch(async () => {
                embed.setTitle('Game Over')
                    .setDescription(`The user didn't respond in time.`)
                    .setColor('DarkRed');

                await reply.edit({
                    embeds: [embed],
                    components: [],
                });
            });

        if (!authorCollector) return;

        const authorChoice = choices.find(
            (choice) => choice.name === authorCollector.customId,
        );

        let result;

        if (userChoice.beats === authorChoice.name) result = `${user} is the winner!`;
        else if (authorChoice.beats === userChoice.name) result = `${interaction.user} is the winner!`;
        else result = 'Nobody won, it was a tie!';

        embed.setDescription(`${user} picked ${userChoice.name} ${userChoice.emoji}\n${interaction.user} picked ${authorChoice.name} ${authorChoice.emoji}`);

        reply.edit({ content: result, embeds: [embed], components: [] });
    }
}

module.exports = command;


/**
 * const user = interaction.options.getUser('user');
        const authorIcon = interaction.user.displayAvatarURL();

        if (interaction.user.id === user.id) {
            return interaction.reply({
                embeds: [embedErr('You cannot play with yourself.')],
                ephemeral: true,
            });
        }

        if (user.bot) {
            return interaction.reply({
                embeds: [embedErr('You cannot play with a bot.')],
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        const startEmbed = new EmbedBuilder()
            .setTitle('Rock, Paper, Scissors!')
            .setDescription(`\`${user.tag}\`, you have been challenged by \`${interaction.user.tag}\`.`)
            .setColor('DarkOrange')
            .setFooter({ text: interaction.user.tag, iconURL: authorIcon })
            .setTimestamp();

        const acceptComponent = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Accept')
                    .setStyle('Success'),
                new ButtonBuilder()
                    .setCustomId('decline')
                    .setLabel('Decline')
                    .setStyle('Danger'),
            );

        const matchComponent = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rock')
                    .setLabel('Rock')
                    .setStyle('Secondary'),
                new ButtonBuilder()
                    .setCustomId('paper')
                    .setLabel('Paper')
                    .setStyle('Secondary'),
                new ButtonBuilder()
                    .setCustomId('scissors')
                    .setLabel('Scissors')
                    .setStyle('Secondary'),
            );

        const msg = await interaction.editReply({
            embeds: [startEmbed],
            components: [acceptComponent]
        });

        const filter = (i) => ['accept', 'decline'].includes(i.customId) && i.user.id === user.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 600_000, componentType: 2 });

        collector.on('collect', async (i) => {
            if (started === false) {
                let turn = Math.floor(Math.random());
                currentTurn = turn === 1 ? user : interaction.user;

                if ((i.user.id !== user.id)) {
                    return i.reply({
                        embeds: [embedErr('You cannot accept the match for the opponent.')],
                        ephemeral: true,
                    });
                }

                await i.deferUpdate();

                const matchEmbed = new EmbedBuilder()
                    .setTitle('Rock, Paper, Scissors!')
                    .setDescription(`${currentTurn}, it's your turn to choose.`)
                    .setColor('Yellow')
                    .setFooter({ text: interaction.user.tag, iconURL: authorIcon })
                    .setTimestamp();

                const matchMsg = await i.editReply({
                    embeds: [matchEmbed],
                    components: [matchComponent],
                });

                matchCollector = matchMsg.createMessageComponentCollector({ componentType: 2 });

                started = true;
            }

            matchCollector.on('collect', async (j) => {
                let userChoice;
                let authorChoice;

                if (j.user.id !== currentTurn.id) {
                    return j.reply({
                        embeds: [embedErr("It's not your turn right now.")],
                        ephemeral: true,
                    });
                }

                await j.deferUpdate();

                if (currentTurn.id === user.id) {
                    userChoice = j.customId;
                    currentTurn = interaction.user;
                } else {
                    authorChoice = j.customId;
                    currentTurn = user;
                }

                if ((userChoice && !authorChoice) || (authorChoice && !userChoice)) {
                    j.editReply({ embeds: [matchEmbed] });
                }
            });
        });
    }
 */