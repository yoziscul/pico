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
    run: async (interaction, client) => {
        await interaction.deferReply();

        const pagination = new Pagination(interaction, {
            firstEmoji: '<:fastleft:1221241132197871727>',
            prevEmoji: '<:left:1221241130033741905>',
            nextEmoji: '<:right:1221241128532185238>',
            lastEmoji: '<:fastright:1221241125738778755>',
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
                    value: `<:arrow:1221241123599679618> ${command.description}`,
                });
            });

            embeds.push(newEmbed);
        }

        pagination.setEmbeds(embeds);
        pagination.render();
    }
}

module.exports = command;
