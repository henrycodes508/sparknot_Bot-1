const axios = require('axios');

module.exports = {
  name: 'memena',

  async execute(msg) {
    try {
      const res = await axios.get('https://meme-api.com/gimme');
      return msg.reply(res.data.url);
    } catch {
      return msg.reply('Erro ao buscar meme gringo.');
    }
  }
};