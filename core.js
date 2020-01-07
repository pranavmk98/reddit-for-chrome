var maxFeedItems = 15;
var req;
var buildPopupAfterResponse = false;
var OnFeedSuccess = null;
var OnFeedFail = null;
var retryMilliseconds = 120000;
var rss_url = "http://www.reddit.com/.rss";
var reddit_url = "https://www.reddit.com/";

function SetInitialOption(key, value) {
	if (localStorage[key] == null) {
		localStorage[key] = value;
	}
}

function UpdateIfReady(force) {
	var lastRefresh = parseFloat(localStorage["reddit.LastRefresh"]);
	var interval = parseFloat(localStorage["reddit.RequestInterval"]);
	var nextRefresh = lastRefresh + interval;
	var curTime = parseFloat((new Date()).getTime());
	var isReady = (curTime > nextRefresh);
	var isNull = (localStorage["reddit.LastRefresh"] == null);
	if ((force == true) || (localStorage["reddit.LastRefresh"] == null)) {
		UpdateFeed();
	}
	else {
	  if (isReady) {
	    UpdateFeed();
	  }
	}
}

function UpdateFeed() {
  $.ajax({type:'GET', dataType:'xml', url: rss_url, timeout:5000, success:onRssSuccess, error:onRssError, async: false});
}

function onRssSuccess(doc) {
	if (!doc) {
		handleFeedParsingFailed("Not a valid feed.");
		return;
	}

	links = parseredditLinks(doc);
	SaveLinksToLocalStorage(links);
	if (buildPopupAfterResponse == true) {
		buildPopup(links);
		buildPopupAfterResponse = false;
	}
	localStorage["reddit.LastRefresh"] = (new Date()).getTime();
}

function updateLastRefreshTime() {
  localStorage["reddit.LastRefresh"] = (new Date()).getTime();
}

function DebugMessage(message) {
  var notification = webkitNotifications.createNotification(
    "icon48.png",
    "DEBUG",
    printTime(new Date()) + " :: " + message
  );
  notification.show();
}


function onRssError(xhr, type, error) {
  handleFeedParsingFailed('Failed to fetch RSS feed.');
}

function handleFeedParsingFailed(error) {
  //var feed = document.getElementById("feed");
  //feed.className = "error"
  //feed.innerText = "Error: " + error;
  localStorage["reddit.LastRefresh"] = localStorage["reddit.LastRefresh"] + retryMilliseconds;
}

function parseXml(xml) {
  var xmlDoc;
  try {
    xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
    xmlDoc.async = false;
    xmlDoc.loadXML(xml);
  } 
  catch (e) {
    xmlDoc = (new DOMParser).parseFromString(xml, 'text/xml');
  }

  return xmlDoc;
}

function parseredditLinks(doc) {
	doc_json = xmlToJson(doc).feed;
	console.log(doc_json);
	var entries = doc_json['entry'];
	// console.log(entries);
	if (entries.length == 0) {
	  entries = doc_json['item'];
	}
	var count = Math.min(entries.length, maxFeedItems);
	var links = new Array();
	for (var i=0; i < count; i++) {
		item = entries[i];
		var redditLink = new Object();

		//Grab the title
		console.log(item);
		var itemTitle = item.title;
		if (itemTitle) {
			redditLink.Title = itemTitle["#text"];
		} else {
			redditLink.Title = "Unknown Title";
		}

		//Grab the Link
		var itemLink = item["link"]["@attributes"]["href"];
		console.log(item["link"], itemLink, item["link"]["@attributes"]);
		if (itemLink) {
			redditLink.Link = itemLink;
		} else {
			redditLink.Link = '';
		}

		//Grab the subreddit
		var subreddit = item["category"]["@attributes"]["label"];
		if (subreddit) {
			redditLink.subreddit = subreddit;
			redditLink.subredditLink = reddit_url + subreddit;
		} else {
			redditLink.subreddit = 'r/';
		}

		links.push(redditLink);
	}
	console.log(links);
	return links;
}

function SaveLinksToLocalStorage(links) {
	localStorage["reddit.NumLinks"] = links.length;
	for (var i=0; i<links.length; i++) {
		localStorage["reddit.Link" + i] = JSON.stringify(links[i]);
	}
}

function RetrieveLinksFromLocalStorage() {
	var numLinks = localStorage["reddit.NumLinks"];
	if (numLinks == null) {
		return null;
	}
	else {
		var links = new Array();
		for (var i=0; i<numLinks; i++) {
			links.push(JSON.parse(localStorage["reddit.Link" + i]))
		}
		return links;
	}
}

function openOptions() {
	var optionsUrl = chrome.extension.getURL('options.html');
	chrome.tabs.create({url: optionsUrl});
}

function openLink(e) {
  e.preventDefault();
  openUrl(this.href, (localStorage['reddit.BackgroundTabs'] == 'false'));
}

function openLinkFront(e) {
	e.preventDefault();
	openUrl(this.href, true);
}

function printTime(d) {
	var hour   = d.getHours();
	var minute = d.getMinutes();
	var ap = "AM";
	if (hour   > 11) { ap = "PM";             }
	if (hour   > 12) { hour = hour - 12;      }
	if (hour   == 0) { hour = 12;             }
	if (minute < 10) { minute = "0" + minute; }
	var timeString = hour +
					':' +
					minute +
					" " +
					ap;
  return timeString;
}

// Show |url| in a new tab.
function openUrl(url, take_focus) {
  // Only allow http and https URLs.
  if (url.indexOf("http:") != 0 && url.indexOf("https:") != 0) {
    return;
  }
  chrome.tabs.create({url: url, selected: take_focus});
}
	
function hideElement(id) {
	var e = document.getElementById(id);
	e.style.display = 'none';
}

function showElement(id) {
	var e = document.getElementById(id);
	e.style.display = 'block';
}

function toggle(id) {
	var e = document.getElementById(id);
	if(e.style.display == 'block')
		e.style.display = 'none';
	else
		e.style.display = 'block';
}
