const musics =
  require('../../data/musics.json')

module.exports = {
  name: ['ambiente', 'amb', 'cena'],

  async execute(msg, args) {

    const query =
      args.join(' ')
        .toLowerCase()
        .split(' ');

    if (!query.length) {

      return msg.reply(
        'Use: !ambiente combate floresta'
      );
    }

    let bestMusic = null;
    let bestScore = 0;

    for (const music of musics) {

      let score = 0;

      for (const word of query) {

        if (
          music.tags.includes(word)
        ) {
          score++;
        }
      }

      if (score > bestScore) {

        bestScore = score;
        bestMusic = music;
      }
    }

    if (!bestMusic) {

      return msg.reply(
        '❌ Nenhum ambiente encontrado.'
      );
    }

    // pega comando tocar
    const tocar =
      require('../musica/tocar');

    // transforma url em args
    const fakeArgs =
      [bestMusic.url];

    await msg.channel.send(
      ` Ambiente encontrado:\n` +
      `🎵 ${bestMusic.title}`
    );

    // chama teu tocar
    tocar.execute(msg, fakeArgs);
  }
};