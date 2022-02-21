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

    document.getElementById("options").addEventListener("click", () => {
        if (document.getElementById("optionsContainer") != null) return

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Main Options Container
        const optionsContainer = document.createElement("div");
        optionsContainer.id = "optionsContainer"
        // optionsContainer.innerHTML = "Options Container"


        // Accounts Input Container
        const accountsInputContainer = document.createElement("div");
        accountsInputContainer.id = "accountsInputContainer"
        accountsInputContainer.classList.add("optionsContainerChildren")
        optionsContainer.appendChild(accountsInputContainer);

        // Accounts Input Headers
        const accountsInputHeader = document.createElement("h2");
        accountsInputHeader.id = "accountsInputHeader"
        accountsInputHeader.classList.add("optionsContainerChildrenHeader")
        accountsInputHeader.innerHTML = "Accounts"
        accountsInputContainer.appendChild(accountsInputHeader)

        // Accounts Input Description
        const accountsInputDescription = document.createElement("p");
        accountsInputDescription.id = "accountsInputDescription"
        accountsInputContainer.appendChild(accountsInputDescription)


        const accountsTextArea = this.document.createElement("textarea");
        accountsTextArea.id = "accountsTextArea"
        // accountsTextArea.rows = "10"
        // accountsTextArea.cols = "50"
        accountsInputContainer.appendChild(accountsTextArea)



        // Open the options bar
        document.getElementById("options").classList.remove("deselected");
        document.getElementById("options").classList.add("selected");





        // Settings Container
        const settingsInputContainer = document.createElement("div");
        settingsInputContainer.id = "settingsInputContainer"
        settingsInputContainer.classList.add("optionsContainerChildren")
        optionsContainer.appendChild(settingsInputContainer);


        const settingsButtonContainer = document.createElement("div");
        settingsButtonContainer.id = "settingsButtonContainer"
        settingsInputContainer.appendChild(settingsButtonContainer)


        // Auto Fill Enable Slider --- Start

        // Header
        const enableAutoFillDiv = document.createElement("div");
        enableAutoFillDiv.id = "enableAutoFillDiv"

        const enableAutoFillHeader = document.createElement("h3");
        enableAutoFillHeader.innerHTML = "Auto-Fill"
        enableAutoFillDiv.appendChild(enableAutoFillHeader)

        // Button
        const enableAutoFill = document.createElement("label");
        enableAutoFill.classList.add("switch")

        const enableAutoFillCheckbox = document.createElement("input")
        enableAutoFillCheckbox.type = "checkbox"
        enableAutoFillCheckbox.id = "enableAutoClickInput"
        enableAutoFill.appendChild(enableAutoFillCheckbox)


        const enableAutoFillSlider = document.createElement("span")
        enableAutoFillSlider.classList.add("slider", "round")
        enableAutoFill.appendChild(enableAutoFillSlider)



        // 



        enableAutoFillDiv.appendChild(enableAutoFill)
        settingsButtonContainer.appendChild(enableAutoFillDiv)

        // Autofill Enable Slider --- Start End


        // Auto-Click Enable Slider --- Start

        // Header
        const enableAutoClickDiv = document.createElement("div");
        enableAutoClickDiv.id = "enableAutoClickDiv"

        const enableAutoClickHeader = document.createElement("h3");
        enableAutoClickHeader.innerHTML = "Auto-Click"
        enableAutoClickDiv.appendChild(enableAutoClickHeader)

        // Button
        const enableAutoClick = document.createElement("label");
        enableAutoClick.classList.add("switch")

        const enableAutoClickCheckbox = document.createElement("input")
        enableAutoClickCheckbox.type = "checkbox"
        enableAutoFillCheckbox.id = "enableAutoClickInput"
        enableAutoClick.appendChild(enableAutoClickCheckbox)

        const enableAutoClickSlider = document.createElement("span")
        enableAutoClickSlider.classList.add("slider", "round")
        enableAutoClick.appendChild(enableAutoClickSlider)



        // 



        enableAutoClickDiv.appendChild(enableAutoClick)
        settingsButtonContainer.appendChild(enableAutoClickDiv)

        // Autofill Enable Slider --- Start End


        // Attatch Options Menu to Options bar
        document.getElementById("options").appendChild(optionsContainer);


        document.getElementById("optionsHeader").remove();


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


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
