import program from 'commander';

import Console from '../console';
import createBuilder from '../build-tree';
import onBuild from '../hooks';
import getProject from './common';

program
  .command('build')
  .description('builds the project into \'dist\' directory')
  .action(() => {
    const project = getProject();
    const builder = createBuilder(project);

    builder.build()
      .then(() => onBuild(builder, project))
      .then(() => Console.log('Build successful'))
      .catch(error => Console.error('Something went wrong', error))
      .then(() => {
        Console.log('Build: cleanup');
        builder.cleanup();
      });
  });
