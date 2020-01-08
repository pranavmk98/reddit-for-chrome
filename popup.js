window.onload = function(){
  main();
  setupEvents();
};
function setupEvents() {
  $('#refresh').click(refreshLinks);
  $('#searchbox').keypress(searchOnEnter);
  $('a#options').click(function(){
    openOptions();
  });
}
function main() {
  if (localStorage['reddit.NumLinks'] == null) {
    buildPopupAfterResponse = true;
    UpdateFeed(frontpage_rss);
  }
  else {
    buildPopup(RetrieveLinksFromLocalStorage());
  }
}

function buildPopup(links) {
  var header = document.getElementById("header");
  var feed = document.getElementById("feed");
  var issueLink = document.getElementById("issues");
  issueLink.addEventListener("click", openLinkFront);

  //Setup Title Link
  var title = document.getElementById("title");
  title.addEventListener("click", openLink);
  
  //Setup subreddit button
  var searchButton = document.getElementById("searchbutton");
  searchButton.addEventListener("click", getSubreddit);

  for (var i=0; i<links.length; i++) {
    redditLink = links[i];
    var row = document.createElement("tr");
    row.className = "link";
    var num = document.createElement("td");
    num.innerText = i+1;
    var link_col = document.createElement("td")

    // Link to post
    var title = document.createElement("a");
      title.className = "link_title";
      title.innerText = redditLink.Title;
      title.href = redditLink.Link;
      title.addEventListener("click", openLink);

    // Link to subreddit
    var subreddit = document.createElement("a");
      subreddit.className = "subreddit";
      subreddit.innerText = "(" + redditLink.subreddit + ")";
      subreddit.href = redditLink.subredditLink;
      subreddit.addEventListener("click", openLink);

      link_col.appendChild(title);
    link_col.appendChild(subreddit);
    row.appendChild(num);
    row.appendChild(link_col)
    feed.appendChild(row);
  }
  hideElement("spinner");
  showElement("container");
}

function searchOnEnter(e) {
  if (e.keyCode == 13) {
    getSubreddit();
  }
}

function getSubreddit() {
  var searchBox = document.getElementById("searchbox");
  var sub = searchBox.value;
  if (sub.length > 0) {
    var rss_url = "https://www.reddit.com/r/" + sub + ".rss";
    var linkTable = document.getElementById("feed");
    while(linkTable.hasChildNodes()) linkTable.removeChild(linkTable.firstChild); //Remove all current links
    toggle("container");
    toggle("spinner");
    buildPopupAfterResponse = true;
    UpdateSubredditFeed(rss_url);
  }
}

function refreshLinks() {
  var linkTable = document.getElementById("feed");
  while(linkTable.hasChildNodes()) linkTable.removeChild(linkTable.firstChild); //Remove all current links
  toggle("container");
  toggle("spinner");
  buildPopupAfterResponse = true;
  UpdateFeed(frontpage_rss);
  updateLastRefreshTime();
}
