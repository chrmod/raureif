import program from 'commander';
import rimraf from 'rimraf';
import printSlowNodes from 'broccoli-slow-trees';

import { createBuilder } from '../build-tree';

import { onBuild } from '../hooks';
import { project } from './common';

program
  .command('build')
  .description('builds the project into \'dist\' directory')
  .action(() => {
    const { builder } = createBuilder(project);


    builder.build().then(() => {
      onBuild(builder, project);
    }).then(() => {
      console.log('Build successful');
    }).catch(error => {
      console.error('Something went wrong', error);
    });
  });
