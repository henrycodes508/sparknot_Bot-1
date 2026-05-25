const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  name: 'parar',

  async execute(msg) {
    const connection = getVoiceConnection(msg.guild.id);

    if (!connection) return msg.reply('Não estou em call.');

    connection.destroy();
    msg.reply('⏹️ Música parada.');
  }
};