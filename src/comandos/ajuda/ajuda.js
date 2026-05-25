module.exports = {
  name: ['ajuda', 'comandos'],

  async execute(msg) {
    return msg.reply(`
**⚡ Sparknot Bot - Comandos**

**📌 Gerais**
!ping — Testa o bot
!cachorro — Imagem de cachorro
!gato — Imagem de gato
!meme(Em Breve) — Memes Resenha BR 🇧🇷
!memena — Meme Norte Americano
!shitpost(Em Breve) — Humor de Qualidade duvidosa
!ppt <opção> — Pedra, papel e tesoura

**🎲 RPG**
!rolar <dado> — Ex: !roll d20 / !roll 2d6 vantagem
!missao — Missão aleatória

**🎵 Música**
!letra <nome da música> — Ver letra de música
!entrar — Entrar no canal
!tocar <nome/link> — Tocar música
!fila — Ver fila de músicas
!pular — Pular música
!parar — Parar tudo
!sair — Sair do canal

Use **!botoes** para ver os controles do player de música
`);
  }
};