const {
  criarFicha,
  carregarFicha,
  salvarFicha
} = require('../../servicos/fichas');

module.exports = {
  name: 'registroficha',

  async execute(msg, args) {

    const subcomando = args[0];

    // criar
    if (subcomando === 'criar') {

      const nome = args.slice(1).join(' ');

      if (!nome) {
        return msg.reply('Use: !registroficha criar Nome');
      }

      const ficha = criarFicha(
        msg.guild.id,
        msg.author.id,
        nome
      );

      if (!ficha) {
        return msg.reply('Você já possui ficha.');
      }

      return msg.reply(`Ficha criada para ${nome}`);
    }

    // ver
    if (subcomando === 'ver') {

      const ficha = carregarFicha(
        msg.guild.id,
        msg.author.id
      );

      if (!ficha) {
        return msg.reply('Você não possui ficha.');
      }

      return msg.reply(
`Nome: ${ficha.nome}
Classe: ${ficha.classe}
Raça: ${ficha.raca}
Nível: ${ficha.nivel}

HP: ${ficha.hp}/${ficha.hpMax}

FOR: ${ficha.atributos.for}
DES: ${ficha.atributos.des}
CON: ${ficha.atributos.con}
INT: ${ficha.atributos.int}
SAB: ${ficha.atributos.sab}
CAR: ${ficha.atributos.car}`
      );
    }

    // set
    if (subcomando === 'set') {

      const campo = args[1];
      const valor = args.slice(2).join(' ');

      if (!campo || !valor) {
        return msg.reply(
          'Use: !registroficha set campo valor'
        );
      }

      const ficha = carregarFicha(
        msg.guild.id,
        msg.author.id
      );

      if (!ficha) {
        return msg.reply('Você não possui ficha.');
      }

      const camposPermitidos = [
        'classe',
        'raca',
        'hp',
        'hpMax',
        'nivel',
        'xp'
      ];

      if (camposPermitidos.includes(campo)) {

        if (
          campo === 'hp' ||
          campo === 'hpMax' ||
          campo === 'nivel' ||
          campo === 'xp'
        ) {
          ficha[campo] = Number(valor);
        } else {
          ficha[campo] = valor;
        }

        salvarFicha(
          msg.guild.id,
          msg.author.id,
          ficha
        );

        return msg.reply(
          `${campo} alterado para ${valor}`
        );
      }

      const atributos = [
        'for',
        'des',
        'con',
        'int',
        'sab',
        'car'
      ];

      if (atributos.includes(campo)) {

        ficha.atributos[campo] = Number(valor);

        salvarFicha(
          msg.guild.id,
          msg.author.id,
          ficha
        );

        return msg.reply(
          `${campo} alterado para ${valor}`
        );
      }

      return msg.reply('Campo inválido.');
    }

    return msg.reply(
`!registroficha criar Nome
!registroficha ver
!registroficha set classe Guerreiro
!registroficha set raca Humano
!registroficha set hp 30
!registroficha set for 18`
    );
  }
};