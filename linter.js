(function() {

// Enter your desired settings here:
var settings = [
    {
        s:'a', // selector
        p:'color', // property
        v:['red','rgb(88, 96, 105)'], // acceptable expected values
        // c:true, // "contains" (actual value can contain expected value)
        // i:'Some innerHTML text.' // innerHTML
    }
];

removeAllErrorButtons();

var errors = [];
for (var i=0; i<settings.length; i++) {
    var error = lint(settings[i]);
    if (error) {
        errors.push(error);
    }
}

alert('Finished linting. Hover over the buttons.\n\nA summary is also listed in the console log.');
console.log('Linter found these errors: (click to expand)');
console.log(errors);

function lint(setting) {
    var errorSummary = '';
    var selector = setting.s || setting.selector;
    var property = setting.p || setting.property;
    var expectedValues = setting.v || setting.ev || setting.value || setting.expected || setting.expectedValue || setting.expectedValues;
    var checkIfContains = setting.c || setting.contains;
    var innerHTML = setting.i || setting.innerHTML;

    if (!settingPropertiesSet(selector, property, expectedValues)) {
        return; // ignore invalid setting
    }

    // let user give an array of acceptable values (or just one value string):
    expectedValues = Array.isArray(expectedValues) ? expectedValues : [expectedValues];

    var pseudoelement = selector.match(/:[^ ]+$/);
    pseudoelement = pseudoelement ? pseudoelement[0] : '';
    if (pseudoelement) {
        selector = selector.replace(pseudoelement, '');
    }
    
    var elements = document.querySelectorAll(selector + ':not(.in-browser-linter-button)');
    for (var j=0; j<elements.length; j++) {
        var element = elements[j];

        var actualValue = element ? window.getComputedStyle(element, pseudoelement).getPropertyValue(property) : '';
        var matchesActualValue = (expectedValues.indexOf(actualValue) !== -1);
        if (matchesActualValue) {
            continue; // ignore correct
        }

        if (checkIfContains) {
            var isAnyFoundInsideActualValue = expectedValues.filter(function (expectedValue) {
                return actualValue.indexOf(expectedValue) !== -1;
            }).length > 0;
            if (isAnyFoundInsideActualValue) {
                continue; // ignore correct
            }
        }

        if (innerHTML && innerHTML !== element.innerHTML) {
            continue; // ignore non-matching innerHTML
        }

        var errorButton = createErrorButton(selector + pseudoelement, property, expectedValues, actualValue)
        element.appendChild(errorButton);

        errorSummary = {
            selector:selector + pseudoelement,
            property:property,
            expectedValues:expectedValues,
            actualValue:actualValue
        };
    }
    return errorSummary;
}

function createErrorButton(selector, property, expectedValues, actualValue) {
    var message = selector + ':\n' + property + ':\n\tWANT: ' + expectedValues.join('\n\t  or: ') + '\n\tHAVE: ' + actualValue;
    var button = document.createElement("BUTTON");
    button.onclick = function() {
        alert(message);
    };
    button.innerHTML = '!';
    button.style.cssText = 'all: initial; position: absolute; top: -0.5rem; right: -1rem; background: red; border-radius: 1rem; border: 0.15rem solid white; height: 1.5rem; width: 1.5rem; font-size: 1rem; text-align: center;';
    button.title = message;
    button.className = 'in-browser-linter-button';
    var span = document.createElement("SPAN");
    span.style.cssText = 'all: initial; position: relative; width: 0; height: 0;';
    span.className = 'in-browser-linter-button';
    span.appendChild(button);
    return span;
}

function settingPropertiesSet(selector, property, expectedValues) {
    if (!selector) {
        alert('Linter: Missing a selector.');
        return false;
    }
    if (!property) {
        alert('Linter: Missing a property.');
        return false;
    }
    if (!expectedValues) {
        alert('Linter: Missing an expected value.');
        return false;
    }
    return true;
}

function removeAllErrorButtons() {
    var errorButtons = document.getElementsByClassName('in-browser-linter-button');
    while (errorButtons.length>0) {
        errorButtons[0].parentNode.removeChild(errorButtons[0]);
    }
}

})();
