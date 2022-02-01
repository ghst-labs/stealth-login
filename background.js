// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.debugger.attach({
        tabId: tab.id
    }, version,
        onAttach.bind(null, tab.id));
});

var version = "1.3";

function onAttach(tabId) {
    if (chrome.runtime.lastError) {
        alert(chrome.runtime.lastError.message);
        return;
    }

    chrome.windows.create({
        url: "headers.html?" + tabId,
        type: "popup",
        width: 550,
        height: 800
    });
}

function reloadScript() {
    const scripts = document.getElementsByTagName('script');

    Array.from(scripts)
        .filter(script => script.src.includes("ns_common"))
        .forEach(script => {
            const url = new URL(script.src, script.src);
            url.searchParams.set('forceReload', Date.now());
            script.src = url.href;
        });
}