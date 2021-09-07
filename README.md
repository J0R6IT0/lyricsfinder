
# @j0r6it0/lyricsfinder

A simple module to get the lyrics of a song. It uses Genius as the main option and falls back to Google if no song is found. If nothing is found, it returns ```false```. Song titles are automatically 'cleaned' for a more reliable search. ("Passenger | Let Her Go (Official Video)" will be transformed to "passenger let her go"). Should work with songs in every language.

## Install
```sh
npm i @j0r6it0/lyricsfinder
```
## Usage
```js
const findLyrics = require('@j0r6it0/lyricsfinder');


const lyrics = await findLyrics("Alan Walker Alone", { useGenius: true, useGoogle: true });

if (lyrics == false) return console.log("Lyrics not found");

console.log(lyrics);
```
## Options
```
geniusToken: Genius Api Access Token [Optional]
useGenius: true/false [Optional] (Default: true)
useGoogle: true/false [Optional] (Default: true)
```
