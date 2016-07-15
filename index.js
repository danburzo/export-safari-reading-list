var plist = require('simple-plist');
var fs = require('fs-extra');
var path = require('path');

// This is where Safari keeps its bookmark file
var READING_LIST_FILE = path.join(process.env.HOME, '/Library/Safari/Bookmarks.plist');

// Narrow down to the Reading List items from Safari's bookmarks file
function getReadingList(data) {
	var reading_list = data.Children.find(function(item) {
		return item.Title === 'com.apple.ReadingList';
	});
	return reading_list && reading_list.Children ? reading_list.Children : [];
};

// For each item in the Reading List, extract data into a saner JSON structure. 
function parseBookmark(bookmark) {
	return {
		href: bookmark.URLString,
		title: bookmark.ReadingListNonSync.Title || bookmark.URIDictionary.title,
		time: bookmark.ReadingList.DateAdded,
		description: bookmark.ReadingList.PreviewText || ''
	}
};

// Format the JSON object for the bookmark item into a HTML fragment
function item_formatter(item) {

	// transform the standard timestamp to `seconds-from-1970` timestamp used in Netscape format
	var timestamp = (new Date(item.time).getTime() + '').replace(/\d{3}$/, '');

	// sanitize the HTML description so it does not break the markup (further)
	var description = sanitize(item.description);

	return `<DT><A HREF="${item.href}" ADD_DATE="${timestamp}">${item.title}</A>
		<DD>${description}
	`;
};

// Wrap the HTML fragments for the bookmark items in the Netscape Bookmark File Format.
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

// Generic method to sanitize a HTML string
function sanitize(str) {
	return (str + "")
		.replace(/&/g,"&amp;")
		.replace(/</g,"&lt;")
		.replace(/>/g,"&gt;")
		.replace(/"/g,"&quot;")
		.replace(/'/g,"&#x27;")
};

var plist_data = plist.readFileSync(READING_LIST_FILE);
var reading_list = getReadingList(plist_data);
var bookmarks = reading_list.map(parseBookmark);
var html_bookmarks = bookmarks.map(item_formatter).join('\n');

fs.outputFile(path.join('dist', 'bookmarks.html'), netscape_template(html_bookmarks));
