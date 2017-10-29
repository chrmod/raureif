import copy from 'recursive-copy';
import path from 'path';

import Console from '../console';

export default class {
  constructor(projectName) {
    this.projectName = projectName;
  }

  create() {
    Console.log(`Creating project with name "${this.projectName}"`);
    const srcPath = path.join(
      __dirname,
      '..',
      '..',
      'blueprints',
      'project',
    );
    const destPath = this.projectName;

    return copy(srcPath, destPath, { dot: true })
      .then(results => Console.info(`Copied ${results.length} files`))
      .catch((error) => {
        Console.error(`Copy failed: ${error}`);
        throw error;
      });
  }
}
