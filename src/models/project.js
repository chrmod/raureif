import resolve from 'resolve';
import findup from 'find-up';
import path from 'path';

import Addon from './addon';

const projectPath = process.cwd();
const projectPackage = require(path.join(projectPath, 'package.json'));

export default class {
  constructor({ outputPath }) {
    this.outputPath = outputPath;
    this.pkg = projectPackage;
    this.path = projectPath;
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
