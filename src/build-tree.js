const path = require('path');
const broccoliSource = require('broccoli-source');
const broccoli = require('broccoli');
const copyDereference = require('copy-dereference');
const MergeTrees = require('broccoli-merge-trees');
const babel = require('broccoli-babel-transpiler');
const babelPreset2015 = require('babel-preset-es2015');
const watchify = require('broccoli-watchify');
const Funnel = require('broccoli-funnel');
const babelPluginAddModleExports = require('babel-plugin-add-module-exports');
const uppercamelcase = require('uppercamelcase');

const copyDereferenceSync = copyDereference.sync;
const WatchedDir = broccoliSource.WatchedDir;
const Watcher = broccoli.Watcher;
const Builder = broccoli.Builder;

const OUTPUT_PATH = 'dist';

const createBuildTree = () => {
  const basePath = process.cwd();
  const packageManifest = require(path.join(basePath, 'package.json'));
  const sourceTree = new WatchedDir(path.join(basePath, 'src'));
  const nodeTestsTree = new WatchedDir(path.join(basePath, 'tests', 'node'));
  const browserTestsTree = new WatchedDir(path.join(basePath, 'tests', 'browser'));
  const tree = new MergeTrees([
    sourceTree,
    new Funnel(nodeTestsTree, { destDir: 'node' }),
    new Funnel(browserTestsTree, { destDir: 'browser' }),
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
  return new MergeTrees([
    transpiledTree,
    watchify(transpiledTree, getOptions('index')),
    watchify(transpiledTree, getOptions('browser/index')),
  ]);
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
