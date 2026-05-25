const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const musics =
  require('../../data/musics.json');

module.exports = {
  name: ['narrar', 'nar', 'narra'],

  async execute(msg, args) {

    const action = args.join(' ');

    if (!action) {
      return msg.reply(
        'Use: !narrar ação'
      );
    }

    try {

      // mensagem temporária
      const thinking =
        await msg.reply(
          'Narrando...'
        );

      const response =
        await client.responses.create({

          model: 'gpt-5-mini',

          input: `
          
Você é um mestre de RPG estilo D&D 5e. Comece uma história, descrevendo o ambiente, sons e atmosfera de forma imersiva e cinematográfica. Use as seguintes

REGRAS:
- Narre de forma imersiva
- Descreva ambiente, som e atmosfera
- Não fale como assistente
- Nunca controle totalmente o jogador
- Máximo 2 parágrafos
- Seja cinematográfico

Além da narração, gere tags de ambiente.

FORMATO OBRIGATÓRIO:

[TAGS]
tag1, tag2, tag3

[NARRAÇÃO]
texto aqui

AÇÃO DO JOGADOR:
"${action}"
`
        });

      const text =
        response.output_text;

      // pega tags
      const tagsMatch =
        text.match(
          /\[TAGS\]([\s\S]*?)\[NARRAÇÃO\]/
        );

      // pega narração
      const narrationMatch =
        text.match(
          /\[NARRAÇÃO\]([\s\S]*)/
        );

      const tags =
        tagsMatch
          ? tagsMatch[1]
              .split(',')
              .map(t =>
                t.trim().toLowerCase()
              )
          : [];

      const narration =
        narrationMatch
          ? narrationMatch[1].trim()
          : text;

      // busca melhor músicaD
      let bestMusic = null;
      let bestScore = 0;

      for (const music of musics) {

        let score = 0;

        for (const tag of tags) {

          if (
            music.tags.includes(tag)
          ) {
            score++;
          }
        }

        if (score > bestScore) {

          bestScore = score;
          bestMusic = music;
        }
      }

      // toca música automaticamente
      if (bestMusic) {

        try {

          const tocar =
            require('../musica/tocar');

          tocar.execute(
            msg,
            [bestMusic.url]
          );

        } catch (musicError) {

          console.error(
            'Erro ao tocar música:',
            musicError
          );
        }
      }

      // envia narração
      await thinking.edit(
        `${narration}`
      );

    } catch (err) {

      console.error(err);

      return msg.reply(
        'Erro ao narrar.'
      );
    }
  }
};