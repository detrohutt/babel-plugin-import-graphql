# ChangeLog

### v2.0.4

Add support for Meteor projects.

### v2.0.3

Visit node on `exit` instead of `enter`. It allows other plugins like [babel-root-slash-import](https://github.com/mantrajs/babel-root-slash-import) to modify the import path before we load it.

### v2.0.2

Improve error for not found files.

### v2.0.1

Add forgotten `build` files to npm package.

### v2.0.0

Change approach. Replace `import` statements by inline content, instead of trying to export raw content according to JS standards.

Forks [babel-root-slash-import](https://github.com/mantrajs/babel-root-slash-import).

### v1.0.0

Try to wrap raw content and export it according to JS standards.
Didn't work well. Couldn't manage to stop Babel parsing raw content.

It can be accessed at [v1 branch](https://github.com/Quadric/babel-plugin-graphql-raw/tree/v1).
Forks [babel-plugin-iife-wrap](https://github.com/TrySound/babel-plugin-iife-wrap).
