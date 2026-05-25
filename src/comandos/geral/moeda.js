module.exports = {
  name: ['moeda', 'coin', 'caraoucoroa'],

  async execute(msg) {

    const result =
      Math.random() < 0.5
        ? '🪙 Cara'
        : '🪙 Coroa';

    return msg.reply(
      `🪙 A moeda está no ar, lá vem...\n\n${result}!`
    );
  }
};