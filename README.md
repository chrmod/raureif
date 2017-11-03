# raureif [![Build Status](https://travis-ci.org/chrmod/raureif.svg?branch=project-generator)](https://travis-ci.org/chrmod/raureif)

Simple toolset for javascript library authoring.
It is highly inspired by amazing tools like `ember-cli`, but aims to be
framework and platform agnostic. So if you plan to release your library for
multiple enviroments (node/browser/iot) - raureif may be a tool for your.

Important! Raureif is still in early stage and should not be used for production
workflows if you're unwilling to fix its internals.

## Installation

To get `raureif` in the PATH, install it globally:

```
yarn global add raureif
```

## Usage

Raureif comes with project generator and project building tools.

### Starting new project

Use build it project blueprint with:

```
raureif new <project name>
```

Raureif will copy base project files and start git repository for you.

### Existing project

Install raureif

```
yarn add raureif -D
```

### Basic operations

To get basic usage help type:

```
raureif --help
```

Most important operations for building the project are:

* build - to compile project into `dist` directory
* serve - like build, but with live reloading
* test - like serve, but runs tests
* test --ci - like build, but runs tests, once

## Project testing

By default raureif comes with two testing environments, node and the browser.
Both of them are run on top of `testem` and `mocha`.

To create tests create a file in either `tests/node` or `tests/browser` folder.
The file name has to end with `-test.js`.

To start tests run

```
raureif test
```

## Examples

* [spanan](https://github.com/chrmod/spanan) - postMessage wrapper
* [raureif](https://github.com/chrmod/raureif) - raureif itself is build with raureif
* [green-analytics](https://github.com/cliqz-oss/green-analytics) - uses raureif to
  build its browser probes.

## Addons

Rauraif has a simple addons system that extends its building capabilities.
That is, if rauraif project want to process some of its files it can use an
addon to do that. Examples are:

* [raureif-sass](https://github.com/chrmod/raureif-sass)
* [raureif-typescript](https://github.com/chrmod/raureif-typescript)
* [raureif-svelte](https://github.com/chrmod/raureif-svelte)
* [raureif-jsx](https://github.com/chrmod/raureif-jsx)
* [raureif-flow](https://github.com/chrmod/raureif-flow)
* [raureif-glimmer](https://github.com/chrmod/raureif-glimmer)
* [raureif-eslint](https://github.com/chrmod/raureif-eslint)
* [raureif-browserify](https://github.com/chrmod/raureif-browserify)

Essenstially addons wrap Broccoli plugins and preconfigure them to work
correctly with rauraif project structure.

### Installing addons

Just add addon as devDependency in your project, for example:

```
yarn add raureif-sass -D
```

### Creating addons

Addons are simple node modules that export single object:

```js
module.exports = {
  build: function (inputTree) {
    // process tree
    return anotherTree;
  },
};
```

Properties of the addon configure it behavior:

* `build` - is a function that takes `src` as broccoli tree and return another
            broccoli tree. Project trees and addons trees are merged together.

* `folder` - instructs raureif which subfolder of `src` to ignore. It is
             expected that addon will take care of files in that folder.

For raureif to detect the addon, a `raureif-addon` has to be added to keywords
list inside of addon package.json.
