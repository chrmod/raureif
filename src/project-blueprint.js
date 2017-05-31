'use strict';

const copy = require('recursive-copy');
const path = require('path');

module.exports = class {
  constructor(projectName) {
    this.projectName = projectName;
  }

  create() {
    console.log(`Creating project with name "${this.projectName}"`);
    const srcPath = path.join(
      __dirname,
      '..',
      'blueprints',
      'project'
    );
    const destPath = this.projectName;

    copy(srcPath, destPath)
      .then(function(results) {
        console.info('Copied ' + results.length + ' files');
      })
      .catch(function(error) {
        console.error('Copy failed: ' + error);
      });

    // TODO:
    // * yarn init
    // * yarn install
    // * git init
  }
}
