# Babel Root Import
Babel plugin to add the opportunity to use `import` with root based paths.<br>

## Example
```javascript
// Usually
import SomeExample from '../../../some/example.js';

// With Babel-Root-Importer
import SomeExample from '/some/example.js';
```

## Install
```
npm install babel-plugin-inline-import --save-dev
```

## Use
Add a `.babelrc` file and write:
```javascript
{
  "plugins": [
    "babel-plugin-inline-import"
  ]
}
```
or pass the plugin with the plugins-flag on CLI
```
babel-node myfile.js --plugins babel-plugin-inline-import
```

## Extras
If you want a custom root because for example all your files are in the src/js folder you can define this in your `.babelrc` file
```javascript
{
  "plugins": [
    ["babel-plugin-inline-import", {
      "rootPathSuffix": "src/js"
    }]
  ]
}
```

## Motivate
If you like this project just give it a star :) I like stars.
