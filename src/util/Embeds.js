/**
 * EMBED FORMAT:

   const newEmbed = new EmbedBuilder()
    .setTitle('')
    .setDescription('')
    .setColor('')
    .setFooter('')
    .setTimestamp();
*/

const { EmbedBuilder } = require('discord.js');

const embeds = {
    embedErr(description) {
        return new EmbedBuilder()
            .setDescription(description)
            .setColor('Red');
    },
    embedDefault(description, user) {
        return new EmbedBuilder()
            .setDescription(description)
            .setColor('Aqua')
            .setFooter({
                text: user.username,
                iconURL: user.displayAvatarURL(),
            })
            .setTimestamp();
    }
};

module.exports = embeds;