const axios = require('axios');

module.exports = {
  name: 'cachorro',

  async execute(msg) {
    try {
      const res = await axios.get('https://dog.ceo/api/breeds/image/random');
      msg.reply(res.data.message);
    } catch {
      msg.reply('Erro ao buscar cachorrinho.');
    }
  }
};