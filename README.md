# raureif

Simple toolset for javascript library authoring.

## Usage

To get `raureif` in the PATH, install it globally:
```
npm install raureif -g
```

And then, in the project:
```
npm install raureif --save-dev
```

To get basic usage help type:
```
raureif --help
```

To start, create `src/index.js` and run `raureif build`. The output files
for npm will be located in `dist/index.js` and in `dist/index.browser.js` for
the browser respectively.
