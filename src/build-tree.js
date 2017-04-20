const path = require('path');
const broccoliSource = require('broccoli-source');
const MergeTrees = require('broccoli-merge-trees');
const babel = require('broccoli-babel-transpiler');
const babelPreset2015 = require('babel-preset-es2015');
const watchify = require('broccoli-watchify');
const babelPluginAddModleExports = require('babel-plugin-add-module-exports');
const uppercamelcase = require('uppercamelcase');

const WatchedDir = broccoliSource.WatchedDir;

const createBuildTree = () => {
  const basePath = process.cwd();
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
  const options = {
    browserify: {
      entries: ['./index.js'],
      paths: [basePath + '/node_modules'],
      standalone: uppercamelcase(packageManifest.name),
      debug: false
    },
    outputFile: '/index.browser.js',
    cache: true,
  };
  return new MergeTrees([
    transpiledTree,
    watchify(transpiledTree, options),
  ]);
};

module.exports = createBuildTree;
