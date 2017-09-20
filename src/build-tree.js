import Funnel from 'broccoli-funnel';
import MergeTrees from 'broccoli-merge-trees';
import broccoli from 'broccoli';
import broccoliSource from 'broccoli-source';
import fs from 'fs';
import path from 'path';
import uppercamelcase from 'uppercamelcase';
import watchify from 'broccoli-watchify';
import glob from 'glob';
import jsesc from 'jsesc';

import lint from './broccoli/linter';
import transpile from './broccoli/transpiler';

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

  const sourceWithoutExcludesTree = new Funnel(
    new MergeTrees([
      sourceTree,
      testsTree,
    ]),
    {
      exclude,
    }
  );

  const transpiledTree = transpile(sourceWithoutExcludesTree, project);

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
      new Funnel(lint(sourceTree, project), {
        include: ['**/*.js'],
      }),
      {
        includes: ['**/*.lint-test.js'],
        destDir: 'node',
      }
    ),
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
