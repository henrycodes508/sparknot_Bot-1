const players = require('../../jogador');

module.exports = {
  name: 'fila',

  execute(msg) {
    const data = players.get(msg.guild.id);

    if (!data || !data.queue || data.queue.length === 0) {
      return msg.reply('Fila vazia.');
    }

    const nowPlaying = data.current || 'Nada tocando';

    const list = data.queue
      .map((m, i) => `**${i + 1}.** ${m}`)
      .join('\n');

    msg.reply(`
🎶 **Tocando agora:**
${nowPlaying}

📜 **Fila:**
${list}
`);
  }
};