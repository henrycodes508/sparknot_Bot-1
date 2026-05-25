require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const {
  AudioPlayerStatus,
  createAudioResource,
  StreamType
} = require('@discordjs/voice');

const { spawn } = require('child_process');

const commands = require('./src/comandos');
const players = require('./src/jogador');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// bot online
client.once('clientReady', () => {
  console.log(`⚡ Sparknot online como ${client.user.tag}`);
});

// comandos
client.on('messageCreate', async (msg) => {

  try {

    // ignora bots
    if (msg.author.bot) return;

    // regex de rolagem sem prefixo
    const diceRegex =
      /^(([+\-/*]?\s*\d*d\d+)|([+\-/*]?\s*\d+(\.\d+)?))(\s*([+\-/*]\s*\d*d\d+|[+\-/*]\s*\d+(\.\d+)?))*(\s+(v|d|adv|dis|vantagem|desvantagem))?$/i;

    // =========================
    // rolagem sem prefixo
    // =========================

    if (diceRegex.test(msg.content.trim())) {

      // pega comando rolar
      const rollCommand =
        commands.get('rolar') ||
        commands.get('r');

      // não encontrou
      if (!rollCommand) return;

      // executa
      return await rollCommand.execute(
        msg,
        msg.content.trim().split(/\s+/)
      );
    }

    // =========================
    // comandos normais
    // =========================

    // verifica prefixo
    if (!msg.content.startsWith('!')) return;

    // separa argumentos
    const args =
      msg.content
        .slice(1)
        .trim()
        .split(/ +/);

    // nome comando
    const commandName =
      args.shift().toLowerCase();

    // pega comando
    const command =
      commands.get(commandName);

    // comando não existe
    if (!command) return;

    // executa
    await command.execute(msg, args);

  } catch (error) {

    console.error(error);

    msg.reply('⚠️ Erro ao executar comando.');
  }
});

// botoes
client.on('interactionCreate', async (interaction) => {

  if (!interaction.isButton()) return;

  const data =
    players.get(interaction.guild.id);

  if (!data) return;

  const {
    player,
    connection
  } = data;

  try {

    await interaction.deferUpdate();

    // pause / play
    if (interaction.customId === 'pausar_toggle') {

      const isPlaying =
        player.state.status === AudioPlayerStatus.Playing;

      if (isPlaying) {
        player.pause();
      } else {
        player.unpause();
      }

      const newRow =
        new ActionRowBuilder().addComponents(

          new ButtonBuilder()
            .setCustomId('reiniciar')
            .setLabel('↺')
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId('voltar')
            .setLabel('⏮')
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId('pausar_toggle')
            .setLabel(isPlaying ? '❚❚' : '▶')
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId('pular')
            .setLabel('⏭')
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId('parar')
            .setLabel('⏹')
            .setStyle(ButtonStyle.Danger)
        );

      await interaction.message.edit({
        components: [newRow]
      });

      return;
    }

    // pular musica
    if (interaction.customId === 'pular') {

      player.unpause();

      if (data.process) {
        data.process.kill();
      }

      player.stop();

      return;
    }

    // reiniciar musica
    if (interaction.customId === 'reiniciar') {

      if (!data.current) return;

      if (data.process) {
        data.process.kill();
      }

      const ytDlp =
        spawn('./yt-dlp.exe', [
          '-f',
          'bestaudio',
          '-o',
          '-',
          data.current
        ]);

      const resource =
        createAudioResource(
          ytDlp.stdout,
          {
            inputType: StreamType.Arbitrary
          }
        );

      data.process = ytDlp;

      player.play(resource);

      return;
    }

    // voltar musica
    if (interaction.customId === 'voltar') {

      if (data.previous) {

        // coloca atual na fila
        if (data.current) {
          data.queue.unshift(data.current);
        }

        // coloca anterior
        data.queue.unshift(data.previous);

        data.previous = null;

        if (data.process) {
          data.process.kill();
        }

        player.unpause();
        player.stop();
      }

      return;
    }

    // parar tudo
    if (interaction.customId === 'parar') {

      player.stop();

      if (data.process) {
        data.process.kill();
      }

      connection.destroy();

      players.delete(interaction.guild.id);

      return;
    }

  } catch (err) {

    console.error(err);
  }
});

// login
client.login(process.env.DISCORD_TOKEN);