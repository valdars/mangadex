// compatibility for chrome
if(!window.browser) {
  browser = chrome;
}

function openMyPage() {
  browser.tabs.create({
    "url": "/mangadex.html"
  });
}

function rewriteUserAgentHeader(e) {
  let found = false;
  for (var header of e.requestHeaders) {
    if (header.name.toLowerCase() === "referer") {
      found = true;
      header.value = 'https://mangadex.com/follows/';
    }
    if (header.name.toLowerCase() === "origin") {
      found = true;
      header.value = 'https://mangadex.com/follows/';
    }
  }
  if(!found) {
    e.requestHeaders.push({name:"Referer",value:'https://mangadex.com/follows/'})
  }
  return {requestHeaders: e.requestHeaders};
}

/*
Add openMyPage() as a listener to clicks on the browser action.
Browser.browserAction seems to be undefined randomly
*/
browser.browserAction.onClicked.addListener(openMyPage);

browser.webRequest.onBeforeSendHeaders.addListener(rewriteUserAgentHeader,
  {urls: ['https://mangadex.com/*']},
["blocking", "requestHeaders"]);