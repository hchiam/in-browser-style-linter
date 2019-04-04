'use strict';

let settingsButton = document.getElementById('use-settings');
let settingsTextarea = document.getElementById('set-settings');
let clearErrorButtonsButton = document.getElementById('clear-error-buttons');

chrome.storage.sync.get('settings', function getSettings(data) {
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
  chrome.storage.sync.set({'settings': settingsTextarea.value}, function() {});
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
    `
  });
});

function validateSettings(settingsString) {
  var lines = settingsString.split('\n');
  var lastQuotationMark = '';
  var safeToPutBracket = false; // when not inside quotation marks
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    for (var c = 0; c < line.length; c++) {
      var character = line[c];
      if ((character == "'" || character == '"' || character == '`') && (lastQuotationMark === '' || character === lastQuotationMark)) {
        safeToPutBracket = !safeToPutBracket;
        lastQuotationMark = (character === lastQuotationMark) ? '' : character;
      }
      if (!safeToPutBracket && (character == '(' || character == ')')) {
        return false;
      }
    }
  }
  return true;
}