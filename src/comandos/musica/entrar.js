const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  name: 'entrar',

  async execute(msg) {
    const channel = msg.member.voice.channel;

    if (!channel) {
      return msg.reply('Você precisa estar em uma call.');
    }

    joinVoiceChannel({
      channelId: channel.id,
      guildId: msg.guild.id,
      adapterCreator: msg.guild.voiceAdapterCreator
    });

    msg.reply('Entrei na call.');
  }
};