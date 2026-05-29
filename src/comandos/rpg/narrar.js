const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const musics =
  require('../../data/musics.json');

// histórico curto da campanha
const history =
  require('../../data/history');

module.exports = {
  name: ['narrar', 'nar', 'narra'],

  async execute(msg, args) {

    const action = args.join(' ');

    if (!action) {
      return msg.reply(
        'Use: !narrar ação'
      );
    }

    // histórico por servidor
    const guildId = msg.guild.id;

    if (!history.has(guildId)) {
      history.set(guildId, []);
    }

    const actions =
      history.get(guildId);

    actions.push(action);

    if (actions.length > 10) {
      actions.shift();
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
          
Você é um mestre de RPG estilo D&D 5e.

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

HISTÓRICO RECENTE:

${actions.join('\n')}

REGRAS DAS TAGS:
- Gere entre 3 e 6 tags
- Use locais, clima, emoções e ambiente
- Prefira palavras simples
- Exemplos:
taberna, taverna, floresta,
cidade, castelo, combate,
caverna, mercado, chuva,
neve, templo, inferno,
deserto, porto, masmorra

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

      // mistura tags da IA com palavras da ação
      const searchTags = [
        ...tags,
        ...action
          .toLowerCase()
          .split(/\s+/)
      ];

      // busca melhor música
      let bestMusic = null;
      let bestScore = 0;

      for (const music of musics) {

        let score = 0;

        // busca mais inteligente
        for (const searchTag of searchTags) {

          for (const musicTag of music.tags) {

            const a =
              searchTag.toLowerCase();

            const b =
              musicTag.toLowerCase();

            if (
              a === b ||
              a.includes(b) ||
              b.includes(a)
            ) {
              score++;
            }
          }
        }

        if (score > bestScore) {

          bestScore = score;
          bestMusic = music;
        }
      }

      // logs para debug
      console.log(
        '[TAGS]',
        searchTags
      );

      if (bestMusic) {

        console.log(
          '[MUSICA]',
          bestMusic.title
        );
      }

      // toca música automaticamente
      if (
        bestMusic &&
        bestScore > 0
      ) {

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