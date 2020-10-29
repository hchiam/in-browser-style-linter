# [<img src="extension-folder/linter.png" height="50px"> in-browser-style-linter](https://chrome.google.com/webstore/detail/in-browser-style-linter/mopnkclaipjghhmneijljnljeimjahfc)

![version](https://img.shields.io/github/release/hchiam/in-browser-style-linter?style=flat-square) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT) [![HitCount](http://hits.dwyl.com/hchiam/in-browser-style-linter.svg)](http://hits.dwyl.com/hchiam/in-browser-style-linter)

[Chrome extension](https://chrome.google.com/webstore/detail/in-browser-style-linter/mopnkclaipjghhmneijljnljeimjahfc) / [Firefox add-on](https://addons.mozilla.org/en-CA/firefox/addon/in-browser-style-linter)

Do quick style checks on your page _after_ it renders, _without leaving your browser_, and with minimal friction to setup (important for adoption):

1. Add settings.
2. Run in-browser. [(Chrome/Firefox/IE)](https://github.com/hchiam/in-browser-style-linter#step-2-set-up-your-browser-to-run-the-js-code)
3. See red buttons.

Or follow this demo: <https://youtu.be/eK5jMvivitQ>

Side step the worry of whether your style will be overridden, or whether you're accurately testing/simulating the computed styles; make use of the fact that the browser already renders the styles that the user sees.

## STEP 1: To add a setting, edit [this part](https://github.com/hchiam/in-browser-style-linter/blob/master/linter.js#L3) of the JS code:

```js
// Enter your desired settings here:
var settings = [
  {
    selector: "a", // CSS selector
    property: "color", // CSS property to check
    expectedValues: ["red", "rgb(88, 96, 105)"], // acceptable expected values of property
    // contains:true // OPTIONAL: boolean to say actual value can at least contain the expected value
    // innerHTML:'Some innerHTML text.' // OPTIONAL: you can be more specific than CSS selectors
  },
];
```

to something like this (try it on <https://www.google.com>):

```js
// Enter your desired settings here:
var settings = [
  {
    s: "a",
    p: "font-family",
    v: "avenir",
    i: "About",
  },
  {
    s: "a.gb_d",
    p: "font-family",
    v: "avenir",
    c: true,
  },
  {
    s: ".gLFyf.gsfi",
    p: "color",
    v: ["#eee", "rgb(88, 96, 105)", "#3e3e3e"],
  },
];
```

(For details, see [more info](https://github.com/hchiam/in-browser-style-linter#more-info-click-to-expand).)

## STEP 2: Set up your browser to run the JS code:

- Chrome extension: [In-Browser Style Linter](https://chrome.google.com/webstore/detail/in-browser-style-linter/mopnkclaipjghhmneijljnljeimjahfc)
- Chrome: [snippets](https://developers.google.com/web/tools/chrome-devtools/snippets)
- Firefox add-on: [In-Browser Style Linter](https://addons.mozilla.org/en-CA/firefox/addon/in-browser-style-linter)
- Firefox: [console in Multi-line mode](https://developer.mozilla.org/en-US/docs/Tools/Web_Console/The_command_line_interpreter#Multi-line_mode)
- Internet Explorer: F12 > Console > paste the whole code into the terminal (paste after the ">" symbol on the bottom) > Ctrl+Enter (or hit run)

## STEP 3: You'll see ugly red buttons, like this:

![image](https://github.com/hchiam/in-browser-style-linter/blob/master/example-screenshot.png)

Hovering over the error button shows the expected and actual values. See this demo: <https://youtu.be/eK5jMvivitQ>

# More info: (click to expand)

<details>
<summary><strong>Basics ("SVP")</strong></summary>

Minimal required info:

```js
var settings = [
  {
    selector: "a", // a CSS selector like 'div span a:hover'
    property: "color", // a CSS property
    value: "red", // the expected value after page render
  },
];
```

All parameters have short forms to let you save on keystrokes. Here's an equivalent to the example above:

```js
var settings = [
  {
    s: "a", // s is for selector
    p: "color", // p is for property
    v: "red", // v (or ev) is for expected value
  },
];
```

</details>

<details>
<summary><strong>c is for Contains Value</strong></summary>

To relax the matching of the property value to simply "contain" the expected value, set the optional **contains** parameter to true:

```js
var settings = [
  {
    selector: "a",
    property: "background",
    value: "#333",
    contains: true, // would not flag '#333 url("img_tree.gif") no-repeat fixed center' as error
  },
];
```

All parameters have short forms to let you save on keystrokes. Here's an equivalent to the example above:

```js
var settings = [
  {
    s: "a",
    p: "background",
    v: "#333",
    c: true, // would not flag '#333 url("img_tree.gif") no-repeat fixed center' as error
  },
];
```

</details>

<details>
<summary><strong>Multiple Allowable Values = []</strong></summary>

To specify several allowable expected values, use an array:

```js
var settings = [
  {
    selector: "a",
    property: "color",
    value: ["red", "rgb(88, 96, 105)"],
  },
];
```

This is also compatible with the "contains" option (see above).

</details>

<details>
<summary><strong>i Can Be More Specific with innerHTML</strong></summary>

To specify elements that have a specific innerHTML (in addition to the CSS selector), set the optional parameter value:

```js
var settings = [
  {
    selector: "a",
    property: "color",
    innerHTML: "Some innerHTML text.", // check the color of <a> tags with this innerHTML
    value: "rgb(88, 96, 105)",
  },
];
```

All parameters have short forms to let you save on keystrokes. Here's an equivalent to the example above:

```js
var settings = [
  {
    s: "a",
    p: "color",
    i: "Some innerHTML text.", // check the color of <a> tags with this innerHTML
    v: "rgb(88, 96, 105)",
  },
];
```

</details>

<details>
<summary><strong>Modify Values in One Place</strong></summary>

You can use variables to update properties in one place instead of updating the whole settings array. For example:

```js
var myColour = 'blue'; // you edit the value here, just one place

var settings = [
    {
        s:'button.btn.btn-info',
        p:'background',
        v:myColour
    },
    ...
    {
        s:'a.some-fancy-button',
        p:'background',
        v:myColour
    },
    ...
    {
        s:'label.consistent-styling-ftw'
        p:'background',
        v:myColour
    }
];
```

And avoid situations like this:

```js
var settings = [
    {
        s:'button.btn.btn-info',
        p:'background',
        v:'blue' // edit here
    },
    ...
    {
        s:'a.some-fancy-button',
        p:'background',
        v:'blue' // and here
    },
    ...
    {
        s:'label.consistent-styling-ftw'
        p:'background',
        v:'lightblue' // oops I forgot, where else do I have to change this?
    }
];
```

</details>

# Want to understand how the code works?

## In my mind, the key line of code is this:

```js
var elements = document.querySelectorAll(
  selector + ":not(.in-browser-linter-button)"
);
```

## If you want more details:

I recommend you start with reading the standalone snippet: <https://github.com/hchiam/in-browser-style-linter/blob/master/linter.js>

History alert: Pure JavaScript. No jQuery. This was originally just a snippet I'd copy and paste into Chrome DevTools.

## Conceptual data flow in the [extension-folder](https://github.com/hchiam/in-browser-style-linter/tree/master/extension-folder) folder:

```js
manifest.json -> popup.html (the settings popup) -> popup.js -> main.js -> (the summary popup)
```

# Like this project?

A Chrome extension template repo: [chrome-extension-template](https://github.com/hchiam/chrome-extension-template)

## Other Chrome extensions:

A Chrome extension project I helped tutor and contribute to: [Habit-Tracker-Extension](https://github.com/marko-polo-cheno/Habit-Tracker-Extension)

A tool to quickly search links and menus (even if collapsed): [quick-menu-search](https://github.com/hchiam/quick-menu-search)

Another Chrome extension (_note:_ very experimental): [select-hover-search](https://github.com/hchiam/select-hover-search)

Another Chrome extension (_note:_ very experimental): [in-browser-test-automator](https://github.com/hchiam/in-browser-test-automator)

## Firefox add-ons:

[Console Log Element](https://github.com/hchiam/console-log-element)

[Check All Scripts with URLVoid](https://github.com/hchiam/urlvoid-firefox-extension)

# Want to make a linter in VS Code instead?

Custom VS Code linter template repo: [custom-vscode-linter](https://github.com/hchiam/custom-vscode-linter)
