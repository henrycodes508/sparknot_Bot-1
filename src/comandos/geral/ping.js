module.exports = {
  name: 'ping',

  async execute(msg) {
    const sent = await msg.reply('🏓 Calculando ping...');

    const latency = sent.createdTimestamp - msg.createdTimestamp;
    const apiPing = msg.client.ws.ping;

    sent.edit(`🏓 Pong! ${latency}ms
    API: ${apiPing}ms`);
  }
};