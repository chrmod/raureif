import { server as BroccoliServer, Watcher } from 'broccoli';
import program from 'commander';

import { createBuilder } from '../build-tree';

import { OUTPUT_PATH, project } from './common';

program
  .command('serve')
  .description('starts building server that watches src file changes')
  .option('-p, --port <port>', 'http serve port', 3000)
  .action(function ({ port }) {
    const { builder, copy } = createBuilder(project);
    const watcher = new Watcher(builder);

    watcher.on('buildSuccess', function () {
      rimraf.sync(OUTPUT_PATH);
      copy();
    });

    BroccoliServer.serve(watcher, 'localhost', Number(port));
  });
