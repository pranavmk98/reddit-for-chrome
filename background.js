var firstRequest = true;
function startRequest() {
	UpdateIfReady(firstRequest);
	firstRequest = false;
	window.setTimeout(startRequest, 60000);
}
//If any options are not already set, they will be set to defaults here
SetInitialOption("reddit.RequestInterval", 1200000);
SetInitialOption("reddit.BackgroundTabs", false);

startRequest();
