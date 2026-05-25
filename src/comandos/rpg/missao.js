const axios = require('axios');

module.exports = {
  name: 'missao',

  async execute(msg) {
    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return msg.reply('⚠️ Falta a OPENAI_API_KEY no .env');
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You generate RPG quests.'
            },
            {
              role: 'user',
              content: 'Create a short RPG quest with: Title, Objective, Location, NPC, Reward.'
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

      const quest = response.data.choices?.[0]?.message?.content;

      if (!quest) {
        return msg.reply('⚠️ Não consegui gerar missão.');
      }

      msg.reply(`🧭 **Missão:**\n${quest}`);

    } catch (err) {
      console.error(err.response?.data || err.message);
      msg.reply('❌ Erro ao gerar missão.');
    }
  }
};