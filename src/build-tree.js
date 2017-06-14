import Funnel from 'broccoli-funnel';
import MergeTrees from 'broccoli-merge-trees';
import babel from 'broccoli-babel-transpiler';
import babelPluginAddModleExports from 'babel-plugin-add-module-exports';
import babelPreset2015 from 'babel-preset-es2015';
import eslint from 'broccoli-lint-eslint';
import broccoli from 'broccoli';
import broccoliSource from 'broccoli-source';
import copyDereference from 'copy-dereference';
import fs from 'fs';
import path from 'path';
import uppercamelcase from 'uppercamelcase';
import watchify from 'broccoli-watchify';
import glob from 'glob';

const Builder = broccoli.Builder;
const OUTPUT_PATH = 'dist';
const WatchedDir = broccoliSource.WatchedDir;
const Watcher = broccoli.Watcher;
const basePath = process.cwd();
const copyDereferenceSync = copyDereference.sync;

const buildForBrowser = () => {
  return !!require(path.join(basePath, 'package.json')).browser;
}

const hasBrowserTests = () => {
  return buildForBrowser() && fs.existsSync(path.join(basePath, 'tests', 'browser'));
};

const lint = (tree) => eslint(tree, {
  options: {
    baseConfig: {
      extends: 'airbnb',
    },
  }
});

const createBuildTree = () => {
  const packageManifest = require(path.join(basePath, 'package.json'));
  const sourceTree = new WatchedDir(path.join(basePath, 'src'));
  const testsTree = new WatchedDir(path.join(basePath, 'tests'));
  const tree = new MergeTrees([
    lint(sourceTree),
    testsTree,
  ]);
  const transpiledTree = babel(tree, {
    plugins: [
      babelPluginAddModleExports,
    ],
    presets: [
      babelPreset2015,
    ],
    browserPolyfill: true,
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
  const outputTrees = [
    transpiledTree,
  ];

  if (buildForBrowser()) {
    outputTrees.push(
      watchify(transpiledTree, getOptions('index'))
    );
    const testFiles = glob.sync(
      basePath +  '/tests/browser/**/*-test.js'
    ).map(filePath => '.' + filePath.slice(basePath.length + 6));
    outputTrees.push(
      watchify(transpiledTree, {
        browserify: {
          entries: testFiles,
          paths: [basePath + '/node_modules'],
          standalone: uppercamelcase(packageManifest.name),
          debug: false
        },
        outputFile: '/tests.browser.js',
        cache: true,
      })
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

export default {
  createWatcher,
  createBuilder,
};
