
function run(elem) {
  const extensionID = chrome.runtime.id;
  const el = document.createElement("div")
  el.id = "artifactoryReady"
  document.body.appendChild(el)

  elem.addEventListener("click", function (event) {
    path = event.target.closest("a").getAttribute('onclick').split("encodeURIComponent('")[1].split("'")[0];
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
      var reader = new FileReader();
        reader.onload = function(e){
          chrome.storage.local.get({
            artifactory: ''
          }, function (items) {
          (async () => {
            var file = input.files[0]
            var fullpath = `${path}/${file.name}`
            const response = await chrome.runtime.sendMessage({
              msg: "startUpload",
              data: {content: fileToJson(reader.result), file: file, path: fullpath, key: items.artifactory}
            });
            if(response === true) {
              alert(`Sucessfully uploaded ${file.name}`)
            }
            console.log(response);
          })();
        });
        }
        reader.readAsArrayBuffer(input.files[0])
      
    }
    input.click();
  }, false);

}

//Converts the ArrayBuffer to JSON of dataURL, which allows it to be passed to background
function fileToJson(res) {
  var msgUint8 = new Uint8Array(res).buffer
  const blob = new Blob([msgUint8])
  const dataURL = URL.createObjectURL(blob)
  return JSON.stringify({dataURL})
}



function artifactoryClick(path) {
  alert(path)
  
  var input = document.createElement('input');
  input.type = 'file';
  input.click();
}

function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

waitForElm("#test > span > span > a").then((elm) => {
  run(elm)
});


