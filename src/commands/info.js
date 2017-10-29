import program from 'commander';

import Console from '../console';
import { project } from './common';

program
  .command('info')
  .description('run tests with live reloading server')
  .action(() => {
    Console.log('Project path:', project.path);
    Console.log('Addons:', project.addons.map(a => a.pkg.name));
  });
