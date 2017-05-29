const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const babel = require('broccoli-babel-transpiler');
const babelPluginAddModleExports = require('babel-plugin-add-module-exports');
const babelPreset2015 = require('babel-preset-es2015');
const broccoli = require('broccoli');
const broccoliSource = require('broccoli-source');
const copyDereference = require('copy-dereference');
const fs = require('fs');
const path = require('path');
const uppercamelcase = require('uppercamelcase');
const watchify = require('broccoli-watchify');

const Builder = broccoli.Builder;
const OUTPUT_PATH = 'dist';
const WatchedDir = broccoliSource.WatchedDir;
const Watcher = broccoli.Watcher;
const basePath = process.cwd();
const copyDereferenceSync = copyDereference.sync;

const hasBrowserTests = () => {
  return fs.existsSync(path.join(basePath, 'tests', 'browser'));
};

const createBuildTree = () => {
  const packageManifest = require(path.join(basePath, 'package.json'));
  const sourceTree = new WatchedDir(path.join(basePath, 'src'));
  const testsTree = new WatchedDir(path.join(basePath, 'tests'));
  const tree = new MergeTrees([
    sourceTree,
    testsTree,
  ]);
  const transpiledTree = babel(tree, {
    plugins: [
      babelPluginAddModleExports,
    ],
    presets: [
      babelPreset2015,
    ]
  });
  const getOptions = function(entryPoint) {
    return {
      browserify: {
        entries: ['./'+entryPoint+'.js'],
        paths: [basePath + '/node_modules'],
        standalone: uppercamelcase(packageManifest.name),
        debug: false
      },
      outputFile: '/'+entryPoint+'.browser.js',
      cache: true,
    };
  };
  outputTrees = [
    transpiledTree,
    watchify(transpiledTree, getOptions('index')),
  ];

  if (hasBrowserTests()) {
    outputTrees.push(
      watchify(transpiledTree, getOptions('browser/index'))
    );
  }
  return new MergeTrees(outputTrees);
};

const createWatcher = (builder) => {
  const watcher = new Watcher(builder);

  return {
    start() {
      return watcher.start();
    },
    on(eventName, cb) {
      watcher.on(eventName, cb);
    },
  }
};

const createBuilder = () => {
  const tree = createBuildTree();
  const builder = new Builder(tree);

  return {
    hasBrowserTests,
    builder,
    copy() {
      copyDereferenceSync(builder.outputPath, OUTPUT_PATH)
    },
    cleanup() {
      builder.cleanup()
    },
  };
};

module.exports = {
  createWatcher,
  createBuilder,
};
