'use strict';

let settingsButton = document.getElementById('use-settings');
let settingsTextarea = document.getElementById('set-settings');
let clearErrorButtonsButton = document.getElementById('clear-error-buttons');
let versionNumber = document.getElementById('version-number');

chrome.storage.local.get('settings', function getSettings(data) {
  settingsTextarea.value = data.settings ? data.settings.replace(/^\s+|\s+$/g, '') : `// Enter your desired settings here:
var settings = [
    {
        s:'a', // selector
        p:'color', // property
        v:'red' // expected value
    }
];`;
});

settingsTextarea.onkeyup = function setSettings() {
  chrome.storage.local.set({'settings': settingsTextarea.value}, function() {});
};

settingsButton.addEventListener("click", function useSettings() {
  settingsTextarea.value = settingsTextarea.value.replace(/^\s+|\s+$/g, '');
  var isValidSettingsInput = validateSettings(settingsTextarea.value)
  if (!isValidSettingsInput) {
    alert(`Invalid input for settings. Please enter something like this: 

var settings = [
    {
        s:'a', // selector
        p:'color', // property
        v:'red' // expected value
    }
];`);
    settingsTextarea.focus();
    return; // do not continue
  }

  // actually use the settings:
  chrome.tabs.executeScript(null, {
    code: settingsTextarea.value
  }, function() {
    chrome.tabs.executeScript(null, {file: 'main.js'});
    window.close();
  });
});

clearErrorButtonsButton.addEventListener("click", function clearSettings() {
  chrome.tabs.executeScript(null, {
    code: `
      var errorButtons = document.getElementsByClassName('in-browser-linter-button');
      while (errorButtons.length>0) {
          errorButtons[0].parentNode.removeChild(errorButtons[0]);
      }
      var errorModal = document.getElementById('in-browser-linter-modal');
      if (errorModal) {
          errorModal.parentNode.removeChild(errorModal);
      }
    `
  });
});

versionNumber.innerHTML = `You're using version <a href="https://github.com/hchiam/in-browser-style-linter/releases" target="_blank">${chrome.runtime.getManifest().version}</a>`;

function validateSettings(settingsString) {
  var lines = settingsString.split('\n');
  var lastQuotationMark = '';
  var safeToPutBracket = false; // when not inside quotation marks
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    for (var c = 0, foundComment = false; c < line.length && !foundComment; c++) {
      var character = line[c];
      if ((character == "'" || character == '"') && (lastQuotationMark === '' || character === lastQuotationMark)) {
        safeToPutBracket = !safeToPutBracket;
        lastQuotationMark = (character === lastQuotationMark) ? '' : character;
      }
      if (!safeToPutBracket && (character == '(' || character == ')')) {
        return false;
      }
      foundComment = (c < line.length-1 && character == '/' && line[c+1] == '/');
    }
  }
  return true;
}