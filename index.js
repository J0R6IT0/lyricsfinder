const fetch = require("node-fetch");
const { load } = require("cheerio");
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
  query = query
    .replace(new RegExp(/((\[|\()(?!.*?(remix|edit)).*?(\]|\))|\/+|-+| x |,|"|video oficial|five nights at freddy's (3|4) song| ft.?|\|+|yhlqmdlg|x100pre|prod. afro bros & jeon)/, 'g'), '')
    .replace(new RegExp(/  +/, 'g'), ' ')

  if (!query || typeof query !== "string") return;
  const song = await search(query);
  if (!song) return;
  const html = await (await fetch(song.url, reqOpt)).text();
  var lyrics = load(html)(".lyrics").text().trim();
  if (lyrics) {
    return lyrics
  } else {
    try {
      lyrics = await fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}+lyrics`);
      lyrics = await lyrics.textConverted();
      [, lyrics] = lyrics.split(delimiter1);
      [lyrics] = lyrics.split(delimiter2);
    } catch (e) {
      console.log(e);
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
            lyrics = await lyrics.textConverted(); // Convert to text
            [, lyrics] = lyrics.split(delimiter1); // Split it by the first delimiter
            [lyrics] = lyrics.split(delimiter2); // Split it by the second delimiter
          } catch {
            lyrics = ''; // Give up, couldn't find lyrics
          }
        }
      }
    }

    const split = lyrics.split('\n');
    var final = '';
    for (var i = 0; i < split.length; i++) {
      final = `${final}${split[i]}\n`;
    }
    return final.trim() || false; // Return false if no lyrics were found
  }

}

module.exports = findLyrics;
