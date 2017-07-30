import program from 'commander';
import rimraf from 'rimraf';
import printSlowNodes from 'broccoli-slow-trees';

import { createBuilder } from '../build-tree';

import { OUTPUT_PATH, project } from './common';

program
  .command('build')
  .description('builds the project into \'dist\' directory')
  .action(() => {
    const { builder, copy } = createBuilder(project);

    rimraf.sync(OUTPUT_PATH);

    builder.build().then(() => {
      return copy();
    }).then(() => {
      console.log('Build successful');
    }).catch(error => {
      console.error('Something went wrong', error);
    });
  });
