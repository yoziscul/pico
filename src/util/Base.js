const { readdirSync }  = require('node:fs');
const { Client, Collection } = require('discord.js');
const { embedErr } = require('./Embeds');

class Base extends Client {
    register = false;
    commands = new Collection();

    constructor() {
        super({
            intents: [1, 2],
            partials: [1, 0],
        });

        this.on('ready', this.registerClientCommands);
        this.on('interactionCreate', this.listenInteraction)

        void this.login(process.env.DISCORD_TOKEN);
    }

    async registerClientCommands() {
        for (const file of readdirSync('src/command')) {
            const command = require(`../command/${file}`);
            this.commands.set(command.name, { ...command });
        }

        if (this.register) {
            await this.application.commands.set(Array.from(this.commands.values()));
            console.warn('Commands are set to register ⚠️');
        }

        const commands = (await this.application.commands.fetch()).toJSON();

        for (const slashCommand of commands) {
            Object.defineProperty(this.commands.get(slashCommand.name), 'id', {
                value: slashCommand.id,
                writable: true,
                configurable: true,
            });
        }

        console.info('Commands loaded. ✅');
    }

    async listenInteraction(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = this.commands.get(interaction.commandName);

            if (command) {
                try {
                    await command.run(interaction, this);
                } catch(error) {
                    console.error(error);

                    interaction.followUp({
                        embeds: [embedErr(`Error while executing command, sorry for the inconvenience!`)],
                        ephemeral: true,
                    });
                }
            }
        }
    }
}

module.exports = Base;
