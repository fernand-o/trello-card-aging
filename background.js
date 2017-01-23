chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    if ((changeInfo.title != undefined) && (changeInfo.title.includes('|'))) {
        chrome.tabs.executeScript(tab.id, {
            code: "start_aging('" + changeInfo.title + "');"
        });
    }

});