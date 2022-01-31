// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const DEFAULT_PORT = 5000;

var tabId = parseInt(window.location.search.substring(1));

function reloadScript() {
    var scripts = document.getElementsByTagName('script');
    var firstScriptToDelete = document.querySelector('script[src*="ns_common.js?seed"]');
    console.log(firstScriptToDelete)
    firstScriptToDelete.parentNode.removeChild(firstScriptToDelete);

    //var secondScriptToDelete =  document.querySelector('script[src*="ns_common.js?async"]');
    //console.log(secondScriptToDelete)
    //secondScriptToDelete.parentNode.removeChild(secondScriptToDelete);

    var thirdScriptToDelete = document.querySelector('script[src*="js/nordstrom.js"]');
    console.log(thirdScriptToDelete)
    thirdScriptToDelete.parentNode.removeChild(thirdScriptToDelete)

    var newScript = document.createElement("script");
    newScript.src = "https://www.nordstrom.com/mwp/integration/ns_common.js?async";
    document.head.appendChild(newScript);
    return "script re-added";
}

function reloadPage() {
    location.reload();
}

function doStuffWithDom(domContent) {
    console.log('I received the following DOM content:\n' + domContent);
}

window.addEventListener("load", function () {
    chrome.debugger.sendCommand({
        tabId: tabId
    }, "Fetch.enable");
    chrome.debugger.onEvent.addListener(onEvent);
    document.getElementById("cookieNumber").innerText = "0";
    document.getElementById("port").value = DEFAULT_PORT.toString();
});

window.addEventListener("unload", function () {
    chrome.debugger.detach({
        tabId: tabId
    });
});

// Creates the request to communicate with the bot on the localhost + port

var requests = {};

const fullfillRequest = (debuggeeId, requestId, reqHeaders) => {
    chrome.debugger.sendCommand(
        debuggeeId, "Fetch.continueRequest",
        {
            requestId: requestId
        },
        function (e) {
            var headerStore = {};
            for (var headerKey in reqHeaders) {
                if (headerKey.startsWith("Cookie"))
                    headerStore['CookieString'] = reqHeaders[headerKey];
            }
            headerStore['Site'] = 'FansEdge';
            headerStore['UserAgent'] = window.navigator.userAgent;
            var req = new XMLHttpRequest();
            var port = document.getElementById("port").value;
            var baseUrl = "http://localhost:" + port + "/api/receiveHeaders";
            req.open("POST", baseUrl, true);
            req.setRequestHeader("Content-type", "application/json");
            req.send(JSON.stringify(headerStore));
            req.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    console.log("Got response 200!");
                    document.getElementById("cookieNumber").innerText = (Number(document.getElementById("cookieNumber").innerText) + 1).toString();
                    //first delete cookies
                    chrome.cookies.getAll({ domain: "fansedge.com" }, function (cookies) {
                        for (var i = 0; i < cookies.length; i++) {
                            chrome.cookies.remove({ url: "https://www.fansedge.com" + cookies[i].path, name: cookies[i].name });
                        }
                    });

                    //then reload page
                    chrome.tabs.executeScript(tabId, {
                        code: '(' + reloadPage + ')();' //argument here is a string but function.toString() returns function's code
                    }, (results) => {
                        console.log('page reloaded')
                    });
                }
            }

        });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



// TARGET HARVESTING
function onEvent(debuggeeId, message, params) {
    if (tabId != debuggeeId.tabId)
        return;

    // Gets the port from the extension pop out window
    var port = document.getElementById("port").value;

    // If the request is a POST request and the URL the request is going to contains the start of the nike login, it will run
    if (message == "Fetch.requestPaused" && params.request.method == "POST" && params.request.url.startsWith('https://s3.nikecdn.com/login')) {
        //handle target cookies

        console.log(params)


        var headerStore = {};
        headerStore['Site'] = 'Nike';
        headerStore['Type'] = 'login'
        headerStore['UserAgent'] = window.navigator.userAgent;
        var cookieString = "";
        for (var headerKey in params.request.headers) {
            if (headerKey.startsWith('X-GyJwza5Z'))
                headerStore['Header' + headerKey.split('-')[2].toUpperCase()] = params.request.headers[headerKey];
            else if (headerKey.startsWith("Cookie"))
                headerStore['CookieString'] = params.request.headers[headerKey];
        }
        let deviceInfo = JSON.parse(params.request.postData)
        headerStore['DeviceInfo'] = JSON.stringify(deviceInfo.device_info)
        var req = new XMLHttpRequest();
        var baseUrl = "http://localhost:" + port + "/api/receiveHeaders";

        req.open("POST", baseUrl, true);
        req.setRequestHeader("Content-type", "application/json");

        req.send(JSON.stringify(headerStore));

        req.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                console.log("one login cookie harvested");
                document.getElementById("cookieNumber").innerText = (Number(document.getElementById("cookieNumber").innerText) + 1).toString();

                //clear all cookies
                chrome.cookies.getAll({ domain: "target.com" }, function (cookies) {
                    for (var i = 0; i < cookies.length; i++) {
                        chrome.cookies.remove({ url: "https://target.com" + cookies[i].path, name: cookies[i].name });
                    }
                });

                chrome.cookies.getAll({ domain: "gsp.target.com" }, function (cookies) {
                    for (var i = 0; i < cookies.length; i++) {
                        chrome.cookies.remove({ url: "https://gsp.target.com" + cookies[i].path, name: cookies[i].name });
                    }
                });

                //clear all erroneous browser data for login.target.com
                chrome.debugger.sendCommand({
                    tabId: tabId
                }, "Storage.clearDataForOrigin", {
                    origin: 'https://login.target.com',
                    storageTypes: 'appcache, cookies, file_systems, indexeddb, local_storage, shader_cache, websql, service_workers, cache_storage, all, other'
                });

                //clear all erroneous browser data for www.target.com
                chrome.debugger.sendCommand({
                    tabId: tabId
                }, "Storage.clearDataForOrigin", {
                    origin: 'https://www.target.com',
                    storageTypes: 'appcache, cookies, file_systems, indexeddb, local_storage, shader_cache, websql, service_workers, cache_storage, all, other'
                });

                //then reload page
                chrome.tabs.executeScript(tabId, {
                    code: '(' + reloadPage + ')();' //argument here is a string but function.toString() returns function's code
                }, (results) => {
                    console.log('page reloaded')
                });
            }
        }
        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Fetch.failRequest", {
            requestId: params.requestId,
            errorReason: 'Failed'
        });
    }
}