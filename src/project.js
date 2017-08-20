import resolve from 'resolve';
import findup from 'find-up';
import path from 'path';

class Addon {
  constructor(entryPoint, pkg, project) {
    this.project = project;
    this.entryPoint = entryPoint;
    this.pkg = pkg;
    this._addon = require(this.entryPoint);
  }

  build(inputTree) {
    const addon = this._addon;
    const builder = addon.build || function () {};
    return builder.call(addon, inputTree, this.project);
  }

  get folder() {
   return this._addon.folder;
  }
}

export default class {
  constructor({ outputPath }) {
    this.outputPath = outputPath;
  }

  get name() {
    return this.pkg.name;
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
    }).map(({ pkg, entryPoint }) => new Addon(entryPoint, pkg, this));
  }

  get path() {
    return process.cwd();
  }

  get pkg() {
    return require(path.join(this.path, 'package.json'));
  }
}
