const { embedErr } = require('../util/Embeds');

const command = {
    name: 'number',
    description: 'Play a game of Guess the Number!',
    run: async (interaction) => {
        await interaction.deferReply();

        const number = Math.floor(Math.random() * 1000) + 1;
        let attempts = 1;
        let guess = 0;

        await interaction.editReply('I have chosen a number between 1 and 1000. You have 30 seconds to guess it!');

        const filter = m => !isNaN(m.content) && m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 30000 });

        collector.on('collect', async (message) => {
            guess = parseInt(message.content);

            if (guess === number) {
                collector.stop();
                message.reply(`Congratulations! You guessed the number in ${attempts} attempts.`);
            } else {
                attempts++;

                const reply = guess < number ? '🔼' : '🔽';
                message.react(reply);
            }
        });

        collector.on('end', async (i) => {
            if (guess !== number) {
                interaction.followUp({
                    embeds: [embedErr("You couldn't guess the number in time!")],
                });
            }
        });
    }
};

module.exports = command;
