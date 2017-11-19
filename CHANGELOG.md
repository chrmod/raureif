# Raureif Changelog

## 3.0.0
* [breaking] reorganizing build tree and addons system (all addons have to be
  updated to 3.x)

## 3.0.2
* [fix] in run only tests from node folder

## 2.0.0

* [breaking] removing babel-plugin-add-module-exports
* notification on successful build
* addons: pass custom babel options

## 1.7.0

* test: autogenerate linter tests
* cli: ability to select build server http port
* linter: complete airbnb preset
* project generator: creates git repo
* project generator: better package.json
* [FIX] project generator: copies .gitignore

## 1.6.0

* http server in serve mode
* simple addons system

## 1.5.0

* PhantomJS run tests in CI
* babel-polyfill shipped in dist (to be used by PhantomJS)

## 1.4.0

* raureif builds itself

## 1.3.1

* project generator with `raureif new <project name>`
* browser test in multiple files

## 1.3.0

* global installation to enable normal cli interaction

## 1.2.0

* browser tests

## 1.1.3

* exporting only the default export with PascalCase name

## 1.1.0

* upgrade babel to 6.0.0
* builds for browser via browserify
