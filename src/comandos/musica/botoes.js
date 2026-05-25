module.exports = {
  name: 'botoes',

  execute(msg) {
    return msg.reply(`
**Controles do Player**

❚❚ — Pausar a música atual  
▶︎ — Retomar a música  
↺ — Reiniciar ou voltar a música  
⏭ — Pular para a próxima música  
⏹ — Parar tudo e limpar a fila  

 Use os botões abaixo da mensagem do player
`);
  }
};