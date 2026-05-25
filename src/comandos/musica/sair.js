const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  name: 'sair',

  async execute(msg) {
    const connection = getVoiceConnection(msg.guild.id);

    if (!connection) {
      return msg.reply('Não estou em nenhuma call.');
    }

    connection.destroy();

    msg.reply('Saí da call.');
  }
};