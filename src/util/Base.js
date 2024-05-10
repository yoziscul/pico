const { readdirSync }  = require('node:fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { embedErr } = require('./Embeds');

class Base extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.MessageContent,
            ],
        });

        // SET TO TRUE IF Object.defineProperty called on non-object
        this.register = false;
        this.commands = new Collection();

        this.on('ready', this.registerClientCommands);
        this.on('interactionCreate', this.listenInteraction);

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
                        embeds: [embedErr(`Error while executing command, sorry for the inconvenience!\n\`\`\`js\n${error}\`\`\``)],
                        ephemeral: true,
                    });
                }
            }
        }
    }
}

module.exports = Base;
