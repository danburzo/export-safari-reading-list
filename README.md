# Export Safari Reading List

[![Greenkeeper badge](https://badges.greenkeeper.io/danburzo/export-safari-reading-list.svg)](https://greenkeeper.io/)

This is a small script that exports bookmarks from Safari's Reading List to the (rather bizarre) [Netscape Bookmark File Format](http://fileformats.archiveteam.org/wiki/Netscape_bookmarks) which you can import into bookmarking sites such as [Pinboard](https://pinboard.in). 

## Why.

I want to archive the things I find while browsing on my phone (which I save with _Add to reading list_). It's nice that they sync to my desktop Safari, but there's no way to export the Reading List. This script takes the Reading List and exports it to an antiquated yet widely supported HTML format. 

## Usage

```shell
~$ cd export-safari-reading-list
export-safari-reading-list$ npm install
export-safari-reading-list$ node index.js
```

You'll find the generated `bookmarks.html` file in the `dist/` folder.
