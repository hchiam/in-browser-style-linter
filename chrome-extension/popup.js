'use strict';

let settingsButton = document.getElementById('use-settings');
let variablesTextarea = document.getElementById('set-variables');
let settingsTextarea = document.getElementById('set-settings');
let clearErrorButtonsButton = document.getElementById('clear-error-buttons');

chrome.storage.sync.get('variables', function(data) {
  variablesTextarea.value = data.variables.replace(/^\s+|\s+$/g, '') || '';
});

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

variablesTextarea.onkeyup = function setVariables() {
  chrome.storage.sync.set({variables: variablesTextarea.value}, function() {});
};

settingsTextarea.onkeyup = function setSettings() {
  chrome.storage.sync.set({settings: settingsTextarea.value}, function() {});
};

settingsButton.addEventListener("click", function useSettings() {
  variablesTextarea.value = variablesTextarea.value.replace(/^\s+|\s+$/g, '');
  settingsTextarea.value = settingsTextarea.value.replace(/^\s+|\s+$/g, '');
  if (!isValidSettingsInput(settingsTextarea.value)) {
    alert(`Invalid input for settings. Please enter something like this: 

// Enter your desired settings here:
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
    code: isValidVariablesInput(variablesTextarea.value)
  }, function() {
    chrome.tabs.executeScript(null, {
      code: settingsTextarea.value
    }, function() {
      chrome.tabs.executeScript(null, {file: 'main.js'});
      window.close();
    });
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

function isValidVariablesInput(variablesSetupString) {
  var isEachLineAVariableDeclarationOrComment = variablesSetupString.split('\n').every(function(line) {
    return line.match(/((^var .+? = .+?;$)|(^\/\/.*$)|(^\s*$))/);
  });
  if (!isEachLineAVariableDeclarationOrComment) {
    alert('Invalid input for variables.');
    return ''; // don't use if invalid
  }
  return variablesSetupString;
}

function isValidSettingsInput(settingsInputString) {
  var isCommentAndArrayJSON = settingsInputString.match(/^\/\/ Enter your desired settings here:\nvar settings = \[\n    \{/);
  var isArrayJSON = settingsInputString.match(/^var settings = \[\n    \{/);
  var isEndingWithArrayJSON = settingsInputString.match(/\];$/);
  return ((isCommentAndArrayJSON != null) || (isArrayJSON != null)) && (isEndingWithArrayJSON != null);
}
