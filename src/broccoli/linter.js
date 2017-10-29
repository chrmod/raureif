import eslint from 'broccoli-lint-eslint';

export default function (tree, project) {
  const baseConfig = [
    {
      extends: [
        'airbnb',
      ],
    },
    ...project.addons.map(a => a.eslintOptions),
  ].reduce((prev, curr) => Object.assign(prev, curr), {});

  const lintTree = eslint(tree, {
    // TODO: should use 'mocha' - which currently does not print errors due to:
    //   https://github.com/ember-cli/aot-test-generators/blob/master/src/mocha.ts#L29
    testGenerator: 'mocha',
    options: {
      cwd: project.path,
      baseConfig,
    },
  });

  project.addons.forEach((addon) => {
    Object.keys(addon.eslintPlugins).forEach((pluginName) => {
      lintTree.cli.addPlugin(pluginName, addon.eslintPlugins[pluginName]);
    });
  });

  return lintTree;
}
