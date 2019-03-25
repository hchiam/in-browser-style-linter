(function() {

// Enter your desired settings here:
var settings = [
{
    's': 'h1', // selector
    'p': 'color', // property
    'v': 'red' // expected value
}
];

for (var i=0; i<settings.length; i++) {
    lint(settings[i]);
}

function lint(setting) {
    var selector = setting.selector || setting.s;
    var property = setting.property || setting.p;
    var valueExpected = setting.value || setting.v || setting.expected || setting.ev;
    if (!settingPropertiesSet(selector, property, valueExpected)) return;
    var element = document.querySelector(selector);
    if (element) {
        var compStyles = element ? window.getComputedStyle(element) : '';
        if (valueExpected != compStyles.getPropertyValue(property)) {
            var message = selector + ':\n  ' + property + ':\n    Expected: ' + valueExpected + '\n    Actual: ' + compStyles.getPropertyValue(property);
        }
        var btn = document.createElement("BUTTON");
        btn.onclick = function() {
            alert(message);
        };
        btn.innerHTML = '!';
        btn.style.cssText = 'all: initial; position: absolute; top: -0.5rem; right: -1rem; background: red; border-radius: 1rem; width: 1rem; text-align: center;';
        var spn = document.createElement("SPAN");
        spn.style.cssText = 'all: initial; position: relative; width: 0; height: 0;';
        spn.appendChild(btn);
        element.appendChild(spn);
    }
}

function settingPropertiesSet(selector, property, valueExpected) {
    if (!selector) {
        alert('Linter: Missing a selector.');
        return false;
    }
    if (!property) {
        alert('Linter: Missing a property.');
        return false;
    }
    if (!valueExpected) {
        alert('Linter: Missing an expected value.');
        return false;
    }
    return true;
}

})();
