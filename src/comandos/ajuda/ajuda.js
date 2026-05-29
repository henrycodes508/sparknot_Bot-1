module.exports = {
  name: ['ajuda', 'comandos'],

  async execute(msg) {
    return msg.reply(`
**⚡ Sparknot Bot - Comandos**

**📌 Gerais**
!ping — Testa o bot
!cachorro — Imagem de cachorro
!gato — Imagem de gato
!ppt <opção> — Pedra, papel e tesoura
!moeda — Jogue uma moeda cara ou coroa

**🎲 RPG**
!narrar <texto> — A IA toma a frente e narra algo para o grupo
!rolar <dado> — Ex: !rolar d20 / !roll 2d6 vantagem/ 2d20 + 5 v
!missao — Missão aleatória
!ambiente <texto>— Toca uma música ambiente baseada em tags
!registroficha criar <nome> — Criar ficha de RPG
!registroficha ver — Ver ficha de RPG
!registroficha set <campo> <valor> — Editar ficha de RPG

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