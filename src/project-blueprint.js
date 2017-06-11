import copy from 'recursive-copy';
import path from 'path';

export default class {
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

    return copy(srcPath, destPath)
      .then(function(results) {
        console.info('Copied ' + results.length + ' files');
      })
      .catch(function(error) {
        console.error('Copy failed: ' + error);
        throw error;
      });

    // TODO:
    // * git init
  }
}
