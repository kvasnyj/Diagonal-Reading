chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(
      tab.id, { file: "content_script.js" } );
});
