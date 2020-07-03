"use strict";

let settingsButton = document.getElementById("use-settings");
let settingsTextarea = document.getElementById("set-settings");
let clearErrorButtonsButton = document.getElementById("clear-error-buttons");
let showInstructionButton = document.getElementById("show-instruction");
let versionNumber = document.getElementById("version-number");

chrome.storage.local.get("settings", function getSettings(data) {
  settingsTextarea.value = data.settings
    ? data.settings.replace(/^\s+|\s+$/g, "")
    : `// Enter your desired settings here:
var settings = [
{
    s:'a', // selector
    p:'color', // property
    v:'red' // expected value
},
{
    s:'a',
    p:'font-family',
    v:'avenir',
    i:'About'
},
{
    s:'a.gb_d',
    p:'font-family',
    v:'avenir',
    c:true
},
{
    s:'.gLFyf.gsfi',
    p:'color',
    v:['#eee','rgb(88, 96, 105)','#3e3e3e'],
},
];`;
});

settingsTextarea.onkeyup = function setSettings(e) {
  let eventObject = window.event ? event : e;
  let hitCtrlOrCmd = eventObject.ctrlKey || eventObject.metaKey;
  let hitEnter = eventObject.keyCode == 13;
  if (hitCtrlOrCmd && hitEnter) {
    useSettings();
  }

  if (settingsTextarea.value === "") {
    showInstructionButton.style.visibility = "hidden";
    settingsTextarea.title = "Enter your desired settings here";
  } else {
    showInstructionButton.style.visibility = "visible";
    settingsTextarea.title = "To run, hit Ctrl+Enter (or Cmd+Return)";
  }

  chrome.storage.local.set(
    { settings: settingsTextarea.value },
    function () {}
  );
};

settingsButton.addEventListener("click", useSettings);

clearErrorButtonsButton.addEventListener("click", function clearSettings() {
  chrome.tabs.executeScript(null, {
    code: `
      var errorButtons = document.getElementsByClassName('in-browser-linter-button');
      while (errorButtons.length>0) {
          errorButtons[0].parentNode.removeChild(errorButtons[0]);
      }
      var errorPalette = document.getElementById('in-browser-linter-palette');
      if (errorPalette) {
          errorPalette.parentNode.removeChild(errorPalette);
      }
    `,
  });
});

versionNumber.innerHTML = `You're using version <a href="https://github.com/hchiam/in-browser-style-linter/releases" target="_blank" title="See release notes">${
  chrome.runtime.getManifest().version
}</a>`;

function useSettings() {
  settingsTextarea.value = settingsTextarea.value.replace(/^\s+|\s+$/g, "");
  var isValidSettingsInput = validateSettings(settingsTextarea.value);
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
  chrome.tabs.executeScript(
    null,
    {
      code: settingsTextarea.value,
    },
    function () {
      chrome.tabs.executeScript(null, { file: "main.js" });
      window.close();
    }
  );
}

function validateSettings(settingsString) {
  var lines = settingsString.split("\n");
  var lastQuotationMark = "";
  var safeToPutBracket = false; // when not inside quotation marks
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    for (
      var c = 0, foundComment = false;
      c < line.length && !foundComment;
      c++
    ) {
      var character = line[c];
      if (
        (character == "'" || character == '"') &&
        (lastQuotationMark === "" || character === lastQuotationMark)
      ) {
        safeToPutBracket = !safeToPutBracket;
        lastQuotationMark = character === lastQuotationMark ? "" : character;
      }
      if (!safeToPutBracket && (character == "(" || character == ")")) {
        return false;
      }
      foundComment =
        c < line.length - 1 && character == "/" && line[c + 1] == "/";
    }
  }
  return isValidCode(settingsString);
}

function isValidCode(codeString) {
  try {
    (function () {
      new Function(codeString);
    })();
  } catch (error) {
    return false;
  }
  return true;
}
