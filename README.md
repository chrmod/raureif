# raureif

Simple toolset for javascript library authoring.

## Usage

To get `raureif` in the PATH, install it globally:

```
npm install raureif -g
```

### Create new project

Raureif comes with project generator:

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

Currently raureif supports:

* build - to compile project into `dist` directory
* serve - like build, but with live reloading
* test - live reloading that runs tests

## Project testing

By default raureif comes with two testing environments, node and the browser.
Both of them are run on top of `testem` and `mocha`.

To create tests add a file into either `tests/node` or `tests/browser` folder.
The file name has to end with `-test.js`.

To start tests run

```
raureif test
```

## Examples

* [spanan](https://github.com/chrmod/spanan) - postMessage wrapper
