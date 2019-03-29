'use strict';

let settingsButton = document.getElementById('use-settings');
let settingsTextarea = document.getElementById('set-settings');
let clearErrorButtonsButton = document.getElementById('clear-error-buttons');

chrome.storage.sync.get('settings', function(data) {
settingsTextarea.value = data.settings.replace(/^\s+|\s+$/g, '') || `// Enter your desired settings here:
var settings = [
    {
        s:'h1', // selector
        p:'color', // property
        v:'red' // expected value
    }
];`;
});

settingsTextarea.onkeyup = function setSettings() {
  chrome.storage.sync.set({settings: settingsTextarea.value}, function() {});
};

settingsButton.addEventListener("click", function useSettings() {
  settingsTextarea.value = settingsTextarea.value.replace(/^\s+|\s+$/g, '');
  var isValidSettingsInput = validateSettings(settingsTextarea.value)
  if (!isValidSettingsInput) {
    alert(`Invalid input for settings. Please enter something like this: 

var settings = [
    {
        s:'h1', // selector
        p:'color', // property
        v:'red' // expected value
    }
];`);
    settingsTextarea.focus();
    return; // do not continue
  }
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

function validateSettings(settingsString) {
  var line = settingsString.split('\n');
  var safeToPutBracket = false;
  for (var i = 0; i < line.length; i++) {
    if (line[i] == "'" || line[i] == '"') {
      safeToPutBracket = !safeToPutBracket;
    }
    if (!safeToPutBracket && line[i] == '(') {
      return false;
    }
  }
  return true;
}