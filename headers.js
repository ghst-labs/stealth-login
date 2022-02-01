// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const DEFAULT_PORT = 55975;

const scriptUrlPatterns = [
    '*'
]




// chrome.tabs.query( //get current Tab
// {
//     currentWindow: true,
//     active: true
// },
// function(tabArray) {
//     currentTab = tabArray[0];
//     chrome.debugger.attach({ //debug at current tab
//         tabId: currentTab.id
//     }, version, onAttach.bind(null, currentTab.id));
// }
// )
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
    }, "Network.enable");
    chrome.debugger.onEvent.addListener(allEventHandler);


    function allEventHandler(debuggeeId, message, params) {

        if (tabId != debuggeeId.tabId) {
            return;
        }

        if (message == "Network.responseReceived") { //response return 
            chrome.debugger.sendCommand({
                tabId: tabId
            }, "Network.getResponseBody", {
                "requestId": params.requestId
            }, function (response) {
                // you get the response body here!
                try {
                    console.log(response.body)
                    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    // Up until here works
                    if (response.body.access_token) {
                        console.log(response)

                        var xhr = new XMLHttpRequest();
                        var port = document.getElementById("port").value;
                        var url = "http://localhost:" + port + "/v1/unite";
                        xhr.open("POST", url, true);
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.send(JSON.stringify({
                            accessToken: response.access_token
                        }));

                        // Refresh Page
                        chrome.tabs.executeScript(tabId, {
                            code: '(' + reloadPage + ')();' //argument here is a string but function.toString() returns function's code
                        }, (results) => {
                            console.log('page reloaded')
                        });
                    } // End of if response.body.access_token
                } catch (error) {
                    null
                }


            }); // End of sendCommand

        } // End of if Netwrok.responseReceived

    } // End of allEventHandler

}) // End of Window Listener
