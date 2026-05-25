module.exports = {
  name: 'ppt',

  async execute(msg) {
    const options = ['pedra', 'papel', 'tesoura'];
    const choice = msg.content.replace('!ppt ', '');

    if (!options.includes(choice)) {
      return msg.reply('Use: !ppt <pedra|papel|tesoura>');
    }

    const bot = options[Math.floor(Math.random() * 3)];

    let result = 'Achei fácil.';
    if (choice === bot) result = 'Empatamos, vamos de novo.';
    else if (
      (choice === 'pedra' && bot === 'tesoura') ||
      (choice === 'papel' && bot === 'pedra') ||
      (choice === 'tesoura' && bot === 'papel')
    ) result = 'Tá com toda sorte do mundo, ganhou.';

    return msg.reply(`${result}\nVocê: ${choice} | Eu: ${bot}`);
  }
};