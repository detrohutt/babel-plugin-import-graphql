# ChangeLog

## v2.6.2 (June 29, 2018)

### Fixes

- Continue fixing bug with multiple imports in a schema file (Thanks @gregorycuellar)

## v2.6.1 (June 29, 2018)

### Fixes

- Fix duplicate code when using multiple imports in one schema file (Thanks @gregorycuellar)

## v2.6.0 (June 16, 2018)

### Features

- Add support for #import syntax in schema files

### Maintenance

- Improve Options table in README
- Refactor existing tests and add new tests

## v2.5.2 (June 8, 2018)

### Fixes

- Continue fixing compatibility with Babel 6

## v2.5.1 (June 8, 2018)

### Fixes

- Fix compatibility issue with Babel 6

## v2.5.0 (June 7, 2018)

### Features

- Reduce output size of AST ({ runtime: false }) by 30%+ :fire: (:clap: @loganfsmyth and @supukarmin)
- Add new 'runtime' option for even smaller output :mag: (if enabled, 'graphql-tag' is a peerDependency)

### Maintenance

- Update all devDependencies :arrows_counterclockwise:
- Improve the README :tada:

## v2.4.4 (May 27, 2018)

### Maintenance

- Update copyright in LICENSE
- Update deprecation/migration info in README.md
- Update package name, author, and repository in package.json

## v2.4.2, v2.4.3 (May 27, 2018) \*\* Don't use these \*\*

### Maintenance

- Temporarily created a new repo on GitHub and published from that, but have now removed that repo and renamed the original repo instead.

## v2.4.1 (May 27, 2018)

### Maintenance

- Deprecate this package in favor of `babel-plugin-import-graphql` (see README)

## v2.4.0 (May 18, 2018)

### Features

- Add support for fragment-only files with multiple fragments
- Add support for importing fragments from mixed files (containing fragments and operations)

## v2.3.8 (May 15, 2018)

### Fixes

- Refactor plugin to not have direct dependency on @babel/core (hopefully fixing #30)
- Update package-lock.json that was not updated for version 2.3.7

### Maintenance

- Automate updating of package-lock.json and yarn.lock
- Remove undocumented `requireGql` export
- Update all dependencies

## v2.3.7 (April 26, 2018)

### Maintenance

- Update dependencies

## v2.3.6 (March 30, 2018)

### Fixes

- Fix operation files with top level indentation being mistaken for schema files

### Maintenance

- Add regression tests for above fix

## v2.3.5 (March 15, 2018)

### Maintenance

- Adjust code to conform to relevant breaking change in @babel/core@7.0.0-beta.41 (more forward-compatible solution to "bug" from [#24](https://github.com/detrohutt/babel-plugin-inline-import-graphql-ast/issues/24))
- Upgrade @babel/core dependency to 7.0.0-beta.42
- Improve tests code

## v2.3.4 (March 14, 2018)

### Fixes

- Pin versions of babel packages which were causing issue [#24](https://github.com/detrohutt/babel-plugin-inline-import-graphql-ast/issues/24)

### Maintenance

- Begin including package-lock.json file for users of NPM

## v2.3.3 (March 9, 2018)

### Fixes

- Fix fragments inlining as raw text

### Maintenance

- Add regression test for above fix

## v2.3.2 (March 9, 2018)

### Fixes

- Fix operations with fragments inlining as raw text

### Maintenance

- Add initial test for fragments

## v2.3.1 (March 8, 2018)

### Maintenance

- Update all dependencies/devDependencies

## v2.3.0 (March 8, 2018)

### Features

- Initial support for schema-like files

### Maintenance

- Fix typos in README

## v2.2.0 (February 17, 2018)

### Features

- Multiple operations in a single GraphQL file

- Named and namespace imports (can be mixed with default imports)

### Maintenance

- Update README.md

- Upgrade all dependencies (including upgrading to Babel 7)

- Add Jest and write initial tests covering import types

- Improve, expand, and reconfigure toolchain (babel, eslint, prettier, lint-staged)

## v2.1.2 (January 26, 2018)

### Maintenance

- Add "Known Issues" section to README.md

## v2.1.1 (January 25, 2018)

### Fixes

- Revert changes to babel settings and babel dependencies

## v2.1.0 (January 25, 2018)

### Features

- Add `nodePath` option

### Fixes

- Respect `NODE_PATH` environment variable

### Maintenance

- Remove leftover files and dependencies from `babel-plugin-inline-import`

## v2.0.4 (December 7, 2017)

### Fixes

- Improve .gql file parsing to address issues with Windows and/or IDE settings (@OisinOKeeffe
  @Tzelon)

## v2.0.3 (December 1, 2017)

### Fixes

- Utilize regex for more robust statement splitting (@Tzelon)

## v2.0.2 (October 9, 2017)

### Maintenance

- Change graphql to a peer dependency and allow newer versions

## v2.0.1 (September 23, 2017)

#### Note: this should have been a minor release rather than a patch release. Oops!

### Features

- Added support for nested fragments

- Added support for Babel's resolveModuleSource option (@real34)

### Fixes

- Deduplicate fragments

## v2.0.0 (July 22, 2017)

### Breaking

- Potentially removed Meteor support. Not sure it worked anyway and there's an alternative solution
  for .graphql files in Meteor.

- Removed support for customizable extensions. This was undocumented and left over from the project
  I forked.

### Features

- `<query>.loc.source` is now available on the inlined query

### Maintenance

- Major rewrite. Code is now much smaller and more readable. (1 file, ~60 LOC)

- Removed dependence on `resolve` package.

## v1.3.3

First official release with Windows support

Updated README and CHANGELOG

## v1.3.2

Test version(debugging Windows problems), published as @winfix tag

First version that works on Windows/Mac/Linux

## v1.3.1

Test version(debugging Windows problems), published as @winfix tag

First working version on Windows, non-functional on Mac/Linux

## v1.3.0

Test version(debugging Windows problems), published as @winfix tag

Initial attempt, non-functional

## v1.2.3

Update name of Github repo

## v1.2.2

Add required graphql dependency

## v1.2.1

Update npm keywords

## v1.2.0

Add support for GraphQL Fragments

Remove support for .raw and .text extensions(left over from forked project)

## v1.1.1

Update forked README to reflect the new package

## v1.1.0

Add support for .gql file extension

## v1.0.1

First functional version

Add ability to import .graphql files as AST(only on Mac/Linux)

Fix package.json info

## v1.0.0

Initial version. Bad publish, non-functional
