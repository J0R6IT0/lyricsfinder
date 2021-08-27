
# @j0r6it0/lyricsfinder

A simple module to get the lyrics of a song. It uses Genius as the main option and falls back to Google if no song is found.

## Install
```sh
npm i @j0r6it0/lyricsfinder
```
## Usage
```js
const findLyrics = require('@j0r6it0/lyricsfinder');

const lyrics = await findLyrics("Alan Walker Alone");
```
