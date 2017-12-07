# ChangeLog

## v2.0.4 (December 7, 2017)

### Fixes

* Improve .gql file parsing to address issues with Windows and/or IDE settings (@OisinOKeeffe
  @Tzelon)

## v2.0.3 (December 1, 2017)

### Fixes

* Utilize regex for more robust statement splitting (@Tzelon)

## v2.0.2 (October 9, 2017)

### Maintenance

* Change graphql to a peer dependency and allow newer versions

## v2.0.1 (September 23, 2017)

#### Note: this should have been a minor release rather than a patch release. Oops!

### Features

* Added support for nested fragments

* Added support for Babel's resolveModuleSource option (@real34)

### Fixes

* Deduplicate fragments

## v2.0.0 (July 22, 2017)

### Breaking

* Potentially removed Meteor support. Not sure it worked anyway and there's an alternative solution
  for .graphql files in Meteor.

* Removed support for customizable extensions. This was undocumented and left over from the project
  I forked.

### Features

* `<query>.loc.source` is now available on the inlined query

### Maintenance

* Major rewrite. Code is now much smaller and more readable. (1 file, ~60 LOC)

* Removed dependence on `resolve` package.

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
