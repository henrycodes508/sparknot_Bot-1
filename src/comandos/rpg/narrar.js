const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const musics =
    require('../../data/musics.json');

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

        const guildId = msg.guild.id;

        if (!history.has(guildId)) {
            history.set(guildId, []);
        }

        const actions =
            history.get(guildId);

        // Salva a ação do jogador
        actions.push(
            `[PLAYER] ${action}`
        );

        while (actions.length > 30) {
            actions.shift();
        }

        try {
            const thinking =
                await msg.reply(
                    'Narrando...'
                );

            const response =
                await client.responses.create({
                    model: 'gpt-5-mini',

                    input: `
Você é um mestre de RPG estilo D&D 5e.

IMPORTANTE:

Antes de narrar, leia todo o histórico.

Se existir uma missão ativa, a narração deve continuar essa missão.

Se existir um NPC mencionado em uma missão recente,
ele pode reaparecer.

Se existir um local mencionado em uma missão recente,
a narrativa deve levar os jogadores para lá ou desenvolver
os acontecimentos daquele local.

Nunca ignore missões anteriores.

Nunca crie uma aventura totalmente diferente se houver
uma missão ativa.

As consequências das ações dos jogadores devem afetar
o rumo da campanha.

O mundo deve possuir continuidade.

REGRAS:

- Narre de forma imersiva
- Descreva ambiente, som e atmosfera
- Não fale como assistente
- Nunca controle totalmente o jogador
- Máximo 2 parágrafos
- Seja cinematográfico
- Mantenha a coerência da campanha

Além da narração, gere tags de ambiente.

REGRAS DE TESTES (D&D 5e)

Nem toda situação exige rolagem de dados.

Solicite testes apenas quando houver chance real de falha ou sucesso relevante para a história.

Quando um teste for necessário, interrompa a narração antes do resultado e informe apenas o teste exigido.

Formato:

[TESTE]
Nome do personagem - Tipo de teste - CD

Exemplos:

Aragorn - Percepção - CD 13
Luna - Furtividade - CD 15
Kael - Persuasão - CD 14

Não revele o motivo exato do teste.

Não revele consequências antes da rolagem.

Aguarde os jogadores enviarem os resultados.

Quando os jogadores enviarem algo como:

"Aragorn tirou 17 em Percepção"
"Luna tirou 8 em Furtividade"

Considere esses valores como os resultados finais dos testes.

Na próxima narração:

- Resolva as consequências de cada personagem individualmente
- Descreva o que cada personagem percebeu, descobriu, ouviu ou sofreu
- Use os resultados para alterar a cena
- Quanto maior o sucesso, melhores as informações ou vantagens obtidas
- Em falhas, forneça consequências narrativas apropriadas

Exemplos de situações que podem exigir testes:

Percepção
Investigação
Intuição
Furtividade
Persuasão
Enganação
Intimidação
Atletismo
Acrobacia
Sobrevivência
Arcanismo
Religião
Natureza
História

Não peça testes em toda cena.

FORMATO OBRIGATÓRIO:

[TAGS]
tag1, tag2, tag3

[NARRAÇÃO]
texto aqui

HISTÓRICO DA CAMPANHA:

${actions.join('\n')}

REGRAS DAS TAGS:

- Gere entre 3 e 6 tags
- Use locais, clima, emoções e ambiente
- Prefira palavras simples

Exemplos:

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

            const tagsMatch =
                text.match(
                    /\[TAGS\]([\s\S]*?)\[NARRAÇÃO\]/
                );

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

            // Salva a narração no histórico
            actions.push(
                `[NARRACAO] ${narration}`
            );

            while (actions.length > 30) {
                actions.shift();
            }

            history.set(
                guildId,
                actions
            );

            const searchTags = [
                ...tags,
                ...action
                    .toLowerCase()
                    .split(/\s+/)
            ];

            let bestMusic = null;
            let bestScore = 0;

            for (const music of musics) {
                let score = 0;

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

            await thinking.edit(
                narration
            );
        } catch (err) {
            console.error(err);

            return msg.reply(
                'Erro ao narrar.'
            );
        }
    }
};