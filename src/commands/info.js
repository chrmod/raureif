import program from 'commander';

import { project } from './common';

program
  .command('info')
  .description('run tests with live reloading server')
  .action(() => {
    console.log('Project path:', project.path);
    console.log('Addons:', project.addons.map(a => a.pkg.name));
  });
