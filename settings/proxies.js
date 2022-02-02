
function navHome() {
    window.history.back()
}
window.addEventListener("load", function () {
    document.getElementById("back-button").addEventListener("click", () => {
        navHome()
    })
})