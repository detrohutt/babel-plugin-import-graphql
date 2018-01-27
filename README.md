[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3AYURHRU7PMCL)

# Babel Inline Import GraphQL AST

Babel plugin allowing you to `import` `.graphql` and `.gql` files. The code is pre-parsed by `gql` from `graphql-tag` and the GraphQL AST object is inserted into your code at transpile time.

## Known Issues

#### `Cannot read property 'type' of undefined` in file containing .gql/.graphql import

I'm putting this right at the top because if you use this package to any real degree you'll almost certainly experience this error at some point and it can be hard to track down if you don't know what it is. This is caused by a bug in Babel 6.

A PR has been submitted to Babel [here](https://github.com/babel/babel/pull/7205) and hopefully they'll merge it and make a patch release soon.

In the meantime, there's an easy, although annoying, workaround. Just change the content of the file throwing the error in any way. The easiest and most reliable change I've found is to simply add an empty comment `//` on it's own line when this error occurs. As the file gets updated over time, you can later remove the empty comment. I usually only have 1 or 2 of these in my project at any given time.

## Known use cases

* Replaces `graphql-tag/loader` in projects where Webpack is unavailable(i.e. [NextJS](https://github.com/zeit/next.js/))

* Users of [create-react-app](https://github.com/facebook/create-react-app/) that want to avoid ejecting their app can use this package indirectly by using [react-app-rewire-inline-import-graphql-ast](https://github.com/detrohutt/react-app-rewire-inline-import-graphql-ast)

## Examples

Before (without babel-plugin-inline-import-graphql-ast):

```javascript
// ProductsPage.js

...
import { gql } from 'react-apollo'

class ProductsPage extends React.Component {
  ...
}

const productsQuery = gql`
  query products {
    products {
      productId
      name
      description
      weight
    }
  }
`

export default graphql(productsQuery)(ProductsPage)
```

Now (with babel-plugin-inline-import-graphql-ast):

```javascript
// productFragment.graphql
fragment productFragment on Product {
  name
  description
  weight
}

// productsQuery.graphql
#import "./productFragment.graphql"
query products {
  products {
    productId
    ...productFragment
  }
}

// ProductsPage.js

...
import myImportedQuery from './productsQuery.graphql'

class ProductsPage extends React.Component {
  ...
}

export default graphql(myImportedQuery)(ProductsPage)
```

**Note:** both cases are equivalent and will result in similar code after Babel transpiles them. Check [How it works](#how-it-works) section for details.

## Install

```
yarn add -D babel-plugin-inline-import-graphql-ast
```

## Use

Add a `.babelrc` file and write:

```javascript
{
  "plugins": [
    "babel-plugin-inline-import-graphql-ast"
  ]
}
```

or pass the plugin with the plugins-flag on CLI

```
babel-node myfile.js --plugins babel-plugin-inline-import-graphql-ast
```

Babel-Inline-Import supports the following file extensions:

* .graphql
* .gql

## options

* `nodePath` -- Takes a string just like the [`NODE_PATH`](https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders) environment variable and is used to allow resolution of absolute paths to your `.gql`/`.graphql` files. Note this currently only works in javascript files. If you already have your `NODE_PATH` variable set in your environment, you don't need to set this option. It is intended primarily for use with [react-app-rewire-inline-import-graphql-ast](https://github.com/detrohutt/react-app-rewire-inline-import-graphql-ast).

## How it works

When you `import` a `.graphql` or `.gql` file, it is parsed into a GraphQL AST object by the `gql` function from `graphql-tag`. This AST object is inserted directly into the _importing file_, in a variable with the name defined in the _import statement_. The import should be treated as a default import(name whatever you want; no braces necessary)

## Caveats

Babel does not track dependency between _imported_ and _importing_ files after the transformation is made. Therefore, you need to change the _importing file_ in order to see your changes in the _imported file_ take effect. To overcome this, you can:

* Disable babel cache (`BABEL_DISABLE_CACHE=1`)

Also make sure that your task runner is watching for changes in the _imported file_ as well. You can see it working [here](https://github.com/Quadric/perfect-graphql-starter/blob/master/nodemon.json).

**Note** - If `BABEL_DISABLE_CACHE` doesn't work, you'll need to manually clear the `node_modules/.cache` folder to re-transpile your `.gql`/`.graphql` files. You can either prepend your normal `start` script command with `rimraf ./node_modules/.cache &&` or create a separate script i.e. `clean`. Note you'd need the rimraf dependency installed in this example

## Credits

This package started out as a modified version of [babel-plugin-inline-import](https://www.npmjs.com/package/babel-plugin-inline-import)
