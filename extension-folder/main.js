var alreadyAddedEventListeners; // NOTE: leave this var undefined for addEventListenersSafely to work!

(function () {
  removeAllErrorButtons();
  deleteLines();
  removeErrorPalette();
  addEventListenersSafely();

  // because used within chrome popup, avoid fatal error if no settings:
  if (typeof settings === "undefined" || settings === null) {
    return;
  }

  try {
    var errors = [];
    for (var i = 0; i < settings.length; i++) {
      var error = lint(settings[i]);
      if (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      createErrorPalette(errors);
      alert("Finished linting. For more info, hover over a button.");
      console.log("Linter found these errors: (click to expand)");
      console.log(errors);
    } else {
      alert("No errors found. :)");
      console.log("In-browser style linter found no errors. :)");
    }
  } catch (exception) {
    console.log(exception);
    alert(
      "Something went wrong. Make sure your input is something like this: \n" +
        "\n" +
        "var settings = [\n" +
        "    {\n" +
        "        s:'a', // selector\n" +
        "        p:'color', // property\n" +
        "        v:'red' // expected value\n" +
        "    }\n" +
        "];"
    );
  }

  function lint(setting) {
    var errorSummary = "";
    var selector = setting.s || setting.selector;
    var property = setting.p || setting.property;
    var expectedValues =
      setting.v ||
      setting.ev ||
      setting.value ||
      setting.expected ||
      setting.expectedValue ||
      setting.expectedValues;
    var checkIfContains = setting.c || setting.contains;
    var innerHTML = setting.i || setting.innerHTML;

    if (!settingPropertiesSet(selector, property, expectedValues)) {
      return; // ignore invalid setting
    }

    // let user give an array of acceptable values (or just one value string):
    expectedValues = Array.isArray(expectedValues)
      ? expectedValues
      : [expectedValues];
    expectedValues = expectedValues
      .map(convertColorToRGB)
      .map(standardizeSpacesAfterCommas);

    var pseudoelement = selector.match(/:(?!.*not)[^ ]+$/);
    pseudoelement = pseudoelement ? pseudoelement[0] : "";
    if (pseudoelement) {
      selector = selector.replace(pseudoelement, "");
    }

    var elements = document.querySelectorAll(
      selector + ":not(.in-browser-linter-button)"
    );
    for (var j = 0; j < elements.length; j++) {
      var element = elements[j];

      if (isHidden(element)) {
        continue; // ignore hidden
      }

      var actualValue = element
        ? window
            .getComputedStyle(element, pseudoelement)
            .getPropertyValue(property)
        : "";
      var matchesActualValue = expectedValues.indexOf(actualValue) !== -1;
      if (matchesActualValue) {
        continue; // ignore correct
      }

      if (checkIfContains) {
        var isAnyFoundInsideActualValue =
          expectedValues.filter(function (expectedValue) {
            return actualValue.indexOf(expectedValue) !== -1;
          }).length > 0;
        if (isAnyFoundInsideActualValue) {
          continue; // ignore correct
        }
      }

      if (innerHTML && innerHTML !== element.innerHTML) {
        continue; // ignore non-matching innerHTML
      }

      var alreadyHasLinterButton =
        element.lastChild &&
        element.lastChild.className == "in-browser-linter-button";
      if (alreadyHasLinterButton) {
        var oldMessage = element.lastChild.childNodes[0].title;
        var newMessage =
          oldMessage +
          "\n\n" +
          (selector + pseudoelement) +
          "\n" +
          property +
          ":\n    WANT: " +
          expectedValues.join("\n      or: ") +
          "\n    HAVE: " +
          actualValue;
        element.lastChild.childNodes[0].title = newMessage;
        element.lastChild.childNodes[0].onclick = function () {
          alert(newMessage);
        };
      } else {
        var errorButton = createErrorButton(
          selector + pseudoelement,
          property,
          expectedValues,
          actualValue
        );
        element.appendChild(errorButton);
      }

      errorSummary = {
        selector: selector + pseudoelement,
        property: property,
        expectedValues: expectedValues,
        actualValue: actualValue,
        element: element,
      };
    }
    return errorSummary;
  }

  function isHidden(element) {
    return element.offsetParent === null;
  }

  function createErrorButton(selector, property, expectedValues, actualValue) {
    var message =
      selector +
      ":\n" +
      property +
      ":\n    WANT: " +
      expectedValues.join("\n      or: ") +
      "\n    HAVE: " +
      actualValue;
    var button = document.createElement("BUTTON");
    button.onclick = function () {
      alert(message);
    };
    button.innerText = "!";
    button.style.cssText =
      "all: initial; position: absolute; top: -0.5rem; right: -1rem; background: red; border-radius: 1rem; border: 0.15rem solid white; height: 1.5rem; width: 1.5rem; font-size: 1rem; text-align: center;";
    button.title = message;
    button.className = "in-browser-linter-button";
    var span = document.createElement("SPAN");
    span.style.cssText =
      "all: initial; position: relative; width: 0; height: 0;";
    span.className = "in-browser-linter-button";
    span.appendChild(button);
    return span;
  }

  function settingPropertiesSet(selector, property, expectedValues) {
    if (!selector) {
      alert("Linter: Missing a selector.");
      return false;
    }
    if (!property) {
      alert("Linter: Missing a property.");
      return false;
    }
    if (!expectedValues) {
      alert("Linter: Missing an expected value.");
      return false;
    }
    return true;
  }

  function removeAllErrorButtons() {
    var errorButtons = document.getElementsByClassName(
      "in-browser-linter-button"
    );
    while (errorButtons.length > 0) {
      errorButtons[0].parentNode.removeChild(errorButtons[0]);
    }
  }

  function removeErrorPalette() {
    var errorPalette = document.getElementById("in-browser-linter-palette");
    if (errorPalette) {
      errorPalette.parentNode.removeChild(errorPalette);
    }
  }

  var onHoverStyle =
    "all: initial; background: red; padding: 0.5rem; margin: 0.75rem; display: inline; border-radius: 5px; font-family: avenir, arial, tahoma;";
  var offHoverStyle =
    "all: initial; background: rgba(255,0,0,0.5); padding: 0.5rem; margin: 0.75rem; display: inline; border-radius: 5px; font-family: avenir, arial, tahoma;";

  function createErrorPalette(errors) {
    var div = document.createElement("div");
    div.className = "in-browser-linter-palette";
    div.style.cssText =
      "all: initial; position: fixed; left: 25%; top: 25vh; width: 50%; height: 50%; z-index: 9999; border: 1rem solid rgba(255, 0, 0, 0.5); background: rgba(255,255,255,0.75); color: black; overflow-y: auto; border-radius: 5px; font-family: avenir, arial, tahoma; box-shadow: inset 0 -50px 50px -55px rgba(0, 0, 0, 1);";
    div.id = "in-browser-linter-palette";
    div.title = "(Psst! This window is draggable.)";
    makeElementDraggable(div);

    var button = document.createElement("button");
    button.className = "in-browser-linter-palette";
    button.innerText = "X";
    button.style.cssText =
      "all: initial; position: absolute; right: 1rem; background: red; padding: 0.5rem; margin: 0.75rem; display: inline; border-radius: 5px; font-family: avenir, arial, tahoma;";
    button.title = "Close";
    button.onclick = function () {
      removeErrorPalette();
      removeAllErrorButtons();
    };
    button.onmouseover = function () {
      button.style.cssText = onHoverStyle + "position: absolute; right: 1rem;";
    };
    button.onmouseout = function () {
      button.style.cssText = offHoverStyle + "position: absolute; right: 1rem;";
    };
    div.appendChild(button);

    var pointerPreview = document.createElement("div");
    pointerPreview.className = "in-browser-linter-palette";
    pointerPreview.id = "in-browser-linter-palette-pointer-preview";
    pointerPreview.style.cssText =
      "margin: 0.75rem; text-align: center; line-height: 3rem; background: white; color: grey; padding: 0.5rem; width: 80%; min-height: 4rem; word-wrap: break-word; transition: 0.5s; ";
    pointerPreview.innerHTML =
      '<i class="in-browser-linter-palette">(Hover over an element to preview its identifier.)</i>';
    div.appendChild(pointerPreview);

    var h1 = document.createElement("H1");
    h1.className = "in-browser-linter-palette";
    h1.innerHTML = "Summary of Linter Errors:";
    h1.style.cssText =
      "all: initial; margin: 0.75rem; font-family: avenir, arial, tahoma; font-weight: bold;";
    div.appendChild(h1);

    var errorContainer = document.createElement("div");
    errorContainer.className = "in-browser-linter-palette";
    errorContainer.id = "in-browser-linter-error-container";
    errorContainer.style.cssText =
      "float: left; width: 100%; height: 100%; padding: 0.75rem; overflow-y: auto;";

    for (var e = 0; e < errors.length; e++) {
      createErrorPointerEntry(errors[e], errorContainer);
    }

    div.appendChild(errorContainer);

    document.body.insertBefore(div, document.body.firstChild);
  }

  function createErrorPointerEntry(error, container) {
    var p = document.createElement("p");
    p.className = "in-browser-linter-palette";
    p.innerHTML =
      encodeHTML(error.selector) +
      ":<br/>" +
      encodeHTML(error.property) +
      ":<br/>&nbsp;&nbsp;WANT: " +
      encodeHTML(
        error.expectedValues.join("<br/>&nbsp;&nbsp;&nbsp;&nbsp;or: ")
      ) +
      "<br/>&nbsp;&nbsp;HAVE: " +
      encodeHTML(error.actualValue);

    var button = document.createElement("button");
    button.className = "in-browser-linter-palette";
    button.innerHTML = "&rarr; Locate example";
    button.style.cssText =
      "all: initial; background: rgba(255,0,0,0.5); padding: 0.5rem; margin: 0.25rem; border-radius: 5px; font-family: avenir, arial, tahoma;";
    button.id =
      "pointer-" +
      (error.selector + "-" + error.property).replace(
        /[ .,#$\^&\*;:{}=~()]/g,
        "_"
      );
    button.title = "Click to scroll";
    button.onmouseover = function () {
      button.style.cssText = onHoverStyle;
      locateError(error, button.id);
    };
    button.onmouseout = function () {
      button.style.cssText = offHoverStyle;
      deleteLines();
    };
    button.onclick = function () {
      moveToLocatedError(error);
      deleteLines();
      locateError(error, button.id);
    };
    p.appendChild(button);

    container.appendChild(p);
  }

  function locateError(error, buttonID) {
    var buttonPosition = document
      .getElementById(buttonID)
      .getBoundingClientRect();
    if (!error.element) return;
    var fromCenterX =
      buttonPosition.width / 2 + buttonPosition.left + window.scrollX; // window.innerWidth/2 + window.scrollX;
    var fromCenterY =
      buttonPosition.height / 2 + buttonPosition.top + window.scrollY; // window.innerHeight/2 + window.scrollY;
    var targetCenterX =
      error.element.getBoundingClientRect().width / 2 +
      error.element.getBoundingClientRect().left +
      window.scrollX;
    var targetCenterY =
      error.element.getBoundingClientRect().height / 2 +
      error.element.getBoundingClientRect().top +
      window.scrollY;
    document.body.appendChild(
      createLine(fromCenterX, fromCenterY, targetCenterX, targetCenterY)
    );
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
    var styles =
      "z-index: 9998; background: red; border-radius: 1rem; border: 0.15rem solid white; padding: 0.15rem; " +
      "width: " +
      length +
      "px; " +
      "position: absolute; " +
      "top: " +
      y +
      "px; " +
      "left: " +
      x +
      "px; " +
      "-moz-transform: rotate(" +
      angle +
      "rad); " +
      "-webkit-transform: rotate(" +
      angle +
      "rad); " +
      "-o-transform: rotate(" +
      angle +
      "rad); " +
      "-ms-transform: rotate(" +
      angle +
      "rad); " +
      "transform: rotate(" +
      angle +
      "rad); ";
    line.setAttribute("style", styles);
    line.className = "in-browser-linter-pointer";
    return line;
  }

  function createCircle(x, y) {
    var circle = document.createElement("div");
    var diameter = window.innerHeight / 3;
    var styles =
      "all: initial; z-index: 9997; position: absolute; background: rgba(255,0,0,0.1); width: " +
      diameter +
      "px; height: " +
      diameter +
      "px; border-radius: " +
      diameter / 2 +
      "px; overflow: hidden; ";
    styles += "left: " + (x - diameter / 2) + "px; ";
    styles += "top: " + (y - diameter / 2) + "px; ";
    circle.setAttribute("style", styles);
    circle.className = "in-browser-linter-pointer";
    return circle;
  }

  function deleteLines() {
    var lines = document.getElementsByClassName("in-browser-linter-pointer");
    while (lines.length > 0) {
      lines[0].parentNode.removeChild(lines[0]);
    }
  }

  function moveToLocatedError(error) {
    if (!error.element) return;
    var targetCenterX =
      error.element.getBoundingClientRect().width / 2 +
      error.element.getBoundingClientRect().left +
      window.scrollX;
    var targetCenterY =
      error.element.getBoundingClientRect().height / 2 +
      error.element.getBoundingClientRect().top +
      window.scrollY;
    window.scrollTo(targetCenterX, targetCenterY);
  }

  function makeElementDraggable(element) {
    var x = 0;
    var y = 0;
    element.onmousedown = dragOnMouseDown;

    function dragOnMouseDown(event) {
      var event = event || window.event;
      event.preventDefault();
      x = event.clientX;
      y = event.clientY;
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
      var xChange = event.clientX - x;
      var yChange = event.clientY - y;
      x = event.clientX;
      y = event.clientY;
      element.style.left = element.offsetLeft + xChange + "px";
      element.style.top = element.offsetTop + yChange + "px";
    }
  }

  function addEventListenersSafely() {
    // removeEventListener does not seem to work
    if (alreadyAddedEventListeners === undefined) {
      document.addEventListener("mouseover", pointerPreviewOnMouseOver);
      document.addEventListener("keydown", getPointerPreviewIdentifier);
      alreadyAddedEventListeners = true;
    } else {
      // do nothing
    }
  }

  function pointerPreviewOnMouseOver(event) {
    var isPaletteOpen = document.getElementById("in-browser-linter-palette");
    if (!isPaletteOpen) {
      return;
    }
    var e = event.target;
    var classes =
      e.className && e.className !== ""
        ? "." + e.className.trim().replace(/ +/g, ".")
        : "";
    var isInPalette = classes.includes("in-browser-linter-palette");
    var pointerPreview = document.getElementById(
      "in-browser-linter-palette-pointer-preview"
    );
    if (!isInPalette) {
      var parentIdentifier = "";
      var identifier = getIdentifier(event);
      var isUnique = isIdentifierUnique(identifier);
      if (!isUnique) {
        // see if prepending parent identifier would make identifier unique
        parentIdentifier = getParentIdentifier(event);
        var identifierWithParentPrepended = parentIdentifier + ">" + identifier;
        isUnique = isIdentifierUnique(identifierWithParentPrepended);
      }
      parentIdentifier = encodeHTML(parentIdentifier);
      identifier = encodeHTML(identifier);
      if (isUnique) {
        pointerPreview.style.cssText =
          "margin: 0.75rem; background: #41f4ca; padding: 0.5rem; width: 80%; min-height: 4rem; word-wrap: break-word; transition: 0.5s; ";
        pointerPreview.innerHTML = `<span style="font-size: 0.95rem;">Your pointer is hovering over: </span><i class='in-browser-linter-palette' style="color:#36d1af"><span style="font-size:0.9rem">Hit Ctrl+i (or control+i) to copy to clipboard:</span></i><div style="padding-left:0.5rem">${
          parentIdentifier ? parentIdentifier + ">" : ""
        }<strong class='in-browser-linter-palette'>${identifier}</strong></div>`;
        pointerPreview.title =
          (parentIdentifier ? parentIdentifier + ">" : "") + identifier;
      } else {
        pointerPreview.style.cssText =
          "margin: 0.75rem; background: #f4bc42; padding: 0.5rem; width: 80%; min-height: 4rem; word-wrap: break-word; transition: 0.5s; ";
        pointerPreview.innerHTML = `<span style="font-size: 0.95rem;">Your pointer is hovering over: </span><i class='in-browser-linter-palette' style="color:red">(NOT UNIQUE!) <span style="font-size:0.9rem">Hover elsewhere? Might need innerHTML.</span></i> <div style="padding-left:0.5rem">${
          parentIdentifier ? parentIdentifier + ">" : ""
        }<strong class='in-browser-linter-palette'>${identifier}</strong></div>`;
        pointerPreview.title =
          (parentIdentifier ? parentIdentifier + ">" : "") + identifier;
      }
    } else {
      pointerPreview.style.cssText =
        "margin: 0.75rem; text-align: center; line-height: 3rem; background: white; color: grey; padding: 0.5rem; width: 80%; min-height: 4rem; word-wrap: break-word; transition: 0.5s; ";
      pointerPreview.innerHTML =
        '<i class="in-browser-linter-palette">(Hover over an element to preview its identifier.)</i>';
      pointerPreview.title = "";
    }
  }

  function getIdentifier(event) {
    var e = event.target || event;
    var tag = e.tagName ? e.tagName.trim().toLowerCase() : "";
    var id = e.id ? "#" + e.id.trim() : "";
    var classes =
      e.className && e.className !== ""
        ? "." + e.className.trim().replace(/ +/g, ".")
        : "";
    var identifier = tag + id + classes;
    return identifier;
  }

  function isIdentifierUnique(identifier) {
    return typeof document.querySelectorAll(identifier)[1] === "undefined"; // index 1 should not exist
  }

  function getParentIdentifier(event) {
    var e = event.parentElement || event.target.parentElement;
    var tag = e.tagName ? e.tagName.trim().toLowerCase() : "";
    var id = e.id ? "#" + e.id.trim() : "";
    var classes = e.className
      ? "." + e.className.trim().replace(/ /g, ".")
      : "";
    var identifier = tag + id + classes;
    return identifier;
  }

  function getPointerPreviewIdentifier(e) {
    let eventObject = window.event ? event : e;
    let hitCtrlOrCmd = eventObject.ctrlKey || eventObject.metaKey;
    let hitIKey = eventObject.keyCode == 73;
    if (hitCtrlOrCmd && hitIKey) {
      let pointerPreviewTitle = copyPointerPreviewToClipboard();
      if (pointerPreviewTitle) {
        alert(`Copied to clipboard: \n\n${pointerPreviewTitle}`);
      }
    }
  }

  function copyPointerPreviewToClipboard() {
    let pointerPreview = document.getElementById(
      "in-browser-linter-palette-pointer-preview"
    );
    if (pointerPreview && pointerPreview.title) {
      let container = document.createElement("div");
      container.innerHTML = `{
    selector: '${encodeHTML(pointerPreview.title)}',
    property: '',
    expectedValues: [''],
    /* contains: true, */
    /* innerHTML: '' */
},`;
      container.style.position = "fixed";
      container.style.pointerEvents = "none";
      container.style.opacity = 0;
      document.body.appendChild(container);
      window.getSelection().removeAllRanges();
      let range = document.createRange();
      range.selectNode(container);
      window.getSelection().addRange(range);
      document.execCommand("copy");
      return container.innerHTML;
    }
  }

  function standardizeSpacesAfterCommas(text) {
    return text.replace(/,(\S)/g, ", $1");
  }

  function convertColorToRGB(text) {
    var parameters = text.split(" ");
    var result = [];
    for (var i = 0; i < parameters.length; i++) {
      if (parameters[i][0] === "#") {
        result.push(hexToRgbColor(parameters[i]));
      } else {
        result.push(colorNameToRgb(parameters[i]));
      }
    }
    return result.join(" ");
  }

  function hexToRgbColor(text) {
    var shorthandHexPattern = /^#([a-f\d])([a-f\d])([a-f\d])$/i; // e.g. #123
    var longhandHexCode = text.replace(shorthandHexPattern, function (
      entire,
      r,
      g,
      b
    ) {
      return "#" + r + r + g + g + b + b;
    });
    var longhandHexPattern = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      longhandHexCode
    ); // e.g. #123456
    if (longhandHexPattern) {
      return (
        "rgb(" +
        parseInt(longhandHexPattern[1], 16) +
        ", " +
        parseInt(longhandHexPattern[2], 16) +
        ", " +
        parseInt(longhandHexPattern[3], 16) +
        ")"
      );
    } else {
      return text;
    }
  }

  function colorNameToRgb(text) {
    var colourNames = {
      aliceblue: "rgb(240, 248, 255)",
      antiquewhite: "rgb(250, 235, 215)",
      aqua: "rgb(0, 255, 255)",
      aquamarine: "rgb(127, 255, 212)",
      azure: "rgb(240, 255, 255)",
      beige: "rgb(245, 245, 220)",
      bisque: "rgb(255, 228, 196)",
      black: "rgb(0, 0, 0)",
      blanchedalmond: "rgb(255, 235, 205)",
      blue: "rgb(0, 0, 255)",
      blueviolet: "rgb(138, 43, 226)",
      brown: "rgb(165, 42, 42)",
      burlywood: "rgb(222, 184, 135)",
      cadetblue: "rgb(95, 158, 160)",
      chartreuse: "rgb(127, 255, 0)",
      chocolate: "rgb(210, 105, 30)",
      coral: "rgb(255, 127, 80)",
      cornflowerblue: "rgb(100, 149, 237)",
      cornsilk: "rgb(255, 248, 220)",
      crimson: "rgb(220, 20, 60)",
      cyan: "rgb(0, 255, 255)",
      darkblue: "rgb(0, 0, 139)",
      darkcyan: "rgb(0, 139, 139)",
      darkgoldenrod: "rgb(184, 134, 11)",
      darkgray: "rgb(169, 169, 169)",
      darkgrey: "rgb(169, 169, 169)",
      darkgreen: "rgb(0, 100, 0)",
      darkkhaki: "rgb(189, 183, 107)",
      darkmagenta: "rgb(139, 0, 139)",
      darkolivegreen: "rgb(85, 107, 47)",
      darkorange: "rgb(255, 140, 0)",
      darkorchid: "rgb(153, 50, 204)",
      darkred: "rgb(139, 0, 0)",
      darksalmon: "rgb(233, 150, 122)",
      darkseagreen: "rgb(143, 188, 143)",
      darkslateblue: "rgb(72, 61, 139)",
      darkslategray: "rgb(47, 79, 79)",
      darkslategrey: "rgb(47, 79, 79)",
      darkturquoise: "rgb(0, 206, 209)",
      darkviolet: "rgb(148, 0, 211)",
      deeppink: "rgb(255, 20, 147)",
      deepskyblue: "rgb(0, 191, 255)",
      dimgray: "rgb(105, 105, 105)",
      dimgrey: "rgb(105, 105, 105)",
      dodgerblue: "rgb(30, 144, 255)",
      firebrick: "rgb(178, 34, 34)",
      floralwhite: "rgb(255, 250, 240)",
      forestgreen: "rgb(34, 139, 34)",
      fuchsia: "rgb(255, 0, 255)",
      gainsboro: "rgb(220, 220, 220)",
      ghostwhite: "rgb(248, 248, 255)",
      gold: "rgb(255, 215, 0)",
      goldenrod: "rgb(218, 165, 32)",
      gray: "rgb(128, 128, 128)",
      grey: "rgb(128, 128, 128)",
      green: "rgb(0, 128, 0)",
      greenyellow: "rgb(173, 255, 47)",
      honeydew: "rgb(240, 255, 240)",
      hotpink: "rgb(255, 105, 180)",
      "indianred ": "rgb(205, 92, 92)",
      indigo: "rgb(75, 0, 130)",
      ivory: "rgb(255, 255, 240)",
      khaki: "rgb(240, 230, 140)",
      lavender: "rgb(230, 230, 250)",
      lavenderblush: "rgb(255, 240, 245)",
      lawngreen: "rgb(124, 252, 0)",
      lemonchiffon: "rgb(255, 250, 205)",
      lightblue: "rgb(173, 216, 230)",
      lightcoral: "rgb(240, 128, 128)",
      lightcyan: "rgb(224, 255, 255)",
      lightgoldenrodyellow: "rgb(250, 250, 210)",
      lightgrey: "rgb(211, 211, 211)",
      lightgreen: "rgb(144, 238, 144)",
      lightpink: "rgb(255, 182, 193)",
      lightsalmon: "rgb(255, 160, 122)",
      lightseagreen: "rgb(32, 178, 170)",
      lightskyblue: "rgb(135, 206, 250)",
      lightslategray: "rgb(119, 136, 153)",
      lightslategrey: "rgb(119, 136, 153)",
      lightsteelblue: "rgb(176, 196, 222)",
      lightyellow: "rgb(255, 255, 224)",
      lime: "rgb(0, 255, 0)",
      limegreen: "rgb(50, 205, 50)",
      linen: "rgb(250, 240, 230)",
      magenta: "rgb(255, 0, 255)",
      maroon: "rgb(128, 0, 0)",
      mediumaquamarine: "rgb(102, 205, 170)",
      mediumblue: "rgb(0, 0, 205)",
      mediumorchid: "rgb(186, 85, 211)",
      mediumpurple: "rgb(147, 112, 216)",
      mediumseagreen: "rgb(60, 179, 113)",
      mediumslateblue: "rgb(123, 104, 238)",
      mediumspringgreen: "rgb(0, 250, 154)",
      mediumturquoise: "rgb(72, 209, 204)",
      mediumvioletred: "rgb(199, 21, 133)",
      midnightblue: "rgb(25, 25, 112)",
      mintcream: "rgb(245, 255, 250)",
      mistyrose: "rgb(255, 228, 225)",
      moccasin: "rgb(255, 228, 181)",
      navajowhite: "rgb(255, 222, 173)",
      navy: "rgb(0, 0, 128)",
      oldlace: "rgb(253, 245, 230)",
      olive: "rgb(128, 128, 0)",
      olivedrab: "rgb(107, 142, 35)",
      orange: "rgb(255, 165, 0)",
      orangered: "rgb(255, 69, 0)",
      orchid: "rgb(218, 112, 214)",
      palegoldenrod: "rgb(238, 232, 170)",
      palegreen: "rgb(152, 251, 152)",
      paleturquoise: "rgb(175, 238, 238)",
      palevioletred: "rgb(216, 112, 147)",
      papayawhip: "rgb(255, 239, 213)",
      peachpuff: "rgb(255, 218, 185)",
      peru: "rgb(205, 133, 63)",
      pink: "rgb(255, 192, 203)",
      plum: "rgb(221, 160, 221)",
      powderblue: "rgb(176, 224, 230)",
      purple: "rgb(128, 0, 128)",
      rebeccapurple: "rgb(102, 51, 153)",
      red: "rgb(255, 0, 0)",
      rosybrown: "rgb(188, 143, 143)",
      royalblue: "rgb(65, 105, 225)",
      saddlebrown: "rgb(139, 69, 19)",
      salmon: "rgb(250, 128, 114)",
      sandybrown: "rgb(244, 164, 96)",
      seagreen: "rgb(46, 139, 87)",
      seashell: "rgb(255, 245, 238)",
      sienna: "rgb(160, 82, 45)",
      silver: "rgb(192, 192, 192)",
      skyblue: "rgb(135, 206, 235)",
      slateblue: "rgb(106, 90, 205)",
      slategray: "rgb(112, 128, 144)",
      slategrey: "rgb(112, 128, 144)",
      snow: "rgb(255, 250, 250)",
      springgreen: "rgb(0, 255, 127)",
      steelblue: "rgb(70, 130, 180)",
      tan: "rgb(210, 180, 140)",
      teal: "rgb(0, 128, 128)",
      thistle: "rgb(216, 191, 216)",
      tomato: "rgb(255, 99, 71)",
      turquoise: "rgb(64, 224, 208)",
      violet: "rgb(238, 130, 238)",
      wheat: "rgb(245, 222, 179)",
      white: "rgb(255, 255, 255)",
      whitesmoke: "rgb(245, 245, 245)",
      yellow: "rgb(255, 255, 0)",
      yellowgreen: "rgb(154, 205, 50)",
    };

    if (typeof colourNames[text.toLowerCase()] != "undefined") {
      return colourNames[text.toLowerCase()];
    } else {
      return text;
    }
  }

  function encodeHTML(html) {
    // examle: '<script>alert("hi");</script>' -> "&lt;script&gt;alert(\"hi\");&lt;/script&gt;"
    return document
      .createElement("div")
      .appendChild(document.createTextNode(html)).parentNode.innerHTML;
  }
})();
