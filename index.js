const { Client, GatewayIntentBits, ApplicationCommandOptionType } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function GetProxyURL(url) {
    const channel = client.channels.cache.get(config.channel);
    let lastmessage = null;

    while (true) {
        await new Promise(resolve => setTimeout(resolve, 100));

        if (lastmessage) {
            await lastmessage.delete().catch(error => {
                console.error('Failed to delete message:', error);
            });
        }
        
        let message = await channel.send(url);
        
        let newurl = message.embeds[0]?.data?.thumbnail?.proxy_url;

        if (newurl) {
            return newurl;
        } else {
            lastmessage = message;
        }
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        const guild = await client.guilds.fetch(config.guildId);
        const commands = await guild.commands.fetch();
        const existingCommand = commands.find(command => command.name === 'getimage');

        if (existingCommand) {
            await existingCommand.delete();
        }

        await guild.commands.create({
            name: 'getimage',
            description: 'Obter URL da imagem com proxy',
            options: [
                {
                    name: 'url',
                    description: 'URL da imagem',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        });

        console.log('Slash command "getimage" criado com sucesso.');
    } catch (error) {
        console.error('Erro ao criar o slash command:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || interaction.commandName !== 'getimage') return;

    if (interaction.channelId !== config.channel) {
        return await interaction.reply('Este comando só pode ser executado no canal configurado.');
    }

    const url = interaction.options.getString('url');

    try {
        await GetProxyURL(url);
        await interaction.reply(`Imagem enviada`);
    } catch (error) {
        console.error('Erro ao obter a URL da imagem:', error);
        await interaction.reply('Ocorreu um erro ao obter a URL da imagem. Por favor, tente novamente mais tarde.');
    }
});

client.login(config.token);
