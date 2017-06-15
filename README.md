# raureif

Simple toolset for javascript library authoring.
It is highly inspired by amazing tools like `ember-cli`, but aims to be
framework and platform agnostic. So if you plan to release you're library for
multiple enviroments (node/browser/iot) - raureif may be a tool for your.

## Installation

To get `raureif` in the PATH, install it globally:

```
npm install raureif -g
```

## Usage

Raureif comes with project generator and project building tools.

### Starting new project

Use build it project blueprint with:

```
raureif new <project name>
```

### Existing project

Install raureif

```
npm install raureif --save-dev
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
