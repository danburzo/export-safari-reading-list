var plist = require('simple-plist');
var fs = require('fs-extra');
var path = require('path');

// This is where Safari keeps its bookmark file on a Mac
const READING_LIST_FILE = path.join(process.env.HOME, '/Library/Safari/Bookmarks.plist');

// This is where we'll output the bookmarks
const OUTPUT_FILE = path.join('dist', 'bookmarks.html');

/* 
	Process the reading list PLIST file and output
	a Netscape-formatted HTML file.
*/

plist.readFile(READING_LIST_FILE, function(err, plist_data) {
	if (err) { throw err; }
	var bookmarks = find_bookmarks(plist_data)
		.map(parse_bookmark)
		.map(bookmark_to_html)
		.join('\n');
	fs.outputFile(OUTPUT_FILE, netscape_template(bookmarks));
});

/*
	Helper functions used in processing the bookmarks.
*/

// Narrow down to the Reading List items from Safari's bookmarks file
function find_bookmarks(data) {
	var reading_list = data.Children.find(function(item) {
		return item.Title === 'com.apple.ReadingList';
	});
	return reading_list && reading_list.Children ? reading_list.Children : [];
};

// For each item in the Reading List, extract data into a saner JSON structure. 
function parse_bookmark(bookmark) {
	return {
		href: bookmark.URLString,
		title: bookmark.ReadingListNonSync.Title || bookmark.URIDictionary.title,
		time: bookmark.ReadingList.DateAdded,
		description: bookmark.ReadingList.PreviewText || ''
	}
};

// Format the JSON object for the bookmark item into a HTML fragment
function bookmark_to_html(item) {

	// Transform the Javascript timestamp (in milliseconds from Jan 1, 1970) to the 
	// Epoch time (in seconds from Jan 1, 1970) used in Netscape format
	var timestamp = Math.round(new Date(item.time).getTime() / 1000);

	// Sanitize the HTML description so it does not break the markup (further)
	var description = sanitize_html(item.description);

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

// A generic method to sanitize a HTML string, to make sure we don't break the markup 
// any further than it already is in the Netscape Bookmark File Format.
function sanitize_html(str) {
	return (str + "")
		.replace(/&/g,"&amp;")
		.replace(/</g,"&lt;")
		.replace(/>/g,"&gt;")
		.replace(/"/g,"&quot;")
		.replace(/'/g,"&#x27;")
};
