# in-browser-style-linter
Do quick style checks on your page _after_ it renders, and _without leaving your browser_: 

1. Add settings. 
2. Run in-browser. [(Chrome/Firefox/IE)](https://github.com/hchiam/in-browser-style-linter#step-2-set-up-your-browser-to-run-the-js-code)
3. See red buttons.

Or follow this demo: https://goo.gl/ou1KEv

## STEP 1: To add a setting, edit [this part](https://github.com/hchiam/in-browser-style-linter/blob/master/linter.js#L3) of the JS code:
```js
// Enter your desired settings here:
var settings = [
    {
        s:'a', // selector
        p:'color', // property
        v:['red','rgb(88, 96, 105)'], // acceptable expected values
        // c:true // "contains" (actual value can contain expected value)
        // i:'Some innerHTML text.' // innerHTML
    }
];
```
to something like this:
```js
// Enter your desired settings here:
var settings = [
    {
        s: 'a', // selector
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

Hovering over the error button shows the expected and actual values. See this demo: https://goo.gl/ou1KEv

# More info:

<details>
<summary><strong>Basic</strong></summary>

Minimal required info:

```js
var settings = [
    {
        selector:'a', // a CSS selector like 'div span a:hover'
        property:'color', // a CSS property
        value:'red' // the expected value after page render
    }
];
```
</details>

<details>
<summary><strong>Contains Value</strong></summary>

To relax the matching of the property value to simply "contain" the expected value, set the optional parameter to true:

```js
var settings = [
    {
        selector:'a',
        property:'background',
        value:'lightblue',
        contains:true // would not flag 'lightblue url("img_tree.gif") no-repeat fixed center' as error
    }
];
```
</details>

<details>
<summary><strong>Multiple Allowable Values</strong></summary>

To specify several allowable values, use an array:

```js
var settings = [
    {
        selector:'a',
        property:'color',
        value:['red', 'rgb(88, 96, 105)']
    }
];
```
</details>

<details>
<summary><strong>Specify innerHTML</strong></summary>

To specify elements that have a specific innerHTML (in addition to the CSS selector), set the optional parameter value:

```js
var settings = [
    {
        selector:'a',
        property:'color',
        innerHTML:'Some innerHTML text.', // check the color of <a> tags with this innerHTML
        value:'rgb(88, 96, 105)'
    }
];
```
</details>
