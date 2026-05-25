module.exports = {
  name: ['letra', 'lirica', 'musica', 'lyrics'],

  async execute(msg, args) {

    if (!args.length) {
      return msg.reply(
        'use: !letra nome da música\nou\n!letra artista - música'
      );
    }

    const query = args.join(' ');

    let artist = null;
    let song = null;

    try {

      // =========================
      // artista - música
      // =========================

      if (query.includes(' - ')) {

        const split = query.split(' - ');

        artist = split[0].trim();
        song = split[1].trim();

      } else {

        // =========================
        // busca automática
        // =========================

        const url =
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;

        console.log('Buscando música:', url);

        const searchSong =
          await fetch(url);

        const result =
          await searchSong.json();

        console.log('Resultado iTunes:', result);

        if (
          !result.results ||
          !result.results.length
        ) {

          return msg.reply(
            'Não encontrei essa música.'
          );
        }

        artist =
          result.results[0].artistName;

        song =
          result.results[0].trackName;
      }

      console.log('Artista:', artist);
      console.log('Música:', song);

      // remove acentos
      const normalize = (text) => {
        return text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      };

      // =========================
      // tenta lyrics.ovh primeiro
      // =========================

      const tries = [

        {
          artist,
          song
        },

        {
          artist: normalize(artist),
          song: normalize(song)
        },

        {
          artist: artist.split('&')[0].trim(),
          song
        }
      ];

      let lyrics = null;

      for (const attempt of tries) {

        const lyricsUrl =
          `https://api.lyrics.ovh/v1/${encodeURIComponent(attempt.artist)}/${encodeURIComponent(attempt.song)}`;

        console.log('Tentando lyrics.ovh:', lyricsUrl);

        try {

          const search =
            await fetch(lyricsUrl);

          const data =
            await search.json();

          console.log('Resposta lyrics.ovh:', data);

          if (data && data.lyrics) {

            lyrics = data.lyrics;
            console.log('Letra encontrada no lyrics.ovh');
            break;
          }

        } catch (e) {

          console.log('Falhou tentativa lyrics.ovh');
        }
      }

      // =========================
      // fallback pra API alternativa
      // =========================

      if (!lyrics) {

        try {

          const fallbackUrl =
            `https://some-random-api.com/lyrics?title=${encodeURIComponent(`${artist} ${song}`)}`;

          console.log('Tentando fallback:', fallbackUrl);

          const fallbackSearch =
            await fetch(fallbackUrl);

          const fallbackData =
            await fallbackSearch.json();

          console.log('Resposta fallback:', fallbackData);

          if (
            fallbackData &&
            fallbackData.lyrics
          ) {

            lyrics =
              fallbackData.lyrics;

            console.log('Letra encontrada no fallback');
          }

        } catch (e) {

          console.log('Fallback falhou');
        }
      }

      // =========================
      // não encontrou
      // =========================

      if (!lyrics) {

        return msg.reply(
          `Não encontrei a letra.\n\n🎵 ${song}\n👤 ${artist}`
        );
      }

      const text =
        `🎵 ${song}\n` +
        `👤 ${artist}\n\n` +
        `${lyrics}`;

      // =========================
      // corta mensagem grande
      // =========================

      if (text.length > 1900) {

        for (
          let i = 0;
          i < text.length;
          i += 1900
        ) {

          await msg.reply(
            text.slice(i, i + 1900)
          );
        }

        return;
      }

      return msg.reply(text);

    } catch (err) {

      console.error(err);

      return msg.reply(
        'Erro ao buscar letra.'
      );
    }
  }
};