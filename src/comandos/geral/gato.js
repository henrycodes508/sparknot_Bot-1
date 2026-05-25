const axios = require('axios');

module.exports = {
  name: 'gato',

  async execute(msg) {
    try {
      const res = await axios.get('https://api.thecatapi.com/v1/images/search');
      return msg.reply(res.data[0].url);
    } catch {
      return msg.reply('Erro ao buscar gatinho.');
    }
  }
};