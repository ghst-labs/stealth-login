// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.









const DEFAULT_PORT = 55975;


var tabId = parseInt(window.location.search.substring(1));

function navSettings(page) {
    window.location.href = `./settings/${page}.html`

}

function reloadPage() {
    function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    document.location.href = `https://s3.nikecdn.com/unite/mobile.html?androidSDKVersion=2.8.1&backendEnvironment=identity&clientId=qG9fJbnMcBPAMGibPRGI72Zr89l8CD4R&locale=en_US&mid=${uuidv4()}&uxid=com.nike.commerce.snkrs.droid&view=login#{%22event%22%20:%20%22loaded%22}`;
}


window.addEventListener("unload", function () {
    document.getElementById("status").className = "disconnected";

    chrome.debugger.detach({
        tabId: tabId
    });
});


window.addEventListener("load", function () {
    chrome.debugger.sendCommand({
        tabId: tabId
    }, "Network.enable");
    chrome.debugger.onEvent.addListener(allEventHandler);



    document.getElementById("harvest").addEventListener("click", () => {

        chrome.tabs.executeScript(tabId, {
            code: '(' + reloadPage + ')();'
        }, (results) => {
            console.log('Going to login page')
        });

    })

    document.getElementById("accounts").addEventListener("click", () => {
    })
    document.getElementById("proxies").addEventListener("click", () => {
        navSettings("proxies")
    })

    document.getElementById("options").addEventListener("click", () => {
        console.log("Options has been clicked")

    })







    function allEventHandler(debuggeeId, message, params) {

        if (tabId != debuggeeId.tabId) {
            return;
        }

        if (message == "Network.responseReceived") { //response return 
            var localhost_data_package = {};




            chrome.debugger.sendCommand({
                tabId: tabId
            }, "Network.getResponseBody", {
                "requestId": params.requestId
            }, function (response) { // you get the response body here!
                try {
                    if (JSON.parse(response.body).refresh_token) {
                        localhost_data_package["refresh_token"] = JSON.parse(response.body).refresh_token;

                        // Now that we have the refresh_token saved in localhost_data_package, we can get the info from the request!

                        chrome.debugger.sendCommand({
                            tabId: tabId
                        }, "Network.getRequestPostData", {
                            "requestId": params.requestId
                        }, function (response) {
                            try {
                                localhost_data_package["email"] = JSON.parse(response.postData).username;





                                var xhr = new XMLHttpRequest();
                                var port = DEFAULT_PORT
                                var url = "http://localhost:" + port + "/v1/unite";
                                xhr.open("POST", url, true);
                                xhr.setRequestHeader('Content-Type', 'application/json');
                                xhr.send(JSON.stringify({
                                    refresh_token: localhost_data_package.refresh_token,
                                    email: localhost_data_package.email
                                }));
                                xhr.onreadystatechange = function () {
                                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                                        console.log("Account saved to localhost")
                                        var timestamp = Date.now()
                                        var date = new Date(timestamp * 1000)

                                        var table = document.getElementById("account-table");
                                        var row = table.insertRow(1);
                                        var email = row.insertCell(0);
                                        // var timestamp = row.insertCell(1);
                                        email.innerHTML = localhost_data_package.email;
                                        // timestamp.innerHTML = `${date.getMonth}/${date.getDate}/${date.getFullYear} - ${date.getHours}:${date.getMinutes}:${date.getSeconds}`

                                        // document.getElementById("harvestNumber").innerText = (Number(document.getElementById("harvestNumber").innerText) + 1).toString();
                                    }
                                }





                                // Refresh Page
                                chrome.tabs.executeScript(tabId, {
                                    code: '(' + reloadPage + ')();' //argument here is a string but function.toString() returns function's code
                                }, (results) => {
                                    console.log('Chrome Reset')
                                });

                            } catch (error) {
                                null
                            }

                        }); // End of Network.getRequestPostData




                    } // End of if response.body.refresh_token


                } catch (error) {
                    null
                }


            }); // End of Network.getResponseBody

        } // End of if Netwrok.responseReceived

    } // End of allEventHandler

}) // End of Window Listener
