import program from 'commander';

import Console from '../console';
import getProject from './common';

program
  .command('info')
  .description('run tests with live reloading server')
  .action(() => {
    const project = getProject();
    Console.log('Project path:', project.path);
    Console.log('Addons:', project.addons.map(a => a.pkg.name));
  });
