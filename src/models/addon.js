export default class Addon {
  constructor(entryPoint, pkg, project) {
    this.project = project;
    this.entryPoint = entryPoint;
    this.pkg = pkg;
    const addon = require(this.entryPoint);
    this.addon = addon.default || addon;
  }

  build(inputTree) {
    const builder = this.addon.build || (() => {});
    return builder.call(this.addon, inputTree, this.project);
  }

  get babelOptions() {
    return this.addon.babelOptions || {};
  }

  get eslintOptions() {
    return this.addon.eslintOptions || {};
  }

  get eslintPlugins() {
    return this.addon.eslintPlugins || {};
  }

  get exclude() {
    return this.addon.exclude || [];
  }
}
