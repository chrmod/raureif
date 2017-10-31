import Funnel from 'broccoli-funnel';
import MergeTrees from 'broccoli-merge-trees';
import broccoli from 'broccoli';
import broccoliSource from 'broccoli-source';
import path from 'path';

import transpile from './broccoli/transpiler';

const { Builder } = broccoli;
const { WatchedDir } = broccoliSource;

export const createBuildTree = (project) => {
  const sourceTree = new WatchedDir(path.join(project.path, 'src'));
  const testsTree = new WatchedDir(path.join(project.path, 'tests'));

  // let addons compile the tree
  const addonTree = project.addons.reduce((t, addon) => {
    const tree = addon.build(t);

    if (!tree) {
      return t;
    }

    return tree;
  }, sourceTree);

  // prepare the list of exclusions
  const exclude = project.addons.reduce(
    (all, a) => ([...all, ...a.exclude]),
    [],
  );

  // exclude file already "taken" by addons
  const sourceWithoutExcludesTree = new Funnel(
    new MergeTrees([
      sourceTree,
      testsTree,
    ]),
    {
      exclude,
    },
  );

  // transpile code
  const transpiledTree = transpile(sourceWithoutExcludesTree, project);


  // merge addons and transpiled trees
  const codeTree = new MergeTrees([
    addonTree,
    transpiledTree,
  ], { overwrite: true });

  const addonPostBuildTrees = project.addons
    .map(addon => addon.postBuild(codeTree))
    .filter(t => Boolean(t));

  const codeTree2 = new MergeTrees([
    ...addonPostBuildTrees,
    codeTree,
  ], { overwrite: true });

  return codeTree2;
};

export default function (project) {
  const tree = createBuildTree(project);
  return new Builder(tree);
}
