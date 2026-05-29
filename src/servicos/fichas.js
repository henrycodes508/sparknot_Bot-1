const fs = require('fs');
const path = require('path');

const pastaBase = path.join(__dirname, '..', '..', 'data', 'fichas');

function garantirPasta(guildId) {
  const pastaGuild = path.join(pastaBase, guildId);

  if (!fs.existsSync(pastaGuild)) {
    fs.mkdirSync(pastaGuild, { recursive: true });
  }

  return pastaGuild;
}

function caminhoFicha(guildId, userId) {
  const pastaGuild = garantirPasta(guildId);

  return path.join(pastaGuild, `${userId}.json`);
}

function criarFicha(guildId, userId, nome) {
  const caminho = caminhoFicha(guildId, userId);

  if (fs.existsSync(caminho)) {
    return false;
  }

  const ficha = {
    nome,
    nivel: 1,
    xp: 0,
    hp: 10,
    hpMax: 10,
    classe: 'Nenhuma',
    raca: 'Nenhuma',

    atributos: {
      for: 10,
      des: 10,
      con: 10,
      int: 10,
      sab: 10,
      car: 10
    },

    moedas: {
      ouro: 0,
      prata: 0,
      cobre: 0
    },

    inventario: []
  };

  fs.writeFileSync(caminho, JSON.stringify(ficha, null, 2));

  return ficha;
}

function carregarFicha(guildId, userId) {
  const caminho = caminhoFicha(guildId, userId);

  if (!fs.existsSync(caminho)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(caminho));
}

function salvarFicha(guildId, userId, ficha) {
  const caminho = caminhoFicha(guildId, userId);

  fs.writeFileSync(caminho, JSON.stringify(ficha, null, 2));
}

module.exports = {
  criarFicha,
  carregarFicha,
  salvarFicha
};