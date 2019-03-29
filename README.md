# in-browser-style-linter
Do quick style checks on your page _after_ it renders, and _without leaving your browser_: 

1. Add settings. 
2. Run in-browser. [(Chrome/Firefox/IE)](https://github.com/hchiam/in-browser-style-linter#step-2-set-up-your-browser-to-run-the-js-code)
3. See red buttons.

## STEP 1: To add a setting, edit [this part](https://github.com/hchiam/in-browser-style-linter/blob/master/linter.js#L3) of the JS code:
```js
// Enter your desired settings here:
var settings = [
    {
        s:'h1', // selector
        p:'color', // property
        v:['red','rgb(88, 96, 105)'], // acceptable expected values
        // c:true // "contains" (actual value can contain expected value)
    }
];
```
to something like this:
```js
// Enter your desired settings here:
var settings = [
    {
        s: 'h1', // selector
        p: 'color', // property
        v: 'red' // expected value
    },
    {
        s: 'p#description',
        p: 'font-family',
        v: 'avenir'
    }
];
```

## STEP 2: Set up your browser to run the JS code:
* Chrome extension: [In-Browser Style Linter](https://chrome.google.com/webstore/detail/in-browser-style-linter/mopnkclaipjghhmneijljnljeimjahfc)
* Chrome: [snippets](https://developers.google.com/web/tools/chrome-devtools/snippets)
* Firefox: [Scratchpad](https://developer.mozilla.org/en-US/docs/Tools/Scratchpad)
* Internet Explorer: F12 > Console > paste the whole code into the terminal (paste after the ">" symbol on the bottom) > Ctrl+Enter (or hit run)

## STEP 3: You'll see ugly red buttons, like this:

![image](https://github.com/hchiam/in-browser-style-linter/blob/master/example-screenshot.png)

Clicking on the button shows the expected and actual values.
