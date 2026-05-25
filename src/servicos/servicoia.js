const axios = require('axios');

async function generateRPG(prompt) {
  try {
    const res = await axios.post('http://localhost:8000/rpg', {
      prompt
    });

    return res.data.response;
  } catch (err) {
    return "Erro na IA.";
  }
}

module.exports = { generateRPG };