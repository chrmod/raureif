import resolve from 'resolve';
import findup from 'find-up';
import path from 'path';

import Addon from './addon';

const LINT_ADDONS = [
  'raureif-eslint',
  'raureif-flow',
];

const BUILD_ADDONS = [
  'raureif-babel',
  'raureif-typescript',
  'raureif-svelte',
  'raureif-glimmer',
  'raureif-sass',
];

const BUNDLE_ADDONS = [
  'raureif-browserify',
];

export default class {
  constructor({ projectPath, outputPath }) {
    this.outputPath = outputPath;
    this.path = projectPath;
  }

  get pkg() {
    return require(path.join(this.path, 'package.json'));
  }

  get name() {
    return this.pkg.name;
  }

  get dependencies() {
    return Object.keys(Object.assign({}, this.pkg.devDependencies, this.pkg.dependencies));
  }

  get addons() {
    if (this.projectAddons) {
      return this.projectAddons;
    }

    this.projectAddons = this.dependencies
      .map((depName) => {
        let entryPoint;
        let pkg;

        try {
          entryPoint = resolve.sync(depName, { basedir: this.path });
          const pkgPath = findup.sync('package.json', { cwd: entryPoint });
          pkg = require(pkgPath);
        } catch (e) {
          pkg = {};
        }

        return {
          entryPoint,
          pkg,
        };
      })
      .filter(dep => (dep.pkg.keywords || []).indexOf('raureif-addon') >= 0)
      .map(({ pkg, entryPoint }) => new Addon(entryPoint, pkg, this));

    return this.projectAddons;
  }

  get lintAddons() {
    return this.addons.filter(a => LINT_ADDONS.indexOf(a.name) >= 0);
  }

  get buildAddons() {
    return this.addons.filter(a => BUILD_ADDONS.indexOf(a.name) >= 0);
  }

  get preBundleAddons() {
    return [
      ...this.lintAddons,
      ...this.buildAddons,
    ];
  }

  get bundleAddons() {
    return this.addons.filter(a => BUNDLE_ADDONS.indexOf(a.name) >= 0);
  }
}
