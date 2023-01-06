
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.msg ==="startUpload") {
        var path = request.data.path
        chrome.storage.session.set({ [path]: true })
    uploadFile(request.data).then((resp) => sendResponse(resp));
    return true;
    }
});
async function uploadFile(request) {
    let formData = new FormData();
    formData.append("fileToUpload", request.file);
    let buff = await getBuff(request.content)
    let sha = await GetSha1(buff);
    var headers = new Headers();
    headers.append('X-JFrog-Art-Api', request.key)
    headers.append('X-Checksum-Sha1', sha)
    let initObject = {
        method: 'PUT', 
        headers: headers,
        body: buff
    };
    let resp = await PutReq(request, initObject)
    if(resp.ok === true) {
    chrome.storage.session.remove(request.path)
    chrome.runtime.sendMessage({
        msg: "endUpload",
        data: {path: request.path}
      });
    }
    else {
        chrome.storage.session.set({[request.path]: false})
        chrome.windows.create({
            focused: true,
            width: 400,
            height: 600,
            type: 'popup',
            url: 'uploads.html',
            top: 0,
            left: 0
          },
          () => {})
    }
    return resp.ok
}

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.windows.create({
            focused: true,
            width: 400,
            height: 600,
            type: 'popup',
            url: 'options.html',
            top: 0,
            left: 0
          },
          () => {})
    }})

let PutReq = function(request, initObject) {
    return fetch(request.path, initObject).then(response => {return response}).catch(err => {return err});
}

let GetSha1 = function(blob) {
    return getShaHex(blob).then((digestText) => {return digestText});
}

async function getBuff(content) {
    const parsedJson = JSON.parse(content);
    const dataURL = parsedJson.dataURL;
    const blob = await fetch(dataURL)
    return blob.arrayBuffer().then(ret => {return ret})
}

async function getShaHex(arrayBuffer) {    
    const msg = new Uint8Array(arrayBuffer)
    const hashBuffer = await crypto.subtle.digest('SHA-1', msg);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
  }

