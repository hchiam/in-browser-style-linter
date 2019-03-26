(function() {

// Enter your desired settings here:
var settings = [
    {
        s:'h1', // selector
        p:'color', // property
        v:'red' // expected value
    }
];

var errors = [];
for (var i=0; i<settings.length; i++) {
    errors.push(lint(settings[i]));
}

alert('Finished linting. Hover over the buttons.\n\nA summary is also listed in the console log.');
console.log(errors);

function lint(setting) {
    var errorSummary = '';
    var selector = setting.s || setting.selector;
    var property = setting.p || setting.property;
    var expectedValue = setting.v || setting.ev || setting.value || setting.expected || setting.expectedValue;
    var contains = setting.c || setting.contains;
    if (!settingPropertiesSet(selector, property, expectedValue)) return;
    var elements = document.querySelectorAll(selector + ':not(.in-browser-linter-button)');
    for (var j=0; j<elements.length; j++) {
        var element = elements[j];
        var actualValue = element ? window.getComputedStyle(element).getPropertyValue(property) : '';
        if (expectedValue == actualValue) {
            continue; // ignore correct
        }
        if (contains && actualValue.indexOf(expectedValue) !== -1) {
            continue; // ignore correct
        }
        var message = selector + ':\n  ' + property + ':\n    WANT: ' + expectedValue + '\n    HAVE: ' + actualValue;
        var btn = document.createElement("BUTTON");
        btn.onclick = function() {
            alert(message);
        };
        btn.innerHTML = '!';
        btn.style.cssText = 'all: initial; position: absolute; top: -0.5rem; right: -1rem; background: red; border-radius: 1rem; border: 0.1rem solid white; width: 1rem; text-align: center;';
        btn.title = message;
        btn.className = 'in-browser-linter-button';
        var spn = document.createElement("SPAN");
        spn.style.cssText = 'all: initial; position: relative; width: 0; height: 0;';
        spn.appendChild(btn);
        if (element) {
            element.appendChild(spn);
            errorSummary = {
                selector:selector,
                property:property,
                expectedValue:expectedValue,
                actualValue:actualValue
            };
        }
    }
    return errorSummary;
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
