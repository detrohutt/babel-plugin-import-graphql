# Babel Inline Import GraphQL AST
Babel plugin allowing you to `import` `.graphql` and `.gql` files. The code is pre-parsed by `gql` from `graphql-tag` and the GraphQL AST object is inserted into your code at transpile time.

## Important note

Prior to v1.3.2, the plugin cannot be run in Windows
Prior to v1.2.0, [fragments](http://dev.apollodata.com/react/webpack.html#Fragments) (#import statements) are not supported

## Known use cases

Replaces `graphql-tag/loader` in projects where Webpack is unavailable(i.e. [NextJS](https://github.com/zeit/next.js/))

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

Babel-Inline-Import is compatible with the following file extensions:

* .graphql
* .gql

## How it works

When you `import` a `.graphql` or `.gql` file, it is parsed into a GraphQL AST object by the `gql` function from `graphql-tag`. This AST object is inserted directly into the _importing file_, in a variable with the name defined in the _import statement_. The import should be treated as a default import(name whatever you want; no braces necessary)

## Caveats

Babel does not track dependency between _imported_ and _importing_ files after the transformation is made. Therefore, you need to change the _importing file_ in order to see your changes in the _imported file_ spread. To overcome this, you can:

* Disable babel cache (`BABEL_DISABLE_CACHE=1`)

Also make sure that your task runner is watching for changes in the _imported file_ as well. You can see it working [here](https://github.com/Quadric/perfect-graphql-starter/blob/master/nodemon.json).

**Note for NextJS users** - instead of BABEL_DISABLE_CACHE, you'll need to manually clear the node_modules/.cache folder to re-transpile your .gql/.graphql files. The easiest way to do this is using node scripts. You can either prepend your normal `start` script command with `rimraf ./node_modules/.cache` or create a separate script i.e. `clean`. Note you'd need the rimraf dependency installed in this example

## Credits
This package is a modified version of [babel-plugin-inline-import](https://www.npmjs.com/package/babel-plugin-inline-import)
