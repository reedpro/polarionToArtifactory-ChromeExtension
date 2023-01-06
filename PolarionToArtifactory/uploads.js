document.getElementById('optionsBtn').addEventListener('click', goToOptions);

chrome.storage.session.get(null, function(items) {

    var allKeys = Object.keys(items);
    allKeys.forEach(key => {
        addLoader(key,  items[key])
    })
});

function goToOptions()
{
    window.location.assign("options.html")
}

function addLoader(id, status) {
    var orig = status === true?document.getElementById('divTemplate'):document.getElementById('divFailTemplate');
    var parent = document.getElementById('containerParent');
    var clone = orig.cloneNode(true)
    // clone.querySelector('.uplName').innerText = `Uploading ${id.split("/").pop()}`
    clone.id = id
    parent.appendChild(clone)
    debugger
    document.getElementById(id).querySelector(".uplName").textContent = `${status === true?"Uploading":"Failed to upload"} ${id.split("/").pop()}`
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.msg ==="startUpload") {
        var id = request.data.path
        addLoader(id)
        
    }
    else if (request.msg ==="endUpload") {
        var id = request.data.path
        
        document.getElementById(id).remove()
    }
});