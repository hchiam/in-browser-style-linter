# in-browser-style-linter
In-browser style linter.

## To use it, run it in your browser:
* Chrome: snippets
* Firefox: scratchpad

## To add a setting, edit this part of the JS code:
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
    s: 'p#description',
    p: 'font-family',
    v: 'avenir'
];
```
