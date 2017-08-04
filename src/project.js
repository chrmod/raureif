import resolve from 'resolve';
import findup from 'find-up';
import path from 'path';

class Addon {
  constructor(entryPoint, pkg) {
    this.entryPoint = entryPoint;
    this.pkg = pkg;
    this._addon = require(this.entryPoint);
  }

  build(...args) {
    const addon = this._addon;
    const builder = addon.build || function () {};
    return builder.apply(addon, args);
  }

  get folder() {
   return this._addon.folder;
  }
}

export default class {
  constructor({ outputPath }) {
    this.outputPath = outputPath;
  }

  get dependencies() {
    return Object.keys(
      Object.assign({}, this.pkg.devDependencies, this.pkg.dependencies)
    );
  }

  get addons() {
    return this.dependencies.map(depName => {
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
    }).filter(dep => {
      return (dep.pkg.keywords || []).indexOf('raureif-addon') >= 0;
    }).map(({ pkg, entryPoint }) => new Addon(entryPoint, pkg));
  }

  get path() {
    return process.cwd();
  }

  get pkg() {
    return require(path.join(this.path, 'package.json'));
  }
}
