[![npm Version](https://img.shields.io/npm/v/babel-plugin-inline-import-graphql-ast.svg)](https://www.npmjs.com/package/babel-plugin-inline-import-graphql-ast)
[![npm Downloads](https://img.shields.io/npm/dm/babel-plugin-inline-import-graphql-ast.svg)](https://www.npmjs.com/package/babel-plugin-inline-import-graphql-ast)
[![npm License](https://img.shields.io/npm/l/babel-plugin-inline-import-graphql-ast.svg)](https://www.npmjs.com/package/babel-plugin-inline-import-graphql-ast)
[![donate](https://img.shields.io/badge/donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3AYURHRU7PMCL)

# Babel Inline Import GraphQL AST

Babel plugin allowing `import` of `.graphql` and `.gql` files into `.js` and `.jsx` files.

### Install

```bash
$ yarn add -D babel-plugin-inline-import-graphql-ast
```

In `.babelrc` file:

```JSON
{
  "plugins": ["inline-import-graphql-ast"]
}
```

### Usage

```JavaScript
...
import myQuery from './query.graphql'
...
export default graphql(myQuery)(myComponent)
```

### Potential use cases

* Replaces `graphql-tag/loader` in projects where Webpack is unavailable(i.e. [NextJS](https://github.com/zeit/next.js/))

* Users of [create-react-app](https://github.com/facebook/create-react-app/) that want to avoid ejecting their app can use this package indirectly by using [react-app-rewire-inline-import-graphql-ast](https://github.com/detrohutt/react-app-rewire-inline-import-graphql-ast)

### Supported features

#### In `.gql`/`.graphql` files

* Multiple operations (queries/mutations/subscriptions) per file
* Fragment imports
  * `#import "./fragment.graphql"`

#### In `.js`/`.jsx` files

##### For both unnamed (`query { test }`) and named (`query named { test }`) operations

* Default import - `import anyName from './file.graphql'`

_note: when multiple operation exist in one file, the first is used as the default export_

##### For named operations only

* Named imports `import { first, second as secondQuery } from './file.graphql'`
* Namespace imports `import * as ops from './file.graphql'` (example usage: `graphql(ops.third)`)
* Any combination of the above `import firstQuery, * as ops from './file.graphql'`

File for examples above:

```GraphQL
query first {
  test1
}

mutation second {
  test2
}

subscription third {
  test3
}
```

### Full example

##### Before (without this plugin):

ProductsPage.js

```JSX
import React, { Component } from 'react'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

class ProductsPage extends Component {
  render() {
    if (this.props.data.loading) return <h3>Loading...</h3>
    return <div>{`This is my data: ${this.props.data.queryName}`}</div>
  }
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

##### After (with this plugin):

productFragment.graphql

```GraphQL
fragment productFragment on Product {
  name
  description
  weight
}
```

productsQuery.graphql

```GraphQL
#import "./productFragment.graphql"
query products {
  products {
    productId
    ...productFragment
  }
}
```

ProductsPage.js

```JSX
import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import myImportedQuery from './productsQuery.graphql'

class ProductsPage extends Component {
  render() {
    if (this.props.data.loading) return <h3>Loading...</h3>
    return <div>{`This is my data: ${this.props.data.queryName}`}</div>
  }
}

export default graphql(myImportedQuery)(ProductsPage)
```

### Options

* `nodePath` -- _Intended primarily for use with [react-app-rewire-inline-import-graphql-ast](https://github.com/detrohutt/react-app-rewire-inline-import-graphql-ast)_ Takes a string like the [`NODE_PATH`](https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders) environment variable and is used to allow resolution of absolute paths to your `.gql`/`.graphql` files. Note this currently is NOT respected for fragment imports. If you already have your `NODE_PATH` variable set in your environment, you don't need to set this option.

### How it works

When you `import` a `.graphql` or `.gql` file, it is parsed into a GraphQL AST object by the `gql` function from `graphql-tag`. This AST object is inserted directly into the _importing file_, in a variable with the name defined in the _import statement_.

### Caveats

#### Applying changes to GraphQL files

It is necessary to clear the `node_modules/.cache/babel-loader` folder to re-transpile your `.gql`/`.graphql` files each time one is changed. The recommended method is prepending the relevant script in your `package.json` and rerunning the script when you change a GraphQL file:

```JSON
{
  "scripts": {
    "start": "rimraf ./node_modules/.cache/babel-loader && node index.js"
  }
}
```

Note you'd need the rimraf dependency installed in this example.

#### Note for users of Babel 6

This plugin has problems with `babel-generator` before version `6.26.1`, which is included in `babel-core` and `babel-cli`. Unfortunately, the `6.26.1` update only applied to `babel-generator` itself, without bumping the version of the other packages. This means you need a copy of `babel-core@6.26.0` or `babel-cli@6.26.0` added to your project after February 3rd, 2018. If one of these was added prior to that date, you'll need to remove your `node_modules` folder, along with your `package-lock.json` or `yarn.lock` file, and reinstall your dependencies.

### Credits

This package started out as a modified version of [babel-plugin-inline-import](https://www.npmjs.com/package/babel-plugin-inline-import)
