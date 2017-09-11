export default class Addon {
  constructor(entryPoint, pkg, project) {
    this.project = project;
    this.entryPoint = entryPoint;
    this.pkg = pkg;
    const addon = require(this.entryPoint);
    this._addon = addon.default || addon;
  }

  build(inputTree) {
    const addon = this._addon;
    const builder = addon.build || function () {};
    return builder.call(addon, inputTree, this.project);
  }

  get babelOptions() {
    return this._addon.babelOptions || {};
  }

  get eslintOptions() {
    return this._addon.eslintOptions || {};
  }

  get eslintPlugins() {
    return this._addon.eslintPlugins || {};
  }

  get exclude() {
    return this._addon.exclude || [];
  }
}
