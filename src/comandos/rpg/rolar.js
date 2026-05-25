const MAX_DICE = 100;

module.exports = {
  name: ['rolar', 'r', 'roll'],

  async execute(msg, args) {

    // suporte sem comando
    if (!args || !args.length) {
      args = msg.content.trim().split(/\s+/);
    }

    let input = args.join(' ').toLowerCase().replace(',', '.');

    let mode = null;

    // vantagem
    if (
      input.includes('vantagem') ||
      input.includes('adv') ||
      input.trim().endsWith('v')
    ) {
      mode = 'vantagem';
    }

    // desvantagem
    if (
      input.includes('desvantagem') ||
      input.includes('dis') ||
      input.trim().endsWith('d')
    ) {
      mode = 'desvantagem';
    }

    // limpa texto
    input = input
      .replace(/vantagem/g, '')
      .replace(/desvantagem/g, '')
      .replace(/\badv\b/g, '')
      .replace(/\bdis\b/g, '')
      .replace(/\s+[vd]$/, '')
      .trim();

    // regex principal
    const diceRegex =
      /^(([+\-/*]?\s*\d*d\d+)|([+\-/*]?\s*\d+(\.\d+)?))(\s*([+\-/*]\s*\d*d\d+|[+\-/*]\s*\d+(\.\d+)?))*(\s+(v|d|adv|dis|vantagem|desvantagem))?$/i;

    if (!diceRegex.test(input)) {
      return msg.reply(
        'use: !r d20 | !r 2d6 | !r d20 + 5 | !r d20 v'
      );
    }

    // separa dados e operações
    const tokens = input.match(
      /([+-/*]?\s*\d*d\d+|[+-/*]?\s*\d+(\.\d+)?)/g
    );

    if (!tokens) {
      return msg.reply(
        'use: !r d20 | !r 2d6 | !r d20 + 5 | !r d20 v'
      );
    }

    let diceParts = [];
    let operations = [];

    for (let token of tokens) {

      token = token.replace(/\s/g, '');

      let operator = '+';

      if (/^[+\-*/]/.test(token)) {
        operator = token[0];
        token = token.slice(1);
      }

      // dados
      if (token.includes('d')) {

        diceParts.push({
          dice: token,
          op: operator
        });

      } else {

        // números
        operations.push({
          value: parseFloat(token),
          op: operator
        });
      }
    }

    // nenhum dado
    if (!diceParts.length) {
      return msg.reply('Nenhum dado encontrado.');
    }

    // valida vantagem/desvantagem
    if (mode) {

      const counts = diceParts.map(d => {

        const raw =
          d.dice.split('d')[0];

        // d20 v = 2d20
        return raw === ''
          ? 2
          : parseInt(raw);
      });

      const first = counts[0];

      if (!counts.every(c => c === first)) {

        return msg.reply(
          'Para vantagem/desvantagem, todos os dados precisam ter a mesma quantidade (ex: 2d20 + 2d6)'
        );
      }
    }

    // rolagem
    const rollOnce = () => {

      let groups = {};

      for (const part of diceParts) {

        let [count, sides] =
          part.dice.split('d');

        // d20 v = 2d20
        if (count === '') {

          count =
            mode
              ? 2
              : 1;

        } else {

          count =
            parseInt(count);
        }

        sides = parseInt(sides);

        // validação
        if (
          isNaN(count) ||
          isNaN(sides) ||
          count <= 0 ||
          sides <= 0
        ) {
          throw new Error(
            'Formato de dado inválido.'
          );
        }

        // limite
        if (count > MAX_DICE) {
          throw new Error(
            `Tá querendo me estourar? No máximo ${MAX_DICE} por rolagem`
          );
        }

        const key =
          `${part.op}d${sides}`;

        if (!groups[key]) {
          groups[key] = [];
        }

        // gera números
        for (let i = 0; i < count; i++) {

          groups[key].push(
            Math.floor(
              Math.random() * sides
            ) + 1
          );
        }
      }

      return groups;
    };

    // aplica operações
    const applyOperations = (base) => {

      let total = base;

      for (const op of operations) {

        if (op.op === '+')
          total += op.value;

        if (op.op === '-')
          total -= op.value;

        if (op.op === '*')
          total *= op.value;

        if (op.op === '/')
          total /= op.value;
      }

      return total;
    };

    // monta expressão
    const buildExpression = (
      values,
      ops
    ) => {

      let exp = [];

      values.forEach((v, i) => {

        const sign =
          ops[i] === '-'
            ? '-'
            : i === 0
            ? ''
            : '+';

        exp.push(
          `${sign} ${v}`.trim()
        );
      });

      operations.forEach(op => {
        exp.push(
          `${op.op} ${op.value}`
        );
      });

      return exp.join(' ');
    };

    try {

      // normal
      if (!mode) {

        const groups =
          rollOnce();

        let lines = [];
        let valuesFlat = [];
        let opsFlat = [];

        for (const key in groups) {

          const op =
            key.startsWith('-')
              ? '-'
              : '+';

          const cleanKey =
            key.replace(/^[-+]/, '');

          const values =
            groups[key];

          const prefix =
            op === '-'
              ? '-'
              : '';

          // mostra os dados rolados
          lines.push(
            `🎲 ${prefix}${values.length}${cleanKey} = ${values.join(', ')}`
          );

          // salva cada dado individual
          for (const v of values) {

            valuesFlat.push(v);
            opsFlat.push(op);
          }
        }

        // soma os dados primeiro
        let baseTotal = 0;

        for (
          let i = 0;
          i < valuesFlat.length;
          i++
        ) {

          if (opsFlat[i] === '-') {

            baseTotal -=
              valuesFlat[i];

          } else {

            baseTotal +=
              valuesFlat[i];
          }
        }

        // aplica operações UMA vez no total
        const final =
          applyOperations(baseTotal);

        let extra = '';

        // mostra cálculo detalhado
        if (
          operations.length ||
          opsFlat.includes('-')
        ) {

          let expression =
            valuesFlat
              .map((v, i) => {

                return opsFlat[i] === '-'
                  ? `-${v}`
                  : `${v}`;
              })
              .join(' + ');

          // limpa "+ -"
          expression =
            expression.replace(
              /\+\s-/g,
              '- '
            );

          operations.forEach(op => {

            expression +=
              ` ${op.op} ${op.value}`;
          });

          extra =
            `\n🤓 👆 (${expression}) = ${final}\n`;
        }

        return msg.reply(
          `${lines.join('\n')}${extra}\n⚡ resultado: ${final} ⚡`
        );
      }

      // vantagem/desvantagem
      const groups1 =
        rollOnce();

      const groups2 =
        rollOnce();

      const keys =
        Object.keys(groups1);

      const count =
        Math.min(
          ...keys.map(
            k => groups1[k].length
          )
        );

      // único dado sem operação
      if (
        count === 1 &&
        !operations.length &&
        keys.length === 1
      ) {

        const key =
          keys[0];

        const cleanKey =
          key.replace(/^[-+]/, '');

        const all = [
          ...groups1[key],
          ...groups2[key]
        ];

        const final =
          mode === 'vantagem'
            ? Math.max(...all)
            : Math.min(...all);

        return msg.reply(
          `🎲 ${all.length}${cleanKey} = ${all.join(', ')}\n\n` +
          `⚡ resultado final (${mode}): ${final} ⚡`
        );
      }

      // único dado com operação
      if (
        count === 1 &&
        keys.length === 1
      ) {

        const key =
          keys[0];

        const cleanKey =
          key.replace(/^[-+]/, '');

        const v1 =
          groups1[key][0];

        const v2 =
          groups2[key][0];

        const total1 =
          applyOperations(v1);

        const total2 =
          applyOperations(v2);

        const final =
          mode === 'vantagem'
            ? Math.max(total1, total2)
            : Math.min(total1, total2);

        return msg.reply(
          `🎲 1${cleanKey} = ${v1} ${operations
            .map(o =>
              `${o.op} ${o.value}`
            )
            .join(' ')} = ${total1}\n` +

          `🎲 1${cleanKey} = ${v2} ${operations
            .map(o =>
              `${o.op} ${o.value}`
            )
            .join(' ')} = ${total2}\n\n` +

          `⚡ resultado final (${mode}): ${final} ⚡`
        );
      }

      // múltiplos dados
      let lines = [];
      let results = [];

      for (
        let i = 0;
        i < count;
        i++
      ) {

        let vals = [];
        let ops = [];

        for (const key of keys) {

          const op =
            key.startsWith('-')
              ? '-'
              : '+';

          const v1 =
            groups1[key][i];

          const v2 =
            groups2[key][i];

          // escolhe maior ou menor
          const chosen =
            mode === 'vantagem'
              ? Math.max(v1, v2)
              : Math.min(v1, v2);

          vals.push(chosen);
          ops.push(op);
        }

        let total = 0;

        vals.forEach((v, idx) => {

          if (ops[idx] === '+') {

            total += v;

          } else {

            total -= v;
          }
        });

        // aplica operações
        total =
          applyOperations(total);

        results.push(total);

        const exp =
          buildExpression(
            vals,
            ops
          );

        const diceLabel =
          diceParts
            .map(
              d => `${d.op}${d.dice}`
            )
            .join(' ');

        lines.push(
          `🎲 ${diceLabel} → ${exp} = ${total}`
        );
      }

      const final =
        mode === 'vantagem'
          ? Math.max(...results)
          : Math.min(...results);

      return msg.reply(
        `${lines.join('\n')}\n\n⚡ Resultado final (${mode}): ${final} ⚡`
      );

    } catch (err) {

      return msg.reply(err.message);
    }
  }
};