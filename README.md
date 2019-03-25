# in-browser-style-linter
Find style problems in your page _after_ it renders: 
1. Add settings. 
2. Run in-browser. 
3. See red buttons.

## STEP 1: To add a setting, edit this part of the JS code:
```js
// Enter your desired settings here:
var settings = [
{
    s: 'h1', // selector
    p: 'color', // property
    v: 'red' // expected value
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
* Chrome: [snippets](https://developers.google.com/web/tools/chrome-devtools/snippets)
* Firefox: [Scratchpad](https://developer.mozilla.org/en-US/docs/Tools/Scratchpad)

## STEP 3: You'll see ugly red buttons, like this:

![image](https://github.com/hchiam/in-browser-style-linter/blob/master/example-screenshot.png)

Clicking on the button shows the expected and actual values.
