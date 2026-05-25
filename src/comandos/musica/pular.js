const players = require('../../jogador');

module.exports = {
  name: 'pular',

  execute(msg) {
    const data = players.get(msg.guild.id);

    if (!data) return msg.reply('Nada tocando.');

    data.player.stop();
    msg.reply('⏭️ Pulando música...');
  }
};