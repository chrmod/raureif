import Funnel from 'broccoli-funnel';
import MergeTrees from 'broccoli-merge-trees';
import broccoli from 'broccoli';
import broccoliSource from 'broccoli-source';
import fs from 'fs';
import path from 'path';
import uppercamelcase from 'uppercamelcase';
import watchify from 'broccoli-watchify';
import glob from 'glob';

import transpile from './broccoli/transpiler';

const { Builder } = broccoli;
const { WatchedDir } = broccoliSource;
const basePath = process.cwd();

const buildForBrowser = () => !!require(path.join(basePath, 'package.json')).browser;
const hasBrowserTests = () => buildForBrowser() && fs.existsSync(path.join(basePath, 'tests', 'browser'));

export const createBuildTree = (project) => {
  const packageManifest = require(path.join(basePath, 'package.json'));
  const sourceTree = new WatchedDir(path.join(basePath, 'src'));
  const testsTree = new WatchedDir(path.join(basePath, 'tests'));

  const addonTree = project.addons.reduce((t, addon) => {
    const tree = addon.build(t);

    if (!tree) {
      return t;
    }

    return tree;
  }, sourceTree);

  const exclude = project.addons.reduce(
    (all, a) => ([...all, ...a.exclude]),
    [],
  );

  const sourceWithoutExcludesTree = new Funnel(
    new MergeTrees([
      sourceTree,
      testsTree,
    ]),
    {
      exclude,
    },
  );

  const transpiledTree = transpile(sourceWithoutExcludesTree, project);

  const getOptions = entryPoint => ({
    browserify: {
      entries: [`./${entryPoint}.js`],
      paths: [`${basePath}/node_modules`],
      standalone: uppercamelcase(packageManifest.name),
      debug: false,
    },
    outputFile: `/${entryPoint}.browser.js`,
    cache: true,
  });

  const codeTree = new MergeTrees([
    addonTree,
    transpiledTree,
  ], { overwrite: true });

  const outputTrees = [
    codeTree,
  ];

  if (buildForBrowser()) {
    outputTrees.push(watchify(codeTree, getOptions('index')));

    const testFiles = glob
      .sync(`${basePath}/tests/browser/**/*-test.js`)
      .map(filePath => `.${filePath.slice(basePath.length + 6)}`);

    outputTrees.push(watchify(codeTree, {
      browserify: {
        entries: testFiles,
        paths: [`${basePath}/node_modules`],
        standalone: uppercamelcase(packageManifest.name),
        debug: false,
      },
      outputFile: '/tests.browser.js',
      cache: true,
    }));
  }

  return new MergeTrees(outputTrees, {
    overwrite: true,
  });
};

export function createBuilder(project) {
  const tree = createBuildTree(project);
  const builder = new Builder(tree);

  return {
    hasBrowserTests,
    builder,
  };
}
