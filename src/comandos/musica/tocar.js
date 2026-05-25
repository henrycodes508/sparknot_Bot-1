const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
  StreamType
} = require('@discordjs/voice');

const { spawn } = require('child_process');
const play = require('play-dl');
const players = require('../../jogador');

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

function criarBotoes() {
  return new ActionRowBuilder().addComponents(
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
      .setLabel('▶')
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
}

async function tocarProxima(guildId, msg) {
  const data = players.get(guildId);
  if (!data) return;

  if (!data.queue.length) {
    data.playing = false;

    if (data.connection) {
      data.connection.destroy();
    }

    players.delete(guildId);
    return;
  }

  const url = data.queue.shift();

  if (data.current) {
    data.previous = data.current;
  }

  data.current = url;

  console.log('Tocando:', url);

  const ytDlp = spawn('./yt-dlp.exe', [
    '-f',
    'bestaudio',
    '-o',
    '-',
    url
  ]);

  ytDlp.stderr.on('data', data => {
    console.log('[yt-dlp]', data.toString());
  });

  ytDlp.on('error', err => {
    console.error('Erro yt-dlp:', err);
  });

  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',

    '-f', 's16le',

    '-ar', '48000',

    '-ac', '2',

    'pipe:1'
  ]);

  ffmpeg.stderr.on('data', data => {
    console.log('[ffmpeg]', data.toString());
  });

  ffmpeg.on('error', err => {
    console.error('Erro ffmpeg:', err);
  });

  ytDlp.stdout.pipe(ffmpeg.stdin);

  const resource = createAudioResource(ffmpeg.stdout, {
    inputType: StreamType.Raw
  });

  data.process = ytDlp;

  data.player.play(resource);

  await msg.channel.send({
    content: `🎵 Tocando: ${url}`,
    components: [criarBotoes()]
  });
}

module.exports = {
  name: 'tocar',

  async execute(msg, args) {
    let started = false;

    try {
      const query = args.join(' ').trim();

      if (!query) {
        return msg.reply('Coloca o nome ou link da música.');
      }

      const channel = msg.member.voice.channel;

      if (!channel) {
        return msg.reply('Entra em uma call.');
      }

      let url;

      const validate = play.yt_validate(query);

      if (validate === 'video' || validate === 'playlist') {
        url = query;
      } else {
        const results = await play.search(query, { limit: 1 });

        if (!results.length) {
          return msg.reply('❌ Música não encontrada.');
        }

        url = results[0].url;
      }

      let data = players.get(msg.guild.id);

      if (!data) {
        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: msg.guild.id,
          adapterCreator: msg.guild.voiceAdapterCreator
        });

        await entersState(
          connection,
          VoiceConnectionStatus.Ready,
          20000
        );

        const player = createAudioPlayer();

        data = {
          player,
          connection,
          queue: [],
          playing: false,
          process: null,
          current: null,
          previous: null
        };

        players.set(msg.guild.id, data);

        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
          console.log('Player ficou idle');

          if (data.process) {
            data.process.kill();
          }

          if (data.queue.length > 0) {
            tocarProxima(msg.guild.id, msg);
          } else {
            data.playing = false;

            data.connection.destroy();

            players.delete(msg.guild.id);

            console.log('Fila encerrada');
          }
        });

        player.on('error', error => {
          console.error('Erro player:', error);

          msg.channel.send('❌ Erro ao reproduzir.');

          if (data.process) {
            data.process.kill();
          }

          data.connection.destroy();

          players.delete(msg.guild.id);
        });
      }

      data.queue.push(url);

      if (!data.playing) {
        data.playing = true;

        started = true;

        tocarProxima(msg.guild.id, msg);
      } else {
        msg.reply(`➕ Adicionado à fila:\n${url}`);
      }

    } catch (err) {
      console.error('Erro geral:', err);

      if (!started) {
        msg.reply('❌ Erro ao tocar música.');
      }
    }
  }
};