(function() {

removeAllErrorButtons();
deleteLines();
removeErrorModal();

// because used within chrome popup, avoid fatal error if no settings:
if (typeof settings === 'undefined' || settings === null) {
    return;
}

try {
    var errors = [];
    for (var i=0; i<settings.length; i++) {
        var error = lint(settings[i]);
        if (error) {
            errors.push(error);
        }
    }

    if (errors.length > 0) {
        createErrorModal(errors);
    }

    alert('Finished linting. For more info, hover over a button.');
    console.log('Linter found these errors: (click to expand)');
    console.log(errors);
} catch (exception) {
    console.log(exception);
    alert("Something went wrong. Make sure your input is something like this: \n" +
          "\n" +
          "var settings = [\n" +
          "    {\n" +
          "        s:'a', // selector\n" +
          "        p:'color', // property\n" +
          "        v:'red' // expected value\n" +
          "    }\n" +
          "];");
}

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
    expectedValues = expectedValues.map(hexToRgbColor);

    var pseudoelement = selector.match(/:(?!.*not)[^ ]+$/);
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
            actualValue:actualValue,
            element:element
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

function removeErrorModal() {
    var errorModal = document.getElementById('in-browser-linter-modal');
    if (errorModal) {
        errorModal.parentNode.removeChild(errorModal);
    }
}

var onHoverStyle = 'all: initial; background: red; padding: 0.5rem; margin: 0.25rem; display: inline; border-radius: 5px; font-family: avenir, arial, tahoma;';
var offHoverStyle ='all: initial; background: rgba(255,0,0,0.5); padding: 0.5rem; margin: 0.25rem; display: inline; border-radius: 5px; font-family: avenir, arial, tahoma;';

function createErrorModal(errors) {
    var div = document.createElement("div");
    div.style.cssText = 'all: initial; position: fixed; left: 25%; top: 25vh; width: 50%; height: 50%; padding: 1rem; z-index: 9999; border: 1rem solid rgba(255, 0, 0, 0.5); background: rgba(255,255,255,0.75); color: black; overflow-y: auto; border-radius: 5px; font-family: avenir, arial, tahoma; box-shadow: inset 0 -50px 50px -55px rgba(0, 0, 0, 1);';
    div.id = 'in-browser-linter-modal';
    makeElementDraggable(div);

    var h1 = document.createElement("H1");
    h1.innerHTML = 'Summary of Linter Errors:';
    h1.style.cssText = 'all: initial; font-family: avenir, arial, tahoma; font-weight: bold;';
    div.appendChild(h1);

    var button = document.createElement("button");
    button.innerHTML = 'X';
    button.style.cssText = 'all: initial; position: absolute; right: 1rem; background: red; padding: 0.5rem; margin: 0.25rem; display: inline; border-radius: 5px; font-family: avenir, arial, tahoma;';
    button.title = 'Close';
    button.onclick = function() {
        removeErrorModal();
    };
    button.onmouseover = function() {
        button.style.cssText = onHoverStyle + 'position: absolute; right: 1rem;';
    };
    button.onmouseout = function() {
        button.style.cssText = offHoverStyle + 'position: absolute; right: 1rem;';
    };
    div.appendChild(button);

    for (var e=0; e<errors.length; e++) {
        createErrorPointerEntry(errors[e], div);
    }

    document.body.insertBefore(div, document.body.firstChild);
}

function createErrorPointerEntry(error, container){
    var p = document.createElement("p");
    p.innerHTML = error.selector + ':<br/>' + error.property + ':<br/>&nbsp;&nbsp;WANT: ' + error.expectedValues.join('<br/>&nbsp;&nbsp;&nbsp;&nbsp;or: ') + '<br/>&nbsp;&nbsp;HAVE: ' + error.actualValue;
    
    var button = document.createElement("button");
    button.innerHTML = '&rarr; Locate example';
    button.style.cssText = 'all: initial; background: rgba(255,0,0,0.5); padding: 0.5rem; margin: 0.25rem; border-radius: 5px; font-family: avenir, arial, tahoma;';
    button.id = 'pointer-'+ (error.selector + '-' + error.property).replace(/[ .,#$\^&\*;:{}=~()]/g,'_');
    button.title = 'Click to scroll';
    button.onmouseover = function() {
        button.style.cssText = onHoverStyle;
        locateError(error, button.id);
    };
    button.onmouseout = function() {
        button.style.cssText = offHoverStyle;
        deleteLines();
    };
    button.onclick = function() {
        moveToLocatedError(error);
        deleteLines();
        locateError(error, button.id);
    };
    p.appendChild(button);

    container.appendChild(p);
}

function locateError(error, buttonID) {
    var buttonPosition = document.getElementById(buttonID).getBoundingClientRect();
    if (!error.element) return;
    var fromCenterX = buttonPosition.width/2 + buttonPosition.left + window.scrollX; // window.innerWidth/2 + window.scrollX;
    var fromCenterY = buttonPosition.height/2 + buttonPosition.top + window.scrollY; // window.innerHeight/2 + window.scrollY;
    var targetCenterX = error.element.getBoundingClientRect().width/2 + error.element.getBoundingClientRect().left + window.scrollX;
    var targetCenterY = error.element.getBoundingClientRect().height/2 + error.element.getBoundingClientRect().top + window.scrollY;
    document.body.appendChild(createLine(fromCenterX, fromCenterY, targetCenterX, targetCenterY));
    document.body.appendChild(createCircle(targetCenterX, targetCenterY));
}

function createLine(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    var c = Math.sqrt(a * a + b * b);

    var sx = (x1 + x2) / 2;
    var sy = (y1 + y2) / 2;

    var x = sx - c / 2;
    var y = sy;

    var alpha = Math.PI - Math.atan2(-b, a);

    return createLineElement(x, y, c, alpha);
}

function createLineElement(x, y, length, angle) {
    var line = document.createElement("div");
    var styles = 'z-index: 9998; background: red; border-radius: 1rem; border: 0.15rem solid white; padding: 0.15rem; '
               + 'width: ' + length + 'px; '
               + 'position: absolute; '
               + 'top: ' + y + 'px; '
               + 'left: ' + x + 'px; '
               + '-moz-transform: rotate(' + angle + 'rad); '
               + '-webkit-transform: rotate(' + angle + 'rad); '
               + '-o-transform: rotate(' + angle + 'rad); '
               + '-ms-transform: rotate(' + angle + 'rad); '
               + 'transform: rotate(' + angle + 'rad); ';
    line.setAttribute('style', styles);
    line.className = 'in-browser-linter-pointer';
    return line;
}

function createCircle(x, y) {
    var circle = document.createElement("div");
    var diameter = window.innerHeight/3;
    var styles = 'all: initial; z-index: 9997; position: absolute; background: rgba(255,0,0,0.1); width: ' + diameter + 'px; height: ' + diameter + 'px; border-radius: '+ (diameter/2) + 'px; overflow: hidden; ';
    styles += 'left: ' + (x - diameter/2) + 'px; ';
    styles += 'top: ' + (y - diameter/2) + 'px; ';
    circle.setAttribute('style', styles);
    circle.className = 'in-browser-linter-pointer';
    return circle;
}

function deleteLines() {
    var lines = document.getElementsByClassName('in-browser-linter-pointer');
    while (lines.length>0) {
        lines[0].parentNode.removeChild(lines[0]);
    }
}

function moveToLocatedError(error) {
    if (!error.element) return;
    var targetCenterX = error.element.getBoundingClientRect().width/2 + error.element.getBoundingClientRect().left + window.scrollX;
    var targetCenterY = error.element.getBoundingClientRect().height/2 + error.element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(targetCenterX, targetCenterY);
}

function hexToRgbColor(hex) {
    var shorthandHexPattern = /^#([a-f\d])([a-f\d])([a-f\d])$/i; // e.g. #123
    var longhandHexCode = hex.replace(shorthandHexPattern, function(entire, r, g, b) {
        return '#' + r + r + g + g + b + b;
    });
    var longhandHexPattern = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(longhandHexCode); // e.g. #123456
    if (longhandHexPattern) {
        return 'rgb(' +
            parseInt(longhandHexPattern[1], 16) + ', ' +
            parseInt(longhandHexPattern[2], 16) + ', ' +
            parseInt(longhandHexPattern[3], 16) + ')';
    } else {
        return hex;
    }
}

function makeElementDraggable(element) {
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    element.onmousedown = dragOnMouseDown;

    function dragOnMouseDown(event) {
        var event = event || window.event;
        event.preventDefault();
        x2 = event.clientX;
        y2 = event.clientY;
        document.onmouseup = stopDragging;
        document.onmousemove = dragElement;
    }

    function stopDragging() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    function dragElement(event) {
        var event = event || window.event;
        event.preventDefault();
        xChange = event.clientX - x;
        yChange = event.clientY - y;
        x = event.clientX;
        y = event.clientY;
        element.style.left = (element.offsetLeft + xChange) + "px";
        element.style.top = (element.offsetTop + yChange) + "px";
    }
}

})();
