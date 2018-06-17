[![npm Version](https://img.shields.io/npm/v/babel-plugin-import-graphql.svg)](https://www.npmjs.com/package/babel-plugin-import-graphql)
[![npm Downloads](https://img.shields.io/npm/dt/babel-plugin-inline-import-graphql-ast.svg)](https://www.npmjs.com/package/babel-plugin-inline-import-graphql-ast)
[![npm License](https://img.shields.io/npm/l/babel-plugin-import-graphql.svg)](https://www.npmjs.com/package/babel-plugin-import-graphql)
[![donate](https://img.shields.io/badge/donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3AYURHRU7PMCL)

# babel-plugin-import-graphql

Babel plugin enabling `import` syntax for `.graphql` and `.gql` files.

##### For users of the old package name (babel-plugin-inline-import-graphql-ast)

<details>

<summary>Deprecation/Migration notes</summary>

As of May 27, 2018, the `babel-plugin-inline-import-graphql-ast` package name is deprecated. Please use [`babel-plugin-import-graphql` (NPM)](https://www.npmjs.com/package/babel-plugin-import-graphql) instead.

### Migrating to babel-plugin-import-graphql

#### Update your babel configuration

###### Update `plugins` array:

`babel-plugin-inline-import-graphql-ast` (or `inline-import-graphql-ast`) -> `import-graphql`.

#### Update your `package.json` file

###### Update the package name in `devDependencies`:

`babel-plugin-inline-import-graphql-ast` -> `babel-plugin-import-graphql`.

###### Make sure your version string is compatible:

The first correct version of `babel-plugin-import-graphql` is `2.4.4` so please make sure your version string matches that. For instance, `"babel-plugin-import-graphql": "^2.0.0"` is fine because of the caret.

If you've pinned to a specific version, you'll need to upgrade and pin to at least `2.4.4` or widen your version range to include it.

Congratulations, you're all set!

</details>

---

> If you enjoy my package please [star the GitHub repo](https://github.com/detrohutt/babel-plugin-import-graphql) or share on Twitter (and [follow me](https://twitter.com/detrohutt) for updates)!

## Prerequisites

* `babel-core@^6.26.3` or `@babel/core@^7.0.0-beta.40` (Lower betas may work but weren't tested)

* `graphql-tag@^2.1.0` (only if using the `runtime` option described below)

## Install

```bash
$ yarn add -D babel-plugin-import-graphql
```

In `.babelrc` file:

```JSON
{
  "plugins": ["import-graphql"]
}
```

Each time you modify a GraphQL file, the `node_modules/.cache/babel-loader` folder must be cleared for the changes to take effect. I recommend prepending the relevant script in your `package.json` and rerunning the script when you change a GraphQL file:

```JSON
{
  "scripts": {
    "start": "rm -rf ./node_modules/.cache/babel-loader && node index.js"
  }
}
```

> Note: Windows users would need to use `rimraf` or another solution in place of `rm -rf`.

## Basic Usage

```JavaScript
...
import myQuery from './query.graphql'
...
export default graphql(myQuery)(myComponent)
```

## Supported features

### Schema files

Feature | Description
-|-
Default import | The entire source code for the file will act as the default export.
\#import syntax | Types, etc. in one GraphQL file can be imported into another GraphQL file using this syntax: `#import "./types.graphql"`. These imports will be resolved recursively to any reasonable depth of files. Currently, all content in the named file will be imported and there is no way to import specific types. If you want that behavior, you can store a single type in each file.

### Operation/fragment files

All variants of the [import syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) are supported for non-schema files, except `import './filename'`.

Feature | Description
-|-
Multiple operations/fragments per file | Multiple operations (queries/mutations/subscriptions) and/or fragments can be placed in a single file. However, in this case you cannot use unnamed operations/fragments. For example, `query { test }` would need to be `query someName { test }`.
Default import | The first or only operation/fragment in a file will act as the default export. However, for backwards compatibility reasons, if there are both operations and fragments in a file, the first operation will act as the default export.
Named imports | All operations/fragments, **including the default**, act as named exports.
\#import syntax | Fragments in one GraphQL file can be imported into another GraphQL file using this syntax: `#import "./fragment.graphql"`. These imports will be resolved recursively to any reasonable depth of files. Currently, all fragments in the named file will be imported and there is no way to import specific fragments. If you want that behavior, you can store a single fragment in each file.

## Full example

#### Before (without this plugin):

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

#### After (with this plugin):

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

## Options

Option | Type | Default | Description
-|-|-|-
`nodePath` | String | value of NODE_PATH environment variable | **Intended for use with [react-app-rewire-inline-import-graphql-ast](https://github.com/detrohutt/react-app-rewire-inline-import-graphql-ast)** -- Used to allow resolution of absolute paths to your `.gql`/`.graphql` files. If you already have your `NODE_PATH` variable set in your environment, you don't need to set this option. **Not** currently respected by `#import` syntax.
`runtime` | Boolean | false | **Enabling this option requires `graphql-tag` to be installed as a peerDependency.** -- Instead of inlining the parsed AST object, which is very large, this option inlines your GraphQL source code along with an import of the `gql` function from `graphql-tag` and parses your GraphQL source code with `gql` at runtime.

## For users of create-react-app

[create-react-app](https://github.com/facebook/create-react-app/) users can use this package without ejecting via [react-app-rewire-inline-import-graphql-ast](https://github.com/detrohutt/react-app-rewire-inline-import-graphql-ast)

## Credits

The behavior of this plugin is inspired by and mostly mirrors the [graphql-tag Webpack loader](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader)

This package started out as a modified version of [babel-plugin-inline-import](https://www.npmjs.com/package/babel-plugin-inline-import)
