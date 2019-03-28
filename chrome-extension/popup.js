'use strict';

let settingsButton = document.getElementById('use-settings');
let settingsTextarea = document.getElementById('set-settings');
let clearErrorButtonsButton = document.getElementById('clear-error-buttons');

chrome.storage.sync.get('settings', function(data) {
settingsTextarea.value = data.settings || `// Enter your desired settings here:
var settings = [
    {
        s:'*', // selector
        p:'color', // property
        v:'red' // expected value
    }
];`;
});

settingsTextarea.onkeyup = function setSettings() {
  chrome.storage.sync.set({settings: settingsTextarea.value}, function() {});
};

settingsButton.addEventListener("click", function useSettings() {
  chrome.tabs.executeScript(null, {
    code: settingsTextarea.value
  }, function() {
      chrome.tabs.executeScript(null, {file: 'main.js'});
      window.close();
  });
});

clearErrorButtonsButton.addEventListener("click", function useSettings() {
  chrome.tabs.executeScript(null, {
    code: `
      var errorButtons = document.getElementsByClassName('in-browser-linter-button');
      while (errorButtons.length>0) {
          errorButtons[0].parentNode.removeChild(errorButtons[0]);
      }
    `
  });
});