var elem = document.querySelector('p#hi');
var propWant = 'color';
var valWant = 'red';
if (elem) {
    var compStyles = elem ? window.getComputedStyle(elem) : '';
    if (valWant != compStyles.getPropertyValue(propWant)) {
        var message = propWant + ':\n    Expected: ' + valWant + '\n    Actual: ' + compStyles.getPropertyValue(propWant);
    }
    var btn = document.createElement("BUTTON");
    btn.onclick = function() {
        alert(message);
    };
    btn.innerHTML = '!';
    btn.style.cssText = 'position: absolute; top: -0.5rem; right: -1rem; background: red; border-radius: 1rem;';
    var spn = document.createElement("SPAN");
    spn.style.cssText = 'position: relative; width: 0; height: 0;';
    spn.appendChild(btn);
    elem.appendChild(spn);
}
