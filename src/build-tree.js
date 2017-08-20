import Funnel from 'broccoli-funnel';
import MergeTrees from 'broccoli-merge-trees';
import babel from 'broccoli-babel-transpiler';
import babelPluginAddModleExports from 'babel-plugin-add-module-exports';
import babelPreset2015 from 'babel-preset-es2015';
import eslint from 'broccoli-lint-eslint';
import broccoli from 'broccoli';
import broccoliSource from 'broccoli-source';
import fs from 'fs';
import path from 'path';
import uppercamelcase from 'uppercamelcase';
import watchify from 'broccoli-watchify';
import glob from 'glob';
import jsesc from 'jsesc';

const Builder = broccoli.Builder;
const OUTPUT_PATH = 'dist';
const WatchedDir = broccoliSource.WatchedDir;
const Watcher = broccoli.Watcher;
const basePath = process.cwd();

const buildForBrowser = () => {
  return !!require(path.join(basePath, 'package.json')).browser;
}

const hasBrowserTests = () => {
  return buildForBrowser() && fs.existsSync(path.join(basePath, 'tests', 'browser'));
};

const lint = (tree) => eslint(tree, {
  // TODO: should use 'mocha' - which currently does not print errors due to:
  //   https://github.com/ember-cli/aot-test-generators/blob/master/src/mocha.ts#L29
  testGenerator: 'mocha',
  options: {
    configFile: path.join(
       __dirname,
      '..',
      '.eslintrc.json',
    ),
  }
});

export const createBuildTree = (project) => {
  const packageManifest = require(path.join(basePath, 'package.json'));
  const sourceTree = new WatchedDir(path.join(basePath, 'src'));
  const testsTree = new WatchedDir(path.join(basePath, 'tests'));

  const addonTree = project.addons.reduce((t, addon) => {
    const addonTree = addon.build(t);

    if (!addonTree) {
      return t;
    }

    return addonTree;
  }, sourceTree);

  const exclude = project.addons.reduce(
    (all, a) => ([...all, ...a.exclude]),
    []
  );

  const sourceWithoutExcludesTree = new Funnel(sourceTree, {
    exclude,
  });

  const transpiledTree = babel(sourceWithoutExcludesTree, {
    plugins: [
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

  const codeTree = new MergeTrees([
    addonTree,
    transpiledTree,
    new Funnel(
      new Funnel(lint(sourceTree), {
        include: ['**/*.js'],
      }),
      {
        includes: ['**/*.lint-test.js'],
        destDir: 'node',
      }
    ),
    testsTree,
  ], { overwrite: true });

  const outputTrees = [
    codeTree,
  ];

  if (buildForBrowser()) {
    outputTrees.push(
      watchify(codeTree, getOptions('index'))
    );
    const testFiles = glob.sync(
      basePath +  '/tests/browser/**/*-test.js'
    ).map(filePath => '.' + filePath.slice(basePath.length + 6));
    outputTrees.push(
      watchify(codeTree, {
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

  return new MergeTrees(outputTrees, {
    overwrite: true,
  });
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

export function createBuilder(project) {
  const tree = createBuildTree(project);
  const builder = new Builder(tree);

  return {
    hasBrowserTests,
    builder,
  };
};
