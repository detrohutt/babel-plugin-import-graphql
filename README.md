# Babel Inline Import [![Build Status](https://travis-ci.org/Quadric/babel-plugin-inline-import.svg?branch=master)](https://travis-ci.org/Quadric/babel-plugin-inline-import)
Babel plugin to add the opportunity to use `import` with raw/literal content<br>
It is good e.g. for importing `*.graphql` files into your code.

## Examples

Before (without Babel-Inline-Import):
```javascript
// server.js

// bad syntax highlighting, no syntax checking
const typeDefinitions = `
type Query {
  testString: String
}
schema {
  query: Query
}
`;

graphQLServer({
  schema: [typeDefinitions],
  ...
});
```

Now (with Babel-Inline-Import):
```javascript
// /some/schema.graphql
type Query {
  testString: String
}
schema {
  query: Query
}
```

```javascript
// server.js
import schema from '/some/schema.graphql';

graphQLServer({
  schema: [schema],
  ...
});
```

**Note:** both cases are equivalent and will result in similar code after Babel transpile them. Check [How it works](#how-it-works) section for details.

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

By default, Babel-Inline-Import is compatible with the following file extensions:

* .raw
* .text
* .graphql


## Customize
If you want to enable different file extensions, you can define them in your `.babelrc` file
```javascript
{
  "plugins": [
    ["babel-plugin-inline-import", {
      "extensions": [
        ".json",
        ".sql"
      ]
    }]
  ]
}
```

## How it works

It inserts the __content__ of the _imported file_ directly into the _importing file_, assigning it to a variable with the same identifier of the _import statement_, thus replacing the _import statement_ and the _file path_ by its resulting raw content (no parsing occurs).


## Motivate
If you like this project just give it a star :) I like stars.
