import Funnel from 'broccoli-funnel';
import MergeTrees from 'broccoli-merge-trees';
import broccoli from 'broccoli';
import broccoliSource from 'broccoli-source';
import path from 'path';

const { Builder } = broccoli;
const { WatchedDir } = broccoliSource;

const processAddons = (srcTree, project) =>
  project.preBundleAddons.reduce((t, addon) => {
    const tree = addon.build(t);

    if (!tree) {
      return t;
    }

    return tree;
  }, srcTree);

export const createBuildTree = (project) => {
  const sourceTree = new WatchedDir(path.join(project.path, 'src'));
  const testsTree = new WatchedDir(path.join(project.path, 'tests'));

  const sourcePlusAddonsTree = processAddons(sourceTree, project);
  const testsPlusAddonsTree = processAddons(testsTree, project);

  const srcTree = new Funnel(new MergeTrees([
    sourcePlusAddonsTree,
    testsPlusAddonsTree,
  ]));

  const addonPostBuildTrees = project.bundleAddons
    .map(addon => addon.postBuild(srcTree))
    .filter(t => Boolean(t));

  return new MergeTrees([
    ...addonPostBuildTrees,
    srcTree,
  ], { overwrite: true });
};

export default function (project) {
  const tree = createBuildTree(project);
  return new Builder(tree);
}
