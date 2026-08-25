const axios = require('axios');

const history = require('../../data/history');

module.exports = {
    name: 'missao',

    async execute(msg) {
        try {
            const apiKey = process.env.OPENAI_API_KEY;

            if (!apiKey) {
                return msg.reply(
                    '⚠️ Falta a OPENAI_API_KEY no .env'
                );
            }

            const guildId = msg.guild.id;

            if (!history.has(guildId)) {
                history.set(guildId, []);
            }

            const actions = history.get(guildId);

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini',

                    messages: [
                        {
                            role: 'system',
                            content: `
Você é um mestre de RPG D&D 5e.

Sua função é criar missões que continuem naturalmente a aventura atual.

REGRAS:

- Analise todo o histórico.
- Se existir uma missão em andamento, continue essa missão.
- Se os jogadores estiverem investigando algo, aprofunde a investigação.
- Se estiverem viajando para algum local, faça a missão avançar nesse local.
- Se estiverem em uma cidade, taberna, floresta, castelo ou masmorra, aproveite o ambiente atual.
- Não reinicie a campanha sem motivo.
- Não ignore eventos importantes do histórico.
- NPCs apresentados anteriormente podem reaparecer.
- Objetivos anteriores podem ganhar novas etapas.


CRIAÇÃO DE MISSÕES:

- Analise primeiro o histórico da campanha.

- Se existir uma missão ativa, continue essa missão.

- Se existir uma missão recente parcialmente concluída, crie a próxima etapa dela.

- Se existir uma investigação, viagem, exploração ou NPC importante, utilize esses elementos para expandir a campanha.

- Se NÃO existir histórico suficiente para identificar uma missão em andamento, crie uma missão completamente nova.

- A nova missão deve conter um gancho claro para futuras continuações.

- A nova missão deve apresentar pelo menos:
  * Um NPC importante
  * Um local importante
  * Um objetivo principal

- Quando criar uma missão nova, escreva-a de forma que futuras narrações possam continuar naturalmente a partir dela.

- Nunca responda dizendo que não há contexto suficiente.

- Sempre gere uma missão, mesmo com histórico vazio.

IMPORTANTE:

- A descrição deve ter no máximo 2 parágrafos.
- A missão completa deve ter menos de 1500 caracteres.
- Seja objetivo.

FORMATO:

🧭 Título:
🎯 Objetivo:
📍 Local:
👤 NPC:
💰 Recompensa:
📖 Descrição:
`
                        },
                        {
                            role: 'user',
                            content: `
HISTÓRICO DA CAMPANHA:

${actions.join('\n')}

Analise tudo que aconteceu anteriormente.

Crie uma missão ou continuação de missão baseada nesse contexto.
`
                        }
                    ]
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const quest =
                response.data.choices?.[0]?.message?.content;

            if (!quest) {
                return msg.reply(
                    '⚠️ Não consegui gerar missão.'
                );
            }

            // Salva a missão no histórico
            actions.push(
                `[MISSAO]\n${quest}`
            );

            // Mantém somente os últimos 30 eventos
            while (actions.length > 30) {
                actions.shift();
            }

            history.set(guildId, actions);

            msg.reply(
                `🧭 **Missão Gerada**\n\n${quest}`
            );
        } catch (err) {
            console.error(
                err.response?.data ||
                err.message
            );

            msg.reply(
                '❌ Erro ao gerar missão.'
            );
        }
    }
};