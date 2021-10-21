const fetch = require('node-fetch');
const { load } = require('cheerio');
const entities = require('entities');
const delimiter1 = '</div></div></div></div><div class="hwc"><div class="BNeawe tAd8D AP7Wnd"><div><div class="BNeawe tAd8D AP7Wnd">';
const delimiter2 = '</div></div></div></div></div><div><span class="hwc"><div class="BNeawe uEec3 AP7Wnd">';

const reqOpt = {
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
	},
};

const searchGenius = (query) => {
	return new Promise((resolve, reject) => {
		fetch(`https://genius.com/api/search/song?q=${encodeURIComponent(query)}`, reqOpt)
			.then(res => res.json())
			.then(body => body.response.sections[0].hits.length ? body.response.sections[0].hits[0].result : undefined)
			.then(resolve)
			.catch(reject);
	});
};

const searchGeniusToken = (query, token) => {
	return new Promise((resolve, reject) => {
		fetch(`https://api.genius.com/search?q=${encodeURIComponent(query)}&access_token=${token}`, reqOpt)
			.then(res => res.json())
			.then(body => body.response.hits.length ? body.response.hits[0].result : undefined)
			.then(resolve)
			.catch(reject);
	});
};

const searchGoogle = (query) => {
	return new Promise((resolve, reject) => {
		fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}+lyrics`)
			.then(resolve)
			.catch(reject);
	});
};

const findLyrics = async (query = '', { token = 'none', useGenius = true, useGoogle = true }) => {
	let lyrics = '';
	let song = '';

	query = query
		.toLowerCase()
		.replace(new RegExp(/((\[|\()(?!.*?(remix|edit)).*?(\]|\))|\/+|-+| x |,|"|video oficial|clip officiel|official lyric video|five nights at freddy's (3|4) song| ft.?|\|+|yhlqmdlg|x100pre|prod. afro bros & jeon|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]|\u274C)/, 'g'), '')
		.replace(new RegExp(/  +/, 'g'), ' ')
		.trim();

	if (!query) {
		console.error('ERROR: Query cannot be empty.');
		return false;
	}
	if (typeof query !== 'string') {
		console.error('ERROR: Query must be a string.');
		return false;
	}
	if (useGenius) {
		if (token == 'none') {
			song = await searchGenius(query);
			for (let i = 0; i < 15; i++) {
				if (song) {
					const html = await (await fetch(song.url, reqOpt)).text();
					lyrics = load(html)('.lyrics').text().trim();
					if (lyrics && typeof lyrics !== 'undefined' && lyrics.length >= 5) break;
				}
				else {break;}
			}
		}
		else {
			song = await searchGeniusToken(query, token);
			for (let i = 0; i < 15; i++) {
				if (song) {
					const html = await (await fetch(song.url, reqOpt)).text();
					lyrics = load(html)('.lyrics').text().trim();
					if (lyrics && typeof lyrics !== 'undefined' && lyrics.length >= 5) break;
				}
				else {break;}
			}
		}

		if (lyrics && typeof lyrics !== 'undefined' && lyrics.length >= 5) return { lyrics: lyrics, title: song.title, artist: song.primary_artist.name, thumbnail: song.song_art_image_url };
	}
	if (useGoogle) {
		try {
			lyrics = await searchGoogle(query);
			lyrics = await lyrics.textConverted();
			[, lyrics] = lyrics.split(delimiter1);
			[lyrics] = lyrics.split(delimiter2);
			lyrics = entities.decodeHTML(lyrics);
			lyrics = lyrics.replace(new RegExp(/<span dir="rtl">|<\/span>/, 'g'), '').trim();

		}
		catch (e) {
			lyrics = '';
		}
		if (lyrics && typeof lyrics !== 'undefined' && lyrics.length >= 5) return { lyrics: lyrics, title: undefined, artist: undefined, thumbnail: undefined };
	}
	return false;
};

module.exports = findLyrics;
