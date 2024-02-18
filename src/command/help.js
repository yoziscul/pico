const { Pagination } = require('pagination.djs');
const { EmbedBuilder } = require('discord.js');

function arraySplit(arr, size) {
    const result = [];

    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }

    return result;
}

const command = {
    name: 'help',
    description: 'Document all commands in the bot.',
    run: async (client, interaction) => {
        await interaction.deferReply();

        const pagination = new Pagination(interaction, {
            firstEmoji: '<:fastleft:1208637662202822727>',
            prevEmoji: '<:left:1208637660286033942>',
            nextEmoji: '<:right:1208637658364907591>',
            lastEmoji: '<:fastright:1208637664295653426>',
            limit: 5,
            ephemeral: false,
        });

        const embeds = [];
        const commands = arraySplit(client.commands.toJSON(), 3);

        for (let i = 0; i < commands.length; i++) {
            const newEmbed = new EmbedBuilder()
                .setTitle("Pico's Commands.")
                .setColor('DarkAqua')
                .setFooter({ text: `Page ${i + 1}/${commands.length}` })
                .setTimestamp();

            commands[i].forEach((command) => {
                newEmbed.addFields({
                    name: `</${command.name}:${command.id}>`,
                    value: `<:joiner:1208637666355052594> ${command.description}`,
                });
            });

            embeds.push(newEmbed);
        }

        pagination.setEmbeds(embeds);
        pagination.render();
    }
}

module.exports = command;
