const fetch = require("node-fetch");
const { load } = require("cheerio");
const entities = require("entities");
const delimiter1 = '</div></div></div></div><div class="hwc"><div class="BNeawe tAd8D AP7Wnd"><div><div class="BNeawe tAd8D AP7Wnd">';
const delimiter2 = '</div></div></div></div></div><div><span class="hwc"><div class="BNeawe uEec3 AP7Wnd">';

const reqOpt = {
  headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
  }
}


const search = (query) => {
  return new Promise((resolve, reject) => {
    fetch(`https://genius.com/api/search/song?q=${encodeURIComponent(query)}`, reqOpt)
      .then(res => res.json())
      .then(body => body.response.sections[0].hits.length ? body.response.sections[0].hits[0].result : undefined)
      .then(resolve)
      .catch(reject);
  });
}

const findLyrics = async (query) => {
  let lyrics = "";
  let song = "";
  query = query
    .toLowerCase()
    .replace(new RegExp(/((\[|\()(?!.*?(remix|edit)).*?(\]|\))|\/+|-+| x |,|"|video oficial|clip officiel|official lyric video|five nights at freddy's (3|4) song| ft.?|\|+|yhlqmdlg|x100pre|prod. afro bros & jeon|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]|\u274C)/, 'g'), '')
    .replace(new RegExp(/  +/, 'g'), ' ')
  if (!query || typeof query !== "string") return false;

  for (let i = 0; i < 15; i++) {
    song = await search(query);
    if (song) {
      const html = await (await fetch(song.url, reqOpt)).text();
      lyrics = load(html)(".lyrics").text().trim();
      if (lyrics && typeof lyrics !== 'undefined' && lyrics.length >= 5) break;
    } else {break}
  }

  if (lyrics && typeof lyrics !== 'undefined' && lyrics.length >= 5) return lyrics;
  try {
    lyrics = await fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}+lyrics`);
    lyrics = await lyrics.textConverted();
    [, lyrics] = lyrics.split(delimiter1);
    [lyrics] = lyrics.split(delimiter2);
  } catch (e) {
    try {
      lyrics = await fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}+song+lyrics`);
      lyrics = await lyrics.textConverted();
      [, lyrics] = lyrics.split(delimiter1);
      [lyrics] = lyrics.split(delimiter2);
    } catch {
      try {
        lyrics = await fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}+song`);
        lyrics = await lyrics.textConverted();
        [, lyrics] = lyrics.split(delimiter1);
        [lyrics] = lyrics.split(delimiter2);
      } catch {
        try {
          lyrics = await fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
          lyrics = await lyrics.textConverted();
          [, lyrics] = lyrics.split(delimiter1);
          [lyrics] = lyrics.split(delimiter2);
        } catch {
          return false;
        }
      }
    }
  }

  const split = lyrics.split('\n');
  var final = '';
  for (var i = 0; i < split.length; i++) {
    final = `${final}${split[i]}\n`;
  }

  final = entities.decodeHTML(final);

  if (typeof final == 'undefined' || final.length < 5) return false;
  return final.replace(new RegExp(/<span dir="rtl">|<\/span>/, 'g'), '').trim() || false;
}

module.exports = findLyrics;
