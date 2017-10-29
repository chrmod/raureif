import resolve from 'resolve';
import findup from 'find-up';
import path from 'path';

import Addon from './addon';

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
    return this.dependencies
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
  }
}
