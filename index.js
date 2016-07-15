var plist = require('simple-plist');
var fs = require('fs-extra');
var path = require('path');

var READING_LIST_FILE = path.join(process.env.HOME, '/Library/Safari/Bookmarks.plist');

function netscape_template(content) {
	return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks Menu</H1>
<DL><p>
${content}
</DL><p>`;
};

function sanitize(str) {
	return (str+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")
};

function item_formatter(item) {
	var timestamp = (new Date(item.time).getTime() + '').replace(/\d{3}$/, '');
	var description = sanitize(item.description);
	return `<DT><A HREF="${item.href}" ADD_DATE="${timestamp}">${item.title}</A>
		<DD>${description}
	`;
};

function getReadingList(data) {
	var reading_list = data.Children.find(function(item) {
		return item.Title === 'com.apple.ReadingList';
	});
	return reading_list ? reading_list.Children : [];
};

function parseBookmark(bookmark) {
	return {
		href: bookmark.URLString,
		title: bookmark.ReadingListNonSync.Title || bookmark.URIDictionary.title,
		time: bookmark.ReadingList.DateAdded,
		description: bookmark.ReadingList.PreviewText || ''
	}
};

var reading_list = getReadingList(plist.readFileSync(READING_LIST_FILE)).map(parseBookmark);
var html = netscape_template(reading_list.map(item_formatter).join('\n'));

fs.outputFile(path.join('dist', 'bookmarks.html'), html);
